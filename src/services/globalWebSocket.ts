import { WebSocketManager } from './WebSocketManager'
import { useDeviceStatusStore, DeviceStatus } from '../stores/deviceStatusStore'
import { useWebSocketStore } from '../stores/webSocketStore'
import { WebSocketMessage, MessageType, WebSocketStatus } from '../types/websocket'
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
      console.error('[GlobalWebSocket] 服务未初始化')
      return
    }

    // 获取设备码
    const finalDeviceCode = deviceCode || await getDeviceCode()
    
    if (!finalDeviceCode) {
      console.error('[GlobalWebSocket] 设备码为空，无法连接')
      return
    }

    console.log('[GlobalWebSocket] 准备连接:', { phone, deviceCode: finalDeviceCode })

    // 如果已连接且参数相同，不需要重新连接
    if (
      this.currentPhone === phone && 
      this.currentDeviceCode === finalDeviceCode &&
      this.wsManager.getStatus() === 'connected'
    ) {
      console.log('[GlobalWebSocket] 已连接且参数相同，跳过重连')
      return
    }

    // 保存当前连接参数
    this.currentPhone = phone
    this.currentDeviceCode = finalDeviceCode

    // 更新 WebSocket URL
    const wsUrl = `ws://115.190.2.98:2333?deviceCode=${encodeURIComponent(finalDeviceCode)}&phone=${encodeURIComponent(phone)}`
    this.wsManager.updateConfig({ url: wsUrl })

    // 断开旧连接
    this.wsManager.disconnect()

    // 等待一小段时间再连接
    await new Promise(resolve => setTimeout(resolve, 100))

    // 连接
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
  public getStatus(): string {
    return this.wsManager?.getStatus() ?? 'disconnected'
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
      // 服务器返回的消息格式是：{ type: 'deviceStatus', bound: false, dragVideo: true, displayAnswer: true }
      // 或者 { type: 'connected', clientId: '...', deviceCode: '...', phone: '...' }
      
      // 检查消息本身的 type 字段（兼容新旧格式）
      const messageType = (message as any).type || message.type
      const messageData = message.data || message

      // 处理设备状态消息
      if (messageType === 'deviceStatus') {
        this.handleDeviceStatus(messageData)
        return
      }

      // 处理连接成功消息
      if (messageType === 'connected') {
        console.log('[GlobalWebSocket] 客户端连接成功:', messageData)
        return
      }

      // 其他消息类型可以在这里添加处理逻辑
      console.log('[GlobalWebSocket] 未处理的消息类型:', messageType)

    } catch (error) {
      console.error('[GlobalWebSocket] 消息处理失败:', error)
    }
  }

  /**
   * 处理设备状态消息
   */
  private handleDeviceStatus(data: any): void {
    console.log('[GlobalWebSocket] 收到设备状态数据:', data)

    try {
      if (!data) {
        console.error('[GlobalWebSocket] 设备状态数据为空')
        return
      }

      const deviceStatus: DeviceStatus = {
        bound: data.bound ?? false,
        dragVideo: data.dragVideo ?? false,
        displayAnswer: data.displayAnswer ?? false,
      }

      console.log('[GlobalWebSocket] 解析后的设备状态:', deviceStatus)

      // 更新 store
      useDeviceStatusStore.getState().setStatus(deviceStatus)

      console.log('[GlobalWebSocket] 设备状态已更新到 store')
    } catch (error) {
      console.error('[GlobalWebSocket] 设备状态解析失败:', error)
    }
  }

  /**
   * 销毁服务
   */
  public destroy(): void {
    console.log('[GlobalWebSocket] 销毁服务')
    
    this.disconnect()
    
    if (this.wsManager) {
      WebSocketManager.destroyInstance()
      this.wsManager = null
    }
    
    this.isInitialized = false
  }
}

// 导出单例实例
export const globalWebSocket = new GlobalWebSocketService()

// 默认导出
export default globalWebSocket
