import { useState, useEffect, useCallback } from "react"
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image } from "react-native"
import { useRouter, useFocusEffect } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import Svg, { Circle, Text as SvgText } from "react-native-svg"

import { StatusBar } from "../../../components/StatusBar"
import { NavBar } from "../../../components/NavBar"
import { createStyles, rpx } from "../../../utils/rpxStyleSheet"
import { getCorrectionRecordResponse, type CorrectionRecordItem } from "../../../services/ai"
import { useActivityTracking } from "../../../hooks/useActivityTracking"

/**
 * 错题本首页
 * 100%还原UniApp项目 /src/pages/AI/error-book.vue
 * 包含左侧科目列表+右侧错题本信息+Canvas圆形进度条
 */
export default function ErrorBookScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [subjectList, setSubjectList] = useState<CorrectionRecordItem[]>([])
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState(0)
  const [selectedSubject, setSelectedSubject] = useState<CorrectionRecordItem | null>(null)
  
  // 活动追踪 - 追踪错题本使用
  const { startErrorBook, endErrorBook } = useActivityTracking({
    autoExitOnUnmount: true,
  })

  // 获取错题本数据
  const fetchCorrectionRecord = useCallback(async () => {
    try {
      setLoading(true)
      const res = await getCorrectionRecordResponse()
      if (res && res.data && res.data.length > 0) {
        setSubjectList(res.data)
        setSelectedSubject(res.data[0])
        
        // 📊 启动错题本追踪
        console.log("📊 [活动追踪] 进入错题本")
        startErrorBook({
          subject: res.data[0].subject,
        })
      }
    } catch (error) {
      console.error("获取错题本数据失败:", error)
    } finally {
      setLoading(false)
    }
  }, [startErrorBook])

  useEffect(() => {
    fetchCorrectionRecord()
  }, [fetchCorrectionRecord])

  // 选择科目
  const selectSubject = useCallback((subject: CorrectionRecordItem, index: number) => {
    setSelectedSubject(subject)
    setSelectedSubjectIndex(index)
  }, [])

  // 打开相机
  const openCamera = useCallback(() => {
    router.push("/ai/error-book/camera")
  }, [router])

  // 根据类型查看错题
  const viewErrorsByType = useCallback(
    (type: string) => {
      if (!selectedSubject) return
      const url = `/ai/error-book/questions?subject=${selectedSubject.subject}&type=${type}`
      router.push(url)
    },
    [selectedSubject, router],
  )

  // 计算进度百分比
  const getProgressPercentage = useCallback(() => {
    if (!selectedSubject || selectedSubject.incorrect_count_this_week === 0) return 0
    return (
      (selectedSubject.corrected_count_this_week / selectedSubject.incorrect_count_this_week) * 100
    )
  }, [selectedSubject])

  // 渲染圆形进度条（使用react-native-svg替代Canvas）
  const renderProgressCircle = () => {
    if (!selectedSubject) return null

    const size = rpx(106)
    const strokeWidth = rpx(9)
    const radius = rpx(39)
    const center = size / 2
    const circumference = 2 * Math.PI * radius
    const progress = getProgressPercentage()
    const strokeDashoffset = circumference - (circumference * progress) / 100
    const uncorrectedCount =
      selectedSubject.incorrect_count_this_week - selectedSubject.corrected_count_this_week

    return (
      <Svg width={size} height={size} style={styles.progressCanvas}>
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
          fontSize={rpx(12)}
          fill="#1571FC"
          textAnchor="middle"
          alignmentBaseline="middle"
          fontWeight="bold"
        >
          {uncorrectedCount}
        </SvgText>
        {/* 中心文字 - "未订正" */}
        <SvgText
          x={center}
          y={center + 24}
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

  if (loading) {
    return (
      <LinearGradient
        colors={["#93ABFF", "#E4F4FF", "#CDEDFF", "#FFFFFF"]}
        locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.errorBookContainer}
      >
        <StatusBar theme="dark" />
        <NavBar title="错题本" leftArrow onBackPress={() => router.navigate("/(tabs)/study")} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1571FC" />
          <Text style={styles.loadingText}>正在加载错本...</Text>
        </View>
      </LinearGradient>
    )
  }

  if (!subjectList || subjectList.length === 0) {
    return (
      <LinearGradient
        colors={["#93ABFF", "#E4F4FF", "#CDEDFF", "#FFFFFF"]}
        locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.errorBookContainer}
      >
        <StatusBar theme="dark" />
        <NavBar title="错题本" leftArrow onBackPress={() => router.navigate("/(tabs)/study")} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>暂无内容</Text>
        </View>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient
      colors={["#93ABFF", "#E4F4FF", "#CDEDFF", "#FFFFFF"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.errorBookContainer}
    >
      <StatusBar theme="dark" />
      <NavBar title="错题本" leftArrow onBackPress={() => router.navigate("/(tabs)/study")} />

      <View style={styles.mainContent}>
        {/* 左右布局容器 */}
        <View style={styles.contentWrapper}>
          {/* 左侧科目列表 */}
          <ScrollView style={styles.subjectList} showsVerticalScrollIndicator={false}>
            {subjectList.map((subject, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.subjectItem, selectedSubjectIndex === index && styles.subjectActive]}
                onPress={() => selectSubject(subject, index)}
                activeOpacity={0.8}
              >
                <View style={styles.subjectInfo}>
                  <Text
                    style={[
                      styles.subjectName,
                      selectedSubjectIndex === index && styles.subjectNameActive,
                    ]}
                  >
                    {subject.subject}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.subjectCount,
                    selectedSubjectIndex === index && styles.subjectCountActive,
                  ]}
                >
                  {subject.incorrect_count}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 右侧我的错题本 */}
          <View style={styles.errorBookSection}>
            {/* 上半部分：我的错题本 */}
            <View style={styles.topSection}>
              <View style={styles.errorBookCard}>
                {/* 头部标题 */}
                <View style={styles.bookHeader}>
                  <Text style={styles.bookHeaderTitle}>我的错题本</Text>
                </View>

                {/* 统计信息 */}
                <View style={styles.statsSection}>
                  <View style={styles.statsRow}>
                    <TouchableOpacity
                      style={styles.statItemWrapper}
                      onPress={() => viewErrorsByType("all")}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.statLabel}>全部错题</Text>
                      <View style={styles.statValueRow}>
                        <Text style={styles.statValue}>
                          {(selectedSubject && selectedSubject.incorrect_count) || 0}
                        </Text>
                        <Text style={styles.statUnit}>道</Text>
                      </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.statItemWrapper, styles.statItemRight]}
                      onPress={() => viewErrorsByType("corrected")}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.statLabel}>已订正</Text>
                      <View style={styles.statValueRow}>
                        <Text style={styles.statValue}>
                          {(selectedSubject && selectedSubject.corrected_count) || 0}
                        </Text>
                        <Text style={styles.statUnit}>道</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* 拍照录入按钮 */}
              <TouchableOpacity
                style={styles.cameraButton}
                onPress={openCamera}
                activeOpacity={0.8}
              >
                <Image
                  source={require("../../../../assets/images/import-error-question.png")}
                  style={styles.cameraIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            </View>

            {/* 下半部分：本周复习建议 */}
            <View style={styles.bottomSection}>
              <Text style={styles.sectionTitle}>本周复习建议</Text>
              <Image
                source={require("../../../../assets/images/ai-error-book-week.png")}
                style={styles.weekDecoration}
                resizeMode="contain"
              />

              <View style={styles.suggestionContent}>
                {/* 左侧：订正本周错题 */}
                <View style={styles.suggestionLeft}>
                  <View style={styles.suggestionHeader}>
                    <Text style={styles.suggestionTitleBold}>订正本周错题</Text>
                    <Text style={styles.suggestionSubtitle}>及时订正消灭错题</Text>
                  </View>

                  {/* 圆形进度条 */}
                  <View style={styles.progressSection}>
                    <View style={styles.progressCircle}>{renderProgressCircle()}</View>

                    <View style={styles.progressStats}>
                      <View style={styles.progressStatRow}>
                        <Text style={styles.progressStatLabel}>全部</Text>
                        <Text style={styles.progressStatValue}>
                          {selectedSubject && selectedSubject.incorrect_count_this_week}
                        </Text>
                      </View>
                      <View style={[styles.progressStatRow, styles.progressStatRowMargin]}>
                        <Text style={styles.progressStatLabel}>已订正</Text>
                        <Text style={styles.progressStatValue}>
                          {selectedSubject && selectedSubject.corrected_count_this_week}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* 右侧：本周高频错题 */}
                {selectedSubject && selectedSubject.top_error_questions && (
                  <View style={styles.suggestionRight}>
                    <View style={styles.suggestionHeader}>
                      <Text style={styles.suggestionTitleBold}>本周高频错题</Text>
                      <Text style={styles.suggestionSubtitle}>及时订正消灭错题</Text>
                    </View>

                    {/* 错题预览 */}
                    <View style={styles.errorPreview}>
                      {selectedSubject.top_error_questions.slice(0, 3).map((error, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.errorItem}
                          onPress={() => viewErrorsByType("selectTime")}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.errorItemText} numberOfLines={1} ellipsizeMode="tail">
                            {error.question_text.replace(/<[^>]*>/g, "")}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = createStyles({
  errorBookContainer: {
    width: "100%",
    height: "100%",
    minWidth: 750,
    minHeight: "100%",
  },
  mainContent: {
    flex: 1,
    paddingTop: 15,
    paddingHorizontal: 29,
    height: "100%",
    overflow: "hidden",
  },
  contentWrapper: {
    height: "100%",
    flexDirection: "row",
    gap: 15, // 15rpx gap between left and right
  },
  // 左侧科目列表
  subjectList: {
    width: 156.25, // 156.25rpx from UniApp - 直接写数字，让createStyles自动转换
    minWidth: 156.25, // 最小宽度
    maxWidth: 156.25, // 最大宽度，强制限制
    height: "100%",
    flexShrink: 0,
    flexGrow: 0, // 防止被拉伸
    flexBasis: 156.25, // 设置基础宽度
    backgroundColor: "transparent", // 透明背景，让渐变透过来
    overflow: "hidden",
  },
  subjectItem: {
    height: 50.78125,
    paddingHorizontal: 9.375,
    marginBottom: 7.8125,
    marginHorizontal: 7.8125, // 左右间距
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    backgroundColor: "transparent", // 透明背景，让渐变透过来
  },
  subjectActive: {
    // Note: Use LinearGradient component for gradient background
    // linear-gradient(93.11deg, rgba(108, 176, 255, 0.84) -7.17%, rgba(3, 121, 255, 0.84) 131.71%)
    backgroundColor: "rgba(108, 176, 255, 0.84)",
    borderWidth: 1.2,
    borderColor: "rgba(255, 255, 255, 0.54)",
    borderRadius: 8.59375,
    shadowColor: "#0073D8",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.54,
    shadowRadius: 6,
    elevation: 3,
  },
  subjectInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  subjectName: {
    fontSize: 14.0625,
    color: "rgba(51, 60, 103, 0.8)",
    fontWeight: "bold",
  },
  subjectNameActive: {
    color: "#fff",
  },
  subjectCount: {
    fontSize: 14.0625,
    color: "rgba(51, 60, 103, 0.8)",
    fontWeight: "bold",
  },
  subjectCountActive: {
    color: "#fff",
  },
  // 右侧错题本区域
  errorBookSection: {
    flex: 1,
    height: "100%",
    flexDirection: "column",
  },
  // 上半部分
  topSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    flexShrink: 0,
  },
  errorBookCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 8.56375,
    width: 376.5625,
    overflow: "hidden",
    shadowColor: "#91CDFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8.4,
    elevation: 3,
  },
  bookHeader: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    paddingVertical: 8,
    paddingLeft: 13.3,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bookHeaderTitle: {
    fontSize: 13.28125,
    color: "#164EBD",
    fontWeight: "bold",
  },
  statsSection: {
    paddingLeft: 20,
    paddingVertical: 16.4,
    paddingRight: 40,
    backgroundColor: "#F3FAFF",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statItemWrapper: {
    flexDirection: "column",
  },
  statItemRight: {
    marginLeft: 132.8125,
  },
  statLabel: {
    fontSize: 11.71875,
    color: "#333C67",
  },
  statValueRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statValue: {
    fontSize: 15.625,
    color: "#333C67",
    fontWeight: "bold",
  },
  statUnit: {
    fontSize: 11.71875,
    color: "rgba(51, 60, 103, 0.5)",
    marginLeft: 2,
  },
  cameraButton: {
    marginLeft: 12,
  },
  cameraIcon: {
    width: 126.5625,
    height: undefined,
    aspectRatio: 1,
  },
  // 下半部分
  bottomSection: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 8.56375,
    paddingHorizontal: 21.8,
    position: "relative",
    shadowColor: "#91CDFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8.4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 13.28125,
    color: "#164EBD",
    fontWeight: "bold",
    paddingVertical: 10,
  },
  weekDecoration: {
    width: 96.09,
    position: "absolute",
    right: 8.6,
    top: 0,
  },
  suggestionContent: {
    flex: 1,
    flexDirection: "row",
    marginTop: 8,
  },
  suggestionLeft: {
    flex: 1,
    marginRight: 15,
    flexDirection: "column",
  },
  suggestionRight: {
    flex: 1,
    flexDirection: "column",
    maxWidth: "100%", // 限制最大宽度
    overflow: "hidden", // 隐藏超出部分
  },
  suggestionHeader: {
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  suggestionTitleBold: {
    fontSize: 10.156,
    color: "rgba(51, 60, 103, 0.9)",
    fontWeight: "bold",
    marginRight: 4,
  },
  suggestionSubtitle: {
    fontSize: 8.6,
    color: "rgba(51, 60, 103, 0.6)",
  },
  // 进度条
  progressSection: {
    backgroundColor: "#fff",
    width: 218.125,
    height: 106.25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 12.5,
    borderRadius: 7.82,
    marginBottom: 12, // 与下方间距
  },
  progressCircle: {
    // position: "relative",
    // width: rpx(106),
    // height: rpx(106),
  },
  progressCanvas: {
    position: "relative",
    width: rpx(106),
    height: rpx(106),
  },
  progressStats: {
    textAlign: "left",
  },
  progressStatRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: 54,
  },
  progressStatRowMargin: {
    marginTop: 8,
  },
  progressStatLabel: {
    fontSize: 8.6,
    color: "#6F6F6F",
  },
  progressStatValue: {
    fontSize: 8.6,
    color: "#333C67",
  },
  // 错题预览
  errorPreview: {
    backgroundColor: "#fff",
    width: 273.4375,
    height: 106.25,
    flexDirection: "column",
    alignItems: "center",
    borderRadius: 7.82,
    padding: 10.9375,
    maxWidth: "100%", // 防止超出父容器
  },
  errorItem: {
    width: "100%",
    height: 39.0625,
    borderRadius: 7.8125,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6FBFF",
    paddingLeft: 10,
    marginBottom: 4,
  },
  errorItemText: {
    fontSize: 9.375,
    color: "#333C67",
  },
  // 加载和空状态
  loadingContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  loadingText: {
    fontSize: 12.5,
    color: "#333",
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 12.5,
    color: "#999",
  },
  // 上传提示
  uploadOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  uploadBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: rpx(20),
    padding: rpx(40),
    alignItems: "center",
    minWidth: rpx(300),
  },
  uploadText: {
    marginTop: rpx(20),
    fontSize: rpx(28),
    color: "#333",
  },
})
