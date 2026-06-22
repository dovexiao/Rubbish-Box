import { useCallback, useEffect, useRef, useState } from 'react';
import { PanResponder } from 'react-native';
import { useFocusEffect } from '@react-navigation/core';
import { triggerLightHaptic } from '@/utils/haptics';
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
  onResult: (text: string) => void;
};

const DEFAULT_HOLD_DELAY_MS = 100;
const DEFAULT_MIN_DURATION_MS = 1000;
const DEFAULT_CANCEL_SLIDE_THRESHOLD = 120;
const DEFAULT_MAX_DURATION_MS = 60 * 1000;

const triggerLightVibration = () => {
  triggerLightHaptic();
};

export const useHoldToTalk = ({
  enabled,
  holdDelayMs = DEFAULT_HOLD_DELAY_MS,
  minDurationMs = DEFAULT_MIN_DURATION_MS,
  cancelSlideThreshold = DEFAULT_CANCEL_SLIDE_THRESHOLD,
  maxDurationMs = DEFAULT_MAX_DURATION_MS,
  startRecording = startVoiceRecording,
  onResult,
}: HoldToTalkOptions) => {
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>('idle');

  const voiceButtonRef = useRef<any>(null);
  const cancelAreaRef = useRef<any>(null);
  const recordStartTimeRef = useRef(0);
  const pressActiveRef = useRef(false);
  const hasStartedRef = useRef(false);
  const cancelingRef = useRef(false);
  const busyRef = useRef(false);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxDurationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const stopRecordingRef = useRef<null | (() => Promise<string>)>(null);
  const wasInsideCancelAreaRef = useRef(true);
  const enabledRef = useRef(enabled);
  const voiceButtonBoundsRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const cancelAreaBoundsRef = useRef({ x: 0, y: 0, width: 0, height: 0 });

  useEffect(() => {
    enabledRef.current = enabled;
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

  const updateVoiceButtonBounds = useCallback(() => {
    voiceButtonRef.current?.measureInWindow(
      (x: number, y: number, width: number, height: number) => {
        voiceButtonBoundsRef.current = { x, y, width, height };
      },
    );
  }, []);

  const updateCancelAreaBounds = useCallback(() => {
    cancelAreaRef.current?.measureInWindow(
      (x: number, y: number, width: number, height: number) => {
        cancelAreaBoundsRef.current = { x, y, width, height };
      },
    );
  }, []);

  const isTouchOnVoiceButton = useCallback((pageX: number, pageY: number) => {
    const { x, y, width, height } = voiceButtonBoundsRef.current;
    if (width <= 0 || height <= 0) {
      return true;
    }
    return (
      pageX >= x && pageX <= x + width && pageY >= y && pageY <= y + height
    );
  }, []);

  const isTouchInsideCancelArea = useCallback(
    (pageX: number, pageY: number) => {
      const { x, y, width, height } = cancelAreaBoundsRef.current;
      if (width <= 0 || height <= 0) {
        return true;
      }
      return (
        pageX >= x && pageX <= x + width && pageY >= y && pageY <= y + height
      );
    },
    [],
  );

  const resetVoiceState = useCallback(() => {
    pressActiveRef.current = false;
    hasStartedRef.current = false;
    cancelingRef.current = false;
    wasInsideCancelAreaRef.current = true;
    clearHoldTimer();
    cleanupRecording();
    setVoiceStatus('idle');
  }, [clearHoldTimer, cleanupRecording]);

  const finishRecording = useCallback(
    async (isCancel: boolean) => {
      hasStartedRef.current = false;
      cancelingRef.current = false;
      wasInsideCancelAreaRef.current = true;
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
    (moveX: number, moveY: number, startY: number) => {
      const isInsideCancelArea = isTouchInsideCancelArea(moveX, moveY);

      if (
        hasStartedRef.current &&
        isInsideCancelArea !== wasInsideCancelAreaRef.current
      ) {
        wasInsideCancelAreaRef.current = isInsideCancelArea;
        triggerLightVibration();
      }

      const shouldCancel =
        !isInsideCancelArea || startY - moveY > cancelSlideThreshold;

      if (shouldCancel !== cancelingRef.current) {
        cancelingRef.current = shouldCancel;
        setVoiceStatus(shouldCancel ? 'cancel' : 'recording');
      }
    },
    [cancelSlideThreshold, isTouchInsideCancelArea],
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
    if (!granted) {
      busyRef.current = false;
      return;
    }

    if (!pressActiveRef.current) {
      busyRef.current = false;
      return;
    }

    try {
      const handler = await startRecording();

      if (!pressActiveRef.current) {
        try {
          await handler.stop();
        } catch {
          // ignore
        }
        busyRef.current = false;
        return;
      }

      stopRecordingRef.current = handler.stop;
      hasStartedRef.current = true;
      cancelingRef.current = false;
      wasInsideCancelAreaRef.current = true;
      recordStartTimeRef.current = Date.now();
      triggerLightVibration();
      setVoiceStatus('recording');

      maxDurationTimerRef.current = setTimeout(() => {
        finishRecording(cancelingRef.current);
      }, maxDurationMs);
    } catch {
      busyRef.current = false;
      setVoiceStatus('idle');
    }
  }, [finishRecording, maxDurationMs, startRecording]);

  const resetVoicePressState = useCallback(() => {
    pressActiveRef.current = false;
    clearHoldTimer();
  }, [clearHoldTimer]);

  const handlersRef = useRef({
    updateVoiceButtonBounds,
    updateCancelAreaBounds,
    clearHoldTimer,
    beginVoiceRecording,
    updateCancelStateFromTouch,
    resetVoicePressState,
    finishRecording,
    isTouchOnVoiceButton,
  });

  useEffect(() => {
    handlersRef.current = {
      updateVoiceButtonBounds,
      updateCancelAreaBounds,
      clearHoldTimer,
      beginVoiceRecording,
      updateCancelStateFromTouch,
      resetVoicePressState,
      finishRecording,
      isTouchOnVoiceButton,
    };
  }, [
    updateVoiceButtonBounds,
    updateCancelAreaBounds,
    clearHoldTimer,
    beginVoiceRecording,
    updateCancelStateFromTouch,
    resetVoicePressState,
    finishRecording,
    isTouchOnVoiceButton,
  ]);

  useEffect(() => {
    return () => {
      clearHoldTimer();
      clearMaxDurationTimer();
    };
  }, [clearHoldTimer, clearMaxDurationTimer]);

  useEffect(() => {
    if (voiceStatus !== 'idle') {
      requestAnimationFrame(() => {
        updateVoiceButtonBounds();
        updateCancelAreaBounds();
      });
    }
  }, [voiceStatus, updateVoiceButtonBounds, updateCancelAreaBounds]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        resetVoiceState();
      };
    }, [resetVoiceState]),
  );

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, _gestureState) => {
        if (!enabledRef.current || pressActiveRef.current) {
          return false;
        }

        const { pageX, pageY } = evt.nativeEvent;
        return handlersRef.current.isTouchOnVoiceButton(pageX, pageY);
      },
      onMoveShouldSetPanResponder: () => pressActiveRef.current,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: (_evt, _gestureState) => {
        if (!enabledRef.current || hasStartedRef.current) {
          return;
        }

        const handlers = handlersRef.current;
        pressActiveRef.current = true;
        cancelingRef.current = false;
        handlers.updateVoiceButtonBounds();
        handlers.updateCancelAreaBounds();
        handlers.clearHoldTimer();

        holdTimerRef.current = setTimeout(() => {
          handlers.beginVoiceRecording();
        }, holdDelayMs);
      },
      onPanResponderMove: (_evt, gestureState) => {
        if (!hasStartedRef.current) {
          return;
        }

        handlersRef.current.updateCancelStateFromTouch(
          gestureState.moveX,
          gestureState.moveY,
          gestureState.y0,
        );
      },
      onPanResponderRelease: (_evt, gestureState) => {
        const handlers = handlersRef.current;
        handlers.resetVoicePressState();

        if (!hasStartedRef.current) {
          return;
        }

        handlers.updateCancelStateFromTouch(
          gestureState.moveX,
          gestureState.moveY,
          gestureState.y0,
        );
        handlers.finishRecording(cancelingRef.current);
      },
      onPanResponderTerminate: () => {
        const handlers = handlersRef.current;
        handlers.resetVoicePressState();

        if (!hasStartedRef.current) {
          return;
        }

        handlers.finishRecording(true);
      },
    }),
  ).current;

  return {
    voiceStatus,
    isVoiceRecording: voiceStatus !== 'idle',
    voiceButtonRef,
    cancelAreaRef,
    panHandlers: panResponder.panHandlers,
    updateVoiceButtonBounds,
    updateCancelAreaBounds,
    resetVoiceState,
  };
};

export { default as VoiceRipple } from './VoiceRipple';
