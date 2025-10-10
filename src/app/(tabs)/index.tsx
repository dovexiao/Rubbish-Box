import { useState, useEffect } from "react"
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ImageBackground,
  Slider,
  Platform,
} from "react-native"
import { useFocusEffect } from "expo-router"
import { StatusBar } from "../../components/StatusBar"
import { useUserStore } from "../../stores/userStore"
import { usePostureStore } from "../../stores/postureStore"
import { getLatestVideo, getNotifications, getHomeRanks } from "../../services/app"
import { LinearGradient } from "expo-linear-gradient"
import { Icons, Images } from "../../constants/Assets"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"
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
  const toggleSettingsPanel = () => {
    setShowSettingsPanel(!showSettingsPanel)
  }

  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        const [userInfoData, latestVideoData, notificationsData, ranksData] = await Promise.all([
          userStore.getUserInfo(),
          getLatestVideo(),
          getNotifications(),
          getHomeRanks(),
        ])

        setUserInfo(userInfoData)
        setLatestVideo(latestVideoData)
        setNotifications(notificationsData.notifications.map((item: any) => item.title))

        if (ranksData && ranksData.ranking_list) {
          let hasCurrentUser = false
          const rankList = ranksData.ranking_list.map((item: any) => {
            if (item.is_current_user) {
              hasCurrentUser = true
            }
            return item
          })

          if (!hasCurrentUser && rankList.length > 0) {
            rankList[0].is_current_user = true
          }

          setRanks(rankList)
        }
      } catch (error) {
        console.error("首页数据加载失败:", error)
      }
    }

    loadData()
  }, [])

  // 播放视频
  const playVideo = () => {
    // 实现视频播放功能
    console.log("播放视频:", latestVideo.rsid)
  }

  // 跳转到AI页面
  const goToAI = () => {
    console.log("跳转到AI页面")
  }

  // 跳转到排行榜页面
  const goToRanking = () => {
    console.log("跳转到排行榜页面")
  }

  // 打开系统WiFi设置
  const openSystemWifiSettings = () => {
    console.log("打开系统WiFi设置")
  }

  // 打开系统蓝牙设置
  const openSystemBluetoothSettings = () => {
    console.log("打开系统蓝牙设置")
  }

  // 亮度调节
  const onBrightnessChange = (value: number) => {
    setBrightness(value)
  }

  // 音量调节
  const onVolumeChange = (value: number) => {
    setVolume(value)
  }

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
                    <Text style={styles.settingIconText}>W</Text>
                  </View>
                  <Text style={styles.settingText}>WiFi</Text>
                </View>
                <Text style={styles.settingArrow}>›</Text>
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
                <Text style={styles.settingArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* 亮度调节 */}
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>亮度</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={brightness}
                onValueChange={onBrightnessChange}
                minimumTrackTintColor="#4891FF"
                maximumTrackTintColor="rgba(255,255,255,0.8)"
                thumbStyle={styles.sliderThumb}
              />
            </View>

            {/* 音量调节 */}
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>系统音量</Text>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                value={volume}
                onValueChange={onVolumeChange}
                minimumTrackTintColor="#4891FF"
                maximumTrackTintColor="rgba(255,255,255,0.8)"
                thumbStyle={styles.sliderThumb}
              />
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
            <View style={styles.noticeBar}>
              <Image source={Images.tipsIcon} style={styles.noticeIcon} resizeMode="contain" />
              <Text style={styles.noticeText}>{notifications[0] || "欢迎使用XHTX学习助手"}</Text>
            </View>

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
      </ImageBackground>
    </LinearGradient>
  )
}

const styles = createStyles({
  pageContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    minWidth: "100%",
    minHeight: "100%",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 38.28125, // 状态栏高度，确保坐姿状态距离上面的高度为状态栏的高度
    position: "relative",
  },
  postureStatus: {
    flexDirection: "row",
    alignItems: "center",
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
    position: "absolute",
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 5,
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIconContainer: {
    width: 20.3125,
    height: 20.3125,
    borderRadius: 10.15625,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
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
    fontWeight: "bold",
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
    fontWeight: "bold",
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
    flexDirection: "row",
    justifyContent: "space-between",
    position: "relative",
  },
  userInfoWrap: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    left: 0,
    bottom: 0,
    width: 248,
    height: 85.9375,
    zIndex: 2,
  },
  avatarContainer: {
    width: 48.4375,
    height: 48.4375,
    justifyContent: "center",
    alignItems: "center",
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
    flexDirection: "row",
    marginBottom: 7.8125,
    alignItems: "center",
  },
  nameColumn: {
    flexDirection: "column",
  },
  username: {
    fontSize: 11.71875,
    color: "#784200",
    fontWeight: "bold",
  },
  gradeText: {
    fontSize: 8.2,
    color: "rgba(120, 66, 0, 0.85)",
    fontWeight: "bold",
  },
  levelBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8.2,
    paddingRight: 4.8,
    marginLeft: 6.640625,
    position: "relative",
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
    position: "absolute",
    left: 0,
    bottom: 0,
  },
  rankText: {
    fontSize: 7.42,
    color: "#F38A00",
    fontWeight: "bold",
    marginLeft: 4.8,
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  progressBar: {
    width: 75.78125,
    height: 4.296875,
    backgroundColor: "#f5cb34",
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
  },
  progressFill: {
    position: "absolute",
    left: 0,
    top: 0,
    height: "100%",
    shadowColor: "#fab235",
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 2.8,
  },
  progressTextContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 6.4,
  },
  progressValue: {
    fontSize: 9.375,
    color: "#D08F04",
    fontWeight: "bold",
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
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 30.078125,
    shadowColor: "#ffffff",
    shadowOffset: { width: 0.3125, height: 0.3125 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
  },
  studyDaysContent: {
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
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
})
