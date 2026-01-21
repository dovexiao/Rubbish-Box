import React, { useEffect, useState, useMemo, useCallback } from "react"
import {  Stack, useSegments } from "expo-router"
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
import { useNetworkMonitor, useNetwork, useNetworkStore } from "../stores/networkStore"
import { useBatteryMonitor } from "../stores/batteryStore"
import { useDeviceAuthStore } from "../stores/deviceAuthStore"
import { useToastStore } from "../stores/toastStore"
import { useDialogStore } from "../stores/dialogStore"
import { useUpdateStore } from "../stores/updateStore"
import { getLoginModalRef, showLoginModal, hideLoginModal, setNetworkModalController } from "../utils/loginUtils"

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

  // 获取用户信息用于调试WebSocket连接
  const user = useUserStore((state) => state.user)
  const isLoggedIn = useUserStore((state) => state.isLoggedIn)

  // 调试WebSocket连接条件
  console.log('🔍 WebSocket连接检查:', {
    isLoggedIn,
    hasUser: !!user,
    userPhone: user?.phone,
    userInfo: user ? { phone: user.phone, user_id: user.user_id } : null
  })

  // 路由守卫 - 使用ref跟踪组件是否已挂载
  const isMounted = React.useRef(false)

  // 网络提示 Modal 状态
  const [showNetworkModal, setShowNetworkModal] = useState(false)
 const [networkModalType, setNetworkModalType] = useState<'no-connection' | '2.4g-warning' | null>(null)
  // 用户是否已点击"知道了"，不再显示网络弹窗
  const [networkModalDismissed, setNetworkModalDismissed] = useState(false)
  const isBlocked = useDeviceAuthStore((state) => state.isBlocked)
  // 防止重复打开系统设置
  const isOpeningSettings = React.useRef(false)

  // 全局网络弹窗控制器
  const showNetworkModalController = React.useCallback((type: 'no-connection' | '2.4g-warning') => {
    setNetworkModalType(type)
    setShowNetworkModal(true)
  }, [])

  // 保存其他弹窗的状态（在显示网络弹窗时需要暂时隐藏它们）
  const savedModalsState = React.useRef<{
    toast: boolean
    dialog: boolean
    update: boolean
    login: { isVisible: boolean; forgotPassword: boolean }
  } | null>(null)


  // 关闭网络弹窗的辅助函数
  const closeNetworkModal = () => {
    setShowNetworkModal(false)
    setNetworkModalType(null)
  }

  // 点击"知道了"按钮，关闭弹窗并标记为已忽略（本次运行不再提示）
  const dismissNetworkModal = () => {
    setNetworkModalDismissed(true)
    closeNetworkModal()
  }

  // 检查是否应该显示网络弹窗（用户未点击"知道了"且满足其他条件）
  const shouldShowNetworkModal = () => {
    return !networkModalDismissed
  }
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

    if (Platform.OS === "android") {
      try {
        console.log("🔧 准备打开系统 WiFi 设置")
        const { openWifiSettings } = await import("../services/systemSettings")
        await openWifiSettings()
        console.log("已打开系统WiFi设置")
      } catch (error: any) {
        console.error("❌ 打开系统 WiFi 设置失败:", error)

        // 如果是活动已启动的错误，尝试使用 FLAG_ACTIVITY_REORDER_TO_FRONT
        if (error?.code === 'E_ACTIVITY_ALREADY_STARTED') {
          try {
            console.log("🔄 设置页面已打开，尝试将其调到前台")
            // const IntentLauncher = await import("expo-intent-launcher")
            // await IntentLauncher.startActivityAsync(
            //   IntentLauncher.ActivityAction.WIFI_SETTINGS,
            //   {
            //     flags: 0x20000 // FLAG_ACTIVITY_REORDER_TO_FRONT
            //   }
            // )
            // console.log("✅ 已将系统设置调到前台")
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
  // 🔴 核心系统初始化和网络管理
  console.log("🔧 初始化核心系统服务")

  // 组件挂载状态管理
  useEffect(() => {
    // 🔴 关键：首先从存储恢复用户登录状态（必须在检查登录状态之前执行）
    console.log("🔍 步骤0：从持久化存储恢复用户登录状态")
    useUserStore.getState().initializeFromStorage()
    const restoredToken = useUserStore.getState().token
    console.log("✅ 用户状态恢复完成，token:", restoredToken ? `存在(${restoredToken.length}字符)` : "不存在")

    // 🔴 如果 token 恢复成功，立即关闭可能已显示的登录弹窗（双重保障）
    if (restoredToken) {
      const loginModalRef = getLoginModalRef()
      if (loginModalRef) {
        loginModalRef.hideLoginModal()
        console.log("🔐 Token恢复后，已关闭登录弹窗")
      }
    }

    isMounted.current = true
    RouteGuard.isMounted = true

    // 设置全局网络弹窗控制器
    setNetworkModalController({
      showNetworkModal: showNetworkModalController
    })

    return () => {
      isMounted.current = false
      RouteGuard.isMounted = false
    }
  }, [showNetworkModalController])

  // 初始化基础服务
  console.log("🚀 步骤1：初始化网络和电池监听")
  useNetworkMonitor()
  useBatteryMonitor()
  console.log("✅ 基础服务初始化完成")

  // 获取网络状态并设置监听
  const { isConnected, isInternetReachable, networkType, networkDetails, isInitialized } = useNetwork()

  // 网络弹窗状态同步到store - 必须在组件顶层调用Hook，不能在useEffect内部
  const setShowNetworkModalInStore = useNetworkStore((state) => state.setShowNetworkModal)

  // WiFi频段检测逻辑
  const checkWifiFrequency = useCallback((frequency: number) => {
    const is5GHz = frequency >= 5000 && frequency <= 6000
    const is2_4GHz = frequency >= 2400 && frequency <= 2500

    if (is2_4GHz) {
      console.log(`⚠️ 检测到 2.4GHz WiFi (${frequency} MHz)`)
      if (!shouldShowNetworkModal()) return
      setNetworkModalType('2.4g-warning')
      setShowNetworkModal(true)
    } else if (!is5GHz && frequency > 0) {
      console.log(`⚠️ 检测到非标准 WiFi 频段 (${frequency} MHz)`)
      if (!shouldShowNetworkModal()) return
      setNetworkModalType('no-connection')
      setShowNetworkModal(true)
    } else if (is5GHz) {
      console.log(`✅ 检测到 5G WiFi (${frequency} MHz)`)
      if (showNetworkModal) setShowNetworkModal(false)
    }
  }, [showNetworkModal])

  // 🔴 网络相关状态监听和处理
  useEffect(() => {
    // API网络错误监听
    const { networkEventManager } = require("../utils/networkEvents")
    const unsubscribeApiErrors = networkEventManager.addListener(() => {
      console.log("🌐 API网络错误，显示网络弹窗")
      if (shouldShowNetworkModal()) {
        setShowNetworkModal(true)
      }
    })

    // WiFi频段检测
    if (isInitialized && isConnected && networkType === "wifi") {
      const frequency = networkDetails.frequency
      if (frequency != null) {
        checkWifiFrequency(frequency)
      } else {
        console.log("📡 WiFi频率信息不可用")
      }
    }

    // 网络弹窗状态同步到store
    setShowNetworkModalInStore(showNetworkModal)

    // 网络弹窗显示时管理其他弹窗
    if (showNetworkModal) {
      hideOtherModals()
    } else {
      restoreOtherModals()
    }

    return () => {
      unsubscribeApiErrors()
    }
  }, [isInitialized, isConnected, networkType, networkDetails.frequency, showNetworkModal, checkWifiFrequency, setShowNetworkModalInStore])

  // 路由守卫逻辑
  useEffect(() => {
    if (!isMounted.current) return

    const path = "/" + segments.join("/")
    const token = useUserStore.getState().token
    console.log(`路由变化: ${path}, token: ${token ? "有" : "无"}`)

    // 跳过不需要验证的页面
    if (path === "/login" || path === "/" || showNetworkModal) {
      return
    }

    InteractionManager.runAfterInteractions(() => {
      const currentToken = useUserStore.getState().token
      // 🔒 只有在没有token且网络已连接的情况下才弹出登录框
      // 避免从设置返回时网络还未完全连接就弹出登录框
      if (!currentToken && isConnected) {
        RouteGuard.beforeEach(path)
      }
    })
  }, [segments, showNetworkModal, isConnected])

  // P0核心功能Hooks
  const {
    verifyDeviceAndAuth,  // 🔴 新增：统一的设备验证函数
  } = useDeviceAuth()

  // P1重要功能Hooks
  console.log("📦 步骤3：初始化更新管理器")
  const { checkForUpdatesOnShow, manualCheckForUpdates, checkBundleUpdateOnly } = useUpdateManager()
  console.log("✅ 更新管理器初始化完成")
  console.log("🏃 步骤4：初始化坐姿监测store")
  const postureStore = usePostureStore()
  console.log("✅ 坐姿监测store初始化完成")
  console.log("🎥 步骤5：初始化全局坐姿监控")
  const { startMonitoring: startPostureMonitoring, stopMonitoring: stopPostureMonitoring } = useGlobalPostureMonitor()
  console.log("✅ 全局坐姿监控初始化完成")

  // 全局 WebSocket 连接
  console.log("🔌 步骤6：初始化全局WebSocket连接")
  useGlobalWebSocket()
  console.log("✅ 全局WebSocket连接初始化完成")

  // 🔴 监听用户登录状态变化，确保登录成功后初始化服务
  console.log("👤 步骤7：设置用户登录状态监听器")
  useEffect(() => {
    const unsubscribe = useUserStore.subscribe((state, prevState) => {
      // 检测token从无到有的变化，表示用户刚刚登录成功
      const hadToken = prevState.token && prevState.token.trim().length > 0
      const hasToken = state.token && state.token.trim().length > 0
      const isNewLogin = !hadToken && hasToken && state.isLoggedIn

      if (isNewLogin) {
        console.log("🎉 检测到用户登录成功，开始初始化坐姿监测和全局监控服务")

        // 初始化坐姿监测
        console.log("📊 执行：初始化坐姿监测")
        postureStore.initPoseMonitor()
        console.log("✅ 坐姿监测初始化完成")

        // 启动全局坐姿监控（异步执行，不阻塞）
        console.log("🎥 执行：启动全局坐姿监控")
        startPostureMonitoring().catch(error => {
          console.error("❌ 启动坐姿监控失败:", error)
        })
        console.log("✅ 全局坐姿监控启动完成")
      }
    })

    console.log("✅ 用户登录状态监听器设置完成")
    // 组件卸载时取消订阅
    return unsubscribe
  }, [postureStore])

  // 🔴 应用初始化逻辑（提取公共部分）
  const performAppInitialization = (async (context: 'launch' | 'show') => {
    try {
      console.log(`🚀 === 应用${context === 'launch' ? '启动' : '前台切换'}流程开始 ===`)

      if (context === 'launch') {
        console.log("📱 App Launch - 应用启动")

        // 🔴 应用启动时，先清除之前可能残留的 isBlocked 状态
        console.log("🧹 执行：清除设备授权阻止状态")
        useDeviceAuthStore.getState().unblockUserInteractions()
        console.log("✅ 已清除授权阻止状态（等待验证结果）")
      }

      // 🔴 第一步：验证网络（这是第一步，所有后续操作都需要网络）
      console.log("🌐 步骤1：验证网络连接状态")
      if (!isConnected || isInternetReachable === false) {
        console.log("❌ 网络未连接或不可达，显示网络弹窗")
        setShowNetworkModal(true)
        console.log(`🏁 === 应用${context === 'launch' ? '启动' : '前台切换'}流程提前结束（网络问题）===`)
        return false // 返回false表示初始化未完成
      }
      console.log("✅ 网络连接正常，开始设备和更新检查")

      // 🔴 第二步：设备码获取和授权验证
      console.log("🔐 步骤2：执行设备码验证和授权检查")
      // 🔴 使用统一的设备验证函数：获取设备码 + 验证授权 + 处理状态
      const deviceVerified = await verifyDeviceAndAuth()
      if (!deviceVerified) {
        console.log("❌ 设备验证失败，停止初始化流程")
        return false
      }
      console.log("✅ 设备验证成功")

      // 🔴 第三步：整包更新检查（在设备验证后立即检查，避免与设备验证冲突）
      console.log("📦 步骤3：检查整包更新")
      const hasBundleUpdate = await checkBundleUpdateOnly()
      if (!hasBundleUpdate) {
        console.log("📦 发现整包更新，显示更新弹窗，停止初始化流程")
        return false // 有整包更新，停止后续初始化
      }
      console.log("✅ 没有整包更新")

      // 🔴 第四步：其他更新检查（OTA更新等）
      console.log("🔄 步骤4：执行其他更新检查")
      if (context === 'launch') {
        await manualCheckForUpdates()
      } else {
        await checkForUpdatesOnShow()
      }
      console.log("✅ 其他更新检查完成")

      // 🔴 第五步：登录验证（所有前置条件都满足后）
      console.log("👤 步骤5：检查用户登录状态")
      const token = useUserStore.getState().token
      if (!token) {
        console.log("🔑 用户未登录，显示登录弹窗")
        await showLoginModal({
          onSuccess: () => {
            console.log(`🎉 用户${context === 'launch' ? '启动时' : '前台'}登录成功回调触发`)
          },
        })
        console.log("✅ 登录弹窗已显示")
      } else {
        console.log("✅ 用户已登录，跳过登录验证")
      }

      console.log(`🏁 === 应用${context === 'launch' ? '启动' : '前台切换'}流程完成 ===`)
      return true // 返回true表示初始化完成
    } catch (error) {
      console.error(`❌ 应用${context === 'launch' ? '启动' : '前台切换'}流程出错:`, error)
      // 发生错误时，仍然返回false表示初始化未完成，避免应用崩溃
      return false
    }
  })

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
  console.log("🔄 步骤8：配置应用生命周期回调")
  const appLifecycleCallbacks = useMemo(() => ({
    onAppLaunch: async () => {
      try {
        // 使用统一的初始化逻辑
        await performAppInitialization('launch')
      } catch (error) {
        console.error('❌ 应用启动生命周期回调出错:', error)
      }
    },

    onAppShow: async () => {
      // 使用InteractionManager优化前台恢复性能
      InteractionManager.runAfterInteractions(async () => {
        try {
          console.log("⚡ InteractionManager: 开始执行前台恢复任务")

          // 使用统一的初始化逻辑（网络检查、设备授权、更新检查、登录检查）
          const initSuccess = await performAppInitialization('show')

        if (initSuccess && isConnected && isInternetReachable) {
          // 前台切换特有的额外逻辑

          // P1功能：系统键监听的兜底处理
          console.log("🎮 执行：系统键监听处理")
          systemKeyHandleAppShow()
          console.log("✅ 系统键监听处理完成")

          // 🔴 只有设备授权通过后才能启动坐姿检测
          console.log("🔐 检查设备授权状态")
          const isAuthorized = useDeviceAuthStore.getState().isAuthorized
          if (!isAuthorized) {
            console.log("❌ 设备未授权，不启动坐姿监控")
            console.log("🏁 === 前台切换流程结束（未授权）===")
            return
          }
          console.log("✅ 设备已授权")

          // 坐姿监控检查和启动
          if (!postureStore.isMonitoring) {
            console.log("📱 检测到监控未运行，重新启动")
            await startPostureMonitoring()
            console.log("✅ 坐姿监控启动完成")
          } else {
            console.log("✅ 坐姿监控正常运行中")
          }

          console.log("🏁 === 前台切换流程完成（正常）===")
        }
        } catch (error) {
          console.error('❌ 前台切换生命周期回调出错:', error)
        }
      })
    },

    onAppHide: () => {
      console.log("🔄 === 应用后台切换流程开始 ===")
      console.log("📱 应用进入后台")

      // 注意：坐姿监控是后台服务，应用进入后台时会继续运行
      // Native层的后台服务会持续进行坐姿检测和时间统计
      console.log("📱 坐姿监控将继续在后台运行（Native层服务）")
      console.log("🏁 === 应用后台切换流程完成 ===")
    },

    onAppExit: async () => {
      console.log("🔄 === 应用退出流程开始 ===")
      console.log("📱 应用退出")

      // 🔴 关键：应用退出时必须停止后台相机服务
      console.log("🛑 执行：停止坐姿监控服务")
      await stopPostureMonitoring()
      console.log("✅ 坐姿监控服务已停止")
      console.log("🏁 === 应用退出流程完成 ===")
    },
  }), [ postureStore, startPostureMonitoring, stopPostureMonitoring, checkForUpdatesOnShow, systemKeyHandleAppShow, isConnected, isInternetReachable, networkType])

  // 网络状态回调 - 100%还原UniApp逻辑
  console.log("🌐 步骤9：配置网络状态回调")
  const networkCallbacks = useMemo(() => ({
    onNetworkConnected: async () => {
      console.log("🔄 === 网络连接恢复流程开始 ===")
      console.log("🟢 网络已连接")
      // 使用InteractionManager优化网络恢复性能
      InteractionManager.runAfterInteractions(async () => {
        console.log("⚡ InteractionManager: 开始执行网络恢复任务")
        // 目前网络恢复时暂无额外处理逻辑
        console.log("✅ 网络恢复处理完成")
        console.log("🏁 === 网络连接恢复流程完成 ===")
      })
    },

    onNetworkDisconnected: () => {
      console.log("🔄 === 网络断开处理流程开始 ===")
      console.log("🔴 网络已断开")
      // 🔴 如果设备未授权且网络已连接，不显示网络弹窗（设备授权弹窗优先）
      // 检查用户是否已点击"知道了"
      if (!shouldShowNetworkModal()) {
        console.log("👤 用户已点击'知道了'，本次运行不再显示网络断开提示")
        console.log("🏁 === 网络断开处理流程结束（用户已忽略）===")
        return
      }
      console.log("📱 显示网络断开提示弹窗")
      // 显示网络提示 Modal
      setShowNetworkModal(true)
      console.log("✅ 网络断开弹窗已显示")
      console.log("🏁 === 网络断开处理流程完成 ===")
    },

    onNetworkChange: (isConnected: boolean, networkType: string) => {
      console.log("🔄 网络状态变化:", { isConnected, networkType })
      console.log(`📊 网络状态: ${isConnected ? '已连接' : '未连接'}, 类型: ${networkType}`)
    },
  }), [])
  console.log("✅ 网络状态回调配置完成")

  // 使用应用生命周期Hook
  console.log("🔄 步骤10：注册应用生命周期监听器")
  useAppLifecycle(appLifecycleCallbacks)
  console.log("✅ 应用生命周期监听器注册完成")

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

      // 🔴 如果设备未授权且网络已连接，不显示网络弹窗（设备授权弹窗优先）
      const isBlocked = useDeviceAuthStore.getState().isBlocked
      if (isBlocked && isConnected) {
        console.log("🔐 设备未授权且网络已连接，不显示网络弹窗（设备授权弹窗优先）")
      } else {
        // 如果初始化完成时网络未连接，直接显示弹窗
        if (!isConnected) {
          // 检查用户是否已点击"知道了"
          if (!shouldShowNetworkModal()) {
            console.log("👤 用户已点击'知道了'，本次运行不再显示初始化网络未连接提示")
            return
          }
          console.log("🔴 初始化时检测到网络未连接，显示弹窗")
          setShowNetworkModal(true)
        }

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


    // 更新 ref
    prevNetworkState.current = { isConnected, isInternetReachable, isInitialized }
  }, [isConnected, isInternetReachable, isInitialized, networkCallbacks])

  console.log("📱 步骤11：初始化屏幕和系统设置")
  useEffect(() => {
    console.log("🔄 === 屏幕系统初始化开始 ===")

    // 锁定横屏模式（还原UniApp逻辑：plus.screen.lockOrientation('landscape-primary')）
    const lockOrientation = async () => {
      console.log("📐 执行：锁定横屏模式")
      try {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT)
        console.log("✅ 已锁定横屏模式（LANDSCAPE_RIGHT）")
      } catch (error) {
        console.warn("❌ 锁定横屏失败:", error)
      }
    }
    lockOrientation()

    // 注意：返回键行为已在useSystemKeyListener中处理，这里不需要重复设置
    console.log("ℹ️ 返回键行为已在系统键监听器中配置")

    // 输出屏幕适配信息（用于调试）
    console.log("📊 收集屏幕适配信息")
    getScreenInfo().then((screenInfo) => {
      console.log("=== 📱 屏幕适配信息 ===")
      console.log(`📏 屏幕尺寸: ${screenInfo.width} × ${screenInfo.height}`)
      console.log(`🎯 设备类型: ${screenInfo.isTablet ? "平板" : "手机"}`)
      console.log(`🔄 屏幕方向: ${screenInfo.isLandscape ? "横屏" : "竖屏"}`)
      console.log(`📈 缩放比例: ${screenInfo.scaleRatio}`)
      console.log(`📏 转换基准: ${screenInfo.baseRpx}rpx`)
      console.log(`🖥️ 平台: ${screenInfo.platform}`)
      console.log("========================")
    })

    // 立即隐藏闪屏（无动画）
    console.log("👁️ 执行：隐藏启动闪屏")
    SplashScreen.hideAsync()
    console.log("✅ 启动闪屏已隐藏")

    console.log("🏁 === 屏幕系统初始化完成 ===")
  }, [])
  console.log("✅ 屏幕和系统设置初始化完成")

  // 锁屏状态，用于控制网络断开提示弹窗的显示
  const locked = useLockScreenStore((state) => state.locked)


  console.log("🎨 步骤12：渲染应用UI")
  return (
    <GestureHandlerRootView style={styles.container}>
      {/* 全局沉浸式模式 - 隐藏状态栏和三大金刚键 */}
      <ImmersiveWrapper enabled={true} />

      <PaperProvider>
        <SafeAreaProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'none',
            }}
          >
            {/* 显式声明 tabs 作为一级页面 */}
            <Stack.Screen name="(tabs)" />

            {/* 其他页面自动发现，作为二级页面 */}
            {/* 不需要显式声明，Expo Router 会自动发现 */}
          </Stack>
          
          {/* <Slot key={token || 'no-token'} /> */}
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
      {/* 🔴 如果设备未授权且网络已连接，不显示网络弹窗（设备授权弹窗优先） */}
     <Modal
        visible={showNetworkModal && !locked && !(isBlocked && isConnected)}
        transparent
        animationType="fade"
        statusBarTranslucent
        presentationStyle="overFullScreen"
        onRequestClose={closeNetworkModal}
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
            {/* <Image
              source={Images.networkModalTitle}
              style={styles.networkModalTitleImage}
              resizeMode="contain"
            /> */}
            {networkModalType === '2.4g-warning' ? (
              <>
                <Text style={styles.networkModalTitle}>请更换Wi-Fi频段</Text>
                <Text style={styles.networkModalMessage}>
                  您当前使用的
                  <Text style={styles.networkModalHighlightText}>2.4G Wi-Fi</Text>
                  频段可能导致资源加载缓慢，强烈建议您更换连接使用
                  <Text style={styles.networkModalHighlightText}>5G频段</Text>
                  Wi-Fi信号
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.networkModalTitle}>
                  未连接网络
                </Text>
                <Text style={styles.networkModalMessage}>
                  当前网络不可用，请连接网络后重试
                </Text>
              </>
            )}
            <View style={styles.networkModalButtons}>
              {networkModalType === '2.4g-warning' && (
                <TouchableOpacity
                  style={[styles.networkModalButton, styles.networkModalCancelButton]}
                  onPress={dismissNetworkModal}
                >
                  <Text style={styles.networkModalCancelText}>知道了</Text>
                </TouchableOpacity>
              )}
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
    paddingTop: 5.625, // 40 * 750/1920
    paddingBottom: 8.625, // 40 * 750/1920
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
    lineHeight: 15.5, // 32 * 750/1920
    textAlign: "center" as const,
    paddingVertical: 12.5, // 32 * 750/1920
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
  networkModalHighlightText: {
    color: "#FF0000", // 红色高亮
    fontWeight: "bold" as const,
  },
  networkModalButtons: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    gap: 12.5, // 32 * 750/1920
  },
})
