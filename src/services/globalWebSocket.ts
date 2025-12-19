import { WebSocketManager } from './WebSocketManager'
import { useDeviceStatusStore, DeviceStatus } from '../stores/deviceStatusStore'
import { useWebSocketStore } from '../stores/webSocketStore'
import { useActivityStore } from '../stores/activityStore'
import { 
  WebSocketMessage, 
  MessageType, 
  WebSocketStatus,
  ServerMessage,
  DeviceStatusServerMessage,
  ConnectedServerMessage,
  UserActivityAckServerMessage,
  WebSocketEventType
} from '../types/websocket'
import { getDeviceCode } from '../utils/deviceInfo'

/**
 * 全局 WebSocket 服务
 * 负责管理应用级别的 WebSocket 连接
 * 
 * 功能：
 * - 保持与服务器的长连接
 * - 接收设备状态更新
 * - 用户登录/切换时重新连接
 */
class GlobalWebSocketService {
  private wsManager: WebSocketManager | null = null
  private currentPhone: string | null = null
  private currentDeviceCode: string | null = null
  private isInitialized = false

  /**
   * 初始化服务
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('[GlobalWebSocket] 服务已初始化')
      return
    }

    console.log('[GlobalWebSocket] 初始化服务')
    
    // 创建 WebSocket Manager 实例（不自动连接）
    this.wsManager = WebSocketManager.getInstance({
      autoConnect: false, // 手动控制连接时机
    })

    // 注册事件监听器
    this.setupEventListeners()

    this.isInitialized = true
    console.log('[GlobalWebSocket] 服务初始化完成')
  }

  /**
   * 连接 WebSocket
   * @param phone 用户手机号
   * @param deviceCode 设备码
   */
  public async connect(phone: string, deviceCode?: string): Promise<void> {
    if (!this.wsManager) {
      const error = new Error('WebSocket服务未初始化')
      console.error('[GlobalWebSocket]', error.message)
      throw error
    }

    // 获取设备码
    const finalDeviceCode = deviceCode || await getDeviceCode()
    
    if (!finalDeviceCode) {
      const error = new Error('设备码为空，无法连接')
      console.error('[GlobalWebSocket]', error.message)
      throw error
    }

    console.log('[GlobalWebSocket] 准备连接:', { phone, deviceCode: finalDeviceCode })

    // 如果已连接且参数相同，不需要重新连接
    if (
      this.currentPhone === phone && 
      this.currentDeviceCode === finalDeviceCode &&
      this.wsManager.getStatus() === WebSocketStatus.CONNECTED
    ) {
      console.log('[GlobalWebSocket] 已连接且参数相同，跳过重连')
      return
    }

    // 检查是否需要切换连接（用户切换）
    const isSwitchingUser = this.currentPhone && this.currentPhone !== phone

    if (isSwitchingUser) {
      console.log('[GlobalWebSocket] 检测到用户切换，清理旧连接状态')
      // 清空消息队列（旧用户的消息不应该发送给新用户）
      this.wsManager.clearQueue()
      // 重置设备状态
      useDeviceStatusStore.getState().reset()
    }

    // 保存当前连接参数
    this.currentPhone = phone
    this.currentDeviceCode = finalDeviceCode

    // 更新 WebSocket URL
    const wsUrl = `ws://115.190.2.98:2333?deviceCode=${encodeURIComponent(finalDeviceCode)}&phone=${encodeURIComponent(phone)}`
    
    // 先断开旧连接
    const currentStatus = this.wsManager.getStatus()
    if (currentStatus !== WebSocketStatus.DISCONNECTED) {
      console.log('[GlobalWebSocket] 断开旧连接')
      this.wsManager.disconnect()
      
      // 等待断开完成（最多等待500ms）
      const startTime = Date.now()
      while (
        this.wsManager.getStatus() !== WebSocketStatus.DISCONNECTED && 
        Date.now() - startTime < 500
      ) {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    }

    // 更新配置
    this.wsManager.updateConfig({ url: wsUrl })

    // 连接
    console.log('[GlobalWebSocket] 开始建立新连接')
    this.wsManager.connect()
  }

  /**
   * 断开连接
   */
  public disconnect(): void {
    if (!this.wsManager) return

    console.log('[GlobalWebSocket] 断开连接')
    
    this.wsManager.disconnect()
    this.currentPhone = null
    this.currentDeviceCode = null
    
    // 重置设备状态
    useDeviceStatusStore.getState().reset()
  }

  /**
   * 重新连接
   * 使用当前保存的连接参数
   */
  public async reconnect(): Promise<void> {
    if (!this.currentPhone || !this.currentDeviceCode) {
      console.warn('[GlobalWebSocket] 缺少连接参数，无法重连')
      return
    }

    await this.connect(this.currentPhone, this.currentDeviceCode)
  }

  /**
   * 获取连接状态
   */
  public getStatus(): WebSocketStatus {
    return this.wsManager?.getStatus() ?? WebSocketStatus.DISCONNECTED
  }

  /**
   * 获取统计信息
   */
  public getStats() {
    if (!this.wsManager) {
      return {
        sentMessages: 0,
        receivedMessages: 0,
        failedMessages: 0,
        reconnectCount: 0,
        lastConnectedAt: null,
        lastDisconnectedAt: null,
        connectionDuration: 0,
      }
    }

    return this.wsManager.getStats()
  }

  /**
   * 发送消息
   */
  public send<T = any>(data: T, type?: MessageType): boolean {
    if (!this.wsManager) {
      console.error('[GlobalWebSocket] 服务未初始化')
      return false
    }

    return this.wsManager.send(data, type)
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (!this.wsManager) return

    // 监听连接打开
    this.wsManager.on('open', () => {
      console.log('[GlobalWebSocket] 连接已建立')
      useWebSocketStore.getState().setStatus(WebSocketStatus.CONNECTED)
    })

    // 监听连接关闭
    this.wsManager.on('close', () => {
      console.log('[GlobalWebSocket] 连接已关闭')
      useWebSocketStore.getState().setStatus(WebSocketStatus.DISCONNECTED)
    })

    // 监听连接错误
    this.wsManager.on('error', (error) => {
      console.error('[GlobalWebSocket] 连接错误:', error)
      useWebSocketStore.getState().setError(error)
    })

    // 监听重连
    this.wsManager.on('reconnecting', (data) => {
      console.log('[GlobalWebSocket] 正在重连...', data)
      useWebSocketStore.getState().setStatus(WebSocketStatus.RECONNECTING)
    })

    // 监听消息
    this.wsManager.on('message', (message: WebSocketMessage) => {
      this.handleMessage(message)
    })
  }

  /**
   * 处理接收到的消息
   */
  private handleMessage(message: WebSocketMessage): void {
    console.log('[GlobalWebSocket] 收到消息:', message)

    try {
      // 服务器消息格式：{ type: 'deviceStatus', bound: false, dragVideo: true, displayAnswer: true }
      // WebSocketManager 包装后：{ type: MESSAGE, timestamp: xxx, data: {...} }
      
      // 1. 先尝试从 data 中获取服务器消息
      let serverMessage: ServerMessage | null = null
      
      if (message.data && typeof message.data === 'object' && 'type' in message.data) {
        serverMessage = message.data as ServerMessage
      } 
      // 2. 如果消息本身就是服务器格式（旧版兼容）
      else if ('type' in message && typeof (message as any).type === 'string') {
        serverMessage = message as any as ServerMessage
      }

      if (!serverMessage || !serverMessage.type) {
        console.warn('[GlobalWebSocket] 无法识别的消息格式:', message)
        return
      }

      const messageType = serverMessage.type

      // 处理设备状态消息
      if (messageType === 'deviceStatus') {
        this.handleDeviceStatus(serverMessage as DeviceStatusServerMessage)
        return
      }

      // 处理连接成功消息
      if (messageType === 'connected') {
        console.log('[GlobalWebSocket] 客户端连接成功:', serverMessage)
        return
      }

      // 处理用户活动确认消息
      if (messageType === 'user_activity_ack') {
        this.handleUserActivityAck(serverMessage as UserActivityAckServerMessage)
        return
      }

      // 其他消息类型可以在这里添加处理逻辑
      console.log('[GlobalWebSocket] 未处理的消息类型:', messageType)

    } catch (error) {
      console.error('[GlobalWebSocket] 消息处理失败:', error)
      this.emit('error', error)
    }
  }

  /**
   * 处理设备状态消息
   */
  private handleDeviceStatus(data: DeviceStatusServerMessage): void {
    console.log('[GlobalWebSocket] 收到设备状态数据:', data)

    try {
      if (!data || typeof data !== 'object') {
        console.error('[GlobalWebSocket] 设备状态数据无效')
        this.emit('error', new Error('Invalid device status data'))
        return
      }

      const deviceStatus: DeviceStatus = {
        bound: Boolean(data.bound),
        dragVideo: Boolean(data.dragVideo),
        displayAnswer: Boolean(data.displayAnswer),
        lockScreenNow: Boolean(data.lockScreenNow),
      }

      console.log('[GlobalWebSocket] 解析后的设备状态:', deviceStatus)

      // 更新 store
      useDeviceStatusStore.getState().setStatus(deviceStatus)

      console.log('[GlobalWebSocket] 设备状态已更新到 store')
    } catch (error) {
      console.error('[GlobalWebSocket] 设备状态解析失败:', error)
      this.emit('error', error)
    }
  }

  /**
   * 处理用户活动确认消息
   */
  private handleUserActivityAck(data: UserActivityAckServerMessage): void {
    console.log('[GlobalWebSocket] 收到用户活动确认:', data)

    try {
      if (!data || typeof data !== 'object') {
        console.error('[GlobalWebSocket] 活动确认数据无效')
        return
      }

      // 如果服务器确认收到退出消息，且成功，则清除本地活动
      if (data.success && data.activityStatus === 'exit') {
        console.log('[GlobalWebSocket] 服务器已确认活动退出，清除本地活动状态')
        // 延迟一点时间再清除，确保消息已处理
        setTimeout(() => {
          useActivityStore.getState().clearActivity()
        }, 500)
      } else if (data.success) {
        console.log('[GlobalWebSocket] 服务器已确认活动状态:', data.activityStatus)
      } else {
        console.warn('[GlobalWebSocket] 服务器确认活动失败:', data)
      }
    } catch (error) {
      console.error('[GlobalWebSocket] 处理活动确认失败:', error)
    }
  }

  /**
   * 触发事件（内部使用）
   */
  private emit(event: WebSocketEventType, data?: any): void {
    // 可以在这里添加全局事件处理
    console.log(`[GlobalWebSocket] 事件触发: ${event}`, data)
  }

  /**
   * 销毁服务
   */
  public destroy(): void {
    console.log('[GlobalWebSocket] 销毁服务')
    
    this.disconnect()
    
    if (this.wsManager) {
      // 清理所有事件监听器
      this.cleanupEventListeners()
      WebSocketManager.destroyInstance()
      this.wsManager = null
    }
    
    this.isInitialized = false
  }

  /**
   * 清理事件监听器
   */
  private cleanupEventListeners(): void {
    if (!this.wsManager) return
    
    console.log('[GlobalWebSocket] 清理事件监听器')
    
    // 移除所有事件监听器
    // 注意：WebSocketManager 内部的 Set 会在 destroyInstance 时被清理
    // 这里只是确保 store 的引用被清理
    useWebSocketStore.getState().reset()
  }
}

// 导出单例实例
export const globalWebSocket = new GlobalWebSocketService()

// 默认导出
export default globalWebSocket
