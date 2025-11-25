/**
 * 网络错误事件管理器
 * 用于在 API 层和 UI 层之间传递网络错误事件
 */

type NetworkErrorListener = () => void

class NetworkEventManager {
  private listeners: NetworkErrorListener[] = []

  /**
   * 注册网络错误监听器
   */
  addListener(listener: NetworkErrorListener): () => void {
    this.listeners.push(listener)
    
    // 返回取消监听的函数
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  /**
   * 触发网络错误事件
   */
  emitNetworkError(): void {
    this.listeners.forEach(listener => {
      try {
        listener()
      } catch (error) {
        console.error('网络错误监听器执行失败:', error)
      }
    })
  }

  /**
   * 清除所有监听器
   */
  clearListeners(): void {
    this.listeners = []
  }
}

// 导出单例
export const networkEventManager = new NetworkEventManager()

/**
 * 触发网络错误弹窗
 */
export const triggerNetworkError = () => {
  console.log('🌐 触发网络错误事件')
  networkEventManager.emitNetworkError()
}

