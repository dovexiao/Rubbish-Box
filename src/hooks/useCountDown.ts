import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * 倒计时 Hook
 * @param initialCount 初始倒计时秒数
 * @returns { count, isCounting, start, stop, reset }
 */
export function useCountDown(initialCount: number = 60) {
  const [count, setCount] = useState(0);
  const [isCounting, setIsCounting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsCounting(false);
  }, []);

  const start = useCallback(() => {
    stop(); // 先清除之前的定时器
    setCount(initialCount);
    setIsCounting(true);

    timerRef.current = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          stop();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [initialCount, stop]);

  const reset = useCallback(() => {
    stop();
    setCount(0);
  }, [stop]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    count,
    isCounting,
    start,
    stop,
    reset,
  };
}
