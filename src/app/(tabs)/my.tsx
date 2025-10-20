import { useState, useEffect, useCallback, useMemo } from "react"
import { InteractionManager } from "react-native"
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import Svg, { Circle, Text as SvgText } from "react-native-svg"
import { useFocusEffect } from "expo-router"

import { StatusBar } from "../../components/StatusBar"
import { NavBar } from "../../components/NavBar"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import { useUserStore } from "../../stores/userStore"
import { useUpdateManager } from "../../hooks/useUpdateManager"
import {
  getUserBadges,
  getUserStudyData,
  getUserTodayQuestionData,
  type MedalList,
  type TodayQuestionData,
  type DailyStudyData,
} from "../../services/my"

/**
 * 个人中心首页
 * 100%还原UniApp项目 /src/pages/my/index.vue
 */
export default function MyScreen() {
  const router = useRouter()
  const userStore = useUserStore()
  const { manualCheckForUpdates } = useUpdateManager()

  const [userInfo, setUserInfo] = useState<any>((userStore as any).userInfo)
  const [badges, setBadges] = useState<MedalList[]>([])
  const [todayQuestionData, setTodayQuestionData] = useState<TodayQuestionData>({
    total_wrong_questions: 0,
    total_corrected_questions: 0,
  })
  const [weeklyStudyData, setWeeklyStudyData] = useState<DailyStudyData[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // 预计算用户头像，避免重复计算
  const userAvatar = useMemo(() => {
    return userInfo?.gender
      ? require("../../../assets/images/user-avatar-girl.png")
      : require("../../../assets/images/user-avatar-boy.png")
  }, [userInfo?.gender])

  // 获取所有数据 - 优化版本
  const fetchAllData = useCallback(async () => {
    try {
      // 并行加载所有数据
      const [userInfoData, badgesData, todayData, studyDataResult] = await Promise.all([
        (userStore as any).getUserInfo?.().catch(() => null),
        getUserBadges().catch(() => ({ medal_list: [] })),
        getUserTodayQuestionData().catch(() => ({ total_wrong_questions: 0, total_corrected_questions: 0 })),
        getUserStudyData().catch(() => ({ daily_data: [] }))
      ])

      // 批量更新状态
      if (userInfoData) {
        setUserInfo(userInfoData)
      }
      setBadges(badgesData.medal_list || [])
      setTodayQuestionData(todayData)
      setWeeklyStudyData(studyDataResult.daily_data || [])
    } catch (error) {
      console.error("获取数据失败:", error)
    }
  }, [userStore])

  // 初始化数据 - 使用InteractionManager优化
  useEffect(() => {
    if (!isInitialized) {
      InteractionManager.runAfterInteractions(async () => {
        await fetchAllData()
        setIsInitialized(true)
      })
    }
  }, [isInitialized, fetchAllData])

  // 页面显示时只刷新用户信息（其他数据已预加载）
  useFocusEffect(
    useCallback(() => {
      if (isInitialized) {
        // 只刷新用户信息，其他数据保持不变
        (userStore as any).getUserInfo?.().then((userInfoData: any) => {
          if (userInfoData) {
            setUserInfo(userInfoData)
          }
        }).catch(() => {})
      }
    }, [isInitialized, userStore]),
  )

  // 处理会员点击
  const handleVipClick = () => {
    Alert.alert("提示", "会员功能开发中")
  }

  // 处理切换账号
  const handleSwitchAccount = () => {
    Alert.alert("切换账号", "确认要切换账号吗？当前账号信息将被清除", [
      { text: "取消", style: "cancel" },
      {
        text: "确定",
        onPress: () => {
          userStore.logout()
          // 使用新的登录弹窗系统
          import("../../utils/loginUtils").then(({ showLoginModal }) => {
            showLoginModal({
              onSuccess: () => {
                console.log("🔐 切换账号成功")
              },
              onCancel: () => {
                console.log("🔐 用户取消登录")
              },
            })
          })
        },
      },
    ])
  }

  // 处理编辑用户信息
  const handleUserEditClick = () => {
    router.push("/my/edit")
  }

  // 处理勋章点击
  const handleBadgesClick = () => {
    router.push("/my/badges")
  }

  // 处理数据点击
  const handleDataClick = () => {
    router.push("/my/data")
  }

  // 渲染今日错题圆形进度条
  const renderTodayProgressCircle = () => {
    const size = 70
    const strokeWidth = 10.54
    const radius = 29
    const center = size / 2
    const circumference = 2 * Math.PI * radius

    const totalWrong = todayQuestionData.total_wrong_questions || 0
    const corrected = todayQuestionData.total_corrected_questions || 0
    const uncorrected = totalWrong - corrected
    const progress = totalWrong === 0 ? 0 : (uncorrected / 100) * 100
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
          y={center - 2}
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
          y={center + 24}
          fontSize={rpx(7)}
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
      colors={["#93ABFF", "#E4F4FF", "#CDEDFF", "#FFFFFF"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.pageContainer}
    >
      <StatusBar theme="dark" />

      {/* 加载状态 */}
      {!isInitialized && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1890ff" />
          <Text style={styles.loadingText}>正在加载个人信息...</Text>
        </View>
      )}

      {/* 内容区域 */}
      {isInitialized && (
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

          <TouchableOpacity
            style={styles.switchAccountBtn}
            onPress={handleSwitchAccount}
            activeOpacity={0.8}
          >
            <Ionicons
              name="swap-horizontal"
              size={rpx(12)}
              color="rgba(13, 92, 245, 0.83)"
              style={styles.switchIcon}
            />
            <Text style={styles.switchText}>切换账号</Text>
          </TouchableOpacity>

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
            <ImageBackground
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
            </ImageBackground>

            {/* 我的勋章 */}
            <View style={styles.badgesCard}>
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
                  {badges.slice(0, 3).map((badge, index) => (
                    <View key={index} style={styles.badgeItem}>
                      <View style={styles.badgeCircle}>
                        <Image
                          source={{ uri: badge.image_url }}
                          style={styles.badgeImage}
                          resizeMode="contain"
                        />
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
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* 右侧列 */}
          <View style={styles.rightColumn}>
            {/* 我的数据卡片 */}
            <View style={styles.dataCard}>
              <View style={styles.dataHeader}>
                <View style={styles.dataTitle}>
                  <Text style={styles.dataTitleText}>我的数据</Text>
                  <Image
                    source={require("../../../assets/images/my-title-bg.png")}
                    style={styles.titleBgImage}
                    resizeMode="contain"
                  />
                </View>
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
                  {/* TODO: 使用WeeklyStudyChart组件 */}
                  <View style={styles.chartPlaceholder}>
                    <Text style={styles.chartPlaceholderText}>图表开发中</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
        </ScrollView>
      )}
    </LinearGradient>
  )
}

const styles = createStyles({
  pageContainer: {
    width: "100%",
    height: "100%",
    minWidth: 750,
    minHeight: "100%",
    overflowX: "hidden",
  },
  // 用户信息头部
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 39.625,
    marginBottom: 15.625,
    paddingHorizontal: 29,
  },
  userBasic: {
    flexDirection: "row",
    alignItems: "center",
    width: 400,
    position: "relative",
  },
  userAvatar: {
    width: 46.875,
    height: 46.875,
    borderRadius: 23.4375,
    borderWidth: 1.953,
    borderColor: "#789EFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    zIndex: 2,
  },
  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  userDetails: {
    flexDirection: "column",
    justifyContent: "center",
    gap: 1.953125,
    height: 39.063,
    borderRadius: 35.156,
    backgroundColor: "rgba(255, 255, 255, 0.46)",
    borderWidth: 1,
    borderColor: "#ffffff",
    paddingLeft: 42.969,
    paddingRight: 13.281,
    left: 7.813,
    position: "absolute",
  },
  userName: {
    fontSize: 10.9375,
    color: "rgba(13, 92, 245, 0.83)",
    fontWeight: "bold",
  },
  userGrade: {
    fontSize: 8.375,
    color: "rgba(13, 92, 245, 0.7)",
  },
  switchAccountBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7.8125,
    paddingVertical: 3.90625,
    // Note: Use LinearGradient component for gradient background
    backgroundColor: "rgba(255, 255, 255, 0.8)",
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
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 7.8125,
    paddingVertical: 3.90625,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 19.531,
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 3.516, height: -1.953 },
    shadowOpacity: 0.1,
    shadowRadius: 4.67,
    elevation: 2,
    marginTop: 7.8125,
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
    flexDirection: "row",
    gap: 15.625,
    paddingHorizontal: 29,
  },
  leftColumn: {
    flex: 1,
    flexDirection: "column",
    gap: 9.375,
  },
  rightColumn: {},
  // 会员卡片
  memberCard: {
    borderRadius: 11.71875,
    paddingHorizontal: 15.625,
    paddingVertical: 15.625,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 73.4375,
    width: 267.1875,
    overflow: "hidden",
    shadowColor: "#AFACD0",
    shadowOffset: { width: 0, height: 8.6 },
    shadowOpacity: 0.47,
    shadowRadius: 8.4,
    elevation: 5,
  },
  memberCardImage: {
    borderRadius: 11.71875,
  },
  memberContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  crownImage: {
    width: 19,
    marginTop: 6,
  },
  memberTitle: {
    fontSize: 11.71875,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 8,
  },
  memberAction: {
    backgroundColor: "#ffffff",
    borderRadius: 11.71875,
    paddingHorizontal: 7.8125,
    paddingVertical: 3.90625,
    flexDirection: "row",
    alignItems: "center",
  },
  actionBtnText: {
    fontSize: 8.6,
    color: "#487FB1",
  },
  // 我的勋章
  badgesCard: {
    // Note: Use LinearGradient component for gradient background
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderWidth: 0.5,
    borderColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 11.71875,
    padding: 15.625,
    width: 267.1875,
    height: 132.03125,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3.90625 },
    shadowOpacity: 0.05,
    shadowRadius: 7.8125,
    elevation: 2,
  },
  badgesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 11.71875,
  },
  badgesTitle: {
    width: "100%",
    height: 40,
    position: "relative",
  },
  badgesTitleText: {
    fontSize: 9.375,
    color: "#333",
    fontWeight: "bold",
    position: "relative",
    zIndex: 2,
  },
  titleBgImage: {
    position: "absolute",
    left: -2,
    bottom: 0,
    width: 53.90625,
  },
  badgesGrid: {
    flexDirection: "row",
    gap: 18.71875,
  },
  badgeItem: {
    flexDirection: "column",
    alignItems: "center",
    gap: 3.90625,
  },
  badgeCircle: {
    width: 57.8125,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  badgeImage: {
    width: "100%",
    height: "100%",
  },
  badgeLabel: {
    textAlign: "center",
    fontSize: 8.6,
    fontWeight: "bold",
    lineHeight: 1.2 * 8.6,
    width: 62.5,
    whiteSpace: "nowrap",
    overflow: "hidden",
  },
  badgeLabelUnlocked: {
    color: "#42508D",
  },
  badgeLabelLocked: {
    color: "#999",
  },
  // 我的数据卡片
  dataCard: {
    width: 401.5625,
    height: 214.0625,
    // Note: Use LinearGradient component for gradient background
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 11.71875,
    padding: 15.625,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3.90625 },
    shadowOpacity: 0.05,
    shadowRadius: 7.8125,
    elevation: 2,
  },
  dataHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 11.71875,
  },
  dataTitle: {
    position: "relative",
    height: 40,
  },
  dataTitleText: {
    fontSize: 9.375,
    color: "#333",
    fontWeight: "bold",
    zIndex: 2,
    position: "relative",
  },
  studyDataContainer: {
    flexDirection: "row",
    gap: 15.625,
  },
  // 今日错题
  todayQuestions: {
    backgroundColor: "rgba(253, 254, 255, 0.3)",
    borderRadius: 7.8125,
    padding: 11.71875,
    flex: 1,
    width: "45%",
  },
  todayTitle: {
    fontSize: 8.6,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 7.8125,
  },
  todaySubtitle: {
    fontSize: 7.8125,
    color: "#666",
  },
  questionStats: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 7.8125,
  },
  progressCircleWrapper: {
    position: "relative",
    width: 70,
    height: 70,
    marginTop: 12,
  },
  questionNumbers: {
    flexDirection: "column",
    gap: 7.8125,
    marginLeft: 20,
  },
  questionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 63.75,
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
    backgroundColor: "rgba(253, 254, 255, 0.3)",
    borderRadius: 7.8125,
    padding: 11.71875,
    flex: 1,
    width: "45%",
  },
  weeklyTitle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 7.8125,
  },
  weeklyTitleText: {
    fontSize: 8.6,
    fontWeight: "bold",
    color: "#000",
  },
  weeklyUnit: {
    fontSize: 7.8125,
    color: "#666",
  },
  chartPlaceholder: {
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  chartPlaceholderText: {
    fontSize: 10,
    color: "#999",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
})
