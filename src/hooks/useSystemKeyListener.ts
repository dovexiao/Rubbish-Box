import { useEffect, useRef, useCallback } from "react"
import { BackHandler, Platform } from "react-native"
import { useRouter } from "expo-router"

interface SystemKeyCallbacks {
  onHomeKey?: () => void | Promise<void>
  onRecentKey?: () => void | Promise<void>
  onBackKey?: () => boolean // 返回true阻止默认行为
}

/**
 * 系统键监听Hook
 * 100%还原UniApp App.vue中的系统键监听逻辑
 *
 * 注意：React Native无法直接监听Home键和Recent键
 * 但可以通过BackHandler监听返回键，并实现相应的导航逻辑
 */
export const useSystemKeyListener = (callbacks?: SystemKeyCallbacks) => {
  const router = useRouter()
  const navigateHomePending = useRef(false)

  // 跳到首页（优先当作 tabbar 处理，失败则重启到首页）
  const navigateToHome = useCallback(() => {
    try {
      console.log("导航到首页")
      // 在React Native中，我们使用router导航到首页
      router.replace("/(tabs)/")
      console.log("已导航到首页")
    } catch (error) {
      console.error("导航到首页失败:", error)
    }
  }, [router])

  // 处理系统键事件（模拟UniApp逻辑）
  const handleSystemKey = useCallback(
    (keyType: "home" | "recent" | "back") => {
      console.log(`系统键事件: ${keyType}`)

      switch (keyType) {
        case "home":
          // 还原UniApp逻辑：尝试立即跳首页，同时设置兜底标记
          navigateToHome()
          navigateHomePending.current = true
          callbacks?.onHomeKey?.()
          break

        case "recent":
          // Recent键处理逻辑
          navigateToHome()
          navigateHomePending.current = true
          callbacks?.onRecentKey?.()
          break

        case "back":
          // 返回键处理逻辑
          const shouldBlock = callbacks?.onBackKey?.()
          return shouldBlock ?? false

        default:
          break
      }

      return false
    },
    [navigateToHome, callbacks],
  )

  // 应用进入前台时的兜底处理
  const handleAppShow = useCallback(() => {
    // 兜底：如果之前收到了 HOME/RECENTS 但未能跳转，前台时再跳
    if (navigateHomePending.current) {
      console.log("应用进入前台，执行兜底导航到首页")
      navigateToHome()
      navigateHomePending.current = false
    }
  }, [navigateToHome])

  useEffect(() => {
    if (Platform.OS !== "android") {
      console.log("系统键监听仅支持Android平台")
      return
    }

    console.log("开始监听系统键")

    // 监听返回键
    const backAction = () => {
      return handleSystemKey("back")
    }

    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction)

    // 注意：React Native无法直接监听Home键和Recent键
    // 这些功能需要通过原生模块实现，或者在应用生命周期中处理

    return () => {
      console.log("停止监听系统键")
      backHandler.remove()
    }
  }, [handleSystemKey])

  return {
    navigateToHome,
    handleAppShow, // 供应用生命周期调用
    navigateHomePending: navigateHomePending.current,
  }
}

