import { useEffect, useCallback, useRef } from 'react'
import { WebSocketManager } from '../services/WebSocketManager'
import { useWebSocketStore } from '../stores/webSocketStore'
import { useNetworkStore } from '../stores/networkStore'
import {
  WebSocketConfig,
  WebSocketEventType,
  WebSocketEventHandler,
  MessageType,
  WebSocketMessage,
} from '../types/websocket'

/**
 * useWebSocket Hook 配置
 */
export interface UseWebSocketOptions {
  /** 自定义配置 */
  config?: Partial<WebSocketConfig>
  
  /** 是否自动连接，默认 true */
  autoConnect?: boolean
  
  /** 是否在网络恢复时自动重连，默认 true */
  reconnectOnNetworkRestore?: boolean
  
  /** 消息处理器 */
  onMessage?: (message: WebSocketMessage) => void
  
  /** 连接成功回调 */
  onOpen?: () => void
  
  /** 连接关闭回调 */
  onClose?: (data?: any) => void
  
  /** 错误回调 */
  onError?: (error: any) => void
  
  /** 重连回调 */
  onReconnecting?: (data?: any) => void
  
  /** 重连成功回调 */
  onReconnected?: () => void
  
  /** 达到最大重连次数回调 */
  onMaxReconnect?: () => void
}

/**
 * WebSocket Hook
 * 提供 React 组件中使用 WebSocket 的便捷接口
 * 
 * @example
 * ```tsx
 * const { send, isConnected } = useWebSocket({
 *   onMessage: (message) => {
 *     console.log('收到消息:', message)
 *   },
 *   onOpen: () => {
 *     console.log('连接成功')
 *   }
 * })
 * 
 * // 发送消息
 * send({ text: 'Hello' })
 * ```
 */
