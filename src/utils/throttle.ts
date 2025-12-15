/**
 * 节流函数 - 在指定时间内只执行一次
 * @param func 要节流的函数
 * @param wait 节流时间（毫秒）
 * @returns 节流后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 500
): (...args: Parameters<T>) => void {
  let lastTime = 0
  
  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now()
    
    if (now - lastTime >= wait) {
      lastTime = now
      func.apply(this, args)
    }
  }
}

/**
 * 防抖函数 - 延迟执行，如果在延迟时间内再次触发则重新计时
 * @param func 要防抖的函数
 * @param wait 延迟时间（毫秒）
 * @returns 防抖后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number = 500
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return function (this: any, ...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout)
    }
    
    timeout = setTimeout(() => {
      func.apply(this, args)
      timeout = null
    }, wait)
  }
}

