import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { type GestureResponderEvent, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/core';
import {
  triggerHoldToTalkTransitionHaptic,
  triggerLightHaptic,
} from '@/utils/haptics';
import { checkMicrophonePermission } from '@/utils/permissions';
import { showToast } from '@/utils';
import { speechToText } from '@/services/speechToText';
import {
  startVoiceRecording,
  VoiceRecordingHandler,
} from '@/services/voiceRecorder';

export type VoiceStatus = 'idle' | 'recording' | 'cancel';

export type HoldToTalkOptions = {
  enabled: boolean;
  holdDelayMs?: number;
  minDurationMs?: number;
  cancelSlideThreshold?: number;
  maxDurationMs?: number;
  startRecording?: () => Promise<VoiceRecordingHandler>;
  /** 本地转文字后回调文本 */
  onResult: (text: string) => void;
  /** 若提供则跳过本地转文字，直接上传录音文件 */
  onVoiceFile?: (filePath: string) => void;
};

const DEFAULT_HOLD_DELAY_MS = 100;
const DEFAULT_MIN_DURATION_MS = 1000;
const DEFAULT_CANCEL_SLIDE_THRESHOLD = 60;
const DEFAULT_MAX_DURATION_MS = 180 * 1000;

function triggerHoldFeedback(toCancel: boolean, recorderActive: boolean) {
  triggerHoldToTalkTransitionHaptic(toCancel, recorderActive);
}

export const useHoldToTalk = ({
  enabled,
  holdDelayMs = DEFAULT_HOLD_DELAY_MS,
  minDurationMs = DEFAULT_MIN_DURATION_MS,
  cancelSlideThreshold = DEFAULT_CANCEL_SLIDE_THRESHOLD,
  maxDurationMs = DEFAULT_MAX_DURATION_MS,
  startRecording = startVoiceRecording,
  onResult,
  onVoiceFile,
}: HoldToTalkOptions) => {
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');

  const voiceButtonRef = useRef<View>(null);
  const recordStartTimeRef = useRef(0);
  const touchStartYRef = useRef(0);
  const pressActiveRef = useRef(false);
  const hasStartedRef = useRef(false);
  const cancelingRef = useRef(false);
  const busyRef = useRef(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxDurationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const stopRecordingRef = useRef<null | (() => Promise<string>)>(null);
  const enabledRef = useRef(enabled);
  const onVoiceFileRef = useRef(onVoiceFile);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    onVoiceFileRef.current = onVoiceFile;
  }, [onVoiceFile]);

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const clearMaxDurationTimer = useCallback(() => {
    if (maxDurationTimerRef.current) {
      clearTimeout(maxDurationTimerRef.current);
      maxDurationTimerRef.current = null;
    }
  }, []);

  const cleanupRecording = useCallback(() => {
    clearMaxDurationTimer();
    stopRecordingRef.current = null;
    busyRef.current = false;
  }, [clearMaxDurationTimer]);

  const resetVoiceState = useCallback(() => {
    pressActiveRef.current = false;
    hasStartedRef.current = false;
    cancelingRef.current = false;
    clearHoldTimer();
    cleanupRecording();
    setVoiceStatus('idle');
  }, [clearHoldTimer, cleanupRecording]);

  const finishRecording = useCallback(
    async (isCancel: boolean) => {
      hasStartedRef.current = false;
      cancelingRef.current = false;
      clearMaxDurationTimer();

      const stopRecording = stopRecordingRef.current;
      stopRecordingRef.current = null;
      busyRef.current = false;
      setVoiceStatus('idle');

      if (isCancel || !stopRecording) {
        if (stopRecording) {
          try {
            await stopRecording();
          } catch {
            // ignore
          }
        }
        return;
      }

      const duration = Date.now() - recordStartTimeRef.current;
      if (duration < minDurationMs) {
        try {
          await stopRecording();
        } catch {
          // ignore
        }
        showToast({ title: '说话时间太短', icon: 'none' });
        return;
      }

      try {
        const filePath = await stopRecording();
        const uploadVoice = onVoiceFileRef.current;
        if (uploadVoice) {
          if (filePath) {
            uploadVoice(filePath);
          } else {
            showToast({ title: '录音文件无效', icon: 'none' });
          }
          return;
        }

        const { text } = await speechToText(filePath);
        const trimmedText = text.trim();
        if (trimmedText) {
          onResult(trimmedText);
        }
      } catch {
        showToast({ title: '语音识别失败', icon: 'none' });
      }
    },
    [clearMaxDurationTimer, minDurationMs, onResult],
  );

  const updateCancelStateFromTouch = useCallback(
    (pageY: number, startY: number) => {
      if (!hasStartedRef.current) {
        return;
      }

      const slideUpDistance = startY - pageY;
      const shouldCancel = slideUpDistance > cancelSlideThreshold;
      const cancelStateChanged = shouldCancel !== cancelingRef.current;
      const recorderActive = !!stopRecordingRef.current;

      if (cancelStateChanged) {
        triggerHoldFeedback(shouldCancel, recorderActive);
        cancelingRef.current = shouldCancel;
        setVoiceStatus(shouldCancel ? 'cancel' : 'recording');
      }
    },
    [cancelSlideThreshold],
  );

  const beginVoiceRecording = useCallback(async () => {
    if (
      !pressActiveRef.current ||
      hasStartedRef.current ||
      busyRef.current ||
      !enabledRef.current
    ) {
      return;
    }

    busyRef.current = true;

    const granted = await checkMicrophonePermission();
    if (!granted || !pressActiveRef.current) {
      busyRef.current = false;
      setVoiceStatus('idle');
      return;
    }

    try {
      const handler = await startRecording();

      // 如果在请求权限或者启动录音期间，用户已经松开了手
      if (!pressActiveRef.current) {
        try {
          await handler.stop();
        } catch {
          // ignore
        }
        busyRef.current = false;
        return;
      }

      hasStartedRef.current = true;
      cancelingRef.current = false;
      recordStartTimeRef.current = Date.now();

      setVoiceStatus('recording');

      stopRecordingRef.current = handler.stop;

      maxDurationTimerRef.current = setTimeout(() => {
        finishRecording(cancelingRef.current);
      }, maxDurationMs);
    } catch (error) {
      hasStartedRef.current = false;
      cancelingRef.current = false;
      busyRef.current = false;
      setVoiceStatus('idle');
      console.warn('[HoldToTalk] start recording failed', error);
      showToast({ title: '录音启动失败，请重试', icon: 'none' });
    }
  }, [finishRecording, maxDurationMs, startRecording]);

  const resetVoicePressState = useCallback(() => {
    pressActiveRef.current = false;
    clearHoldTimer();
  }, [clearHoldTimer]);

  const handleGrant = useCallback(
    (evt: GestureResponderEvent) => {
      if (!enabledRef.current || hasStartedRef.current) {
        return;
      }

      touchStartYRef.current = evt.nativeEvent.pageY;
      pressActiveRef.current = true;
      cancelingRef.current = false;
      triggerLightHaptic();
      clearHoldTimer();

      holdTimerRef.current = setTimeout(() => {
        void beginVoiceRecording();
      }, holdDelayMs);
    },
    [beginVoiceRecording, clearHoldTimer, holdDelayMs],
  );

  const handleMove = useCallback(
    (evt: GestureResponderEvent) => {
      if (!hasStartedRef.current) {
        return;
      }

      updateCancelStateFromTouch(
        evt.nativeEvent.pageY,
        touchStartYRef.current,
      );
    },
    [updateCancelStateFromTouch],
  );

  const handleRelease = useCallback(
    (evt: GestureResponderEvent) => {
      resetVoicePressState();

      if (!hasStartedRef.current) {
        return;
      }

      updateCancelStateFromTouch(
        evt.nativeEvent.pageY,
        touchStartYRef.current,
      );
      void finishRecording(cancelingRef.current);
    },
    [finishRecording, resetVoicePressState, updateCancelStateFromTouch],
  );

  const handleTerminate = useCallback(() => {
    resetVoicePressState();

    if (!hasStartedRef.current) {
      return;
    }

    void finishRecording(true);
  }, [finishRecording, resetVoicePressState]);

  const shouldStartVoicePress = useCallback(() => {
    return enabledRef.current && !pressActiveRef.current;
  }, []);

  const gestureCaptureProps = useMemo(
    () => ({
      onStartShouldSetResponderCapture: shouldStartVoicePress,
      onMoveShouldSetResponderCapture: () =>
        pressActiveRef.current || hasStartedRef.current,
      onStartShouldSetResponder: shouldStartVoicePress,
      onMoveShouldSetResponder: () =>
        pressActiveRef.current || hasStartedRef.current,
      onResponderTerminationRequest: () => false,
      onResponderGrant: handleGrant,
      onResponderMove: handleMove,
      onResponderRelease: handleRelease,
      onResponderTerminate: handleTerminate,
    }),
    [
      handleGrant,
      handleMove,
      handleRelease,
      handleTerminate,
      shouldStartVoicePress,
    ],
  );

  useEffect(() => {
    return () => {
      clearHoldTimer();
      clearMaxDurationTimer();
    };
  }, [clearHoldTimer, clearMaxDurationTimer]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        resetVoiceState();
      };
    }, [resetVoiceState]),
  );

  return {
    voiceStatus,
    isVoiceRecording: voiceStatus !== 'idle',
    voiceButtonRef,
    gestureCaptureProps,
    resetVoiceState,
  };
};

export { default as VoiceRipple } from './VoiceRipple';
