import { router } from "expo-router"
import { useUserStore } from "../stores/userStore"

/**
 * 路由守卫服务
 * 用于处理路由跳转前的权限验证
 */
export class RouteGuard {
  /**
   * 检查用户是否已登录
   * @returns {boolean} 是否已登录
   */
  static isAuthenticated(): boolean {
    const userStore = useUserStore.getState()
    const token = userStore.token

    return !!token && typeof token === "string"
  }

  /**
   * 验证路由访问权限
   * @param {string} path 目标路径
   * @returns {boolean} 是否允许访问
   */
  static validateAccess(path: string): boolean {
    // 公开路由列表，不需要登录即可访问
    const publicRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/welcome"]

    // 如果是公开路由，允许访问
    if (publicRoutes.some((route) => path.startsWith(route))) {
      return true
    }

    // 非公开路由需要验证登录状态
    return this.isAuthenticated()
  }

  // 标记应用是否已挂载
  static isMounted = false

  /**
   * 路由前置守卫
   * @param {string} path 目标路径
   * @returns {boolean} 是否允许导航
   */
  static beforeEach(path: string): boolean {
    // 设置应用为已挂载状态
    this.isMounted = true

    // 检查用户是否有权限访问该路由
    const hasAccess = this.validateAccess(path)

    if (!hasAccess) {
      // 没有权限，重定向到登录页
      console.log("🔐 没有访问权限，重定向到登录页")

      // 使用登录弹窗替代页面跳转
      setTimeout(async () => {
        const { showLoginModal } = await import("../utils/loginUtils")
        showLoginModal({
          onSuccess: () => {
            console.log("🔐 用户登录成功，可以访问受保护的路由")
          },
          onCancel: () => {
            console.log("🔐 用户取消登录，停留在当前页面")
          },
        })
      }, 0)

      return false
    }

    return true
  }

  /**
   * 处理未授权情况
   * 清除用户信息并重定向到登录页
   */
  static handleUnauthorized(): void {
    try {
      const userStore = useUserStore.getState()
      userStore.logout()
      console.log("🔐 用户未授权，已清除token")

      // 只有在应用已挂载的情况下才执行导航
      if (this.isMounted) {
        // 使用登录弹窗替代页面跳转
        setTimeout(async () => {
          const { showLoginModal } = await import("../utils/loginUtils")
          showLoginModal({
            onSuccess: () => {
              console.log("🔐 用户重新登录成功")
            },
            onCancel: () => {
              console.log("🔐 用户取消登录")
            },
          })
        }, 0)
      } else {
        console.log("应用未挂载，暂不执行导航")
      }
    } catch (error) {
      console.error("处理未授权错误:", error)
    }
  }
}

export default RouteGuard
