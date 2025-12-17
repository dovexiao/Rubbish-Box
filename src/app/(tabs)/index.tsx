import { useState, useEffect, useCallback, useRef } from "react"
import { View, Image, TouchableOpacity, ImageBackground, Platform, Linking, AppState } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useFocusEffect, useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { InteractionManager } from "react-native"
import * as Brightness from "expo-brightness"

import { StatusBar } from "../../components/StatusBar"
import { NoticeBar } from "../../components/NoticeBar"
import { usePostureStore } from "../../stores/postureStore"
import { useUserStore } from "../../stores/userStore"
import { useDialogStore } from "../../stores/dialogStore"
import { getLatestVideo, getNotifications, getHomeRanks, getHomeBgImage } from "../../services/app"
import { Images } from "../../constants/Assets"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import { showError, showWarning, showInfo } from "../../utils/toast"

import { BrightnessSlider } from "../../components/BrightnessSlider"

// 自定义Text组件，避免lint错误
const Text = ({ children, style, ...props }: any) => {
  const { Text: RNText } = require("react-native")
  return (
    <RNText style={style} {...props}>
      {children}
    </RNText>
  )
}
// import { globalImmersive } from "../../utils/globalImmersive"

/**
 * 首页组件
 */
export default function HomeScreen() {
  // 只订阅需要的状态，避免不必要的重渲染
  const postureStatus = usePostureStore((state) => state.nowStatus) || "detecting"
  const showDialog = useDialogStore((state) => state.showDialog)
  const [showSettingsPanel, setShowSettingsPanel] = useState(false)
  const [brightness, setBrightness] = useState(50)
  const [volume, setVolume] = useState(50)
  const [userInfo, setUserInfo] = useState<any>({
    username: "",
    grade: "",
    rank: "",
    total_duration: 0,
    rank_required: 0,
    study_days: 0,
    gender: 0,
  })
  const [latestVideo, setLatestVideo] = useState<any>({
    type: 0,
    rsid: "",
    rsname: "",
    rspname: "",
    record_time: 0,
    cover_v: "", // 课程封面图
    referer_img: "", // 图片 Referer（如需要）
  })
  const [notifications, setNotifications] = useState<string[]>([])
  const [ranks, setRanks] = useState<any[]>([])
  const [isDataLoaded, setIsDataLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const isLoadingRef = useRef(false) // 使用 ref 防止重复调用
  const lastLoadTimeRef = useRef<number>(0) // 跟踪最后一次加载时间
  const LOAD_INTERVAL = 2000 // 2秒内不重复加载
  const [homeBgSource, setHomeBgSource] = useState<any>(Images.homeBg1)

  // 获取坐姿状态文本
  const getPostureStatusText = () => {
    if (postureStatus === "no_person") return "正在检测"
    if (postureStatus === "shoulders_not_level") return "肩膀倾斜"
    if (postureStatus === "good") return "坐姿正确"
    if (postureStatus === "head_not_centered") return "头部倾斜"
    if (postureStatus === "head_not_up") return "低头"
    if (postureStatus === "too_far") return "正在检测"
    if (postureStatus === "detecting") return "正在检测"
    return "正在检测"
  }

  // 切换系统设置面板
  const toggleSettingsPanel = async () => {
    // 如果要打开面板，先获取当前亮度和音量
    if (!showSettingsPanel) {
      await getCurrentBrightness()
    }
    setShowSettingsPanel(!showSettingsPanel)
  }

  // 获取当前系统亮度
  const getCurrentBrightness = async () => {
    try {
      // Android 需要请求权限
      if (Platform.OS === 'android') {
        const { status } = await Brightness.requestPermissionsAsync()
        if (status !== 'granted') {
          console.warn('未获得修改亮度权限')
          return
        }
      }
      
      const currentBrightness = await Brightness.getBrightnessAsync()
      setBrightness(Math.round(currentBrightness * 100))
      console.log("当前亮度:", currentBrightness * 100)
    } catch (error) {
      console.error("获取屏幕亮度失败:", error)
    }
  }

  // IntentLauncher 活动状态跟踪
  const intentLauncherActiveRef = useRef<boolean>(false)
  const intentLauncherTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 重置 IntentLauncher 状态（当从系统设置返回时调用）
  const resetIntentLauncherState = useCallback(() => {
    // 清除之前的定时器
    if (intentLauncherTimeoutRef.current) {
      clearTimeout(intentLauncherTimeoutRef.current)
      intentLauncherTimeoutRef.current = null
    }
    // 立即重置活动状态
    intentLauncherActiveRef.current = false
    console.log("🔄 IntentLauncher 状态已重置")
  }, [])

  // 监听应用状态变化（当从系统设置返回时）
  useEffect(() => {
    if (Platform.OS !== "android") return

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      // 当应用从后台回到前台时，重置 IntentLauncher 状态
      if (nextAppState === "active" && intentLauncherActiveRef.current) {
        console.log("📱 应用回到前台，重置 IntentLauncher 状态")
        resetIntentLauncherState()
      }
    })

    return () => {
      subscription.remove()
    }
  }, [resetIntentLauncherState])

  // 页面获得焦点时也重置状态（双重保障）
  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === "android" && intentLauncherActiveRef.current) {
        console.log("👁️ 页面获得焦点，重置 IntentLauncher 状态")
        resetIntentLauncherState()
      }
    }, [resetIntentLauncherState])
  )

  // 获取当前系统音量