export const useWebSocket = (options: UseWebSocketOptions = {}) => {
  const {
    config,
    autoConnect = true,
    reconnectOnNetworkRestore = true,
    onMessage,
    onOpen,
    onClose,
    onError,
    onReconnecting,
    onReconnected,
    onMaxReconnect,
  } = options
  
  // WebSocket 管理器实例
  const wsManager = useRef<WebSocketManager | null>(null)
  
  // Store 状态
  const {
    status,
    lastMessage,
    stats,
    error,
    setStatus,
    setLastMessage,
    updateStats,
    setError,
    setInitialized,
  } = useWebSocketStore()
  
  // 网络状态
  const { isConnected: isNetworkConnected } = useNetworkStore()
  
  // 上一次网络状态
  const prevNetworkConnected = useRef(isNetworkConnected)
  
  /**
   * 初始化 WebSocket 管理器
   */
  useEffect(() => {
    console.log('[useWebSocket] 初始化 WebSocket 管理器')
    
    // 获取单例实例
    wsManager.current = WebSocketManager.getInstance(config)
    
    // 标记已初始化
    setInitialized(true)
    
    // 自动连接
    if (autoConnect && isNetworkConnected) {
      wsManager.current.connect()
    }
    
    return () => {
      console.log('[useWebSocket] 清理 WebSocket Hook')
      // 注意：不要在这里销毁单例，因为可能有其他组件在使用
    }
  }, []) // 只在组件挂载时执行一次
  
  /**
   * 监听网络状态变化
   */
  useEffect(() => {
    if (!reconnectOnNetworkRestore || !wsManager.current) return
    
    // 网络从断开到连接
    if (!prevNetworkConnected.current && isNetworkConnected) {
      console.log('[useWebSocket] 网络恢复，尝试重连')
      wsManager.current.connect()
    }
    
    // 网络从连接到断开
    if (prevNetworkConnected.current && !isNetworkConnected) {
      console.log('[useWebSocket] 网络断开')
      // 可以选择断开 WebSocket 或保持连接等待网络恢复
      // wsManager.current.disconnect()
    }
    
    prevNetworkConnected.current = isNetworkConnected
  }, [isNetworkConnected, reconnectOnNetworkRestore])
  
  /**
   * 设置事件监听器
   */
  useEffect(() => {
    if (!wsManager.current) return
    
    const manager = wsManager.current
    
    // Open 事件
    const handleOpen = () => {
      setStatus(manager.getStatus())
      updateStats(manager.getStats())
      setError(null)
      onOpen?.()
    }
    
    // Close 事件
    const handleClose = (data?: any) => {
      setStatus(manager.getStatus())
      updateStats(manager.getStats())
      onClose?.(data)
    }
    
    // Error 事件
    const handleError = (error: any) => {
      setStatus(manager.getStatus())
      setError(error)
      onError?.(error)
    }
    
    // Message 事件
    const handleMessage = (message: WebSocketMessage) => {
      setLastMessage(message)
      updateStats(manager.getStats())
      onMessage?.(message)
    }
    
    // Reconnecting 事件
    const handleReconnecting = (data?: any) => {
      setStatus(manager.getStatus())
      onReconnecting?.(data)
    }
    
    // Reconnected 事件
    const handleReconnected = () => {
      setStatus(manager.getStatus())
      updateStats(manager.getStats())
      onReconnected?.()
    }
    
    // Max Reconnect 事件
    const handleMaxReconnect = () => {
      setStatus(manager.getStatus())
      onMaxReconnect?.()
    }
    
    // 注册事件监听器
    manager.on('open', handleOpen)
    manager.on('close', handleClose)
    manager.on('error', handleError)
    manager.on('message', handleMessage)
    manager.on('reconnecting', handleReconnecting)
    manager.on('reconnected', handleReconnected)
    manager.on('max_reconnect', handleMaxReconnect)
    
    return () => {
      // 移除事件监听器
      manager.off('open', handleOpen)
      manager.off('close', handleClose)
      manager.off('error', handleError)
      manager.off('message', handleMessage)
      manager.off('reconnecting', handleReconnecting)
      manager.off('reconnected', handleReconnected)
      manager.off('max_reconnect', handleMaxReconnect)
    }
  }, [
    onMessage,
    onOpen,
    onClose,
    onError,
    onReconnecting,
    onReconnected,
    onMaxReconnect,
    setStatus,
    setLastMessage,
    updateStats,
    setError,
  ])
  
  /**
   * 发送消息
   */
  const send = useCallback(<T = any>(data: T, type: MessageType = MessageType.MESSAGE): boolean => {
    if (!wsManager.current) {
      console.error('[useWebSocket] WebSocket 管理器未初始化')
      return false
    }
    
    return wsManager.current.send(data, type)
  }, [])
  
  /**
   * 连接
   */
  const connect = useCallback(() => {
    if (!wsManager.current) {
      console.error('[useWebSocket] WebSocket 管理器未初始化')
      return
    }
    
    wsManager.current.connect()
  }, [])
  
  /**
   * 断开连接
   */
  const disconnect = useCallback(() => {
    if (!wsManager.current) {
      console.error('[useWebSocket] WebSocket 管理器未初始化')
      return
    }
    
    wsManager.current.disconnect()
  }, [])
  
  /**
   * 清空消息队列
   */
  const clearQueue = useCallback(() => {
    if (!wsManager.current) {
      console.error('[useWebSocket] WebSocket 管理器未初始化')
      return
    }
    
    wsManager.current.clearQueue()
  }, [])
  
  /**
   * 添加事件监听器
   */
  const addEventListener = useCallback((event: WebSocketEventType, handler: WebSocketEventHandler) => {
    if (!wsManager.current) {
      console.error('[useWebSocket] WebSocket 管理器未初始化')
      return
    }
    
    wsManager.current.on(event, handler)
  }, [])
  
  /**
   * 移除事件监听器
   */
  const removeEventListener = useCallback((event: WebSocketEventType, handler: WebSocketEventHandler) => {
    if (!wsManager.current) {
      console.error('[useWebSocket] WebSocket 管理器未初始化')
      return
    }
    
    wsManager.current.off(event, handler)
  }, [])
  
  return {
    // 状态
    status,
    lastMessage,
    stats,
    error,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting' || status === 'reconnecting',
    isDisconnected: status === 'disconnected' || status === 'failed',
    
    // 方法
    send,
    connect,
    disconnect,
    clearQueue,
    addEventListener,
    removeEventListener,
  }
}

/**
 * 简化版 Hook - 仅用于发送和接收消息
 * 
 * @example
 * ```tsx
 * const { send, lastMessage } = useWebSocketSimple((message) => {
 *   console.log('收到消息:', message)
 * })
 * ```
 */
export const useWebSocketSimple = (onMessage?: (message: WebSocketMessage) => void) => {
  return useWebSocket({
    autoConnect: true,
    onMessage,
  })
}

export default useWebSocket

