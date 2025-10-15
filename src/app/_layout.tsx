import React, { useEffect } from "react"
import { Slot, SplashScreen, useSegments } from "expo-router"
import * as ScreenOrientation from "expo-screen-orientation"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Provider as PaperProvider } from "react-native-paper"

// import ImmersiveWrapper from "../components/ImmersiveMode"
// 导入P0核心功能Hooks
import { useAppLifecycle } from "../hooks/useAppLifecycle"
import { useDataSync } from "../hooks/useDataSync"
import { useDeviceAuth } from "../hooks/useDeviceAuth"
import { useNetworkStatus } from "../hooks/useNetworkStatus"

// 导入P1重要功能Hooks
import { useSystemKeyListener } from "../hooks/useSystemKeyListener"
import { useUpdateManager } from "../hooks/useUpdateManager"
import { usePostureStore } from "../stores/postureStore"
import { useUserStore } from "../stores/userStore"
import { createStyles, getScreenInfo } from "../utils/rpxStyleSheet"
import RouteGuard from "../services/routeGuard"
// 防止闪屏
SplashScreen.preventAutoHideAsync()

/**
 * 根布局组件
 * 包含全局沉浸式模式配置
 */
export default function RootLayout() {
  const initializeFromStorage = useUserStore((state) => state.initializeFromStorage)
  const segments = useSegments()

  // 路由守卫 - 使用ref跟踪组件是否已挂载
  const isMounted = React.useRef(false)

  useEffect(() => {
    // 第一次渲染时，标记组件为已挂载
    isMounted.current = true
    // 同时设置路由守卫的挂载状态
    RouteGuard.isMounted = true

    // 组件清理时，标记为未挂载
    return () => {
      isMounted.current = false
      RouteGuard.isMounted = false
    }
  }, [])

  // 路由守卫 - 只在组件挂载后执行，并确保用户数据已加载
  useEffect(() => {
    // 确保组件已挂载
    if (!isMounted.current) return

    // 获取当前路径
    const path = "/" + segments.join("/")

    // 获取当前token状态
    const token = useUserStore.getState().token
    console.log(`路由变化: ${path}, token状态: ${token ? "已存在" : "不存在"}`)

    // 登录页面或根路径不需要验证
    if (path === "/login" || path === "/") {
      console.log("登录页面或根路径，跳过路由守卫检查")
      return
    }

    // 添加延迟，确保用户数据已完全加载
    setTimeout(() => {
      // 再次检查token，确保最新状态
      const currentToken = useUserStore.getState().token
      console.log(`路由守卫检查前再次确认token: ${currentToken ? "已存在" : "不存在"}`)

      // 如果token存在，则跳过路由守卫检查
      if (currentToken) {
        console.log("检测到有效token，跳过路由守卫检查")
        return
      }

      // 使用路由守卫验证访问权限
      RouteGuard.beforeEach(path)
    }, 300)
  }, [segments])

  // P0核心功能Hooks
  const {
    getAndCacheDeviceUUID: _getAndCacheDeviceUUID,
    reverifyDeviceAuthorization,
    ensureDeviceAuth,
    clearDeviceUUID,
  } = useDeviceAuth()
  const {
    saveMonitorData: _saveMonitorData,
    setLocalData: _setLocalData,
    getLocalData: _getLocalData,
  } = useDataSync()

  // P1重要功能Hooks
  const { checkForUpdatesOnShow } = useUpdateManager()
  const postureStore = usePostureStore()

  // 系统键监听回调 - 100%还原UniApp逻辑
  const systemKeyCallbacks = {
    onHomeKey: () => {
      console.log("Home键被按下")
      // Home键处理逻辑
    },
    onRecentKey: () => {
      console.log("Recent键被按下")
      // Recent键处理逻辑
    },
    onBackKey: () => {
      console.log("返回键被按下，阻止退出应用")
      // 还原UniApp逻辑：阻止退出应用，给个提示或跳首页
      return true // 返回true阻止默认行为
    },
  }

  // 使用系统键监听Hook
  const { handleAppShow: systemKeyHandleAppShow } = useSystemKeyListener(systemKeyCallbacks)

  // 应用生命周期回调 - 100%还原UniApp逻辑
  const appLifecycleCallbacks = {
    onAppLaunch: async () => {
      console.log("App Launch - 应用启动")

      // 初始化坐姿监测（还原UniApp逻辑）
      postureStore.initPoseMonitor()

      // 登录页面不需要验证设备授权
      const currentPath = "/" + segments.join("/")
      const isLoginPage = currentPath === "/login" || currentPath === "/"

      if (!isLoginPage) {
        // 只在非登录页面进行设备授权校验
        try {
          const isVerified = await ensureDeviceAuth()
          if (!isVerified) {
            console.log("设备未授权，阻止用户交互")
            // 设备授权失败的处理逻辑已在useDeviceAuth中实现
          }
        } catch (error) {
          console.error("设备授权验证失败:", error)
        }
      }
    },

    onAppShow: async () => {
      console.log("应用进入前台")

      // P1功能：检查应用更新
      await checkForUpdatesOnShow()

      // P1功能：系统键监听的兜底处理
      systemKeyHandleAppShow()

      // 这里可以添加其他进入前台时的逻辑
      // 比如恢复监测等
    },

    onAppHide: () => {
      console.log("应用进入后台")
      // 这里可以添加进入后台时的逻辑
      // 比如停止监测、保存数据等
    },

    onAppExit: () => {
      console.log("应用退出")
      // 应用退出时的清理逻辑
    },
  }

  // 网络状态回调 - 100%还原UniApp逻辑
  const networkCallbacks = {
    onNetworkConnected: async () => {
      console.log("网络已连接")
      // 网络恢复后触发一次设备授权复验（缓存优先）
      await reverifyDeviceAuthorization()
    },

    onNetworkDisconnected: () => {
      console.log("网络已断开")
      // 网络断开时的处理逻辑
    },

    onNetworkChange: (isConnected: boolean, networkType: string) => {
      console.log("网络状态变化:", { isConnected, networkType })
    },
  }

  // 使用应用生命周期Hook
  useAppLifecycle(appLifecycleCallbacks)

  // 使用网络状态监控Hook
  const { isConnected, networkType } = useNetworkStatus(networkCallbacks)

  useEffect(() => {
    // 初始化用户存储数据 - 使用async IIFE立即执行
    ;(async () => {
      await initializeFromStorage()
      // 加载完成后检查token状态
      const token = useUserStore.getState().token
      console.log("用户数据初始化完成，token状态:", token ? "已存在" : "不存在")
    })()

    // 锁定横屏模式（还原UniApp逻辑：plus.screen.lockOrientation('landscape-primary')）
    const lockOrientation = async () => {
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)
        console.log("已锁定横屏模式")
      } catch (error) {
        console.warn("锁定横屏失败:", error)
      }
    }
    lockOrientation()

    // 注意：返回键行为已在useSystemKeyListener中处理，这里不需要重复设置

    // 输出屏幕适配信息（用于调试）
    const screenInfo = getScreenInfo()
    console.log("=== 屏幕适配信息 ===")
    console.log(`屏幕尺寸: ${screenInfo.width} × ${screenInfo.height}`)
    console.log(`设备类型: ${screenInfo.isTablet ? "平板" : "手机"}`)
    console.log(`屏幕方向: ${screenInfo.isLandscape ? "横屏" : "竖屏"}`)
    console.log(`缩放比例: ${screenInfo.scaleRatio}`)
    console.log(`转换基准: ${screenInfo.baseRpx}rpx`)
    console.log(`平台: ${screenInfo.platform}`)
    console.log(`网络状态: ${isConnected ? "已连接" : "未连接"} (${networkType})`)
    console.log("==================")

    // 延迟隐藏闪屏
    const timer = setTimeout(() => {
      SplashScreen.hideAsync()
    }, 1000)

    return () => {
      clearTimeout(timer)
    }
  }, [initializeFromStorage, isConnected, networkType])

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* 全局沉浸式模式 - 隐藏状态栏和三大金刚键 */}
      {/* <ImmersiveWrapper enabled={true} /> */}

      <PaperProvider>
        <SafeAreaProvider>
          <Slot />
        </SafeAreaProvider>
      </PaperProvider>
    </GestureHandlerRootView>
  )
}

// 使用rpx单位的样式
const styles = createStyles({
  container: {
    flex: 1,
    width: "100%" as const,
    height: "100%" as const,
  },
})
