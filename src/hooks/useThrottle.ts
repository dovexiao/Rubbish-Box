import { useRef, useCallback } from 'react'

/**
 * 节流 Hook - 用于防止短时间内重复执行函数
 * @param callback 要节流的回调函数
 * @param delay 节流延迟时间（毫秒），默认 500ms
 * @returns 节流后的函数
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 500
): (...args: Parameters<T>) => void {
  const lastRunRef = useRef<number>(0)
  const callbackRef = useRef(callback)

  // 保持最新的 callback 引用
  callbackRef.current = callback

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now()
      
      if (now - lastRunRef.current >= delay) {
        lastRunRef.current = now
        callbackRef.current(...args)
      }
    },
    [delay]
  )
}

