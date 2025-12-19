import { useEffect, useRef } from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { useUserStore } from '../stores/userStore'
import { globalWebSocket } from '../services/globalWebSocket'
import { WebSocketStatus } from '../types/websocket'

/**
 * 全局 WebSocket Hook
 * 
 * 在应用根组件中使用，负责：
 * 1. 初始化 WebSocket 服务
 * 2. 监听用户登录状态，自动连接/断开
 * 3. 监听应用前后台切换
 * 
 * @example
 * ```tsx
 * // 在 _layout.tsx 或 App.tsx 中使用
 * function App() {
 *   useGlobalWebSocket()
 *   return <YourAppContent />
 * }
 * ```
 */
export function useGlobalWebSocket() {
  const isInitialized = useRef(false)
  const appState = useRef(AppState.currentState)
  
  // 获取用户信息
  const user = useUserStore((state) => state.user)
  const isLoggedIn = useUserStore((state) => state.isLoggedIn)

  // 初始化 WebSocket 服务（仅一次）
  useEffect(() => {
    if (isInitialized.current) return

    console.log('[useGlobalWebSocket] 初始化 WebSocket 服务')
    
    globalWebSocket.initialize()
      .then(() => {
        console.log('[useGlobalWebSocket] WebSocket 服务初始化完成')
        isInitialized.current = true
      })
      .catch((error) => {
        console.error('[useGlobalWebSocket] WebSocket 服务初始化失败:', error)
      })

    // 清理函数
    return () => {
      console.log('[useGlobalWebSocket] 清理 WebSocket 服务')
      globalWebSocket.destroy()
      isInitialized.current = false
    }
  }, [])

  // 监听用户登录状态变化
  useEffect(() => {
    if (!isLoggedIn || !user?.phone) {
      console.log('[useGlobalWebSocket] 用户未登录或无手机号，断开连接')
      globalWebSocket.disconnect()
      return
    }

    console.log('[useGlobalWebSocket] 用户已登录，准备连接 WebSocket')
    
    // 延迟一点时间再连接，确保其他初始化完成
    const timer = setTimeout(() => {
      globalWebSocket.connect(user.phone!)
        .then(() => {
          console.log('[useGlobalWebSocket] WebSocket 连接成功')
        })
        .catch((error) => {
          console.error('[useGlobalWebSocket] WebSocket 连接失败:', error)
        })
    }, 500)

    return () => {
      clearTimeout(timer)
    }
  }, [isLoggedIn, user?.phone])

  // 监听应用前后台切换
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      const wasActive = appState.current === 'active'
      const isActive = nextAppState === 'active'
      
      appState.current = nextAppState

      // 从后台切换到前台
      if (!wasActive && isActive) {
        console.log('[useGlobalWebSocket] 应用回到前台，检查 WebSocket 连接')
        
        // 如果用户已登录但 WebSocket 未连接，尝试重连
        if (isLoggedIn && user?.phone) {
          const status = globalWebSocket.getStatus()
          if (
            status !== WebSocketStatus.CONNECTED && 
            status !== WebSocketStatus.CONNECTING &&
            status !== WebSocketStatus.RECONNECTING
          ) {
            console.log('[useGlobalWebSocket] WebSocket 未连接，尝试重连')
            globalWebSocket.reconnect()
              .catch((error) => {
                console.error('[useGlobalWebSocket] 重连失败:', error)
              })
          }
        }
      }

      // 从前台切换到后台
      if (wasActive && !isActive) {
        console.log('[useGlobalWebSocket] 应用进入后台')
        // WebSocketManager 会自动处理后台逻辑（根据配置）
      }
    })

    return () => {
      subscription.remove()
    }
  }, [isLoggedIn, user?.phone])
}

/**
 * 手动连接 WebSocket
 * 用于特殊场景下的手动连接
 */
export function connectWebSocket(phone: string, deviceCode?: string): Promise<void> {
  return globalWebSocket.connect(phone, deviceCode)
}

/**
 * 手动断开 WebSocket
 */
export function disconnectWebSocket(): void {
  globalWebSocket.disconnect()
}

/**
 * 重新连接 WebSocket
 */
export function reconnectWebSocket(): Promise<void> {
  return globalWebSocket.reconnect()
}

/**
 * 发送 WebSocket 消息
 */
export function sendWebSocketMessage<T = any>(data: T, type?: any): boolean {
  return globalWebSocket.send(data, type)
}
