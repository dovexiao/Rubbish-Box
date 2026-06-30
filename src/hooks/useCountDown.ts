import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';

/**
 * 倒计时 Hook（基于结束时间戳，前后台切换后仍按真实时间倒计时）
 * @param initialCount 初始倒计时秒数
 * @returns { count, isCounting, start, stop, reset }
 */
export function useCountDown(initialCount: number = 60) {
  const [count, setCount] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endTimeRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const getRemaining = useCallback(() => {
    if (!endTimeRef.current) return 0;
    return Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
  }, []);

  const tick = useCallback(() => {
    const remaining = getRemaining();
    setCount(remaining);
    if (remaining <= 0) {
      clearTimer();
      endTimeRef.current = 0;
      setIsCounting(false);
    }
  }, [clearTimer, getRemaining]);

  const stop = useCallback(() => {
    clearTimer();
    endTimeRef.current = 0;
    setIsCounting(false);
  }, [clearTimer]);

  const start = useCallback(() => {
    clearTimer();
    endTimeRef.current = Date.now() + initialCount * 1000;
    setCount(initialCount);
    setIsCounting(true);
    tick();
    timerRef.current = setInterval(tick, 1000);
  }, [clearTimer, initialCount, tick]);

  const reset = useCallback(() => {
    stop();
    setCount(0);
  }, [stop]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', nextState => {
      if (nextState === 'active' && endTimeRef.current > 0) {
        tick();
        if (getRemaining() > 0 && !timerRef.current) {
          timerRef.current = setInterval(tick, 1000);
        }
      }
    });
    return () => sub.remove();
  }, [getRemaining, tick]);

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, [clearTimer]);

  return {
    count,
    isCounting,
    start,
    stop,
    reset,
  };
}
