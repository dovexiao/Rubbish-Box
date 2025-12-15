import { WebSocketConfig } from '../types/websocket'
import { API_BASE_URL } from './api'
import { IS_DEV } from './env'

/**
 * WebSocket 服务器地址
 */
export const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws')

/**
 * 默认 WebSocket 配置
 * 针对 RK3566 2GB 内存设备优化
 */
export const DEFAULT_WS_CONFIG: Required<WebSocketConfig> = {
  url: `${WS_BASE_URL}/ws/`,
  
  // 心跳配置：30秒心跳间隔，10秒超时
  heartbeatInterval: 30000,
  heartbeatTimeout: 10000,
  
  // 重连配置：指数退避策略
  reconnect: {
    initialDelay: 1000,       // 首次重连延迟 1秒
    maxDelay: 30000,          // 最大延迟 30秒
    maxAttempts: 10,          // 最多尝试 10次
    backoffMultiplier: 1.5,   // 退避倍数 1.5
  },
  
  // 消息队列：100条限制
  messageQueue: {
    maxSize: 100,
    strategy: 'fifo',
  },
  
  // 后台行为：暂停心跳但保持连接
  background: {
    pauseHeartbeat: true,
    closeConnection: false,
  },
  
  // 连接超时：10秒
  connectionTimeout: 10000,
  
  // 自动连接
  autoConnect: true,
  
  // 请求头（可根据需要添加）
  headers: {},
  
  // 协议（可选）
  protocols: undefined,
}

/**
 * 开发环境配置（更详细的日志）
 */
export const DEV_WS_CONFIG: Partial<WebSocketConfig> = {
  heartbeatInterval: 30000,   // 开发环境也用 30秒，便于调试
  reconnect: {
    initialDelay: 2000,       // 开发环境延迟稍长，便于观察
    maxAttempts: 5,           // 开发环境减少重连次数
  },
}

/**
 * 生产环境配置（更激进的重连）
 */
export const PROD_WS_CONFIG: Partial<WebSocketConfig> = {
  heartbeatInterval: 30000,
  reconnect: {
    initialDelay: 1000,
    maxAttempts: 10,
  },
}

/**
 * 获取当前环境的 WebSocket 配置
 */
export const getWebSocketConfig = (): Required<WebSocketConfig> => {
  const envConfig = IS_DEV ? DEV_WS_CONFIG : PROD_WS_CONFIG
  
  return {
    ...DEFAULT_WS_CONFIG,
    ...envConfig,
    reconnect: {
      ...DEFAULT_WS_CONFIG.reconnect,
      ...envConfig.reconnect,
    },
  }
}

