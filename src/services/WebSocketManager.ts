import { AppState, AppStateStatus } from 'react-native'
import {
  WebSocketConfig,
  WebSocketStatus,
  WebSocketMessage,
  MessageType,
  WebSocketEventType,
  WebSocketEventHandler,
  WebSocketStats,
  QueuedMessage,
} from '../types/websocket'
import { getWebSocketConfig } from '../config/websocket'

/**
<<<<<<< HEAD
 * WebSocket readyState 常量
 * React Native 中 WebSocket 没有 OPEN 等常量，使用数字代替
 */
const WS_READY_STATE = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3,
} as const

/**
=======
>>>>>>> dev
 * WebSocket 管理器（单例模式）
 * 提供稳定的 WebSocket 长连接管理
 * 
 * 特性：
 * - 自动重连（指数退避）
 * - 心跳保活
 * - 消息队列（离线缓存）
 * - 应用后台优化
 * - 完整的事件系统
 * - 统计信息
 */
export class WebSocketManager {
  private static instance: WebSocketManager | null = null
  
  // WebSocket 实例
  private ws: WebSocket | null = null
  
  // 配置
  private config: Required<WebSocketConfig>
  
  // 状态
  private status: WebSocketStatus = WebSocketStatus.DISCONNECTED
  
  // 定时器
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null
  private heartbeatTimeoutTimer: ReturnType<typeof setTimeout> | null = null
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private connectionTimeoutTimer: ReturnType<typeof setTimeout> | null = null
  
  // 重连状态
  private reconnectAttempts = 0
  private reconnectDelay = 0
  
  // 消息队列
  private messageQueue: QueuedMessage[] = []
  
  // 事件监听器
  private eventListeners: Map<WebSocketEventType, Set<WebSocketEventHandler>> = new Map()
  
  // 统计信息
  private stats: WebSocketStats = {
    sentMessages: 0,
    receivedMessages: 0,
    failedMessages: 0,
    reconnectCount: 0,
    lastConnectedAt: null,
    lastDisconnectedAt: null,
    connectionDuration: 0,
  }
  
  // 应用状态
  private appState: AppStateStatus = AppState.currentState
  private appStateSubscription: any = null
  
  // 心跳状态
  private lastPongTime = 0
  private isWaitingPong = false
  
  // 手动关闭标志（用于区分主动关闭和异常断开）
  private isManualClose = false

  private constructor(config?: Partial<WebSocketConfig>) {
    this.config = {
      ...getWebSocketConfig(),
      ...config,
    }
    
    this.reconnectDelay = this.config.reconnect.initialDelay
    
    // 监听应用状态变化
    this.setupAppStateListener()
  }

