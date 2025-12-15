import { Platform, StatusBar, AppState } from "react-native"
import Immersive from "react-native-immersive"
import { useNavigation } from "expo-router"

/**
 * 全局沉浸式模式管理器
 * 单一全局方案，用于隐藏状态栏和三大金刚键
 * 支持页面导航监听和自动恢复
 */
class GlobalImmersiveManager {
  private static instance: GlobalImmersiveManager
  private isEnabled = false
  private appStateListener: any = null
  private navigationListener: any = null
  private restoreInterval: any = null

  private constructor() {}

  static getInstance(): GlobalImmersiveManager {
    if (!GlobalImmersiveManager.instance) {
      GlobalImmersiveManager.instance = new GlobalImmersiveManager()
    }
    return GlobalImmersiveManager.instance
  }

  /**
   * 启用全局沉浸式模式
   * 针对Android 15优化，增加持续恢复机制
   */
  enable(): void {
    if (this.isEnabled) return

    this.isEnabled = true
    console.log("启用全局沉浸式模式（Android 15优化）")

    // 立即隐藏状态栏和三大金刚键
    this.hideSystemUI()

    // 设置应用状态监听器
    this.setupAppStateListener()

    // 设置导航监听器（如果可用）
    this.setupNavigationListener()
    
    // 设置持续恢复定时器（针对Android 15）
    // this.setupRestoreInterval()
  }

  /**
   * 禁用全局沉浸式模式
   */
  disable(): void {
    if (!this.isEnabled) return

    this.isEnabled = false
    console.log("禁用全局沉浸式模式")

    // 显示系统状态栏
    StatusBar.setHidden(false)

    // 移除所有监听器和定时器
    this.removeAppStateListener()
    this.removeNavigationListener()
    this.removeRestoreInterval()

    if (Platform.OS === "android") {
      try {
        if (Immersive && Immersive.off) {
          Immersive.off()
        }
      } catch (error) {
        console.warn("恢复三大金刚键失败:", error)
      }
    }
  }

  /**
   * 隐藏系统UI（状态栏和三大金刚键）
   * 针对Android 15优化
   */
  private hideSystemUI(): void {
    // 隐藏状态栏
    // StatusBar.setHidden(true, "none")
    // console.log("状态栏已隐藏")
    
    if (Platform.OS === "android") {
      StatusBar.setBarStyle("light-content", true)
      StatusBar.setTranslucent(true)
      StatusBar.setBackgroundColor("transparent", true)

      // 隐藏三大金刚键 - 使用多次调用确保生效
      try {
        if (Immersive && Immersive.on) {
          // 连续调用3次以确保在Android 15上生效
          Immersive.on()
          setTimeout(() => Immersive.on && Immersive.on(), 100)
          setTimeout(() => Immersive.on && Immersive.on(), 300)
          console.log("三大金刚键已隐藏（Android 15优化）")
        } else {
          console.warn("Immersive.on 方法不存在")
        }
      } catch (error) {
        console.warn("隐藏三大金刚键失败:", error)
      }
    }
  }

  /**
   * 设置应用状态监听器
   */
  private setupAppStateListener(): void {
    if (this.appStateListener) {
      this.removeAppStateListener()
    }

    this.appStateListener = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active" && this.isEnabled) {
        // 应用重新获得焦点时，恢复沉浸式模式
        console.log("应用获得焦点，恢复沉浸式模式")
        this.restoreImmersiveMode()
      }
    })
  }

  /**
   * 设置导航监听器
   */
  private setupNavigationListener(): void {
    // 这里使用try-catch，因为useNavigation只能在组件内使用
    // 实际监听在页面组件内实现
    console.log("导航监听器需要在页面组件内设置")
  }

  /**
   * 移除应用状态监听器
   */
  private removeAppStateListener(): void {
    if (this.appStateListener) {
      this.appStateListener.remove()
      this.appStateListener = null
    }
  }

  /**
   * 移除导航监听器
   */
  private removeNavigationListener(): void {
    if (this.navigationListener) {
      this.navigationListener.remove()
      this.navigationListener = null
    }
  }

  /**
   * 设置持续恢复定时器（针对Android 15）
   */
  private setupRestoreInterval(): void {
    if (this.restoreInterval) {
      this.removeRestoreInterval()
    }
    
    // 每2秒检查并恢复一次全屏状态
    this.restoreInterval = setInterval(() => {
      if (this.isEnabled && Platform.OS === "android") {
        this.restoreImmersiveMode()
      }
    }, 2000)
  }
  
  /**
   * 移除恢复检查定时器
   */
  private removeRestoreInterval(): void {
    if (this.restoreInterval) {
      clearInterval(this.restoreInterval)
      this.restoreInterval = null
    }
  }

  /**
   * 恢复沉浸式模式
   */
  private restoreImmersiveMode(): void {
    if (Platform.OS === "android") {
      this.hideSystemUI()
    } else if (Platform.OS === "ios") {
      // iOS只需要隐藏状态栏
      StatusBar.setHidden(true)
      // StatusBar.setTranslucent(true)
      // StatusBar.setBackgroundColor("transparent", true)
    }
  }

  /**
   * 强制恢复沉浸式模式（供外部调用）
   */
  forceRestore(): void {
    if (this.isEnabled) {
      console.log("强制恢复沉浸式模式")
      this.restoreImmersiveMode()
    }
  }
}

// 导出单例实例
export const globalImmersive = GlobalImmersiveManager.getInstance()
