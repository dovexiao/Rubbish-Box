import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  type GestureResponderEvent,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/core';
import { triggerHoldToTalkTransitionHaptic, triggerLightHaptic } from '@/utils/haptics';
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
  cancelAreaPadding?: number;
  maxDurationMs?: number;
  startRecording?: () => Promise<VoiceRecordingHandler>;
  /** 本地转文字后回调文本 */
  onResult: (text: string) => void;
  /** 若提供则跳过本地转文字，直接上传录音文件 */
  onVoiceFile?: (filePath: string) => void;
};

type Bounds = { x: number; y: number; width: number; height: number };

const DEFAULT_HOLD_DELAY_MS = 100;
const DEFAULT_MIN_DURATION_MS = 1000;
const DEFAULT_CANCEL_SLIDE_THRESHOLD = 120;
const DEFAULT_CANCEL_AREA_PADDING = 16;
const DEFAULT_MAX_DURATION_MS = 60 * 1000;

const EMPTY_BOUNDS: Bounds = { x: 0, y: 0, width: 0, height: 0 };

function triggerHoldFeedback(toCancel: boolean, recorderActive: boolean) {
  triggerHoldToTalkTransitionHaptic(toCancel, recorderActive);
}

function measureViewBounds(viewRef: React.RefObject<View | null>): Promise<Bounds> {
  return new Promise(resolve => {
    viewRef.current?.measureInWindow(
      (x: number, y: number, width: number, height: number) => {
        resolve({ x, y, width, height });
      },
    );
  });
}

function isPointInsideBounds(
  pageX: number,
  pageY: number,
  bounds: Bounds,
  padding: number,
): boolean {
  const { x, y, width, height } = bounds;
  if (width <= 0 || height <= 0) {
    return true;
  }
  const left = x - padding;
  const right = x + width + padding;
  const top = y - padding;
  const bottom = y + height + padding;
  return pageX >= left && pageX <= right && pageY >= top && pageY <= bottom;
}

