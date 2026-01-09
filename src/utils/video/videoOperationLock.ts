/**
 * 视频操作锁工具
 * 防止并发操作导致卡死
 */

/**
 * 超时保护包装器 - 防止异步操作永远卡住
 * @param promise 要包装的 Promise
 * @param timeoutMs 超时时间（毫秒）
 * @returns 包装后的 Promise
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 3000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Operation timeout')), timeoutMs)
    )
  ])
}

/**
 * 操作锁类
 * 用于防止并发操作
 */
export class OperationLock {
  private isLocked = false
  private lockTimeout: NodeJS.Timeout | null = null
  private lockTime: number | null = null

  /**
   * 尝试获取锁
   * @returns 是否成功获取锁
   */
  tryLock(): boolean {
    if (this.isLocked) {
      return false
    }
    this.isLocked = true
    this.lockTime = Date.now()
    return true
  }

  /**
   * 释放锁
   */
  release(): void {
    this.isLocked = false
    this.lockTime = null
    if (this.lockTimeout) {
      clearTimeout(this.lockTimeout)
      this.lockTimeout = null
    }
  }

  /**
   * 延迟释放锁
   * @param delayMs 延迟时间（毫秒）
   */
  releaseAfter(delayMs: number): void {
    if (this.lockTimeout) {
      clearTimeout(this.lockTimeout)
    }
    this.lockTimeout = setTimeout(() => {
      this.release()
    }, delayMs)
  }

  /**
   * 检查是否已锁定
   */
  isLockedNow(): boolean {
    return this.isLocked
  }

  /**
   * 获取锁的时间戳（用于超时检测）
   */
  getLockTime(): number | null {
    return this.lockTime
  }

  /**
   * 自动恢复机制 - 如果锁超过指定时间未释放，强制重置
   * @param maxLockTimeMs 最大锁定时间（毫秒）
   */
  startAutoRecovery(maxLockTimeMs: number = 5000): () => void {
    const checkInterval = setInterval(() => {
      if (this.isLocked) {
        // 如果锁超过最大时间未释放，强制释放
        this.release()
      }
    }, maxLockTimeMs)
    
    return () => clearInterval(checkInterval)
  }
}

