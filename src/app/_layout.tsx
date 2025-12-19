import React, { useEffect, useState, useMemo, useCallback } from "react"
import { Slot, useSegments } from "expo-router"
import * as SplashScreen from "expo-splash-screen"
import * as ScreenOrientation from "expo-screen-orientation"
import { GestureHandlerRootView } from "react-native-gesture-handler"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Provider as PaperProvider } from "react-native-paper"
import { InteractionManager, Platform, Modal, View, Text, TouchableOpacity, Image } from "react-native"

import ImmersiveWrapper from "../components/ImmersiveMode"
import GlobalLoginManager from "../components/GlobalLoginManager"
import GlobalUpdateDialog from "../components/GlobalUpdateDialog"
import { GlobalToast } from "../components/GlobalToast"
import { GlobalDialog } from "../components/GlobalDialog"
import { DeviceAuthBlocker } from "../components/DeviceAuthBlocker"
// 导入P0核心功能Hooks
import { useAppLifecycle } from "../hooks/useAppLifecycle"
import { useDataSync } from "../hooks/useDataSync"
import { useDeviceAuth } from "../hooks/useDeviceAuth"
import { useNetworkMonitor, useNetwork } from "../stores/networkStore"
import { useDeviceAuthStore } from "../stores/deviceAuthStore"
import { useToastStore } from "../stores/toastStore"
import { useDialogStore } from "../stores/dialogStore"
import { useUpdateStore } from "../stores/updateStore"
import { getLoginModalRef } from "../utils/loginUtils"

