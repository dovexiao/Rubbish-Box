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
  prepareVoiceRecorder,
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
  /** 切换语音模式时已检查过麦克风权限时可设为 true，避免重复走权限队列 */
  skipPermissionCheck?: boolean;
  startRecording?: () => Promise<VoiceRecordingHandler>;
  /** 本地转文字后回调文本 */
  onResult: (text: string) => void;
  /** 若提供则跳过本地转文字，直接上传录音文件 */
  onVoiceFile?: (filePath: string) => void;
};

const DEFAULT_HOLD_DELAY_MS = 50;
const DEFAULT_MIN_DURATION_MS = 1000;
const DEFAULT_CANCEL_SLIDE_THRESHOLD = 60;
const DEFAULT_MAX_DURATION_MS = 180 * 1000;
/** 权限弹窗等待超过该阈值时，视为手势已被系统弹窗打断，放弃本次录音 */
const PERMISSION_DIALOG_INTERRUPT_MS = 2000;

function triggerHoldFeedback(toCancel: boolean, recorderActive: boolean) {
  triggerHoldToTalkTransitionHaptic(toCancel, recorderActive);
}

export const useHoldToTalk = ({
  enabled,
  holdDelayMs = DEFAULT_HOLD_DELAY_MS,
  minDurationMs = DEFAULT_MIN_DURATION_MS,
  cancelSlideThreshold = DEFAULT_CANCEL_SLIDE_THRESHOLD,
  maxDurationMs = DEFAULT_MAX_DURATION_MS,
  skipPermissionCheck = false,
  startRecording = startVoiceRecording,
  onResult,
  onVoiceFile,
}: HoldToTalkOptions) => {
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');

  const voiceButtonRef = useRef<View>(null);
  const recordStartTimeRef = useRef(0);
  const touchStartYRef = useRef(0);
  const pressActiveRef = useRef(false);
  const pressGrantTokenRef = useRef(0);
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

  useEffect(() => {
    if (enabled) {
      prepareVoiceRecorder();
    }
  }, [enabled]);

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
    pressGrantTokenRef.current = 0;
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

  const isPressSessionActive = useCallback((grantToken: number) => {
    return (
      grantToken > 0 &&
      pressActiveRef.current &&
      pressGrantTokenRef.current === grantToken
    );
  }, []);

  const abortPendingRecording = useCallback(() => {
    busyRef.current = false;
    setVoiceStatus('idle');
    pressActiveRef.current = false;
    pressGrantTokenRef.current = 0;
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  const beginVoiceRecording = useCallback(async () => {
    const grantToken = pressGrantTokenRef.current;

    if (
      !isPressSessionActive(grantToken) ||
      hasStartedRef.current ||
      busyRef.current ||
      !enabledRef.current
    ) {
      return;
    }

    busyRef.current = true;

    if (!skipPermissionCheck) {
      const authStart = Date.now();
      const granted = await checkMicrophonePermission();
      const authDuration = Date.now() - authStart;

      // 权限弹窗会抢走触摸焦点，release 事件可能丢失；耗时过长视为手势已打断。
      const permissionDialogInterrupted =
        authDuration > PERMISSION_DIALOG_INTERRUPT_MS;

      if (
        !granted ||
        !isPressSessionActive(grantToken) ||
        permissionDialogInterrupted
      ) {
        abortPendingRecording();

        if (!granted) {
          showToast({ title: '请前往手机应用设置开启录音权限', icon: 'none' });
        }

        return;
      }
    } else if (!isPressSessionActive(grantToken)) {
      busyRef.current = false;
      return;
    }

    try {
      const handler = await startRecording();

      if (!isPressSessionActive(grantToken)) {
        try {
          await handler.stop();
        } catch {
          // ignore
        }
        abortPendingRecording();
        return;
      }

      hasStartedRef.current = true;
      cancelingRef.current = false;
      recordStartTimeRef.current = Date.now();

      triggerLightHaptic();
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
      if (isPressSessionActive(grantToken)) {
        showToast({ title: '录音启动失败，请重试', icon: 'none' });
      }
    }
  }, [
    abortPendingRecording,
    finishRecording,
    isPressSessionActive,
    maxDurationMs,
    skipPermissionCheck,
    startRecording,
  ]);

  const resetVoicePressState = useCallback(() => {
    pressActiveRef.current = false;
    pressGrantTokenRef.current = 0;
    clearHoldTimer();
  }, [clearHoldTimer]);

  const handleGrant = useCallback(
    (evt: GestureResponderEvent) => {
      if (!enabledRef.current || hasStartedRef.current) {
        return;
      }

      touchStartYRef.current = evt.nativeEvent.pageY;
      pressGrantTokenRef.current += 1;
      pressActiveRef.current = true;
      cancelingRef.current = false;
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

      updateCancelStateFromTouch(evt.nativeEvent.pageY, touchStartYRef.current);
    },
    [updateCancelStateFromTouch],
  );

  const handleRelease = useCallback(
    (evt: GestureResponderEvent) => {
      resetVoicePressState();

      if (!hasStartedRef.current) {
        return;
      }

      updateCancelStateFromTouch(evt.nativeEvent.pageY, touchStartYRef.current);
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
