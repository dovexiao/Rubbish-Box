/**
 * WebSocket 服务集成文件
 * 集成网络监听和应用状态，提供全局 WebSocket 管理
 */

import { WebSocketManager } from './WebSocketManager'
import { useNetworkStore } from '../stores/networkStore'
import { useWebSocketStore } from '../stores/webSocketStore'

/**
 * 全局 WebSocket 管理器实例
 */
export const wsManager = WebSocketManager.getInstance()

/**
 * 初始化 WebSocket 服务
 * 应在应用启动时调用一次
 * 
 * @example
 * ```tsx
 * // 在 _layout.tsx 中调用
 * useEffect(() => {
 *   initWebSocketService()
 * }, [])
 * ```
 */
export const initWebSocketService = () => {
  console.log('[WebSocket Service] 初始化 WebSocket 服务')
  
  // 获取网络状态 store
  const networkStore = useNetworkStore.getState()
  const wsStore = useWebSocketStore.getState()
  
  // 监听网络状态变化
  useNetworkStore.subscribe((state, prevState) => {
    const wasConnected = prevState.isConnected
    const isConnected = state.isConnected
    
    // 网络从断开到连接
    if (!wasConnected && isConnected) {
      console.log('[WebSocket Service] 网络恢复，尝试连接 WebSocket')
      
      // 如果 WebSocket 未连接，尝试连接
      const wsStatus = wsManager.getStatus()
      if (wsStatus === 'disconnected' || wsStatus === 'failed') {
        wsManager.connect()
      }
    }
    
    // 网络从连接到断开
    if (wasConnected && !isConnected) {
      console.log('[WebSocket Service] 网络断开')
      // 可以选择断开 WebSocket 或保持连接等待网络恢复
      // 这里选择保持连接，让 WebSocket 自己的重连机制处理
    }
  })
  
  // 监听 WebSocket 状态变化并同步到 Store
  wsManager.on('open', () => {
    wsStore.setStatus(wsManager.getStatus())
    wsStore.updateStats(wsManager.getStats())
    wsStore.setError(null)
  })
  
  wsManager.on('close', () => {
    wsStore.setStatus(wsManager.getStatus())
    wsStore.updateStats(wsManager.getStats())
  })
  
  wsManager.on('error', (error) => {
    wsStore.setStatus(wsManager.getStatus())
    wsStore.setError(error)
  })
  
  wsManager.on('message', (message) => {
    wsStore.setLastMessage(message)
    wsStore.updateStats(wsManager.getStats())
  })
  
  wsManager.on('reconnecting', () => {
    wsStore.setStatus(wsManager.getStatus())
  })
  
  wsManager.on('reconnected', () => {
    wsStore.setStatus(wsManager.getStatus())
    wsStore.updateStats(wsManager.getStats())
  })
  
  wsManager.on('max_reconnect', () => {
    wsStore.setStatus(wsManager.getStatus())
  })
  
  // 如果网络已连接，自动连接 WebSocket
  if (networkStore.isConnected) {
    console.log('[WebSocket Service] 网络已连接，启动 WebSocket')
    wsManager.connect()
  } else {
    console.log('[WebSocket Service] 网络未连接，等待网络恢复')
  }
  
  wsStore.setInitialized(true)
}

/**
 * 清理 WebSocket 服务
 * 应在应用退出时调用
 */
export const cleanupWebSocketService = () => {
  console.log('[WebSocket Service] 清理 WebSocket 服务')
  wsManager.disconnect()
  useWebSocketStore.getState().reset()
}

// 导出类型和工具
export * from '../types/websocket'
export { WebSocketManager } from './WebSocketManager'
export { useWebSocketStore } from '../stores/webSocketStore'
export { useWebSocket, useWebSocketSimple } from '../hooks/useWebSocket'

