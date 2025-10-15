import { useState, useEffect, useCallback, useRef } from "react"
import { View, Image, TouchableOpacity, ImageBackground, Platform, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Slider from "@react-native-community/slider"
import { useFocusEffect, useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"

import { StatusBar } from "../../components/StatusBar"
import { NoticeBar } from "../../components/NoticeBar"
import { usePostureStore } from "../../stores/postureStore"
import { useUserStore } from "../../stores/userStore"
import { getLatestVideo, getNotifications, getHomeRanks } from "../../services/app"
import { Images } from "../../constants/Assets"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"

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
 * 100%还原UniApp项目中的pages/index/index
 */
export default function HomeScreen() {
  const userStore = useUserStore()
  const postureStore = usePostureStore()
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
    cover_v: "",
  })
  const [notifications, setNotifications] = useState<string[]>([])
  const [ranks, setRanks] = useState<any[]>([])

  // 页面获得焦点时恢复沉浸式模式
  useFocusEffect(() => {
    // console.log("首页获得焦点，恢复沉浸式模式")
    // globalImmersive.forceRestore()
  })

  // 获取坐姿状态文本
  const getPostureStatusText = () => {
    const stats = postureStore.nowStatus
    if (stats === "no_person") return "正在检测"
    if (stats === "shoulders_not_level") return "肩膀倾斜"
    if (stats === "good") return "坐姿正确"
    if (stats === "head_not_centered") return "头部倾斜"
    if (stats === "head_not_up") return "低头"
    if (stats === "detecting") return "正在检测"
    return "正在检测"
  }

  // 切换系统设置面板
  const toggleSettingsPanel = async () => {
    // 如果要打开面板，先获取当前亮度和音量
    if (!showSettingsPanel) {
      await getCurrentBrightness()
      await getCurrentVolume()
    }
    setShowSettingsPanel(!showSettingsPanel)
  }

  // 获取当前系统亮度
  const getCurrentBrightness = async () => {
    try {
      const { getBrightnessAsync } = await import("expo-brightness")
      const currentBrightness = await getBrightnessAsync()
      setBrightness(Math.round(currentBrightness * 100))
      console.log("当前亮度:", currentBrightness * 100)
    } catch (error) {
      console.error("获取屏幕亮度失败:", error)
    }
  }

  // 获取当前系统音量
  const getCurrentVolume = async () => {
    try {
      // 检查平台兼容性
      if (Platform.OS !== "android") {
        console.warn("音量控制仅支持Android平台")
        setVolume(50) // 设置默认值
        return
      }

      // 尝试多种方式导入VolumeManager
      let VolumeManager
      try {
        // 方式1：默认导入
        VolumeManager = require("react-native-volume-manager").default
      } catch (e1) {
        try {
          // 方式2：直接导入
          VolumeManager = require("react-native-volume-manager")
        } catch (e2) {
          try {
            // 方式3：命名导入
            const { VolumeManager: VM } = require("react-native-volume-manager")
            VolumeManager = VM
          } catch (e3) {
            console.warn("无法导入VolumeManager模块，可能需要重新构建项目")
            setVolume(50) // 设置默认值
            return
          }
        }
      }

      // 检查VolumeManager是否可用
      if (!VolumeManager) {
        console.warn("VolumeManager模块为空")
        setVolume(50) // 设置默认值
        return
      }

      // 检查getVolume方法
      if (typeof VolumeManager.getVolume !== "function") {
        console.warn("VolumeManager.getVolume方法不存在，可用方法:", Object.keys(VolumeManager))
        setVolume(50) // 设置默认值
        return
      }

      const volumeData = await VolumeManager.getVolume()

      if (volumeData && typeof volumeData.volume === "number") {
        const currentVolume = Math.round(volumeData.volume * 100)
        setVolume(currentVolume)
        console.log("当前音量:", currentVolume)
      } else {
        console.warn("获取到的音量数据格式不正确:", volumeData)
        setVolume(50) // 设置默认值
      }
    } catch (error) {
      console.error("获取音量失败:", error)
      setVolume(50) // 设置默认值
    }
  }

  // 加载数据
  const loadData = async () => {
    try {
      // 显示加载状态
      console.log("正在加载首页数据...")

      // 并行加载所有数据
      const [userInfoData, latestVideoData, notificationsData, ranksData] = await Promise.all([
        userStore.getUserInfo().catch((err) => {
          console.error("获取用户信息失败:", err)
          return null
        }),
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
      ])

      // 设置用户信息
      if (userInfoData) {
        console.log("用户信息加载成功:", userInfoData.username)
        setUserInfo(userInfoData)
      } else {
        console.warn("用户信息为空，可能需要登录")
      }

      // 设置最近学习视频
      if (latestVideoData) {
        console.log("最近学习视频加载成功:", latestVideoData?.rsname || "")
        setLatestVideo(latestVideoData)
      }

      // 设置通知
      if (notificationsData && notificationsData.notifications) {
        console.log("通知加载成功:", notificationsData.notifications.length)
        setNotifications(notificationsData.notifications.map((item: any) => item.title))
      }

      // 设置排行榜
      if (ranksData && ranksData.ranking_list) {
        console.log("排行榜加载成功:", ranksData.ranking_list.length)

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

        setRanks(rankList)
      }
    } catch (error) {
      console.error("首页数据加载失败:", error)
      // 可以在这里显示错误提示给用户
    }
  }

  // 页面加载时获取数据
  useEffect(() => {
    loadData()

    // 清理函数：组件卸载时清除定时器
    return () => {
      if (brightnessTimeoutRef.current) {
        clearTimeout(brightnessTimeoutRef.current)
      }
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current)
      }
    }
  }, [])

  // 页面获得焦点时重新加载数据
  useFocusEffect(
    useCallback(() => {
      loadData()
      // 恢复沉浸式模式
      // globalImmersive.forceRestore()
    }, []),
  )

  const router = useRouter()

  // 播放视频
  const playVideo = () => {
    if (!latestVideo || !latestVideo.rsid) {
      Alert.alert("提示", "无法获取视频信息")
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

  // 跳转到阅读器
  const goToReader = useCallback(() => {
    console.log("📚 [首页] 用户点击跳转到阅读器")
    try {
      router.push("/reader")
      console.log("📚 [首页] ✅ 跳转到阅读器命令已执行")
    } catch (error) {
      console.error("📚 [首页] ❌ 跳转到阅读器失败:", error)
      Alert.alert("提示", "跳转失败，请重试")
    }
  }, [router])

  // 跳转到AI页面
  const goToAI = () => {
    // 使用Expo Router导航到AI拍照页面
    router.push({
      pathname: "/ai/camera" as any,
      params: { type: "question" },
    })
  }

  // 跳转到排行榜页面
  // 注释掉未使用的函数，保留功能以备将来实现
  // const goToRanking = () => {
  //   router.push("/ranking")
  // }

  // 打开系统WiFi设置
  const openSystemWifiSettings = async () => {
    if (Platform.OS === "android") {
      try {
        // 使用IntentLauncher打开Android系统WiFi设置
        const IntentLauncher = await import("expo-intent-launcher")
        await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.WIFI_SETTINGS)
        console.log("已打开系统WiFi设置")
      } catch (error) {
        console.error("打开系统WiFi设置失败:", error)
        Alert.alert("提示", "无法打开WiFi设置")
      }
    } else if (Platform.OS === "ios") {
      // iOS不允许直接打开系统设置，提示用户手动打开
      Alert.alert("提示", "请手动打开系统设置 > WiFi", [{ text: "确定" }])
    }
  }

  // 打开系统蓝牙设置
  const openSystemBluetoothSettings = async () => {
    if (Platform.OS === "android") {
      try {
        // 使用IntentLauncher打开Android系统蓝牙设置
        const IntentLauncher = await import("expo-intent-launcher")
        await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.BLUETOOTH_SETTINGS)
        console.log("已打开系统蓝牙设置")
      } catch (error) {
        console.error("打开系统蓝牙设置失败:", error)
        Alert.alert("提示", "无法打开蓝牙设置")
      }
    } else if (Platform.OS === "ios") {
      // iOS不允许直接打开系统设置，提示用户手动打开
      Alert.alert("提示", "请手动打开系统设置 > 蓝牙", [{ text: "确定" }])
    }
  }

  // 亮度调节防抖定时器
  const brightnessTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
        const { setSystemBrightnessAsync } = await import("expo-brightness")
        await setSystemBrightnessAsync(value / 100)
        console.log("亮度设置成功:", value)
      } catch (error) {
        console.error("设置亮度失败:", error)
        // 不显示弹窗，避免频繁打扰用户
        // Alert.alert("提示", "设置亮度失败")
      }
    }, 300)
  }, [])

  // 音量调节防抖定时器
  const volumeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 音量调节
  const onVolumeChange = useCallback((value: number) => {
    // 立即更新UI显示
    setVolume(value)

    // 清除之前的定时器
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current)
    }

    // 设置防抖，200ms后执行实际的音量设置
    volumeTimeoutRef.current = setTimeout(async () => {
      try {
        console.log("开始设置音量:", value)

        // 检查平台兼容性
        if (Platform.OS !== "android") {
          console.warn("音量控制仅支持Android平台")
          return
        }

        // 尝试多种方式导入VolumeManager
        let VolumeManager
        try {
          // 方式1：默认导入
          VolumeManager = require("react-native-volume-manager").default
        } catch (e1) {
          try {
            // 方式2：直接导入
            VolumeManager = require("react-native-volume-manager")
          } catch (e2) {
            try {
              // 方式3：命名导入
              const { VolumeManager: VM } = require("react-native-volume-manager")
              VolumeManager = VM
            } catch (e3) {
              console.warn("无法导入VolumeManager模块，可能需要重新构建项目")
              return
            }
          }
        }

        // 检查VolumeManager是否可用
        if (!VolumeManager) {
          console.warn("VolumeManager模块为空")
          return
        }

        // 检查setVolume方法
        if (typeof VolumeManager.setVolume !== "function") {
          console.warn("VolumeManager.setVolume方法不存在，可用方法:", Object.keys(VolumeManager))
          return
        }

        await VolumeManager.setVolume(value / 100)
        console.log("音量设置成功:", value)
      } catch (error) {
        console.error("设置音量失败:", error)
        console.log("音量设置失败，但不显示弹窗避免打扰用户")
      }
    }, 200)
  }, [])

  return (
    <LinearGradient
      colors={["#93abff", "#e4f4ff", "#cdedff", "#ffffff"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.pageContainer}
    >
      <ImageBackground source={Images.homeBg1} style={styles.backgroundImage} resizeMode="cover">
        {/* 自定义状态栏 */}
        <StatusBar theme="dark" backgroundColor="transparent" translucent={true} />

        {/* 顶部工具栏 */}
        <View style={styles.topBar}>
          {/* 左侧坐姿状态 */}
          <View style={styles.postureStatus}>
            <View
              style={[
                styles.statusIndicator,
                postureStore.nowStatus === "good"
                  ? styles.statusGood
                  : postureStore.nowStatus === "detecting" || postureStore.nowStatus === "no_person"
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
          <View style={styles.settingsPanel}>
            <View style={styles.settingsPanelTop}>
              {/* WiFi设置 */}
              <TouchableOpacity style={styles.settingItem} onPress={openSystemWifiSettings}>
                <View style={styles.settingItemLeft}>
                  <View style={styles.settingIconContainer}>
                    <Ionicons name="wifi" size={rpx(10.9)} color="#fff" />
                  </View>
                  <Text style={styles.settingText}>WiFi</Text>
                </View>
                <Text style={styles.settingArrow}>
                  <Ionicons name="chevron-forward" size={rpx(8.6)} color="#fff" />
                </Text>
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
                <Text style={styles.settingArrow}>
                  <Ionicons name="chevron-forward" size={rpx(8.6)} color="#fff" />
                </Text>
              </TouchableOpacity>
            </View>

            {/* 亮度调节 */}
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>亮度</Text>
              {Platform.OS === "ios" ? (
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  value={brightness}
                  onValueChange={onBrightnessChange}
                  minimumTrackTintColor="#4891FF"
                  maximumTrackTintColor="rgba(255,255,255,0.8)"
                />
              ) : (
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  value={brightness}
                  onValueChange={onBrightnessChange}
                  minimumTrackTintColor="#4891FF"
                  maximumTrackTintColor="rgba(255,255,255,0.8)"
                  thumbTintColor="#FFFFFF"
                />
              )}
            </View>

            {/* 音量调节 */}
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>系统音量</Text>
              {Platform.OS === "ios" ? (
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  value={volume}
                  onValueChange={onVolumeChange}
                  minimumTrackTintColor="#4891FF"
                  maximumTrackTintColor="rgba(255,255,255,0.8)"
                />
              ) : (
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={100}
                  value={volume}
                  onValueChange={onVolumeChange}
                  minimumTrackTintColor="#4891FF"
                  maximumTrackTintColor="rgba(255,255,255,0.8)"
                  thumbTintColor="#FFFFFF"
                />
              )}
            </View>
          </View>
        )}

        {/* 主内容区 */}
        <View style={styles.mainContent}>
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
                      <Text style={styles.progressTotal}>/{userInfo.rank_required || 0}</Text>
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
              texts={notifications.length > 0 ? notifications : ["欢迎使用XHTX学习助手"]}
              delay={3}
              color="#fff"
              backgroundColor="rgba(255, 235, 181, 0.65)"
            />

            {/* 同步课堂和排行榜容器 */}
            {latestVideo && (
              <View style={styles.cardsContainer}>
                {/* 同步课堂 */}
                <TouchableOpacity style={styles.syncClassCard} onPress={playVideo}>
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
                        <Text style={styles.studyButtonArrow}>›</Text>
                      </LinearGradient>
                    </View>
                    <Image source={Images.book1} style={styles.bookCover} resizeMode="contain" />
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

                  <Image
                    source={Images.indexClassRoomBg}
                    style={styles.syncClassBg}
                    resizeMode="cover"
                  />
                </TouchableOpacity>

                {/* 学习时长排行榜 */}
                <ImageBackground
                  source={Images.indexRankBg2}
                  style={styles.rankingCard}
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
              </View>
            )}
          </View>
        </View>

        {/* AI按钮 */}
        <TouchableOpacity style={styles.aiButton} onPress={goToAI}>
          <Image source={Images.indexAiBtn} style={styles.aiButtonImage} resizeMode="contain" />
        </TouchableOpacity>

        {/* 阅读器按钮 */}
        <TouchableOpacity style={styles.readerButton} onPress={goToReader}>
          <View style={styles.readerButtonContent}>
            <Ionicons name="book" size={rpx(24)} color="#fff" />
            <Text style={styles.readerButtonText}>小褐阅读</Text>
          </View>
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
    height: 64.0625,
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
    height: 39,
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
    width: 138.28125,
    height: 20,
    marginLeft: 0,
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
    left: 0,
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
    fontSize: 7.4218,
    color: "#D08F04",
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
    color: "#fff",
    fontSize: 8,
    marginTop: 1,
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
    width: 16,
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
})