export const useHoldToTalk = ({
  enabled,
  holdDelayMs = DEFAULT_HOLD_DELAY_MS,
  minDurationMs = DEFAULT_MIN_DURATION_MS,
  cancelSlideThreshold = DEFAULT_CANCEL_SLIDE_THRESHOLD,
  cancelAreaPadding = DEFAULT_CANCEL_AREA_PADDING,
  maxDurationMs = DEFAULT_MAX_DURATION_MS,
  startRecording = startVoiceRecording,
  onResult,
  onVoiceFile,
}: HoldToTalkOptions) => {
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');

  const voiceButtonRef = useRef<View>(null);
  const cancelAreaRef = useRef<View>(null);
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
  const lastInsideInputRef = useRef(true);
  const enabledRef = useRef(enabled);
  const onVoiceFileRef = useRef(onVoiceFile);
  const voiceButtonBoundsRef = useRef<Bounds>({ ...EMPTY_BOUNDS });
  const inputAreaBoundsRef = useRef<Bounds>({ ...EMPTY_BOUNDS });

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

  const refreshBounds = useCallback(async () => {
    const [voiceBounds, inputBounds] = await Promise.all([
      measureViewBounds(voiceButtonRef),
      measureViewBounds(cancelAreaRef),
    ]);
    voiceButtonBoundsRef.current = voiceBounds;
    inputAreaBoundsRef.current =
      inputBounds.width > 0 && inputBounds.height > 0
        ? inputBounds
        : voiceBounds;
  }, []);

  const isTouchOnVoiceButton = useCallback(
    (pageX: number, pageY: number) => {
      const bounds = voiceButtonBoundsRef.current;
      if (bounds.width <= 0 || bounds.height <= 0) {
        return false;
      }
      return isPointInsideBounds(
        pageX,
        pageY,
        bounds,
        cancelAreaPadding,
      );
    },
    [cancelAreaPadding],
  );

  const isTouchInsideInputArea = useCallback(
    (pageX: number, pageY: number) => {
      return isPointInsideBounds(
        pageX,
        pageY,
        inputAreaBoundsRef.current,
        cancelAreaPadding,
      );
    },
    [cancelAreaPadding],
  );

  const resetVoiceState = useCallback(() => {
    pressActiveRef.current = false;
    hasStartedRef.current = false;
    cancelingRef.current = false;
    lastInsideInputRef.current = true;
    clearHoldTimer();
    cleanupRecording();
    setVoiceStatus('idle');
  }, [clearHoldTimer, cleanupRecording]);

  const finishRecording = useCallback(
    async (isCancel: boolean) => {
      hasStartedRef.current = false;
      cancelingRef.current = false;
      lastInsideInputRef.current = true;
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
    (pageX: number, pageY: number, startY: number) => {
      if (!hasStartedRef.current) {
        return;
      }

      const isInsideInput = isTouchInsideInputArea(pageX, pageY);
      const inputAreaCrossed = isInsideInput !== lastInsideInputRef.current;

      const slideUpDistance = startY - pageY;
      const recoverThreshold = cancelSlideThreshold * 0.7;
      const shouldCancelBySlide = cancelingRef.current
        ? slideUpDistance > recoverThreshold
        : slideUpDistance > cancelSlideThreshold;

      const shouldCancel = !isInsideInput || shouldCancelBySlide;
      const cancelStateChanged = shouldCancel !== cancelingRef.current;
      const recorderActive = !!stopRecordingRef.current;

      if (inputAreaCrossed) {
        lastInsideInputRef.current = isInsideInput;
        triggerHoldFeedback(!isInsideInput, recorderActive);
      } else if (cancelStateChanged) {
        triggerHoldFeedback(shouldCancel, recorderActive);
      }

      if (cancelStateChanged) {
        cancelingRef.current = shouldCancel;
        setVoiceStatus(shouldCancel ? 'cancel' : 'recording');
      }
    },
    [cancelSlideThreshold, isTouchInsideInputArea],
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
    hasStartedRef.current = true;
    cancelingRef.current = false;
    lastInsideInputRef.current = true;
    recordStartTimeRef.current = Date.now();
    setVoiceStatus('recording');

    await refreshBounds();
    setTimeout(() => {
      void refreshBounds();
    }, 50);

    const granted = await checkMicrophonePermission();
    if (!granted) {
      hasStartedRef.current = false;
      busyRef.current = false;
      setVoiceStatus('idle');
      return;
    }

    if (!pressActiveRef.current) {
      hasStartedRef.current = false;
      busyRef.current = false;
      setVoiceStatus('idle');
      return;
    }

    try {
      const handler = await startRecording();

      if (!pressActiveRef.current || !hasStartedRef.current) {
        try {
          await handler.stop();
        } catch {
          // ignore
        }
        busyRef.current = false;
        return;
      }

      stopRecordingRef.current = handler.stop;

      maxDurationTimerRef.current = setTimeout(() => {
        finishRecording(cancelingRef.current);
      }, maxDurationMs);
    } catch (error) {
      hasStartedRef.current = false;
      cancelingRef.current = false;
      lastInsideInputRef.current = true;
      busyRef.current = false;
      setVoiceStatus('idle');
      console.warn('[HoldToTalk] start recording failed', error);
      showToast({ title: '录音启动失败，请重试', icon: 'none' });
    }
  }, [finishRecording, maxDurationMs, refreshBounds, startRecording]);

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
      void refreshBounds();
      clearHoldTimer();

      holdTimerRef.current = setTimeout(() => {
        triggerLightHaptic();
        void beginVoiceRecording();
      }, holdDelayMs);
    },
    [beginVoiceRecording, clearHoldTimer, holdDelayMs, refreshBounds],
  );

  const handleMove = useCallback(
    (evt: GestureResponderEvent) => {
      if (!hasStartedRef.current) {
        return;
      }

      updateCancelStateFromTouch(
        evt.nativeEvent.pageX,
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
        evt.nativeEvent.pageX,
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

  const shouldCaptureTouch = useCallback(
    (evt: GestureResponderEvent) => {
      if (!enabledRef.current || pressActiveRef.current) {
        return false;
      }
      return isTouchOnVoiceButton(
        evt.nativeEvent.pageX,
        evt.nativeEvent.pageY,
      );
    },
    [isTouchOnVoiceButton],
  );

  const gestureCaptureProps = useMemo(
    () => ({
      onStartShouldSetResponderCapture: shouldCaptureTouch,
      onMoveShouldSetResponderCapture: () =>
        pressActiveRef.current || hasStartedRef.current,
      onStartShouldSetResponder: shouldCaptureTouch,
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
      shouldCaptureTouch,
    ],
  );

  useEffect(() => {
    return () => {
      clearHoldTimer();
      clearMaxDurationTimer();
    };
  }, [clearHoldTimer, clearMaxDurationTimer]);

  useEffect(() => {
    if (voiceStatus !== 'idle') {
      requestAnimationFrame(() => {
        void refreshBounds();
      });
    }
  }, [voiceStatus, refreshBounds]);

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
    cancelAreaRef,
    gestureCaptureProps,
    refreshBounds,
    resetVoiceState,
  };
};

export { default as VoiceRipple } from './VoiceRipple';
