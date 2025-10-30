import React, { useEffect, useState, useMemo } from "react"
import { Slot, useSegments } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import * as ScreenOrientation from "expo-screen-orientation"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Provider as PaperProvider } from "react-native-paper"
import { InteractionManager, Platform, Modal, View, Text, TouchableOpacity } from "react-native"

import ImmersiveWrapper from "../components/ImmersiveMode"
import GlobalLoginManager from "../components/GlobalLoginManager"
import GlobalUpdateDialog from "../components/GlobalUpdateDialog"
import { GlobalToast } from "../components/GlobalToast"
import { GlobalDialog } from "../components/GlobalDialog"
// 导入P0核心功能Hooks
import { useAppLifecycle } from "../hooks/useAppLifecycle"
import { useDataSync } from "../hooks/useDataSync"
import { useDeviceAuth } from "../hooks/useDeviceAuth"
import { useNetworkStatus } from "../hooks/useNetworkStatus"

// 导入P1重要功能Hooks
import { useSystemKeyListener } from "../hooks/useSystemKeyListener"
import { useUpdateManager } from "../hooks/useUpdateManager"
// 🔴 临时注释：坐姿检测功能
// import { usePostureStore } from "../stores/postureStore"
// import { useGlobalPostureMonitor } from "../hooks/useGlobalPostureMonitor"
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

  // 网络提示 Modal 状态
  const [showNetworkModal, setShowNetworkModal] = useState(false)

  // 打开系统网络设置
  const openNetworkSettings = async () => {
    setShowNetworkModal(false) // 先关闭弹窗
    if (Platform.OS === "android") {
      try {
        // 使用 expo-intent-launcher 打开 Android 系统 WiFi 设置
        const IntentLauncher = await import("expo-intent-launcher")
        await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.WIFI_SETTINGS)
        console.log("已打开系统 WiFi 设置")
      } catch (error) {
        console.error("打开系统 WiFi 设置失败:", error)
      }
    } else if (Platform.OS === "ios") {
      // iOS 不允许直接打开系统设置，提示用户手动打开
      console.log("iOS 平台，需要用户手动打开设置")
    }
  }
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

    // 使用InteractionManager优化路由守卫性能
    InteractionManager.runAfterInteractions(() => {
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
    })
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
  // 🔴 临时注释：坐姿检测功能
  // const postureStore = usePostureStore()
  // const { startMonitoring: startPostureMonitoring, stopMonitoring: stopPostureMonitoring } = useGlobalPostureMonitor()

  // 系统键监听回调 - 100%还原UniApp逻辑
  const systemKeyCallbacks = useMemo(() => ({
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
  }), [])

  // 使用系统键监听Hook
  const { handleAppShow: systemKeyHandleAppShow } = useSystemKeyListener(systemKeyCallbacks)

  // 应用生命周期回调 - 100%还原UniApp逻辑
  const appLifecycleCallbacks = useMemo(() => ({
    onAppLaunch: async () => {
      console.log("App Launch - 应用启动")

      // 🔴 临时注释：坐姿检测功能
      // 初始化坐姿监测（还原UniApp逻辑）
      // postureStore.initPoseMonitor()
      
      // 启动全局坐姿监控
      // console.log("🚀 启动全局坐姿监控")
      // await startPostureMonitoring()

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

      // 使用InteractionManager优化前台恢复性能
      InteractionManager.runAfterInteractions(async () => {
        // P1功能：检查应用更新
        await checkForUpdatesOnShow()

        // P1功能：系统键监听的兜底处理
        systemKeyHandleAppShow()

        // 🔴 临时注释：坐姿检测功能
        // 🔴 关键：每次回到前台都重新启动坐姿监控
        // console.log("📱 恢复坐姿监控")
        // await startPostureMonitoring()
      })
    },

    onAppHide: () => {
      console.log("应用进入后台")
      
      // 注意：坐姿监控会在 useGlobalPostureMonitor 中自动处理
      // 当应用进入后台时会自动暂停检测，回到前台时会自动恢复
      console.log("📱 应用进入后台，监控状态会自动处理")
    },

    onAppExit: async () => {
      console.log("应用退出")
      
      // 🔴 临时注释：坐姿检测功能
      // 🔴 关键：应用退出时必须停止后台相机服务
      // console.log("🛑 停止坐姿监控服务")
      // await stopPostureMonitoring()
    },
  }), [segments, ensureDeviceAuth, checkForUpdatesOnShow, systemKeyHandleAppShow]) // 🔴 临时移除：postureStore, startPostureMonitoring, stopPostureMonitoring

  // 网络状态回调 - 100%还原UniApp逻辑
  const networkCallbacks = useMemo(() => ({
    onNetworkConnected: async () => {
      console.log("网络已连接")
      // 使用InteractionManager优化网络恢复性能
      InteractionManager.runAfterInteractions(async () => {
        // 网络恢复后触发一次设备授权复验（缓存优先）
        await reverifyDeviceAuthorization()
      })
    },

    onNetworkDisconnected: () => {
      console.log("网络已断开")
      // 显示网络提示 Modal
      setShowNetworkModal(true)
    },

    onNetworkChange: (isConnected: boolean, networkType: string) => {
      console.log("网络状态变化:", { isConnected, networkType })
    },
  }), [reverifyDeviceAuthorization])

  // 使用应用生命周期Hook
  useAppLifecycle(appLifecycleCallbacks)

  // 使用网络状态监控Hook
  const { isConnected, networkType } = useNetworkStatus(networkCallbacks)

  useEffect(() => {
    // 使用InteractionManager优化初始化性能
    InteractionManager.runAfterInteractions(async () => {
      // 初始化用户存储数据
      await initializeFromStorage()
      // 加载完成后检查token状态
      const token = useUserStore.getState().token
      console.log("用户数据初始化完成，token状态:", token ? "已存在" : "不存在")
    })

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

    // 立即隐藏闪屏（无动画）
    SplashScreen.hideAsync()
  }, [initializeFromStorage, isConnected, networkType])

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* 全局沉浸式模式 - 隐藏状态栏和三大金刚键 */}
      <ImmersiveWrapper enabled={true} />

      <PaperProvider>
        <SafeAreaProvider>
          <Slot />
          {/* 全局登录管理器 */}
          <GlobalLoginManager />
          {/* 全局更新对话框 */}
          <GlobalUpdateDialog />
          {/* 全局 Toast 提示 */}
          <GlobalToast />
          {/* 全局 Dialog 对话框 */}
          <GlobalDialog />
        </SafeAreaProvider>
      </PaperProvider>

      {/* 网络断开提示 Modal - 放在最外层确保在登录框之上 */}
      <Modal
        visible={showNetworkModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowNetworkModal(false)}
      >
        <View style={styles.networkModalOverlay}>
          <View style={styles.networkModalContent}>
            <Text style={styles.networkModalTitle}>网络未连接</Text>
            <Text style={styles.networkModalMessage}>
              当前网络不可用，请检查网络设置后重试
            </Text>
            <View style={styles.networkModalButtons}>
              <TouchableOpacity
                style={[styles.networkModalButton, styles.networkModalCancelButton]}
                onPress={() => setShowNetworkModal(false)}
              >
                <Text style={styles.networkModalCancelText}>知道了</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.networkModalButton, styles.networkModalConfirmButton]}
                onPress={openNetworkSettings}
              >
                <Text style={styles.networkModalConfirmText}>去设置</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  // 网络提示 Modal 样式
  networkModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  networkModalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 24,
    width: 400,
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 24,
  },
  networkModalTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#333",
    marginBottom: 12,
    textAlign: "center" as const,
  },
  networkModalMessage: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
    marginBottom: 24,
    textAlign: "center" as const,
  },
  networkModalButtons: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    gap: 12,
  },
  networkModalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  networkModalCancelButton: {
    backgroundColor: "#f5f5f5",
  },
  networkModalConfirmButton: {
    backgroundColor: "#4891FF",
  },
  networkModalCancelText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500" as const,
  },
  networkModalConfirmText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500" as const,
  },
})
