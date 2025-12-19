/**
 * WebSocket 相关类型定义
 */

/**
 * WebSocket 连接状态
 */
export enum WebSocketStatus {
  /** 未连接 */
  DISCONNECTED = 'disconnected',
  /** 连接中 */
  CONNECTING = 'connecting',
  /** 已连接 */
  CONNECTED = 'connected',
  /** 重连中 */
  RECONNECTING = 'reconnecting',
  /** 连接失败 */
  FAILED = 'failed',
}

/**
 * WebSocket 消息类型
 */
export enum MessageType {
  /** 心跳 ping */
  PING = 'ping',
  /** 心跳 pong */
  PONG = 'pong',
  /** 普通消息 */
  MESSAGE = 'message',
  /** 系统通知 */
  NOTIFICATION = 'notification',
  /** 错误消息 */
  ERROR = 'error',
  /** 用户活动 */
  USER_ACTIVITY = 'user_activity',
}

/**
 * WebSocket 消息结构
 */
export interface WebSocketMessage<T = any> {
  /** 消息类型 */
  type: MessageType
  /** 消息 ID（可选） */
  id?: string
  /** 时间戳 */
  timestamp: number
  /** 消息内容 */
  data?: T
  /** 错误信息（仅 error 类型） */
  error?: string
}

/**
 * 重连配置
 */
export interface ReconnectConfig {
  /** 初始延迟（毫秒），默认 1000 */
  initialDelay: number
  /** 最大延迟（毫秒），默认 30000 */
  maxDelay: number
  /** 最大重连次数，默认 10 */
  maxAttempts: number
  /** 退避倍数，默认 1.5 */
  backoffMultiplier: number
}

/**
 * 消息队列配置
 */
export interface MessageQueueConfig {
  /** 最大队列大小，默认 100 */
  maxSize: number
  /** 队列策略，默认 fifo */
  strategy: 'fifo' | 'lifo'
}

/**
 * 后台行为配置
 */
export interface BackgroundConfig {
  /** 后台是否暂停心跳，默认 true */
  pauseHeartbeat: boolean
  /** 后台是否关闭连接，默认 false */
  closeConnection: boolean
}

/**
 * WebSocket 配置
 */
export interface WebSocketConfig {
  /** WebSocket 服务器地址 */
  url: string
  /** 心跳间隔（毫秒），默认 30000 */
  heartbeatInterval?: number
  /** 心跳超时（毫秒），默认 10000 */
  heartbeatTimeout?: number
  /** 重连配置 */
  reconnect?: Partial<ReconnectConfig>
  /** 消息队列配置 */
  messageQueue?: Partial<MessageQueueConfig>
  /** 后台行为配置 */
  background?: Partial<BackgroundConfig>
  /** 连接超时（毫秒），默认 10000 */
  connectionTimeout?: number
  /** 是否自动连接，默认 true */
  autoConnect?: boolean
  /** 请求头（可选） */
  headers?: Record<string, string>
  /** 协议（可选） */
  protocols?: string | string[]
}

/**
 * WebSocket 事件类型
 */
export type WebSocketEventType = 
  | 'open'
  | 'close'
  | 'error'
  | 'message'
  | 'reconnecting'
  | 'reconnected'
  | 'max_reconnect'

/**
 * WebSocket 事件处理器
 */
export type WebSocketEventHandler<T = any> = (data?: T) => void | Promise<void>

/**
 * WebSocket 统计信息
 */
export interface WebSocketStats {
  /** 发送消息数 */
  sentMessages: number
  /** 接收消息数 */
  receivedMessages: number
  /** 失败消息数 */
  failedMessages: number
  /** 重连次数 */
  reconnectCount: number
  /** 最后连接时间 */
  lastConnectedAt: number | null
  /** 最后断开时间 */
  lastDisconnectedAt: number | null
  /** 连接持续时间（毫秒） */
  connectionDuration: number
}

/**
 * 队列消息项
 */
export interface QueuedMessage {
  /** 消息内容 */
  message: WebSocketMessage
  /** 加入队列时间 */
  enqueuedAt: number
  /** 重试次数 */
  retryCount: number
  /** 过期时间（毫秒） */
  expiresAt?: number
}

/**
 * 服务器消息格式（实际接收的原始格式）
 */
export interface ServerMessage {
  /** 消息类型 */
  type: string
  /** 其他字段根据类型动态 */
  [key: string]: any
}

/**
 * 设备状态服务器消息
 */
export interface DeviceStatusServerMessage extends ServerMessage {
  type: 'deviceStatus'
  bound: boolean
  dragVideo: boolean
  displayAnswer: boolean
  lockScreenNow: boolean
}

/**
 * 连接成功服务器消息
 */
export interface ConnectedServerMessage extends ServerMessage {
  type: 'connected'
  clientId: string
  deviceCode: string
  phone: string
}

/**
 * 用户活动确认服务器消息
 */
export interface UserActivityAckServerMessage extends ServerMessage {
  type: 'user_activity_ack'
  activityStatus: string
  activityType: string
  success: boolean
}

