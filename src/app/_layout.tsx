import React, { useEffect, useState, useMemo, useCallback } from "react"
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
// import { DeviceAuthBlocker } from "../components/DeviceAuthBlocker"
// 导入P0核心功能Hooks
import { useAppLifecycle } from "../hooks/useAppLifecycle"
import { useDataSync } from "../hooks/useDataSync"
import { useDeviceAuth } from "../hooks/useDeviceAuth"
import { useNetworkMonitor, useNetwork } from "../stores/networkStore"
import { useDeviceAuthStore } from "../stores/deviceAuthStore"

// 导入P1重要功能Hooks
import { useSystemKeyListener } from "../hooks/useSystemKeyListener"
import { useUpdateManager } from "../hooks/useUpdateManager"
import { usePostureStore } from "../stores/postureStore"
import { useGlobalPostureMonitor } from "../hooks/useGlobalPostureMonitor"
import { useUserStore } from "../stores/userStore"
import { createStyles, getScreenInfo } from "../utils/rpxStyleSheet"
import RouteGuard from "../services/routeGuard"
import { post } from "../services/api"

// 防止闪屏
SplashScreen.preventAutoHideAsync()

/**
 * 根布局组件
 * 包含全局沉浸式模式配置
 */
export default function RootLayout() {
  const segments = useSegments()

  // 路由守卫 - 使用ref跟踪组件是否已挂载
  const isMounted = React.useRef(false)

  // 网络提示 Modal 状态
  const [showNetworkModal, setShowNetworkModal] = useState(false)
  // 假连接提示 Modal 状态
  const [showFakeConnectionModal, setShowFakeConnectionModal] = useState(false)

  // 打开系统网络设置
  const openNetworkSettings = async () => {
    setShowNetworkModal(false) // 先关闭弹窗
    setShowFakeConnectionModal(false) // 先关闭假连接弹窗
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

  // 🔴 P0最高优先级：网络监测 - 必须第一个初始化
  // 初始化全局网络监听（单例模式）
  useNetworkMonitor()
  
  // 获取网络状态
  const { isConnected, isInternetReachable, networkType, isInitialized } = useNetwork()

  // P0核心功能Hooks
  const {
    getAndCacheDeviceUUID: _getAndCacheDeviceUUID,
    reverifyDeviceAuthorization,
   ensureDeviceAuth ,
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
  const { startMonitoring: startPostureMonitoring, stopMonitoring: stopPostureMonitoring } = useGlobalPostureMonitor()

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

      // 🔴 P0最高优先级：输出网络状态（网络监测已在组件初始化时完成）
      console.log("==================")
      console.log("📡 网络状态检测完成")
      console.log(`🌐 网络连接: ${isConnected ? "已连接" : "未连接"}`)
      console.log(`🌍 互联网访问: ${isInternetReachable === null ? "检测中" : isInternetReachable ? "可访问" : "不可访问"}`)
      console.log(`📶 网络类型: ${networkType}`)
      console.log("==================")

      // 🔴 关键：必须先获取设备序列号，因为设备授权验证需要它
      const deviceCode = await _getAndCacheDeviceUUID()
      console.log("📱 设备序列号:", deviceCode || '(无)')
      
      // 将设备码保存到 store 中，供弹窗显示使用
      if (deviceCode) {
        useDeviceAuthStore.getState().setDeviceUUID(deviceCode)
      }

      // 初始化坐姿监测（还原UniApp逻辑）
      postureStore.initPoseMonitor()
      
      // 启动全局坐姿监控
      console.log("🚀 启动全局坐姿监控")
      await startPostureMonitoring()

      // 🔴 每次进应用都调用设备授权验证接口（在所有请求之前）
      // 注释：暂时禁用设备授权验证
      // if (deviceCode) {
      //   try {
      //     console.log("🔐 开始设备授权验证，设备码:", deviceCode)
      //     
      //     // 直接调用接口，使用 api.ts 的 post 方法（会自动添加设备信息）
      //     const response = await post("/AppStart/verify-device-code/", {
      //       device_code: 'dffklw11p',
      //     })
      //     
      //     console.log("📡 设备授权接口响应:", response)
      //     
      //     // 🔴 根据接口响应处理授权状态
      //     // if (response && typeof response === 'object' && 'exists' in response) {
      //     //   if (response.exists === false) {
      //     //     console.log("❌ 设备未授权 (exists: false)，阻止用户操作")
      //     //     // 直接调用 store 的 blockUserInteractions 方法
      //     //     useDeviceAuthStore.getState().blockUserInteractions()
      //     //   } else {
      //     //     console.log("✅ 设备已授权 (exists: true)")
      //     //     // 解除阻止（如果之前被阻止了）
      //     //     useDeviceAuthStore.getState().setAuthorized(true)
      //     //     useDeviceAuthStore.getState().unblockUserInteractions()
      //     //   }
      //     // }
      //     
      //     console.log("✅ 设备授权验证接口调用成功")
      //   } catch (error) {
      //     console.error("❌ 设备授权验证接口调用失败:", error)
      //     // 接口调用失败也应该阻止用户操作
      //     console.log("❌ 接口调用失败，阻止用户操作")
      //     useDeviceAuthStore.getState().blockUserInteractions()
      //   }
      // } else {
      //   console.warn("⚠️ 未获取到设备序列号，跳过设备授权验证")
      // }
    },

    onAppShow: async () => {
      console.log("应用进入前台")

      // 使用InteractionManager优化前台恢复性能
      InteractionManager.runAfterInteractions(async () => {
        // P1功能：检查应用更新
        await checkForUpdatesOnShow()

        // P1功能：系统键监听的兜底处理
        systemKeyHandleAppShow()

        // 检查坐姿监控状态（后台服务应该持续运行，这里只是确保状态正常）
        if (!postureStore.isMonitoring) {
          console.log("📱 检测到监控未运行，重新启动")
          await startPostureMonitoring()
        } else {
          console.log("📱 坐姿监控正常运行中")
        }
      })
    },

    onAppHide: () => {
      console.log("应用进入后台")
      
      // 注意：坐姿监控是后台服务，应用进入后台时会继续运行
      // Native层的后台服务会持续进行坐姿检测和时间统计
      console.log("📱 应用进入后台，坐姿监控继续在后台运行")
    },

    onAppExit: async () => {
      console.log("应用退出")
      
      // 🔴 关键：应用退出时必须停止后台相机服务
      console.log("🛑 停止坐姿监控服务")
      await stopPostureMonitoring()
    },
  }), [_getAndCacheDeviceUUID, postureStore, startPostureMonitoring, stopPostureMonitoring, checkForUpdatesOnShow, systemKeyHandleAppShow, isConnected, isInternetReachable, networkType])

  // 网络状态回调 - 100%还原UniApp逻辑
  const networkCallbacks = useMemo(() => ({
    onNetworkConnected: async () => {
      console.log("网络已连接")
      // 关闭假连接弹窗（如果正在显示）
      setShowFakeConnectionModal(false)
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
      // 关闭假连接弹窗（如果正在显示）
      setShowFakeConnectionModal(false)
    },

    onNetworkChange: (isConnected: boolean, networkType: string) => {
      console.log("网络状态变化:", { isConnected, networkType })
    },

    onFakeConnection: () => {
      console.log("⚠️ 检测到假连接：已连接网络但无法访问互联网")
      // 显示假连接提示 Modal
      setShowFakeConnectionModal(true)
      // 关闭普通网络断开弹窗（如果正在显示）
      setShowNetworkModal(false)
    },
  }), [reverifyDeviceAuthorization])

  // 使用应用生命周期Hook
  useAppLifecycle(appLifecycleCallbacks)

  // 使用 ref 跟踪之前的网络状态，避免重复触发
  const prevNetworkState = React.useRef({
    isConnected,
    isInternetReachable,
    isInitialized: false,
  })

  // 监听网络状态变化并触发回调（只在真正变化时触发）
  useEffect(() => {
    // 跳过初始化时的触发
    if (!isInitialized || !prevNetworkState.current.isInitialized) {
      prevNetworkState.current = { isConnected, isInternetReachable, isInitialized }
      return
    }

    const prev = prevNetworkState.current

    // 检测网络断开
    if (prev.isConnected && !isConnected) {
      console.log("🔴 网络状态变化：断开 → 触发回调")
      networkCallbacks.onNetworkDisconnected()
    }

    // 检测网络恢复
    if (!prev.isConnected && isConnected) {
      console.log("🟢 网络状态变化：恢复 → 触发回调")
      networkCallbacks.onNetworkConnected()
    }

    // 检测假连接（从能访问变为不能访问）
    if (
      isConnected &&
      prev.isInternetReachable !== false &&
      isInternetReachable === false
    ) {
      console.log("🟠 网络状态变化：假连接 → 触发回调")
      networkCallbacks.onFakeConnection?.()
    }

    // 更新 ref
    prevNetworkState.current = { isConnected, isInternetReachable, isInitialized }
  }, [isConnected, isInternetReachable, isInitialized, networkCallbacks])

  useEffect(() => {
    // 使用InteractionManager优化初始化性能
    InteractionManager.runAfterInteractions(async () => {
      // 初始化用户存储数据 - 直接调用 store 的方法
      await useUserStore.getState().initializeFromStorage()
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
    console.log("==================")

    // 立即隐藏闪屏（无动画）
    SplashScreen.hideAsync()
  }, [])

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
          {/* 设备授权阻止弹窗 */}
          {/* <DeviceAuthBlocker /> */}
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

      {/* 假连接提示 Modal - 已连接但无法访问互联网 */}
      <Modal
        visible={showFakeConnectionModal}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setShowFakeConnectionModal(false)}
      >
        <View style={styles.networkModalOverlay}>
          <View style={[styles.networkModalContent, styles.fakeConnectionModalContent]}>
            <Text style={styles.networkModalTitle}>⚠️ 网络异常</Text>
            <Text style={styles.networkModalMessage}>
              已连接到WiFi/移动网络，但无法访问互联网{"\n"}
              请检查路由器或数据流量设置
            </Text>
            <View style={styles.networkModalButtons}>
              <TouchableOpacity
                style={[styles.networkModalButton, styles.networkModalCancelButton]}
                onPress={() => setShowFakeConnectionModal(false)}
              >
                <Text style={styles.networkModalCancelText}>知道了</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.networkModalButton, styles.fakeConnectionConfirmButton]}
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
  fakeConnectionModalContent: {
    borderWidth: 2,
    borderColor: "#FF9500",
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
  fakeConnectionConfirmButton: {
    backgroundColor: "#FF9500",
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
