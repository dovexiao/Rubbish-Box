import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseCounterOptions {
  /** 初始值，默认 0 */
  initialCount?: number;
  /** 步长，默认 1 */
  step?: number;
  /** 自动计数间隔（毫秒），默认 1000 */
  interval?: number;
}

/**
 * 计数器 Hook
 * 提供自动计数和手动控制功能
 *
 * @param initialCountOrOptions 初始值或配置对象
 * @param step 步长（仅当第一个参数为数字时生效）
 * @returns 包含状态和控制方法的对象
 */
export function useCounter(
  initialCountOrOptions: number | UseCounterOptions = 0,
  stepArg: number = 1,
) {
  // 参数归一化处理
  const options =
    typeof initialCountOrOptions === 'number'
      ? { initialCount: initialCountOrOptions, step: stepArg }
      : initialCountOrOptions;

  const { initialCount = 0, step = 1, interval = 1000 } = options;

  const [count, setCount] = useState(initialCount);
  const [isCounting, setIsCounting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * 清除定时器
   */
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  /**
   * 停止计数
   */
  const stop = useCallback(() => {
    setIsCounting(false);
    clearTimer();
  }, [clearTimer]);

  /**
   * 开始计数
   */
  const start = useCallback(() => {
    setIsCounting(true);
  }, []);

  /**
   * 重置计数器
   */
  const reset = useCallback(() => {
    stop();
    setCount(initialCount);
  }, [initialCount, stop]);

  /**
   * 手动增加
   */
  const increment = useCallback(() => {
    setCount(prev => prev + step);
  }, [step]);

  /**
   * 手动减少
   */
  const decrement = useCallback(() => {
    setCount(prev => prev - step);
  }, [step]);

  // 处理自动计数逻辑
  useEffect(() => {
    if (isCounting) {
      timerRef.current = setInterval(() => {
        setCount(prev => prev + step);
      }, interval);
    } else {
      clearTimer();
    }

    return () => clearTimer();
  }, [isCounting, step, interval, clearTimer]);

  return {
    /** 当前计数值 */
    count,
    /** 是否正在自动计数 */
    isCounting,
    /** 开始自动计数 */
    start,
    /** 停止自动计数 */
    stop,
    /** 重置为初始值并停止 */
    reset,
  };
}
