import { create } from 'zustand'
import { WebSocketStatus, WebSocketMessage, WebSocketStats } from '../types/websocket'

/**
 * WebSocket Store 状态接口
 */
interface WebSocketStore {
  /** 连接状态 */
  status: WebSocketStatus
  
  /** 最后一条消息 */
  lastMessage: WebSocketMessage | null
  
  /** 统计信息 */
  stats: WebSocketStats
  
  /** 错误信息 */
  error: Error | null
  
  /** 是否已初始化 */
  isInitialized: boolean
  
  // Actions
  /** 设置连接状态 */
  setStatus: (status: WebSocketStatus) => void
  
  /** 设置最后一条消息 */
  setLastMessage: (message: WebSocketMessage) => void
  
  /** 更新统计信息 */
  updateStats: (stats: Partial<WebSocketStats>) => void
  
  /** 设置错误 */
  setError: (error: Error | null) => void
  
  /** 设置初始化状态 */
  setInitialized: (initialized: boolean) => void
  
  /** 重置状态 */
  reset: () => void
}

/**
 * 初始统计信息
 */
const initialStats: WebSocketStats = {
  sentMessages: 0,
  receivedMessages: 0,
  failedMessages: 0,
  reconnectCount: 0,
  lastConnectedAt: null,
  lastDisconnectedAt: null,
  connectionDuration: 0,
}

/**
 * WebSocket 状态管理 Store
 * 使用 Zustand 管理 WebSocket 连接状态和消息
 */
export const useWebSocketStore = create<WebSocketStore>((set) => ({
  // 初始状态
  status: WebSocketStatus.DISCONNECTED,
  lastMessage: null,
  stats: initialStats,
  error: null,
  isInitialized: false,
  
  // Actions
  setStatus: (status) => {
    console.log(`[WebSocketStore] 状态更新: ${status}`)
    set({ status })
  },
  
  setLastMessage: (message) => {
    set({ lastMessage: message })
  },
  
  updateStats: (statsUpdate) => {
    set((state) => ({
      stats: {
        ...state.stats,
        ...statsUpdate,
      },
    }))
  },
  
  setError: (error) => {
    if (error) {
      console.error('[WebSocketStore] 错误:', error)
    }
    set({ error })
  },
  
  setInitialized: (initialized) => {
    console.log(`[WebSocketStore] 初始化状态: ${initialized}`)
    set({ isInitialized: initialized })
  },
  
  reset: () => {
    console.log('[WebSocketStore] 重置状态')
    set({
      status: WebSocketStatus.DISCONNECTED,
      lastMessage: null,
      stats: initialStats,
      error: null,
      isInitialized: false,
    })
  },
}))

/**
 * 选择器：是否已连接
 */
export const selectIsConnected = (state: WebSocketStore) => 
  state.status === WebSocketStatus.CONNECTED

/**
 * 选择器：是否正在连接
 */
export const selectIsConnecting = (state: WebSocketStore) => 
  state.status === WebSocketStatus.CONNECTING || state.status === WebSocketStatus.RECONNECTING

/**
 * 选择器：是否断开连接
 */
export const selectIsDisconnected = (state: WebSocketStore) => 
  state.status === WebSocketStatus.DISCONNECTED || state.status === WebSocketStatus.FAILED

/**
 * 选择器：连接是否健康
 */
export const selectIsHealthy = (state: WebSocketStore) => {
  if (state.status !== WebSocketStatus.CONNECTED) return false
  
  // 检查最近是否有心跳
  const now = Date.now()
  const lastConnected = state.stats.lastConnectedAt
  
  if (!lastConnected) return false
  
  // 如果连接时间超过 2 分钟没有活动，认为不健康
  return now - lastConnected < 120000
}

