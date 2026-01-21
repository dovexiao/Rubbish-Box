import { Alert } from 'react-native'
import { useUserStore } from '../stores/userStore'
import { useNetworkStore } from '../stores/networkStore'
import { openWifiSettings } from '../services/systemSettings'

/**
 * 登录工具函数
 * 提供便捷的登录检查和登录弹窗调用
 */

// 全局登录弹窗引用
let globalLoginModalRef: {
  showLoginModal: (options?: { onSuccess?: () => void; onCancel?: () => void }) => void
  hideLoginModal: () => void
} | null = null

// 全局网络弹窗控制函数
let globalNetworkModalController: {
  showNetworkModal: (type: 'no-connection' | '2.4g-warning') => void
} | null = null

/**
 * 设置全局登录弹窗引用
 */
export function setLoginModalRef(ref: typeof globalLoginModalRef) {
  globalLoginModalRef = ref
}

/**
 * 获取全局登录弹窗引用
 */
export function getLoginModalRef() {
  return globalLoginModalRef
}

/**
 * 设置全局网络弹窗控制器
 */
export function setNetworkModalController(controller: typeof globalNetworkModalController) {
  globalNetworkModalController = controller
}

/**
 * 获取全局网络弹窗控制器
 */
export function getNetworkModalController() {
  return globalNetworkModalController
}

/**
 * 检查用户是否已登录
 */
export function isUserLoggedIn(): boolean {
  const userStore = useUserStore.getState()
  return !!(userStore.user && userStore.token)
}

/**
 * 显示登录弹窗
 */
export function showLoginModal(options?: {
  onSuccess?: () => void
  onCancel?: () => void
}) {
  // 🔍 在弹出登录框前验证网络状态
  const networkStore = useNetworkStore.getState()
  const isConnected = networkStore.isConnected

  if (!isConnected) {
    console.log('🌐 网络未连接，显示网络设置弹窗')

    // 显示网络设置弹窗（未连接网络类型）
    const networkModalController = getNetworkModalController()
    if (networkModalController) {
      networkModalController.showNetworkModal('no-connection')
    } else {
      console.warn('网络弹窗控制器未设置，使用Alert提示')
      Alert.alert(
        '网络未连接',
        '请先连接网络后再进行登录操作',
        [{ text: '知道了' }]
      )
    }

    return
  }

  if (globalLoginModalRef) {
    globalLoginModalRef.showLoginModal(options)
  } else {
    console.warn('登录弹窗引用未设置')
    Alert.alert('提示', '登录功能暂不可用')
  }
}

/**
 * 隐藏登录弹窗
 */
export function hideLoginModal() {
  if (globalLoginModalRef) {
    globalLoginModalRef.hideLoginModal()
  }
}

/**
 * 需要登录的操作包装器
 * 如果用户未登录，自动显示登录弹窗
 */
export function requireLogin<T extends (...args: any[]) => any>(
  action: T,
  options?: {
    onLoginSuccess?: () => void
    onLoginCancel?: () => void
  }
): T {
  return ((...args: Parameters<T>) => {
    if (isUserLoggedIn()) {
      // 用户已登录，直接执行操作
      return action(...args)
    } else {
      // 用户未登录，显示登录弹窗
      showLoginModal({
        onSuccess: () => {
          // 登录成功后执行原操作
          action(...args)
          options?.onLoginSuccess?.()
        },
        onCancel: options?.onLoginCancel,
      })
    }
  }) as T
}

/**
 * 登录后执行操作
 * 如果已登录直接执行，否则先登录再执行
 */
export async function withLogin<T>(
  action: () => T | Promise<T>,
  options?: {
    onLoginSuccess?: () => void
    onLoginCancel?: () => void
  }
): Promise<T | null> {
  return new Promise((resolve) => {
    if (isUserLoggedIn()) {
      // 用户已登录，直接执行操作
      const result = action()
      if (result instanceof Promise) {
        result.then(resolve).catch(() => resolve(null))
      } else {
        resolve(result)
      }
    } else {
      // 用户未登录，显示登录弹窗
      showLoginModal({
        onSuccess: async () => {
          try {
            const result = action()
            if (result instanceof Promise) {
              const value = await result
              resolve(value)
            } else {
              resolve(result)
            }
            options?.onLoginSuccess?.()
          } catch (error) {
            console.error('操作执行失败:', error)
            resolve(null)
          }
        },
        onCancel: () => {
          resolve(null)
          options?.onLoginCancel?.()
        },
      })
    }
  })
}

/**
 * 常用的需要登录的操作
 */
export const loginActions = {
  // 收藏操作
  favorite: requireLogin((itemId: string) => {
    console.log('收藏操作:', itemId)
    // 实际的收藏逻辑
  }),

  // 评论操作
  comment: requireLogin((content: string, itemId: string) => {
    console.log('评论操作:', content, itemId)
    // 实际的评论逻辑
  }),

  // 购买操作
  purchase: requireLogin((productId: string) => {
    console.log('购买操作:', productId)
    // 实际的购买逻辑
  }),

  // 个人中心操作
  profile: requireLogin(() => {
    console.log('访问个人中心')
    // 实际的个人中心逻辑
  }),
}