// 导入P1重要功能Hooks
import { useSystemKeyListener } from "../hooks/useSystemKeyListener"
import { useUpdateManager } from "../hooks/useUpdateManager"
import { usePostureStore } from "../stores/postureStore"
import { useGlobalPostureMonitor } from "../hooks/useGlobalPostureMonitor"
import { useUserStore } from "../stores/userStore"
import { useGlobalWebSocket } from "../hooks/useGlobalWebSocket"
import { createStyles, getScreenInfo } from "../utils/rpxStyleSheet"
import RouteGuard from "../services/routeGuard"
import { post } from "../services/api"
import { LinearGradient } from "expo-linear-gradient"
import { Images } from "../constants/Assets"
import GlobalLockScreen from "../components/GlobalLockScreen"
import { useLoginModal } from "../hooks/useLoginModal"
import { useLockScreenStore } from "../stores/lockScreenStore"

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
  // 防止重复打开系统设置
  const isOpeningSettings = React.useRef(false)

  // 保存其他弹窗的状态（在显示网络弹窗时需要暂时隐藏它们）
  const savedModalsState = React.useRef<{
    toast: boolean
    dialog: boolean
    update: boolean
    login: { isVisible: boolean; forgotPassword: boolean }
  } | null>(null)

  // 隐藏其他所有弹窗并保存状态
  const hideOtherModals = useCallback(() => {
    console.log("🔐 [NetworkModal] 网络弹窗显示，隐藏其他弹窗")

    // 保存当前状态
    const toastState = useToastStore.getState()
    const dialogState = useDialogStore.getState()
    const updateState = useUpdateStore.getState()
    const loginModalRef = getLoginModalRef()

    savedModalsState.current = {
      toast: toastState.visible,
      dialog: dialogState.visible,
      update: updateState.showUpdateDialog,
      login: {
        isVisible: false, // 这个值需要从 hook 中获取，这里先默认false
        forgotPassword: false,
      }
    }

    console.log("📦 [NetworkModal] 保存的弹窗状态:", savedModalsState.current)

    // 隐藏所有弹窗
    if (toastState.visible) {
      console.log("  ↪ 隐藏 Toast")
      toastState.hideToast()
    }
    if (dialogState.visible) {
      console.log("  ↪ 隐藏 Dialog")
      dialogState.hideDialog()
    }
    if (updateState.showUpdateDialog) {
      console.log("  ↪ 隐藏 Update Dialog")
      updateState.hideUpdateDialogAction()
    }
    if (loginModalRef) {
      console.log("  ↪ 隐藏 Login Modal")
      loginModalRef.hideLoginModal()
    }
  }, [])

  // 恢复其他弹窗的状态
  const restoreOtherModals = useCallback(() => {
    if (!savedModalsState.current) {
      console.log("📦 [NetworkModal] 没有保存的弹窗状态，跳过恢复")
      return
    }

    console.log("🔓 [NetworkModal] 网络恢复，恢复其他弹窗")
    console.log("📦 [NetworkModal] 恢复的弹窗状态:", savedModalsState.current)

    const saved = savedModalsState.current

    // 恢复 Toast（注意：Toast 通常有自动隐藏机制，可能不需要恢复）
    if (saved.toast) {
      console.log("  ↪ 恢复 Toast（跳过，因为 Toast 有自动消失机制）")
      // 不恢复 Toast，因为它会自动消失
    }

    // 恢复 Dialog
    if (saved.dialog) {
      console.log("  ↪ 恢复 Dialog")
      // Dialog 需要完整的数据才能恢复，这里只是一个占位
      // 实际上 Dialog 在网络断开期间不应该显示，所以不恢复也合理
    }

    // 恢复 Update Dialog
    if (saved.update) {
      console.log("  ↪ 恢复 Update Dialog")
      const updateState = useUpdateStore.getState()
      // 需要保存完整的 updateData 才能恢复，这里简化处理
      // 实际场景中，更新弹窗在网络恢复后会重新检查
    }

    // 恢复 Login Modal
    if (saved.login.isVisible) {
      console.log("  ↪ 恢复 Login Modal")
      const loginModalRef = getLoginModalRef()
      if (loginModalRef) {
        loginModalRef.showLoginModal()
      }
    }

    // 清空保存的状态
    savedModalsState.current = null
  }, [])

  // 打开系统网络设置
  const openNetworkSettings = async () => {
    setShowNetworkModal(false) // 先关闭弹窗
    setShowFakeConnectionModal(false) // 先关闭假连接弹窗

    if (Platform.OS === "android") {
      try {
        console.log("🔧 准备打开系统 WiFi 设置")

        // 使用 expo-intent-launcher 打开 Android 系统 WiFi 设置
        const IntentLauncher = await import("expo-intent-launcher")

        // 使用 FLAG_ACTIVITY_NEW_TASK 和 FLAG_ACTIVITY_CLEAR_TOP 确保每次都能打开
        // FLAG_ACTIVITY_NEW_TASK: 在新任务中启动活动
        // FLAG_ACTIVITY_CLEAR_TOP: 如果活动已存在，清除其上的所有活动
        await IntentLauncher.startActivityAsync(
          IntentLauncher.ActivityAction.WIFI_SETTINGS,
          {
            flags: 0x10000000 | 0x04000000 // FLAG_ACTIVITY_NEW_TASK | FLAG_ACTIVITY_CLEAR_TOP
          }
        )
        console.log("✅ 已打开系统 WiFi 设置")
      } catch (error: any) {
        console.error("❌ 打开系统 WiFi 设置失败:", error)

        // 如果是活动已启动的错误，尝试使用 FLAG_ACTIVITY_REORDER_TO_FRONT
        if (error?.code === 'E_ACTIVITY_ALREADY_STARTED') {
          try {
            console.log("🔄 设置页面已打开，尝试将其调到前台")
            const IntentLauncher = await import("expo-intent-launcher")
            await IntentLauncher.startActivityAsync(
              IntentLauncher.ActivityAction.WIFI_SETTINGS,
              {
                flags: 0x20000 // FLAG_ACTIVITY_REORDER_TO_FRONT
              }
            )
            console.log("✅ 已将系统设置调到前台")
          } catch (retryError) {
            console.error("❌ 重试失败:", retryError)
            console.log("⚠️ 系统设置页面已打开，请在设置中操作")
          }
        }
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

  // 监听 API 层的网络错误事件
  useEffect(() => {
    const { networkEventManager } = require("../utils/networkEvents")

    const unsubscribe = networkEventManager.addListener(() => {
      console.log("🌐 收到 API 网络错误事件，显示网络弹窗")
      setShowNetworkModal(true)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // 监听网络弹窗状态，自动隐藏/恢复其他弹窗
  useEffect(() => {
    const isNetworkModalShowing = showNetworkModal || showFakeConnectionModal

    if (isNetworkModalShowing) {
      // 网络弹窗显示时，隐藏其他弹窗
      hideOtherModals()
    } else {
      // 网络弹窗隐藏时，恢复其他弹窗
      restoreOtherModals()
    }
  }, [showNetworkModal, showFakeConnectionModal, hideOtherModals, restoreOtherModals])

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
  const { startMonitoring: startPostureMonitoring, stopMonitoring: stopPostureMonitoring } = useGlobalPostureMonitor()

  // 全局 WebSocket 连接
  useGlobalWebSocket()

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

  // 🔴 关键修复：初始化完成后，如果网络未连接，直接显示弹窗
  useEffect(() => {
    // 只在初始化完成时检查一次
    if (isInitialized && !prevNetworkState.current.isInitialized) {
      console.log("🔍 网络初始化完成，检查初始网络状态")

      // 如果初始化完成时网络未连接，直接显示弹窗
      if (!isConnected) {
        console.log("🔴 初始化时检测到网络未连接，显示弹窗")
        setShowNetworkModal(true)
      }

      // 如果初始化完成时是假连接，显示假连接弹窗
      if (isConnected && isInternetReachable === false) {
        console.log("🟠 初始化时检测到假连接，显示弹窗")
        setShowFakeConnectionModal(true)
      }

      // 更新 ref，标记初始化已完成
      prevNetworkState.current = { isConnected, isInternetReachable, isInitialized }
    }
  }, [isInitialized, isConnected, isInternetReachable])

  // 监听网络状态变化并触发回调（只在真正变化时触发）
  useEffect(() => {
    // 跳过初始化时的触发（已在上面单独处理）
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
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT)
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

  // 锁屏状态，用于控制网络断开提示弹窗的显示
  const locked = useLockScreenStore((state) => state.locked)

  // useEffect(() => {
  //   (async () => {
  //     setShowNetworkModal(true)
  //     const { showLoginModal } = await import("../utils/loginUtils")
  //     showLoginModal({
  //       onSuccess: () => {
  //         console.log("登录成功")
  //       },
  //       onCancel: () => {
  //         console.log("登录取消")
  //       },
  //     });
  //   })();
  // }, [locked])

  return (
    <GestureHandlerRootView style={styles.container}>
      {/* 全局沉浸式模式 - 隐藏状态栏和三大金刚键 */}
      <ImmersiveWrapper enabled={true} />

      <PaperProvider>
        <SafeAreaProvider>
          <Slot />

          {/* 全局锁屏 */}
          <GlobalLockScreen />

          {/* 全局登录管理器 */}
          <GlobalLoginManager />
          {/* 全局更新对话框 */}
          <GlobalUpdateDialog />
          {/* 全局 Toast 提示 */}
          <GlobalToast />
          {/* 全局 Dialog 对话框 */}
          <GlobalDialog />
          {/* 设备授权阻止弹窗 */}
          <DeviceAuthBlocker />
        </SafeAreaProvider>
      </PaperProvider>

      {/* 网络断开提示 Modal - 放在最外层确保在登录框之上 */}
      <Modal
        visible={showNetworkModal && !locked}
        transparent
        animationType="fade"
        statusBarTranslucent
        presentationStyle="overFullScreen"
        onRequestClose={() => setShowNetworkModal(false)}
      >
        <View style={styles.networkModalOverlay}>
          <LinearGradient
            colors={["#C1E0FF", "#EFF6FE"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 0.4 }}
            style={styles.networkModalContent}
          >
            {/* 绝对定位的男孩图片 */}
            <Image
              source={Images.networkBoy}
              style={styles.networkModalBoyImage}
              resizeMode="contain"
            />
            <Image
              source={Images.networkModalTitle}
              style={styles.networkModalTitleImage}
              resizeMode="contain"
            />
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
              <TouchableOpacity onPress={openNetworkSettings}>
                <LinearGradient
                  colors={["#AFDCFF", "#4BB1FF"]}
                  start={{ x: 0.35, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.networkModalButton, styles.networkModalConfirmButton]}
                >
                  <Text style={styles.networkModalConfirmText}>去设置</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </Modal>

      {/* 假连接提示 Modal - 已连接但无法访问互联网 */}
      {/* <Modal
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
      </Modal> */}
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
    zIndex: 9999,
    elevation: 9999,
  },
  networkModalContent: {
    width: 302.03125, // 773 * 750/1920
    height: 126.5625, // 324 * 750/1920
    // backgroundColor: "#fff",
    borderRadius: 11.71875, // 30 * 750/1920
    paddingVertical: 15.625, // 40 * 750/1920
    paddingHorizontal: 15.625, // 40 * 750/1920
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1.5625 }, // 4 * 750/1920
    shadowOpacity: 0.3,
    shadowRadius: 3.125, // 8 * 750/1920
    elevation: 24,
    position: "relative" as const,
  },
  fakeConnectionModalContent: {
    borderWidth: 0.78125, // 2 * 750/1920
    borderColor: "#FF9500",
  },
  networkModalTitle: {
    fontSize: 12.5, // 32 * 750/1920
    fontFamily: "kingnam_bobo",
    fontWeight: "bold" as const,
    color: "#1571FC",
    textAlign: "center" as const,
  },
  networkModalBoyImage: {
    position: "absolute" as const,
    top: -58.59375, // -150 * 750/1920
    left: -15.625, // -40 * 750/1920
    width: 97.171875, // 248.76 * 750/1920
    height: 94.53125, // 242 * 750/1920
    transform: [{ rotate: "-3.72deg" }],
  },
  networkModalTitleImage: {
    width: 239.453125, // 613 * 750/1920
    height: 16.40625, // 42 * 750/1920
    alignSelf: "center" as const,
  },
  networkModalMessage: {
    fontSize: 10.9375, // 28 * 750/1920
    color: "#00000099",
    lineHeight: 12.5, // 32 * 750/1920
    textAlign: "center" as const,
  },
  networkModalButtons: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    gap: 12.5, // 32 * 750/1920
  },
  networkModalButton: {
    // flex: 1,
    width: 126.5625,
    paddingVertical: 7.8125, // 20 * 750/1920
    // paddingHorizontal: 46.875, // 120 * 750/1920
    borderRadius: 15.625, // 40 * 750/1920
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  networkModalCancelButton: {
    borderWidth: 1.171875, // 3 * 750/1920
    borderColor: "#4BB1FF80",
    backgroundColor: "#FFFFFF66",
  },
  networkModalConfirmButton: {
    borderWidth: 1.171875, // 3 * 750/1920
    borderColor: "#FFFFFF",
    backgroundColor: "transparent",
    shadowColor: '#3BBDF1',
    shadowOffset: { width: 0, height: 2.34375 }, // 6 * 750/1920
    shadowOpacity: 0.51,
    shadowRadius: 6.25, // 16 * 750/1920
    elevation: 24,
  },
  fakeConnectionConfirmButton: {
    backgroundColor: "#FF9500",
  },
  networkModalCancelText: {
    fontSize: 10.9375, // 28 * 750/1920
    color: "#4BB1FF",
    fontWeight: "500" as const,
  },
  networkModalConfirmText: {
    fontSize: 10.9375, // 28 * 750/1920
    color: "#FFFFFF",
    fontWeight: "500" as const,
  },
})
