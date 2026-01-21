import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { InteractionManager } from "react-native"
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
  ScrollView,
} from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import Svg, { Circle, Text as SvgText } from "react-native-svg"
import { useFocusEffect } from "expo-router"
import * as Application from "expo-application"

import { StatusBar } from "../../components/StatusBar"
import { NavBar } from "../../components/NavBar"
import { WeeklyStudyChart } from "../../components/WeeklyStudyChart"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import { useUserStore } from "../../stores/userStore"
import { useDeviceStatusStore } from "../../stores/deviceStatusStore"
import { useUpdateManager } from "../../hooks/useUpdateManager"
import { showSuccess, showError, showWarning, showInfo } from "../../utils/toast"
import { showConfirm, showMessage } from "../../utils/dialog"
import {
  getUserBadges,
  getUserStudyData,
  getUserTodayQuestionData,
  type MedalList,
  type TodayQuestionData,
  type DailyStudyData,
} from "../../services/my"
import { devError, devLog } from "@/services/WebSocketManager"

/**
 * 个人中心首页
 * 100%还原UniApp项目 /src/pages/my/index.vue
 */
export default function MyScreen() {
  const router = useRouter()
  const userStore = useUserStore()
  const { manualCheckForUpdates } = useUpdateManager()

  // 直接订阅 store 的 user，这样当 store 更新时会自动更新组件
  const userInfo = useUserStore((state) => state.user)
  
  // 周学习数据初始值
  const defaultWeeklyStudyData: DailyStudyData[] = [
    { date: "", duration: 0, weekday: "" },
    { date: "", duration: 0, weekday: "" },
    { date: "", duration: 0, weekday: "" },
    { date: "", duration: 0, weekday: "" },
    { date: "", duration: 0, weekday: "" },
  ]
  
  const [badges, setBadges] = useState<MedalList[]>([])
  const [todayQuestionData, setTodayQuestionData] = useState<TodayQuestionData>({
    total_wrong_questions: 0,
    total_corrected_questions: 0,
  })
  const [weeklyStudyData, setWeeklyStudyData] = useState<DailyStudyData[]>(defaultWeeklyStudyData)
  const [isInitialized, setIsInitialized] = useState(false)
  const [showVersion, setShowVersion] = useState(false)

  // 订阅设备绑定状态
  const isBound = useDeviceStatusStore((state) => state.status?.bound ?? false)

  // 获取应用版本号
  const appVersion = useMemo(() => {
    return Application.nativeApplicationVersion || "1.0.0"
  }, [])

  // 预计算用户头像，避免重复计算
  const userAvatar = useMemo(() => {
    return userInfo?.gender
      ? require("../../../assets/images/user-avatar-girl.png")
      : require("../../../assets/images/user-avatar-boy.png")
  }, [userInfo?.gender])

  // 获取所有数据 - 优化版本
  const fetchAllData = useCallback(async () => {
    // 检查是否有token，没有则直接返回
    const token = userStore.token
    if (!token) {
      // console.log("未找到token，跳过我的页面数据加载")
      return
    }

    try {
      // 并行加载所有数据
      const [badgesData, todayData, studyDataResult] = await Promise.all([
        getUserBadges().catch((err) => {
          devError("获取徽章失败:", err)
          return { medal_list: [] }
        }),
        getUserTodayQuestionData().catch((err) => {
          devError("获取今日错题数据失败:", err)
          return { total_wrong_questions: 0, total_corrected_questions: 0 }
        }),
        getUserStudyData().catch((err) => {
          devError("获取学习数据失败:", err)
          return { daily_data: defaultWeeklyStudyData }
        })
      ])

      // 批量更新状态
      // 不需要 setUserInfo，因为 userInfo 已经通过 useUserStore 订阅自动更新了
      setBadges(badgesData.medal_list || [])
      setTodayQuestionData(todayData)
      setWeeklyStudyData(studyDataResult.daily_data || defaultWeeklyStudyData)

      // console.log("✅ 我的页面数据加载完成")
    } catch (error) {
      devError("获取数据失败:", error)
    }
  }, [userStore])

  // 监听token变化，当token从无到有时重新请求数据
  const prevTokenRef = useRef<string | null>(null)
  useEffect(() => {
    const currentToken = userStore.token
    const prevToken = prevTokenRef.current

    // token从无到有，重新请求数据
    if (!prevToken && currentToken && isInitialized) {
      devLog("检测到token从无到有，重新请求我的页面数据")
      fetchAllData()
    }

    prevTokenRef.current = currentToken
  }, [userStore.token, isInitialized, fetchAllData])

  // 初始化数据 - 使用InteractionManager优化
  useEffect(() => {
    if (!isInitialized) {
      InteractionManager.runAfterInteractions(async () => {
        try {
          // 先获取用户信息
          await userStore.getUserInfo()
          // 再获取其他数据
          await fetchAllData()
        } catch (error) {
          devError("初始化数据失败:", error)
        } finally {
          setIsInitialized(true)
        }
      })
    }
  }, [isInitialized, fetchAllData, userStore])

  // 页面显示时刷新所有数据
  useFocusEffect(
    useCallback(() => {
      if (!isInitialized) return

      let isCancelled = false

      // 刷新用户信息和所有数据
      const refreshData = async () => {
        if (isCancelled) return

        try {
          // 1. 先调用 getUserInfo 获取最新用户数据
          await userStore.getUserInfo()

          if (isCancelled) return

          // 2. 刷新其他数据
          const token = userStore.token
          if (!token) return

          const [badgesData, todayData, studyDataResult] = await Promise.all([
            getUserBadges().catch((err) => {
              devError("获取徽章失败:", err)
              return { medal_list: [] }
            }),
            getUserTodayQuestionData().catch((err) => {
              devError("获取今日错题数据失败:", err)
              return { total_wrong_questions: 0, total_corrected_questions: 0 }
            }),
            getUserStudyData().catch((err) => {
              devError("获取学习数据失败:", err)
              return { daily_data: defaultWeeklyStudyData }
            })
          ])

          if (!isCancelled) {
            // 不需要 setUserInfo，因为 userInfo 已经通过 useUserStore 订阅自动更新了
            setBadges(badgesData.medal_list || [])
            setTodayQuestionData(todayData)
            setWeeklyStudyData(studyDataResult.daily_data || defaultWeeklyStudyData)
          }
        } catch (error) {
          devError("刷新数据失败:", error)
        }
      }

      refreshData()

      return () => {
        isCancelled = true
      }
    }, [isInitialized]) // 只依赖 isInitialized
  )

  // 处理会员点击
  const handleVipClick = () => {
    showInfo("会员功能开发中")
  }

  // 处理切换账号
  const handleSwitchAccount = () => {
    showConfirm(
      "切换账号",
      "确认要切换账号吗？当前账号信息将被清除",
      () => {
        userStore.logout()
        // 使用新的登录弹窗系统
        import("../../utils/loginUtils").then(({ showLoginModal }) => {
          showLoginModal({
            onSuccess: () => {
              devLog("切换账号成功")
            },
            onCancel: () => {
              devLog("用户取消登录")
            },
          })
        })
      }
    )
  }

  // 处理绑定家长端
  const handleBindParent = () => {
    router.push("/bind-parent")
  }

  // 处理编辑用户信息 - 跳转到编辑模式的完善信息页面
  const handleUserEditClick = () => {
    router.push("/complete-info?type=edit")
  }

  // 处理勋章点击
  const handleBadgesClick = () => {
    router.push("/my/badges")
  }

  // 处理数据点击
  const handleDataClick = () => {
    router.push("/weekly-report")
  }

  // 渲染今日错题圆形进度条
  const renderTodayProgressCircle = () => {
    const size = rpx(78.125) // 200
    const strokeWidth = rpx(10.546875) // 27
    const radius = rpx(33.203125) // 85
    const center = size / 2
    const circumference = 2 * Math.PI * radius

    const totalWrong = todayQuestionData.total_wrong_questions || 0
    const corrected = todayQuestionData.total_corrected_questions || 0
    const uncorrected = totalWrong - corrected
    const progress = totalWrong === 0 ? 0 : (uncorrected / totalWrong) * 100
    const strokeDashoffset = circumference - (circumference * progress) / 100

    return (
      <Svg width={size} height={size}>
        {/* 背景圆 */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#DFEFFF"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* 进度圆 */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="#2D9DFF"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${center}, ${center}`}
        />
        {/* 中心文字 - 未订正数量 */}
        <SvgText
          x={center}
          y={center - rpx(5)}
          fontSize={rpx(14)}
          fill="#1571FC"
          textAnchor="middle"
          alignmentBaseline="middle"
          fontWeight="bold"
        >
          {uncorrected}
        </SvgText>
        {/* 中心文字 - "未订正" */}
        <SvgText
          x={center}
          y={center + rpx(10)}
          fontSize={rpx(8)}
          fill="#646464"
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          未订正
        </SvgText>
      </Svg>
    )
  }

  return (
    <LinearGradient
      colors={["#DAE4FF", "#E8F1FF", "#F0F5FF", "#D6E2FF"]}
      // colors={["#D1DBFF", "#C0DAFF", "#E6EEFF", "#C4DDFF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.pageContainer}
    >
      <StatusBar theme="light" />

      {/* 内容区域 */}
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* 用户信息头部 */}
        <View style={styles.userHeader}>
          <TouchableOpacity
            style={styles.userBasic}
            onPress={handleUserEditClick}
            activeOpacity={0.8}
          >
            <View style={styles.userAvatar}>
              <Image
                source={userAvatar}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            </View>

            <View style={styles.userDetails}>
              <Text style={styles.userName}>{userInfo?.username || "小褐同学"}</Text>
              <Text style={styles.userGrade}>{userInfo?.grade || "一年级"}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={handleSwitchAccount} activeOpacity={0.8}>
              <LinearGradient
                colors={["rgba(255, 255, 255, 0.14)", "#ffffff"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.switchAccountBtn}
              >
                <Ionicons
                  name="swap-horizontal"
                  size={rpx(12)}
                  color="rgba(13, 92, 245, 0.83)"
                  style={styles.switchIcon}
                />
                <Text style={styles.switchText}>切换账号</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* 绑定家长按钮 - 仅在未绑定时显示 !isBound && */}
            {!isBound &&  (
              <TouchableOpacity onPress={handleBindParent} activeOpacity={0.8}>
                <LinearGradient
                  colors={["rgba(255, 255, 255, 0.14)", "#ffffff"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.switchAccountBtn}
                >
                  <Ionicons
                    name="link"
                    size={rpx(12)}
                    color="rgba(13, 92, 245, 0.83)"
                    style={styles.switchIcon}
                  />
                  <Text style={styles.switchText}>绑定家长</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>

          {/* 测试更新功能按钮 - 仅开发环境显示 */}
          {__DEV__ && (
            <TouchableOpacity
              style={styles.testUpdateBtn}
              onPress={manualCheckForUpdates}
              activeOpacity={0.8}
            >
              <Ionicons
                name="refresh"
                size={rpx(12)}
                color="rgba(13, 92, 245, 0.83)"
                style={styles.switchIcon}
              />
              <Text style={styles.switchText}>测试更新</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 主要内容区域 */}
        <View style={styles.mainContent}>
          {/* 左侧列 */}
          <View style={styles.leftColumn}>
            {/* 会员卡片 */}
            {/* <ImageBackground
              source={require("../../../assets/images/my-user-vip-bg.png")}
              style={styles.memberCard}
              imageStyle={styles.memberCardImage}
            >
              <View style={styles.memberContent}>
                <Image
                  source={require("../../../assets/images/crown.png")}
                  style={styles.crownImage}
                  resizeMode="contain"
                />
                <Text style={styles.memberTitle}>小褐同学拓展服务</Text>
              </View>
              <TouchableOpacity
                style={styles.memberAction}
                onPress={handleVipClick}
                activeOpacity={0.8}
              >
                <Text style={styles.actionBtnText}>立即开通</Text>
                <Ionicons name="chevron-forward" size={rpx(8.6)} color="#487FB1" />
              </TouchableOpacity>
            </ImageBackground> */}

            {/* 我的勋章 */}
            <LinearGradient
              colors={["#F5F9FF", "#E8F2FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.badgesCard}
            >
              <View style={styles.badgesHeader}>
                <View style={styles.badgesTitle}>
                  <Text style={styles.badgesTitleText}>我的勋章</Text>
                  <Image
                    source={require("../../../assets/images/my-title-bg.png")}
                    style={styles.titleBgImage}
                    resizeMode="contain"
                  />
                </View>
              </View>
              {badges && badges.length > 0 && (
                <View style={styles.badgesGrid}>
                  {badges.slice(0, 6).map((badge, index) => {
                    // 检查并修复图片 URL
                    let imageUrl = badge.image_url
                    if (imageUrl && !imageUrl.startsWith('http')) {
                      // 如果不是完整 URL，添加域名
                      const baseUrl = 'http://8.135.11.47:8080'
                      imageUrl = imageUrl.startsWith('/') ? `${baseUrl}${imageUrl}` : `${baseUrl}/${imageUrl}`
                    }

                    // console.log('徽章图片 URL:', imageUrl)

                    return (
                      <View key={index} style={styles.badgeItem}>
                        <View style={styles.badgeCircle}>
                          {imageUrl ? (
                            <Image
                              source={{ uri: imageUrl }}
                              style={styles.badgeImage}
                              resizeMode="contain"
                              onError={(error) => {
                                devError(`徽章[${badge.name}]图片加载失败:`, imageUrl, error.nativeEvent.error)
                              }}
                              onLoad={() => {
                                // console.log(`徽章[${badge.name}]图片加载成功`)
                              }}
                            />
                          ) : (
                            <Text style={{ fontSize: 10, color: '#999' }}>无图片</Text>
                          )}
                        </View>
                        <Text
                          style={[
                            styles.badgeLabel,
                            badge.is_unlocked ? styles.badgeLabelUnlocked : styles.badgeLabelLocked,
                          ]}
                        >
                          {badge.name}
                        </Text>
                      </View>
                    )
                  })}
                </View>
              )}
            </LinearGradient>
          </View>

          {/* 右侧列 */}
          <View style={styles.rightColumn}>
            {/* 我的数据卡片 */}
            <LinearGradient
              colors={["#F5F9FF", "#E8F2FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.dataCard}
            >
              <View style={styles.dataHeader}>
                <View style={styles.dataTitle}>
                  <Text style={styles.dataTitleText}>我的数据</Text>
                  <Image
                    source={require("../../../assets/images/my-title-bg.png")}
                    style={styles.titleBgImage1}
                    resizeMode="contain"
                  />
                </View>
                {/* <Ionicons
                    name="arrow-forward-sharp"
                    size={rpx(8.6)}
                  color="#487FB1"
                  onPress={handleDataClick}
                    style={styles.switchIcon}
                  /> */}
              </View>

              <View style={styles.studyDataContainer}>
                {/* 今日错题 */}
                <View style={styles.todayQuestions}>
                  <Text style={styles.todayTitle}>今日错题</Text>
                  <Text style={styles.todaySubtitle}>快来回顾下进入错题吧！</Text>
                  <View style={styles.questionStats}>
                    <View style={styles.progressCircleWrapper}>{renderTodayProgressCircle()}</View>
                    <View style={styles.questionNumbers}>
                      <View style={styles.questionItem}>
                        <Text style={styles.questionLabel}>全部</Text>
                        <Text style={styles.questionValue}>
                          {todayQuestionData.total_wrong_questions}
                        </Text>
                      </View>
                      <View style={styles.questionItem}>
                        <Text style={styles.questionLabel}>已订正</Text>
                        <Text style={styles.questionValue}>
                          {todayQuestionData.total_corrected_questions}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* 本周学习时长 */}
                <View style={styles.weeklyStudy}>
                  <View style={styles.weeklyTitle}>
                    <Text style={styles.weeklyTitleText}>本周学习时长</Text>
                    <Text style={styles.weeklyUnit}>单位: 分钟</Text>
                  </View>
                  <WeeklyStudyChart weekData={weeklyStudyData} />
                </View>
              </View>
            </LinearGradient>
          </View>
        </View>
      </ScrollView>

      {/* 版本号显示区域 - 右下角 */}
      <TouchableOpacity
        style={styles.versionTrigger}
        onPress={() => setShowVersion(!showVersion)}
        activeOpacity={0.7}
      >
        {showVersion && (
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>v{appVersion}</Text>
          </View>
        )}
      </TouchableOpacity>
    </LinearGradient>
  )
}

const styles = createStyles({
  pageContainer: {
    width: "100%" as const,
    height: "100%" as const,
    minWidth: 750,
    minHeight: "100%" as const,
  },
  // 用户信息头部
  userHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginTop: 38.625,
    marginBottom: 15.625,
    paddingHorizontal: 29,
  },
  userBasic: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    width: 400,
    position: "relative" as const,
  },
  userAvatar: {
    width: 46.875,
    height: 46.875,
    borderRadius: 23.4375,
    borderWidth: 1.953,
    borderColor: "#789EFF",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    position: "relative" as const,
    zIndex: 2,
  },
  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  userDetails: {
    flexDirection: "column" as const,
    justifyContent: "center" as const,
    gap: 1.953125,
    height: 39.063,
    borderRadius: 35.156,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1,
    borderColor: "#ffffff",
    paddingLeft: 42.969,
    paddingRight: 13.281,
    left: 7.813,
    position: "absolute" as const,
  },
  userName: {
    fontSize: 10.9375,
    color: "rgba(13, 92, 245, 0.83)",
    fontWeight: "bold" as const,
  },
  userGrade: {
    fontSize: 8.375,
    color: "rgba(13, 92, 245, 0.7)",
  },
  actionButtons: {
    flexDirection: "row" as const,
    gap: 7.8125,
  },
  switchAccountBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 7.8125,
    paddingVertical: 3.90625,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 19.531,
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 3.516, height: -1.953 },
    shadowOpacity: 0.1,
    shadowRadius: 4.67,
    elevation: 2,
  },
  testUpdateBtn: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 7.8125,
    paddingVertical: 3.90625,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 19.531,
    // shadowColor: "#FFFFFF",
    // shadowOffset: { width: 3.516, height: -1.953 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4.67,
    // elevation: 2,
    // marginTop: 7.8125,
  },
  switchIcon: {
    marginRight: 4,
  },
  switchText: {
    fontSize: 8.6,
    color: "rgba(13, 92, 245, 0.83)",
  },
  // 主要内容区域
  mainContent: {
    flexDirection: "row" as const,
    gap: 15.625,
    paddingHorizontal: 29,
  },
  leftColumn: {
    flex: 1,
    flexDirection: "column" as const,
    gap: 18.75, // 48
  },
  rightColumn: {},
  // 会员卡片
  // memberCard: {
  //   borderRadius: 11.71875,
  //   paddingHorizontal: 15.625,
  //   paddingVertical: 15.625,
  //   flexDirection: "row" as const,
  //   justifyContent: "space-between" as const,
  //   alignItems: "center" as const,
  //   height: 73.4375,
  //   width: 267.1875,
  //   overflow: "hidden" as const,
  //   // shadowColor: "#AFACD0",
  //   // shadowOffset: { width: 0, height: 8.6 },
  //   // shadowOpacity: 0.47,
  //   // shadowRadius: 8.4,
  //   // elevation: 5,
  // },
  // memberCardImage: {
  //   borderRadius: 11.71875,
  // },
  // memberContent: {
  //   flexDirection: "row" as const,
  //   alignItems: "center" as const,
  // },
  // crownImage: {
  //   width: 19,
  //   marginTop: 6,
  // },
  // memberTitle: {
  //   fontSize: 11.71875,
  //   fontWeight: "bold" as const,
  //   color: "#fff",
  //   marginLeft: 8,
  // },
  // memberAction: {
  //   backgroundColor: "#ffffff",
  //   borderRadius: 11.71875,
  //   paddingHorizontal: 7.8125,
  //   paddingVertical: 3.90625,
  //   flexDirection: "row" as const,
  //   alignItems: "center" as const,
  // },
  // actionBtnText: {
  //   fontSize: 8.6,
  //   color: "#487FB1",
  // },
  // 我的勋章
  badgesCard: {
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 11.71875, // 30
    padding: 15.625, // 40
    width: 267.1875, // 684
    height: 209.765625, // 537
    overflow: "hidden" as const,
    shadowColor: "#A3D4FE",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.22265625,
    elevation: 3,
  },
  badgesHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "flex-start" as const,
    marginBottom: 7.8125, // 20
  },
  badgesTitle: {
    width: "100%" as const,
    height: 17.96875, // 46
  },
  badgesTitleText: {
    fontSize: 13.671875, // 35
    color: "#404040E5",
    fontWeight: "bold" as const,
    position: "relative" as const,
    zIndex: 2,
  },
  titleBgImage: {
    position: "absolute" as const,
    left: -1.5625, // -4
    top: 7.03125, // 18
    width: 53.515625, // 137
    height: 12.5, // 32
  },
  titleBgImage1: {
    position: "absolute" as const,
    left: 6.640625, // 17
    top: 6.25, // 16
    width: 53.515625, // 137
    height: 12.5, // 32
  },
  badgesGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    justifyContent: "space-between" as const,
    gap: 7.8125, // 20
  },
  badgeItem: {
    flexDirection: "column" as const,
    alignItems: "center" as const,
    gap: 3.125, // 8
  },
  badgeCircle: {
    width: 59.375, // 152
    height: 59.375, // 152
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    overflow: "hidden" as const,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  badgeImage: {
    width: 59.375, // 152
    height: 59.375, // 152
  },
  badgeLabel: {
    textAlign: "center" as const,
    fontSize: 8.59375, // 22
    fontWeight: "600" as const,
  },
  badgeLabelUnlocked: {
    color: "#42508D",
  },
  badgeLabelLocked: {
    color: "#999",
  },
  // 我的数据卡片
  dataCard: {
    width: 401.5625, // 1028
    height: 214.0625, // 548
    borderRadius: 11.71875, // 30
    padding: 15.625, // 40
    shadowColor: "#A3D4FE",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.22265625,
    elevation: 3,
  },
  dataHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    height: 17.96875, // 46
  },
  dataTitle: {
    width: "100%" as const,
    height: 17.96875, // 46
  },
  dataTitleText: {
    fontSize: 13.671875, // 35
    color: "#404040E5",
    fontWeight: "bold" as const,
    position: "relative" as const,
    zIndex: 2,
  },
  studyDataContainer: {
    flexDirection: "row" as const,
    gap: 15.625, // 40
  },
  // 今日错题
  todayQuestions: {
    backgroundColor: "#F9FCFFF2",
    borderRadius: 7.8125,
    padding: 12.5, // 32
    flex: 1,
    height: 145.3125, // 372
    marginTop: 14.0625, // 36 为了避免阴影遮蔽
    shadowColor: '#D2CFFF',
    shadowOpacity: 0.25,
    shadowOffset: {
      width: 0,    // 对应 X: 0
      height: 0,   // 对应 Y: 0
    },
    shadowRadius: 13.8671875,
    elevation: 2,
  },
  todayTitle: {
    fontSize: 11.71875, // 30
    fontWeight: "bold" as const,
    color: "#404040E5",
    marginBottom: 2.34375, // 6
  },
  todaySubtitle: {
    fontSize: 9.375, // 24
    fontWeight: "400" as const,
    color: "#6F6F6F",
  },
  questionStats: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginTop: 11.71875, // 30
  },
  progressCircleWrapper: {
    position: "relative" as const,
    width: 78.125, // 200
    height: 78.125, // 200
  },
  questionNumbers: {
    flexDirection: "column" as const,
    gap: 5.46875, // 14
    marginLeft: 21.484375, // 55
  },
  questionItem: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    width: 46.875, // 120
    height: 14.0625, // 36
  },
  questionLabel: {
    fontSize: 9.375,
    color: "#6F6F6F",
  },
  questionValue: {
    fontSize: 9.375,
    color: "#333C67",
  },
  // 本周学习时长
  weeklyStudy: {
    backgroundColor: "#F9FCFFF2",
    borderRadius: 7.8125, // 20
    padding: 11.71875, // 30
    flex: 1,
    height: 145.3125, // 372
    marginTop: 14.0625, // 36 为了避免阴影遮蔽
    shadowColor: '#D2CFFF',
    shadowOpacity: 0.25,
    shadowOffset: {
      width: 0,    // 对应 X: 0
      height: 0,   // 对应 Y: 0
    },
    shadowRadius: 13.8671875,
    elevation: 2,
  },
  weeklyTitle: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    height: 17.96875, // 46
    marginBottom: 7.8125, // 20
  },
  weeklyTitleText: {
    fontSize: 11.71875, // 30
    fontWeight: "bold" as const,
    color: "#404040E5",
  },
  weeklyUnit: {
    fontSize: 9.375, // 24
    fontWeight: "400" as const,
    color: "#6F6F6F",
  },
  // 版本号显示
  versionTrigger: {
    position: "absolute" as const,
    bottom: 20,
    right: 20,
    minWidth: 60,
    minHeight: 40,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    zIndex: 999,
  },
  versionContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15.625,
    paddingHorizontal: 15.625,
    paddingVertical: 7.8125,
    borderWidth: 1,
    borderColor: "rgba(72, 145, 255, 0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1.953 },
    shadowOpacity: 0.1,
    shadowRadius: 3.90625,
    elevation: 2,
    minWidth: 80,
    alignItems: "center" as const,
  },
  versionText: {
    fontSize: 11.71875,
    color: "#4891FF",
    fontWeight: "500" as const,
  },
  dataIcon: {
    width: 8.6,
    height: 8.6,
    marginRight: 4,
    marginLeft: 4,
    marginTop: 4,
    marginBottom: 4,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
  }
})