  /**
   * 获取单例实例
   */
  public static getInstance(config?: Partial<WebSocketConfig>): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager(config)
    }
    return WebSocketManager.instance
  }

  /**
   * 销毁单例（用于测试或重置）
   */
  public static destroyInstance(): void {
    if (WebSocketManager.instance) {
      WebSocketManager.instance.disconnect()
      WebSocketManager.instance.removeAppStateListener()
      WebSocketManager.instance = null
    }
  }

  /**
   * 连接 WebSocket
   */
  public connect(): void {
    if (this.status === WebSocketStatus.CONNECTED || this.status === WebSocketStatus.CONNECTING) {
      console.log('[WebSocket] 已连接或正在连接中，跳过')
      return
    }

    this.setStatus(WebSocketStatus.CONNECTING)
    this.isManualClose = false

    try {
      console.log(`[WebSocket] 正在连接: ${this.config.url}`)
      
      // 创建 WebSocket 实例
      this.ws = new WebSocket(this.config.url, this.config.protocols)
      
      // 设置连接超时
      this.connectionTimeoutTimer = setTimeout(() => {
        if (this.status === WebSocketStatus.CONNECTING) {
          console.error('[WebSocket] 连接超时')
          this.handleConnectionError(new Error('连接超时'))
        }
      }, this.config.connectionTimeout)
      
      // 绑定事件
      this.ws.onopen = this.handleOpen.bind(this)
      this.ws.onclose = this.handleClose.bind(this)
      this.ws.onerror = this.handleError.bind(this)
      this.ws.onmessage = this.handleMessage.bind(this)
      
    } catch (error) {
      console.error('[WebSocket] 连接失败:', error)
      this.handleConnectionError(error as Error)
    }
  }

  /**
   * 断开连接
   */
  public disconnect(): void {
    console.log('[WebSocket] 主动断开连接')
    this.isManualClose = true
    this.cleanup()
  }

  /**
   * 发送消息
   */
  public send<T = any>(data: T, type: MessageType = MessageType.MESSAGE): boolean {
    const message: WebSocketMessage<T> = {
      type,
      timestamp: Date.now(),
      data,
    }

    // 如果已连接，直接发送
<<<<<<< HEAD
    if (this.status === WebSocketStatus.CONNECTED && this.ws?.readyState === WS_READY_STATE.OPEN) {
=======
    if (this.status === WebSocketStatus.CONNECTED && this.ws?.readyState === WebSocket.OPEN) {
>>>>>>> dev
      return this.sendMessage(message)
    }

    // 否则加入队列
    this.enqueueMessage(message)
    return false
  }

  /**
   * 添加事件监听器
   */
  public on(event: WebSocketEventType, handler: WebSocketEventHandler): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)!.add(handler)
  }

  /**
   * 移除事件监听器
   */
  public off(event: WebSocketEventType, handler: WebSocketEventHandler): void {
    const handlers = this.eventListeners.get(event)
    if (handlers) {
      handlers.delete(handler)
    }
  }

  /**
   * 获取当前状态
   */
  public getStatus(): WebSocketStatus {
    return this.status
  }

  /**
   * 获取统计信息
   */
  public getStats(): WebSocketStats {
    // 如果当前已连接，计算连接持续时间
    if (this.status === WebSocketStatus.CONNECTED && this.stats.lastConnectedAt) {
      return {
        ...this.stats,
        connectionDuration: Date.now() - this.stats.lastConnectedAt,
      }
    }
    return { ...this.stats }
  }

  /**
   * 更新配置
   */
  public updateConfig(config: Partial<WebSocketConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    }
  }

  /**
   * 清空消息队列
   */
  public clearQueue(): void {
    this.messageQueue = []
    console.log('[WebSocket] 消息队列已清空')
  }

  // ==================== 私有方法 ====================

  /**
   * 处理连接打开
   */
  private handleOpen(): void {
    console.log('[WebSocket] 连接已建立')
    
    // 清除连接超时定时器
    if (this.connectionTimeoutTimer) {
      clearTimeout(this.connectionTimeoutTimer)
      this.connectionTimeoutTimer = null
    }
    
    this.setStatus(WebSocketStatus.CONNECTED)
    this.stats.lastConnectedAt = Date.now()
    
    // 重置重连状态
    if (this.reconnectAttempts > 0) {
      this.stats.reconnectCount++
      this.emit('reconnected')
    }
    this.reconnectAttempts = 0
    this.reconnectDelay = this.config.reconnect.initialDelay
    
    // 启动心跳
    this.startHeartbeat()
    
    // 发送队列中的消息
    this.flushMessageQueue()
    
    // 触发 open 事件
    this.emit('open')
  }

  /**
   * 处理连接关闭
   */
  private handleClose(event: CloseEvent): void {
    console.log('[WebSocket] 连接已关闭:', event.code, event.reason)
    
    this.stats.lastDisconnectedAt = Date.now()
    
    // 停止心跳
    this.stopHeartbeat()
    
    // 清除连接超时定时器
    if (this.connectionTimeoutTimer) {
      clearTimeout(this.connectionTimeoutTimer)
      this.connectionTimeoutTimer = null
    }
    
    // 触发 close 事件
    this.emit('close', { code: event.code, reason: event.reason })
    
    // 如果不是手动关闭，尝试重连
    if (!this.isManualClose) {
      this.attemptReconnect()
    } else {
      this.setStatus(WebSocketStatus.DISCONNECTED)
    }
  }

  /**
   * 处理错误
   */
  private handleError(event: Event): void {
    console.error('[WebSocket] 发生错误:', event)
    this.emit('error', event)
  }

  /**
   * 处理连接错误
   */
  private handleConnectionError(error: Error): void {
    this.setStatus(WebSocketStatus.FAILED)
    this.emit('error', error)
    
    // 清除连接超时定时器
    if (this.connectionTimeoutTimer) {
      clearTimeout(this.connectionTimeoutTimer)
      this.connectionTimeoutTimer = null
    }
    
    // 尝试重连
    if (!this.isManualClose) {
      this.attemptReconnect()
    }
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data)
      
      this.stats.receivedMessages++
      
      // 处理心跳响应
      if (message.type === MessageType.PONG) {
        this.handlePong()
        return
      }
      
      // 触发 message 事件
      this.emit('message', message)
      
    } catch (error) {
      console.error('[WebSocket] 消息解析失败:', error)
      this.emit('error', error)
    }
  }

  /**
   * 发送消息（内部方法）
   */
  private sendMessage(message: WebSocketMessage): boolean {
    try {
<<<<<<< HEAD
      if (!this.ws || this.ws.readyState !== WS_READY_STATE.OPEN) {
=======
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
>>>>>>> dev
        throw new Error('WebSocket 未连接')
      }
      
      this.ws.send(JSON.stringify(message))
      this.stats.sentMessages++
      return true
      
    } catch (error) {
      console.error('[WebSocket] 发送消息失败:', error)
      this.stats.failedMessages++
      this.enqueueMessage(message)
      return false
    }
  }

  /**
   * 消息加入队列
   */
  private enqueueMessage(message: WebSocketMessage): void {
    const queuedMessage: QueuedMessage = {
      message,
      enqueuedAt: Date.now(),
      retryCount: 0,
    }
    
    // 检查队列大小
    if (this.messageQueue.length >= this.config.messageQueue.maxSize) {
      // FIFO: 移除最旧的消息
      if (this.config.messageQueue.strategy === 'fifo') {
        this.messageQueue.shift()
      } else {
        // LIFO: 移除最新的消息
        this.messageQueue.pop()
      }
      console.warn('[WebSocket] 消息队列已满，移除旧消息')
    }
    
    this.messageQueue.push(queuedMessage)
    console.log(`[WebSocket] 消息已加入队列，当前队列长度: ${this.messageQueue.length}`)
  }

  /**
   * 发送队列中的消息
   */
  private flushMessageQueue(): void {
    if (this.messageQueue.length === 0) return
    
    console.log(`[WebSocket] 开始发送队列消息，共 ${this.messageQueue.length} 条`)
    
    const failedMessages: QueuedMessage[] = []
    
    while (this.messageQueue.length > 0) {
      const queuedMessage = this.messageQueue.shift()!
      const success = this.sendMessage(queuedMessage.message)
      
      if (!success) {
        queuedMessage.retryCount++
        failedMessages.push(queuedMessage)
      }
    }
    
    // 将失败的消息重新加入队列
    this.messageQueue = failedMessages
    
    if (failedMessages.length > 0) {
      console.warn(`[WebSocket] ${failedMessages.length} 条消息发送失败，已重新加入队列`)
    }
  }

  /**
   * 启动心跳
   */
  private startHeartbeat(): void {
    // 如果在后台且配置了暂停心跳，则不启动
    if (this.appState !== 'active' && this.config.background.pauseHeartbeat) {
      console.log('[WebSocket] 应用在后台，暂停心跳')
      return
    }
    
    this.stopHeartbeat()
    
    console.log(`[WebSocket] 启动心跳，间隔: ${this.config.heartbeatInterval}ms`)
    
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat()
    }, this.config.heartbeatInterval)
  }

  /**
   * 停止心跳
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
    
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer)
      this.heartbeatTimeoutTimer = null
    }
    
    this.isWaitingPong = false
  }

  /**
   * 发送心跳
   */
  private sendHeartbeat(): void {
    // 如果正在等待 pong，检查是否超时
    if (this.isWaitingPong) {
      const elapsed = Date.now() - this.lastPongTime
      if (elapsed > this.config.heartbeatTimeout) {
        console.error('[WebSocket] 心跳超时，准备重连')
        this.cleanup()
        this.attemptReconnect()
        return
      }
    }
    
    // 发送 ping
    const success = this.send(null, MessageType.PING)
    
    if (success) {
      this.isWaitingPong = true
      this.lastPongTime = Date.now()
      
      // 设置心跳超时定时器
      this.heartbeatTimeoutTimer = setTimeout(() => {
        if (this.isWaitingPong) {
          console.error('[WebSocket] 心跳超时，准备重连')
          this.cleanup()
          this.attemptReconnect()
        }
      }, this.config.heartbeatTimeout)
    }
  }

  /**
   * 处理心跳响应
   */
  private handlePong(): void {
    this.isWaitingPong = false
    
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer)
      this.heartbeatTimeoutTimer = null
    }
  }

  /**
   * 尝试重连
   */
  private attemptReconnect(): void {
    // 检查是否超过最大重连次数
    if (this.reconnectAttempts >= this.config.reconnect.maxAttempts) {
      console.error('[WebSocket] 已达到最大重连次数，停止重连')
      this.setStatus(WebSocketStatus.FAILED)
      this.emit('max_reconnect')
      return
    }
    
    this.setStatus(WebSocketStatus.RECONNECTING)
    this.reconnectAttempts++
    
    console.log(
      `[WebSocket] 准备重连 (${this.reconnectAttempts}/${this.config.reconnect.maxAttempts})，延迟: ${this.reconnectDelay}ms`
    )
    
    this.emit('reconnecting', { attempt: this.reconnectAttempts, delay: this.reconnectDelay })
    
    // 设置重连定时器
    this.reconnectTimer = setTimeout(() => {
      this.connect()
    }, this.reconnectDelay)
    
    // 计算下次重连延迟（指数退避）
    this.reconnectDelay = Math.min(
      this.reconnectDelay * this.config.reconnect.backoffMultiplier,
      this.config.reconnect.maxDelay
    )
  }

  /**
   * 清理资源
   */
  private cleanup(): void {
    // 停止心跳
    this.stopHeartbeat()
    
    // 清除重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    // 清除连接超时定时器
    if (this.connectionTimeoutTimer) {
      clearTimeout(this.connectionTimeoutTimer)
      this.connectionTimeoutTimer = null
    }
    
    // 关闭 WebSocket
    if (this.ws) {
      try {
        this.ws.close()
      } catch (error) {
        console.error('[WebSocket] 关闭连接时出错:', error)
      }
      this.ws = null
    }
  }

  /**
   * 设置状态
   */
  private setStatus(status: WebSocketStatus): void {
    if (this.status !== status) {
      console.log(`[WebSocket] 状态变更: ${this.status} -> ${status}`)
      this.status = status
    }
  }

  /**
   * 触发事件
   */
  private emit(event: WebSocketEventType, data?: any): void {
    const handlers = this.eventListeners.get(event)
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data)
        } catch (error) {
          console.error(`[WebSocket] 事件处理器执行失败 (${event}):`, error)
        }
      })
    }
  }

  /**
   * 设置应用状态监听
   */
  private setupAppStateListener(): void {
    this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange.bind(this))
  }

  /**
   * 移除应用状态监听
   */
  private removeAppStateListener(): void {
    if (this.appStateSubscription) {
      this.appStateSubscription.remove()
      this.appStateSubscription = null
    }
  }

  /**
   * 处理应用状态变化
   */
  private handleAppStateChange(nextAppState: AppStateStatus): void {
    console.log(`[WebSocket] 应用状态变化: ${this.appState} -> ${nextAppState}`)
    
    const wasActive = this.appState === 'active'
    const isActive = nextAppState === 'active'
    
    this.appState = nextAppState
    
    // 从后台切换到前台
    if (!wasActive && isActive) {
      console.log('[WebSocket] 应用回到前台')
      
      // 恢复心跳
      if (this.status === WebSocketStatus.CONNECTED && this.config.background.pauseHeartbeat) {
        this.startHeartbeat()
      }
      
      // 如果配置了后台关闭连接，则重新连接
      if (this.config.background.closeConnection && this.config.autoConnect) {
        this.connect()
      }
    }
    
    // 从前台切换到后台
    if (wasActive && !isActive) {
      console.log('[WebSocket] 应用进入后台')
      
      // 暂停心跳
      if (this.config.background.pauseHeartbeat) {
        this.stopHeartbeat()
      }
      
      // 关闭连接
      if (this.config.background.closeConnection) {
        this.disconnect()
      }
    }
  }
}

// 导出单例实例
export default WebSocketManager.getInstance()