const openVolumeSettings = async () => {
  if (Platform.OS === 'android') {
    try {
        // 使用原生模块打开声音设置，确保每次都能成功
        const { openSoundSettings } = await import("../../services/systemSettings")
        await openSoundSettings()
        console.log("已打开系统音量设置")
    } catch (error) {
        console.error('无法打开音量设置:', error)
        showError('无法打开系统音量设置')
    }
      } else {
    // iOS 不允许直接跳转到音量设置
      showInfo('iOS 不支持直接跳转到音量设置，请手动打开：设置 > 声音与触感')
  }
  }

  // 加载数据 - 每次点击tabbar都刷新
  const loadData = useCallback(async () => {
    const now = Date.now()
    const timeSinceLastLoad = now - lastLoadTimeRef.current
    
    // 检查时间间隔，防止短时间内重复加载
    if (timeSinceLastLoad < LOAD_INTERVAL) {
      console.log(`⏳ [防重复] 距离上次加载时间太短(${timeSinceLastLoad}ms < ${LOAD_INTERVAL}ms)，跳过重复调用`)
      return
    }
    
    // 使用 ref 防止重复调用 - 立即检查
    if (isLoadingRef.current) {
      console.log("⏳ [防重复] 正在加载中，跳过重复调用")
      return
    }
    
    // ⚠️ 关键修复：立即设置加载状态，防止竞态条件（必须在所有检查之后立即设置）
    isLoadingRef.current = true
    lastLoadTimeRef.current = now
    
    console.log("🔄 loadData 开始执行")
    
    // 等待 100ms，确保 token 已经设置完成
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // ⚠️ 重要：直接从 store 获取最新状态，而不是使用闭包捕获的值
    const currentUserStore = useUserStore.getState()
    
    // 打印 userStore 中的用户信息
    console.log("📱 userStore 完整状态:", {
      token: currentUserStore.token ? `存在(${currentUserStore.token.length}字符)` : "不存在",
      user: currentUserStore.user,
      isLoggedIn: currentUserStore.isLoggedIn,
      isLoading: currentUserStore.isLoading,
      error: currentUserStore.error
    })
    
    // 检查是否有token，没有则直接返回
    const token = currentUserStore.token
    console.log("🔑 当前token状态:", token ? `存在(${token.length}字符)` : "不存在")
    
    if (!token) {
      console.log("❌ 未找到token，跳过数据加载")
      isLoadingRef.current = false // 重置加载状态
      setIsDataLoaded(true) // 即使没有token也要显示内容
      return
    }
    
    console.log("✅ 开始加载首页数据...")
    setIsLoading(true)
    
    try {
      // 并行加载所有数据
      const [latestVideoData, notificationsData, ranksData, homeBgData] = await Promise.all([
        getLatestVideo().catch((err) => {
          console.error("获取最近学习视频失败:", err)
          return null
        }),
        getNotifications().catch((err) => {
          console.error("获取通知失败:", err)
          return null
        }),
        getHomeRanks().catch((err) => {
          console.error("获取排行榜失败:", err)
          return null
        }),
        getHomeBgImage().catch((err) => {
          console.error("获取首页背景图失败:", err)
          return null
        }),
      ])

      // 处理首页背景图
      if (homeBgData && homeBgData.image_url) {
        const newUrl = homeBgData.image_url
        setHomeBgSource((prev: any) => {
          const currentUri = (prev && typeof prev === 'object' && prev.uri) ? prev.uri : null
          
          if (currentUri === newUrl) {
            console.log("🖼️ 首页背景图未变，不更新")
            return prev
          }
          
          console.log("🖼️ 更新首页背景图:", newUrl)
          return { uri: newUrl }
        })
      } else {
        // 获取失败或为空，如果当前没有背景图（比如初始状态），保持默认 Images.homeBg1
        // 这里不做操作，保留当前状态（如果是初始的 Images.homeBg1 则继续使用）
        console.log("⚠️ 未获取到背景图，使用默认背景")
      }

      // 设置用户信息 - 直接使用store中的用户信息
      if (currentUserStore.user) {
        console.log("✅ 用户信息加载成功:", currentUserStore.user.username)
        console.log("📱 设置用户信息到状态:", currentUserStore.user)
         currentUserStore.getUserInfo().then(res => {
             setUserInfo(res)  
         })
      } else {
        console.warn("❌ 用户信息为空，可能需要登录")
      }

      // 设置最近学习视频
      if (latestVideoData) {
        // console.log("✅ 最近学习视频加载成功:", latestVideoData?.rsname || "")
        // console.log("📱 设置视频信息到状态:", latestVideoData)
        setLatestVideo(latestVideoData)
      } else {
        console.warn("❌ 最近学习视频为空")
      }

      // 设置通知
      if (notificationsData && notificationsData.notifications) {
        // console.log("✅ 通知加载成功:", notificationsData.notifications.length)
        const notificationTitles = notificationsData.notifications.map((item: any) => item.title)
        // console.log("📱 设置通知到状态:", notificationTitles)
        setNotifications(notificationTitles)
      } else {
        console.warn("❌ 通知数据为空")
      }

      // 设置排行榜
      if (ranksData && ranksData.ranking_list) {
        // console.log("✅ 排行榜加载成功:", ranksData.ranking_list.length)

        let hasCurrentUser = false
        const rankList = ranksData.ranking_list.map((item: any) => {
          if (item.is_current_user) {
            hasCurrentUser = true
          }
          return item
        })

        // 如果没有当前用户，默认将第一个设为当前用户
        if (!hasCurrentUser && rankList.length > 0) {
          rankList[0].is_current_user = true
        }

        // console.log("📱 设置排行榜到状态:", rankList)
        setRanks(rankList)
      } else {
        console.warn("❌ 排行榜数据为空")
      }

      console.log("✅ 首页数据加载完成")
    } catch (error) {
      console.error("首页数据加载失败:", error)
    } finally {
      isLoadingRef.current = false
      setIsLoading(false)
      setIsDataLoaded(true) // 无论成功失败都标记数据已加载，允许显示内容
    }
  }, []) // 空依赖数组，loadData 永远不会重新创建

  // 页面获得焦点时重新加载数据（每次点击tabbar都刷新）
  useFocusEffect(
    useCallback(() => {
      console.log("🎯 首页获得焦点，准备加载数据")
      
      let cancelled = false
      let timeoutId: ReturnType<typeof setTimeout> | null = null
      
      // 移除 InteractionManager 延迟，直接执行，避免回调累积
      // 使用 setTimeout 0 确保在下一个事件循环执行
      timeoutId = setTimeout(() => {
        if (!cancelled) {
          console.log("🚀 开始加载首页数据")
          loadData()
        }
      }, 0)
      
      // 恢复沉浸式模式
      // globalImmersive.forceRestore()
      
      // 清理函数：页面失去焦点时取消待执行的加载
      return () => {
        cancelled = true
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        console.log("🛑 页面失去焦点，取消待执行的加载")
      }
    }, [loadData]), // 依赖 loadData
  )

  const router = useRouter()

  // 播放视频
  const playVideo = () => {
    if (!latestVideo || !latestVideo.rsid) {
      showWarning("无法获取视频信息")
      return
    }

    // 使用Expo Router导航到视频播放页面
    router.push({
      pathname: "/sync-classroom/video",
      params: {
        videoCode: latestVideo.rsid,
        title: latestVideo.rsname,
        duration: latestVideo.record_time,
        totalDuration: latestVideo.rstime || 0,
      },
    })
  }



  // 跳转到AI页面
  const goToAI = () => {
    // 使用Expo Router导航到AI拍照页面
    router.push({
      pathname: "/ai/camera" as any,
      params: { type: "question" },
    })
  }

  // 跳转到AI练口语页面
  // const goToAiSpeaking = () => {
  //   router.push("/ai/speaking")
  // }


  // 跳转到排行榜页面
  // 注释掉未使用的函数，保留功能以备将来实现
  const goToRanking = () => {
    router.push("/ranking")
  }

  // 跳转到 WebSocket 测试页面
  const goToWebSocketTest = () => {
    console.log("🔌 跳转到 WebSocket 测试页面")
    router.push("/examples/websocket-test")
  }

  // 重新启动应用
  const handleRestartApp = () => {
    showDialog(
      "重新启动应用",
      "确定要重新启动应用吗？",
      [
        {
          text: "取消",
          style: "cancel"
        },
        {
          text: "确定",
          onPress: async () => {
            try {
              const Updates = await import("expo-updates")
              await Updates.reloadAsync()
            } catch (error) {
              console.error("重启应用失败:", error)
              showError("重启应用失败")
            }
          },
        },
      ]
    )
  }

  // 关机/重启选择
  const handleShutdown = () => {
    showDialog(
      "电源选项",
      "请选择操作",
      [
        {
          text: "取消",
          style: "cancel"
        },
        {
          text: "重启",
          onPress: async () => {
            try {
              const { NativeModules } = await import("react-native")
              const { ShutdownModule } = NativeModules
              
              if (ShutdownModule) {
                await ShutdownModule.reboot()
                console.log("重启命令已发送")
              } else {
                showError("重启功能不可用")
              }
            } catch (error) {
              console.error("重启失败:", error)
              showError("重启失败")
            }
          },
        },
        {
          text: "关机",
          onPress: async () => {
            try {
              const { NativeModules } = await import("react-native")
              const { ShutdownModule } = NativeModules
              
              if (ShutdownModule) {
                await ShutdownModule.shutdown()
                console.log("关机命令已发送")
              } else {
                showError("关机功能不可用")
              }
            } catch (error) {
              console.error("关机失败:", error)
              showError("关机失败")
            }
          },
        },
      ]
    )
  }

  // 打开系统设置（总设置页面）
  const openSystemSettings = async () => {
    if (Platform.OS === "android") {
      try {
        console.log("🔧 准备打开系统设置")
        // 使用原生模块打开系统设置主页，确保每次都能成功
        const { openSystemSettings } = await import("../../services/systemSettings")
        await openSystemSettings()
        console.log("✅ 已打开系统设置")
      } catch (error) {
        console.error("❌ 打开系统设置失败:", error)
        showError("无法打开系统设置")
      }
    } else if (Platform.OS === "ios") {
      // iOS打开设置
      try {
        await Linking.openURL("app-settings:")
      } catch (error) {
        console.error("❌ 打开系统设置失败:", error)
        showError("无法打开系统设置")
      }
    }
  }


  // 打开系统WiFi设置
  const openSystemWifiSettings = async () => {
    if (Platform.OS === "android") {
      try {
        // 使用原生模块打开WiFi设置，确保每次都能成功
        const { openWifiSettings } = await import("../../services/systemSettings")
        await openWifiSettings()
        console.log("已打开系统WiFi设置")
      } catch (error) {
        console.error("打开系统WiFi设置失败:", error)
        showError("无法打开WiFi设置")
      }
    } else if (Platform.OS === "ios") {
      // iOS不允许直接打开系统设置，提示用户手动打开
      showInfo("请手动打开系统设置 > WiFi")
    }
  }

  // 打开系统蓝牙设置
  const openSystemBluetoothSettings = async () => {
    if (Platform.OS === "android") {
      try {
        // 使用原生模块打开蓝牙设置，确保每次都能成功
        const { openBluetoothSettings } = await import("../../services/systemSettings")
        await openBluetoothSettings()
        console.log("已打开系统蓝牙设置")
      } catch (error) {
        console.error("打开系统蓝牙设置失败:", error)
        showError("无法打开蓝牙设置")
      }
    } else if (Platform.OS === "ios") {
      // iOS不允许直接打开系统设置，提示用户手动打开
      showInfo("请手动打开系统设置 > 蓝牙")
    }
  }

  // 亮度调节防抖定时器
  const brightnessTimeoutRef = useRef<any>(null)

  // 亮度调节
  const onBrightnessChange = useCallback((value: number) => {
    // 立即更新UI显示
    setBrightness(value)

    // 清除之前的定时器
    if (brightnessTimeoutRef.current) {
      clearTimeout(brightnessTimeoutRef.current)
    }

    // 设置防抖，300ms后执行实际的亮度设置
    brightnessTimeoutRef.current = setTimeout(async () => {
      try {
        console.log("开始设置亮度:", value)
        
        // Android 需要请求权限
        if (Platform.OS === 'android') {
          const { status } = await Brightness.requestPermissionsAsync()
          if (status !== 'granted') {
            console.warn('未获得修改亮度权限')
            showWarning('需要系统设置权限才能修改亮度')
            return
          }
        }
        
        await Brightness.setSystemBrightnessAsync(value / 100)
        console.log("亮度设置成功:", value)
      } catch (error) {
        console.error("设置亮度失败:", error)
        showError('设置亮度失败')
      }
    }, 300)
  }, [])

  // 调试：打印当前状态值
  // console.log("🎨 渲染首页 - 当前状态值:", {
  //   userInfo: userInfo,
  //   latestVideo: latestVideo,
  //   notifications: notifications,
  //   ranks: ranks,
  //   isLoading: isLoading,
  //   isDataLoaded: isDataLoaded
  // })

  return (
    <LinearGradient
      colors={["#93abff", "#e4f4ff", "#cdedff", "#ffffff"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.pageContainer}
    >
      <ImageBackground source={homeBgSource} style={styles.backgroundImage} resizeMode="cover">
        {/* 自定义状态栏 */}
        <StatusBar theme="dark" backgroundColor="transparent" translucent={true} />

        {/* 顶部工具栏 */}
        <View style={styles.topBar}>
          {/* 左侧坐姿状态 */}
          <View style={styles.postureStatus}>
            <View
              style={[
                styles.statusIndicator,
                postureStatus === "good"
                  ? styles.statusGood
                  : postureStatus === "detecting" || postureStatus === "no_person"
                    ? styles.statusDetecting
                    : styles.statusBad,
              ]}
            />
            <Text style={styles.statusText}>{getPostureStatusText()}</Text>
          </View>

          {/* 右侧系统设置 */}
          <TouchableOpacity onPress={toggleSettingsPanel} style={styles.settingsButton}>
            <Image
              source={Images.homeSettingIcon}
              style={styles.settingsIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* 系统设置面板 */}
        {showSettingsPanel && (
          <>
            {/* 蒙版层 - 点击关闭 */}
            <TouchableOpacity 
              style={styles.settingsMask} 
              activeOpacity={1}
              onPress={() => setShowSettingsPanel(false)}
            />
            <View style={styles.settingsPanel}>
            <View style={styles.settingsPanelTop}>
              {/* 关机 */}
              <TouchableOpacity style={styles.settingItem} onPress={handleShutdown}>
                <View style={styles.settingItemLeft}>
                  <View style={styles.settingIconContainer}>
                    <Ionicons name="power-outline" size={rpx(10.9)} color="#fff" />
                  </View>
                  <Text style={styles.settingText}>关机</Text>
                </View>
                <View>
                  <Ionicons name="chevron-forward" size={rpx(8.6)} color="rgba(255, 255, 255, 0.52)" />
                </View>
              </TouchableOpacity>
 
                
              {/* 系统设置 - 紧急逃生入口 */}
              <TouchableOpacity style={styles.settingItem} onPress={openSystemSettings}>
                <View style={styles.settingItemLeft}>
                  <View style={styles.settingIconContainer}>
                    <Ionicons name="settings" size={rpx(10.9)} color="#fff" />
                  </View>
                  <Text style={styles.settingText}>系统设置</Text>
                </View>
                <View>
                  <Ionicons name="chevron-forward" size={rpx(8.6)} color="rgba(255, 255, 255, 0.52)" />
                </View>
              </TouchableOpacity>

              {/* WiFi设置 */}
              <TouchableOpacity style={styles.settingItem} onPress={openSystemWifiSettings}>
                <View style={styles.settingItemLeft}>
                  <View style={styles.settingIconContainer}>
                    <Ionicons name="wifi" size={rpx(10.9)} color="#fff" />
                  </View>
                  <Text style={styles.settingText}>WiFi</Text>
                </View>
                <View>
                  <Ionicons name="chevron-forward" size={rpx(8.6)} color="rgba(255, 255, 255, 0.52)" />
                </View>
              </TouchableOpacity>

              {/* 蓝牙设置 */}
              <TouchableOpacity style={styles.settingItem} onPress={openSystemBluetoothSettings}>
                <View style={styles.settingItemLeft}>
                  <Image
                    source={Images.bluetooth}
                    style={styles.bluetoothIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.settingText}>蓝牙</Text>
                </View>
                <View>
                  <Ionicons name="chevron-forward" size={rpx(8.6)} color="rgba(255, 255, 255, 0.52)" />
                </View>
              </TouchableOpacity>

              {/* 声音设置 */}
                <TouchableOpacity style={styles.settingItem} onPress={openVolumeSettings}>
                <View style={styles.settingItemLeft}>
                  <View style={styles.settingIconContainer}>
                    <Ionicons name="volume-high" size={rpx(10.9)} color="#fff" />
                  </View>
                  <Text style={styles.settingText}>声音</Text>
                </View>
                <View>
                  <Ionicons name="chevron-forward" size={rpx(8.6)} color="rgba(255, 255, 255, 0.52)" />
                </View>
              </TouchableOpacity>
            </View>

            {/* 亮度调节 */}
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>亮度</Text>
              <BrightnessSlider 
                initialValue={brightness} 
                style={styles.slider}
              />
            </View>
          </View>
          </>
        )}

        {/* 主内容区 */}
        <View style={styles.mainContent}>
          {/* 内容区域 - 直接显示，不等待加载完成 */}
          <View style={styles.contentContainer}>
            {/* 用户信息卡片 */}
            <View style={styles.userInfoCard}>
              <ImageBackground
                source={Images.indexUserinfoBg}
                style={styles.userInfoWrap}
                resizeMode="cover"
              >
                <View style={styles.avatarContainer}>
                  <Image
                    source={userInfo.gender ? Images.userAvatarGirl : Images.userAvatarBoy}
                    style={styles.avatar}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.userDetails}>
                  <View style={styles.nameRow}>
                    <View style={styles.nameColumn}>
                      <Text style={styles.username}>{userInfo.username || ""}</Text>
                      <Text style={styles.gradeText}>{userInfo.grade || ""}</Text>
                    </View>
                    <LinearGradient
                      colors={["#ffa600", "#fff9cf"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.levelBadge}
                    >
                      <Image
                        source={Images.rankGold}
                        style={styles.rankIcon}
                        resizeMode="contain"
                      />
                      <Text style={styles.rankText}>{userInfo.rank || ""}</Text>
                    </LinearGradient>
                  </View>

                  {/* 进度条 */}
                  <View style={styles.progressRow}>
                    <View style={styles.progressBar}>
                      <LinearGradient
                        colors={["#ffffff", "#fff5cc"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[
                          styles.progressFill,
                          {
                            width: `${(userInfo.total_duration / userInfo.rank_required) * 100}%`,
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.progressTextContainer}>
                      <Text style={styles.progressValue}>{userInfo.total_duration || 0}</Text>
                      <Text style={styles.progressTotal}>/{userInfo.rank_required || 0}h</Text>
                    </View>
                  </View>
                </View>
              </ImageBackground>

              {/* 学习天数卡片 */}
              <View style={styles.studyDaysWrap}>
                <View style={styles.studyDaysContent}>
                  <Text style={styles.studyDaysValue}>
                    {userInfo.study_days || "0"}
                    <Text style={styles.studyDaysUnit}>天</Text>
                  </Text>
                  <View style={styles.studyDaysTips}>
                    <Text style={styles.studyDaysLabel}>学习天数</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* 通知栏 */}
            <NoticeBar
              texts={notifications.length > 0 ? notifications : ["欢迎使用XHTX小褐同学"]}
              delay={3}
              color="#fff"
              backgroundColor="rgba(255, 235, 181, 0.65)"
            />

            {/* 同步课堂和排行榜容器 */}
            {latestVideo && (
              <View style={styles.cardsContainer}>
                {/* 同步课堂 */}
                <TouchableOpacity style={styles.syncClassCard} onPress={playVideo}>
                    <Image
                    source={Images.indexClassRoomBg}
                    style={styles.syncClassBg}
                    resizeMode="cover"
                  />
                  <View style={styles.syncClassHeader}>
                    <View style={styles.syncClassInfo}>
                      <Text style={styles.syncClassTitle}>同步课堂</Text>
                      <Text style={styles.syncClassSubtitle}>精讲精练</Text>
                      <LinearGradient
                        colors={["#ff8a30", "#ffc784"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.studyButton}
                      >
                        <Text style={styles.studyButtonText}>
                          {latestVideo.type === 2 ? "继续学习" : "去学习"}
                        </Text>
                        <Ionicons name="chevron-forward" size={rpx(10)} color="#fff" style={styles.studyButtonArrow} />
                      </LinearGradient>
                    </View>
                    {/* 使用接口数据的封面图，如果没有则使用默认图片 */}
                    {latestVideo.cover_v ? (
                      <Image 
                        source={{ uri: latestVideo.cover_v }} 
                        style={styles.bookCover} 
                        resizeMode="contain"
                        defaultSource={Images.book1}
                      />
                    ) : (
                      <Image 
                        source={Images.book1} 
                        style={styles.bookCover} 
                        resizeMode="contain" 
                      />
                    )}
                  </View>

                  <View style={styles.syncClassFooter}>
                    <Text style={styles.courseTitle} numberOfLines={1}>
                      {latestVideo.rspname || ""}
                    </Text>
                    <View style={styles.lastLearnedRow}>
                      <Text style={styles.lastLearnedLabel}>上次学到：</Text>
                      <Text style={styles.lastLearnedContent} numberOfLines={1}>
                        {latestVideo.rsname || ""}
                      </Text>
                    </View>
                  </View>

                
                </TouchableOpacity>

                {/* 学习时长排行榜 */}
                <TouchableOpacity 
                  activeOpacity={0.8} 
                  onPress={goToRanking}
                  style={styles.rankingCard}
                >
                <ImageBackground
                  source={Images.indexRankBg2}
                    style={styles.rankingCardImage}
                  resizeMode="cover"
                >
                  {ranks && ranks.length > 0 && (
                    <View style={styles.rankingList}>
                      {ranks.map((item, index) => (
                        <LinearGradient
                          key={index}
                          colors={
                            item.is_current_user
                              ? ["rgba(255, 251, 178, 0.23)", "rgba(232, 255, 142, 0.23)"]
                              : ["transparent", "transparent"]
                          }
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 0 }}
                          style={styles.rankingItem}
                        >
                          <Text style={styles.rankingNumber}>{item.ranking}.</Text>
                          <Text style={styles.rankingUsername}>{item.username}</Text>
                          <Text style={styles.rankingDuration}>{item.total_duration}小时</Text>
                        </LinearGradient>
                      ))}
                    </View>
                  )}
                </ImageBackground>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* AI按钮 */}
        {/* <TouchableOpacity style={styles.aiButton} onPress={goToAI}>
          <Image source={Images.indexAiBtn} style={styles.aiButtonImage} resizeMode="contain" />
        </TouchableOpacity> */}

        {/* AI练口语按钮 */}
         {/* <TouchableOpacity style={styles.aiSpeakingButton} onPress={goToAiSpeaking}>
          <View style={styles.aiSpeakingButtonContent}>
            <Text style={styles.aiSpeakingButtonText}>AI练口语</Text>
          </View>
        </TouchableOpacity> */}

        {/* <TouchableOpacity  style={styles.aiSpeakingButton} onPress={() => router.push("/test-camera")}>
          <Text>测试相机</Text>
        </TouchableOpacity> */}

        {/* WebSocket 测试按钮  */}
        <TouchableOpacity
          style={styles.wsTestButton} 
          onPress={goToWebSocketTest}
          activeOpacity={0.7}
        >
          <Text style={styles.wsTestButtonText}>WS测试</Text>
        </TouchableOpacity>
      </ImageBackground>
    </LinearGradient>
  )
}

const styles = createStyles({
  pageContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%" as any,
  },
  topBar: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
    marginTop: 38.28125, // 状态栏高度，确保坐姿状态距离上面的高度为状态栏的高度
    position: "relative" as const,
  },
  postureStatus: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(255, 255, 255, 0.36)",
    borderRadius: 10.9375,
    paddingVertical: 6,
    paddingHorizontal: 12,
    shadowColor: "#ffffff",
    shadowOffset: { width: 0.3125, height: 0.3125 },
    shadowOpacity: 0.6,
    shadowRadius: 0,
  },
  statusIndicator: {
    width: 6.4,
    height: 6.4,
    borderRadius: 4,
    marginRight: 4,
  },
  statusGood: {
    backgroundColor: "#00c53b",
  },
  statusBad: {
    backgroundColor: "#e60012",
  },
  statusDetecting: {
    backgroundColor: "#999",
  },
  statusText: {
    fontSize: 10.9375,
    color: "#fff",
  },
  settingsButton: {
    width: 26,
    height: 26,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsIcon: {
    width: "100%",
    height: "100%",
  },
  settingsMask: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 99,
  },
  settingsPanel: {
    position: "absolute" as const,
    top: 70,
    right: 20,
    width: 168.75,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
    borderRadius: 11.71875,
    padding: 7.8,
    zIndex: 100,
    shadowColor: "#ffffff",
    shadowOffset: { width: -0.32, height: -0.3 },
    shadowOpacity: 0.2,
    shadowRadius: 8.5,
  },
  settingsPanelTop: {
    width: 152.34735,
    height: 162.216, // 增加高度以容纳新的"重启应用"选项
    borderRadius: 8.6,
    backgroundColor: "rgba(21, 21, 21, 0.2)",
    padding: 6.25,
    marginBottom: 4.8,
  },
  settingItem: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginVertical: 5,
  },
  settingItemLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  settingIconContainer: {
    width: 20.3125,
    height: 20.3125,
    borderRadius: 10.15625,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  settingIconText: {
    color: "#fff",
    fontSize: 10.9,
  },
  bluetoothIcon: {
    width: 20.3125,
    height: 20.3125,
    borderRadius: 10.15625,
    marginRight: 4,
  },
  settingText: {
    color: "#fff",
    fontSize: 10.156,
    fontWeight: "bold" as const,
    marginLeft: 4,
  },
  settingArrow: {
    color: "rgba(255, 255, 255, 0.52)",
    fontSize: 8.8125,
  },
  sliderContainer: {
    width: 152.34735,
    height: 49,
    backgroundColor: "rgba(21, 21, 21, 0.2)",
    borderRadius: 8.6,
    padding: 4.7,
    marginTop: 4.8,
  },
  sliderLabel: {
    color: "#fff",
    fontSize: 10.156,
    fontWeight: "bold" as const,
    marginBottom: 5,
  },
  slider: {
    width: "100%",
    height: 14.0625,
    marginTop: 2,
    borderRadius: 999, // 确保外部也是胶囊
  },
  sliderThumb: {
    width: 7.9125,
    height: 7.9125,
    backgroundColor: "#FFFFFF",
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  contentContainer: {
    width: 346.875,
    marginTop: 8,
  },
  userInfoCard: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    position: "relative" as const,
  },
  userInfoWrap: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    position: "absolute" as const,
    left: 0,
    bottom: 0,
    width: 248,
    height: 85.9375,
    zIndex: 2,
  },
  avatarContainer: {
    width: 48.4375,
    height: 48.4375,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginLeft: 22.2656,
  },
  avatar: {
    width: 49.21875,
    height: 45.3125,
    borderRadius: 25,
  },
  userDetails: {
    flex: 1,
    marginLeft: 13.6718,
  },
  nameRow: {
    flexDirection: "row" as const,
    marginBottom: 7.8125,
    alignItems: "center" as const,
  },
  nameColumn: {
    flexDirection: "column" as const,
  },
  username: {
    fontSize: 11.71875,
    color: "#784200",
    fontWeight: "bold" as const,
  },
  gradeText: {
    fontSize: 8.2,
    color: "rgba(120, 66, 0, 0.85)",
    fontWeight: "bold" as const,
  },
  levelBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    borderRadius: 8.2,
    paddingRight: 4.8,
    marginLeft: 6.640625,
    position: "relative" as const,
    width: 51.5625,
    height: 12.89,
    shadowColor: "#ff9500",
    shadowOffset: { width: -2, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 4.8,
  },
  rankIcon: {
    width: 17.1875,
    height: 17.1875,
    position: "absolute" as const,
    right: 0,
    bottom: 0,
  },
  rankText: {
    fontSize: 7.42,
    color: "#F38A00",
    fontWeight: "bold" as const,
    marginLeft: 4.8,
  },
  progressRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  progressBar: {
    width: 75.78125,
    height: 4.296875,
    backgroundColor: "#f5cb34",
    borderRadius: 4,
    overflow: "hidden" as const,
    position: "relative" as const,
  },
  progressFill: {
    position: "absolute" as const,
    left: 0,
    top: 0,
    height: "100%" as any,
    shadowColor: "#fab235",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 2.8,
  },
  progressTextContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginLeft: 6.4,
  },
  progressValue: {
    fontSize: 9.375,
    color: "#D08F04",
    fontWeight: "bold" as const,
  },
  progressTotal: {
    fontSize: 9.375,
    color: "#D08F04",
    fontWeight: "bold" as const,
  },
  studyDaysWrap: {
    width: 346.875,
    height: 81.25,
    borderRadius: 11.71875,
    backgroundColor: "rgba(250, 210, 126, 0.36)",
    flexDirection: "column" as const,
    justifyContent: "center" as const,
    alignItems: "flex-end" as const,
    paddingRight: 30.078125,
    shadowColor: "#ffffff",
    shadowOffset: { width: 0.3125, height: 0.3125 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  studyDaysContent: {
    flexDirection: "column" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  studyDaysValue: {
    fontSize: 20.3125,
    color: "#FFEA28",
    fontWeight: "bold",
    textAlign: "center",
  },
  studyDaysUnit: {
    fontSize: 9.375,
    color: "#fff",
  },
  studyDaysTips: {
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderRadius: 4.8,
    width: 46.875,
    height: 16.40625,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#f4d67b",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 6.4,
  },
  studyDaysLabel: {
    fontSize: 9.375,
    color: "#fff",
    textAlign: "center",
  },
  noticeBar: {
    width: "100%",
    height: 23.4375,
    borderRadius: 7.8125,
    backgroundColor: "rgba(255, 235, 181, 0.65)",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 15.625,
    marginTop: 8,
    marginBottom: 12,
    shadowColor: "#0b54ff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5.6,
  },
  noticeIcon: {
    width: 12.5,
    height: 12.5,
    marginRight: 8,
    marginLeft: 8,
  },
  noticeText: {
    fontSize: 8.6,
    color: "#fff",
  },
  cardsContainer: {
    flexDirection: "row",
    width: "100%",
  },
  syncClassCard: {
    width: 164.0625,
    height: 127.734375,
    borderRadius: 10.9375,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    marginRight: 11.71875,
    overflow: "hidden",
    position: "relative",
    shadowColor: "#ffffff",
    shadowOffset: { width: 0.3125, height: 0.3125 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  syncClassHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5.71875,
    paddingTop: 10.9375,
    paddingLeft: 8,
  },
  syncClassInfo: {
    flexDirection: "column",
    alignItems: "flex-start",
  },
  syncClassTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#FF8147",
    marginRight: 7.8125,
  },
  syncClassSubtitle: {
    fontSize: 9.375,
    color: "#FF8147",
    marginTop: 2,
  },
  studyButton: {
    borderRadius: 8,
    width: 50,
    height: 18.75,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 9.375,
    shadowColor: "#ffffff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 2.6,
  },
  studyButtonText: {
    color: "#fff",
    fontSize: 8.2,
  },
  studyButtonArrow: {
    marginLeft: 2,
  },
  bookCover: {
    width: 54.6875,
    borderRadius: 5.2,
    marginRight: 13.5,
  },
  syncClassFooter: {
    position: "absolute",
    zIndex: 2,
    bottom: 8,
    left: 9.375,
    flexDirection: "column",
    alignItems: "flex-start",
  },
  courseTitle: {
    fontSize: 7.1,
    color: "#fff",
    width: 109,
  },
  lastLearnedRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  lastLearnedLabel: {
    fontSize: 7.8125,
    color: "#fff",
    fontWeight: "bold",
  },
  lastLearnedContent: {
    fontSize: 7.8125,
    color: "#fff",
    fontWeight: "bold",
    width: 109,
  },
  syncClassBg: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
    height: 70, // 添加高度，可根据设计调整
    zIndex: 1,
  },
  rankingCard: {
    flex: 1,
    borderRadius: 10.9375,
    overflow: "hidden",
    backgroundColor: "transparent",
    shadowColor: "rgba(0, 0, 0, 0.05)",
    shadowOffset: { width: 0, height: 3.90625 },
    shadowOpacity: 1,
    shadowRadius: 7.8125,
  },
  rankingCardImage: {
    flex: 1,
  },
  rankingList: {
    marginTop: 40,
    paddingHorizontal: 4.8,
  },
  rankingItem: {
    flexDirection: "row",
    alignItems: "center",
    height: 25.78125,
    paddingHorizontal: 11.71875,
    borderRadius: 4.8125,
    marginBottom: 5,
  },
  rankingNumber: {
    // width: 24,
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 8.6,
    lineHeight: 25.78125,
  },
  rankingUsername: {
    flex: 1,
    marginLeft: 1.625,
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 8.6,
    lineHeight: 25.78125,
  },
  rankingDuration: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 8.6,
    marginLeft: 4,
    lineHeight: 25.78125,
  },
  aiButton: {
    position: "absolute",
    right: 26.5625,
    top: 104.6875,
    width: 46.875,
    height: 46.875,
  },
  aiButtonImage: {
    width: "100%",
    height: "100%",
  },
  aiSpeakingButton: {
    position: "absolute",
    right: 26.5625,
    top: 160,
    width: 80,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(108, 99, 255, 0.9)",
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  aiSpeakingButtonContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  aiSpeakingButtonText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600" as const,
  },
  readerButton: {
    position: "absolute",
    right: 20,
    bottom: 120,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(52, 152, 219, 0.9)",
    shadowColor: "#3498db",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  readerButtonContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  readerButtonText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "bold",
    marginTop: 4,
  },
  testMathButton: {
    position: "absolute",
    right: 26.5625,
    top: 160,
    width: 90,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(72, 145, 255, 0.9)",
    shadowColor: "#4891FF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  wsTestButton: {
    position: "absolute" as const,
    right: 26.5625,
    top: 200,
    width: 80,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 152, 0, 0.9)",
    shadowColor: "#FF9800",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  wsTestButtonText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600" as const,
  },
  testMathButtonContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  testMathButtonText: {
    fontSize: 13,
    color: "#FFFFFF",
    fontWeight: "600" as const,
  },

})
