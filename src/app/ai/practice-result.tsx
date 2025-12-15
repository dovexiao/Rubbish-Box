import { useEffect } from "react"
import { View, Text, TouchableOpacity, Image } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"

import { StatusBar } from "../../components/StatusBar"
import { NavBar } from "../../components/NavBar"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"

interface ResultParams {
  mode?: string
  correctCount?: string
  totalCount?: string
  results?: string
  timeUsed?: string
  questionType?: string
  questionId?: string
  practiceType?: string
}

/**
 * AI练习结果页面
 * 100%还原UniApp项目 /src/pages/AI/practice-result.vue
 */
export default function PracticeResultScreen() {
  const router = useRouter()
  const params = useLocalSearchParams() as ResultParams

  const practiceMode = params.mode || "multiple"
  const correctCount = parseInt(params.correctCount || "2")
  const totalCount = parseInt(params.totalCount || "4")
  const timeUsed = parseInt(params.timeUsed || "80")
  const practiceType = params.practiceType || "course"
  const questionId = params.questionId || ""
  const questionType = params.questionType || ""

  let answerResults: string[] = ["correct", "wrong", "correct", "wrong"]
  if (params.results) {
    try {
      answerResults = JSON.parse(params.results)
    } catch (e) {
      console.error("解析答题结果失败:", e)
    }
  }

  // 计算正确率
  const correctRate = totalCount === 0 ? 0 : Math.round((correctCount / totalCount) * 100)

  // 判断是否已订正（正确率80%以上为已订正）
  const isCorrected = correctRate >= 80

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // 查看解析
  const showAnalysis = (index: number) => {
    // 跳转到错题详情页面，显示解析
    router.push(`/ai/error-book/detail?index=${index}`)
  }

  // TODO: 调用订正API
  useEffect(() => {
    // 延迟1秒后标记订正状态
    const timer = setTimeout(() => {
      if (practiceType === "error" && questionId) {
        // TODO: 调用 qusetionCorrected API
        console.log("标记订正状态:", {
          is_corrected: correctRate >= 80,
          question_id: questionId,
          question_type: questionType,
        })
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [practiceType, questionId, questionType, correctRate])

  // 自定义返回逻辑
  const handleBack = () => {
    console.log("🔙 返回按钮点击")
    console.log("  - practiceType:", practiceType)
    console.log("  - params.practiceType:", params.practiceType)
    console.log("  - canGoBack:", router.canGoBack?.())
    
    if (practiceType === "error") {
      // 从错题本练习返回，使用 replace 回到错题本首页
      console.log("✅ 错题本练习，replace 到错题本首页")
      router.replace("/ai/error-book")
    } else {
      // 其他情况使用默认返回
      console.log("⚠️ 其他练习类型")
      if (router.canGoBack?.()) {
        router.back()
      } else {
        router.navigate("/(tabs)/study")
      }
    }
  }

  return (
    <LinearGradient
      colors={["#93ABFF", "#E4F4FF", "#ECF8FF", "#FFFFFF"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.practiceResultContainer}
    >
      <StatusBar theme="dark" />
      <NavBar title="" leftArrow onBackPress={handleBack} />

      <View style={styles.mainContent}>
        {/* 左右布局 */}
        <View style={styles.resultContent}>
          {/* 左侧奖杯图标和结果 */}
          <View style={styles.trophySection}>
            <Image
              source={require("../../../assets/images/Frame-2090060428.png")}
              style={styles.trophyImg}
              resizeMode="contain"
            />
            <Text style={styles.trophyTitle}>
              {practiceType === "error" && isCorrected
                ? "已经订正啦！"
                : practiceType === "course" && isCorrected
                  ? "知识点已掌握"
                  : "要更认真哦"}
            </Text>
            <Text style={styles.trophyScore}>答对{correctCount}题</Text>
            <Text style={styles.trophyTotal}>共{totalCount}题</Text>
          </View>

          {/* 右侧答题卡 */}
          <View style={styles.answerSheet}>
            {/* 错题报告标题 */}
            <View style={styles.resultHeader}>
              <View style={styles.headerDot} />
              <Text style={styles.resultHeaderTitle}>
                {practiceMode === "single" ? "答题结果" : "答题报告"}
              </Text>
              <View style={styles.headerDot} />
            </View>

            {/* 正确率和订正状态显示 - 仅在多题模式时显示 */}
            {practiceMode === "multiple" && (
              <View style={styles.correctionInfo}>
                <View style={styles.correctionRate}>
                  <Text style={styles.correctionLabel}>答题卡</Text>
                  <View style={styles.correctionRightInfo}>
                    <View style={styles.rateItem}>
                      <Text style={styles.rateLabel}>正确率：</Text>
                      <Text style={styles.rateValue}>{correctRate}%</Text>
                    </View>
                    <View style={[styles.timeItem, styles.timeItemMargin]}>
                      <Ionicons
                        name="time"
                        size={rpx(12)}
                        color="rgba(0, 0, 0, 0.6)"
                        style={styles.timeIcon}
                      />
                      <Text style={styles.timeText}>{formatTime(timeUsed)}</Text>
                    </View>
                  </View>
                </View>

                {isCorrected && (
                  <Image
                    source={require("../../../assets/images/is-corrected.png")}
                    style={styles.correctedBadge}
                    resizeMode="contain"
                  />
                )}

                {/* 状态说明 */}
                <View style={styles.statusLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, styles.legendDotCorrect]} />
                    <Text style={styles.legendText}>正确</Text>
                  </View>
                  <View style={[styles.legendItem, styles.legendItemMargin]}>
                    <View style={[styles.legendDot, styles.legendDotWrong]} />
                    <Text style={styles.legendText}>错误</Text>
                  </View>
                  {practiceMode === "multiple" && (
                    <View style={[styles.legendItem, styles.legendItemMargin]}>
                      <View style={[styles.legendDot, styles.legendDotUnanswered]} />
                      <Text style={styles.legendText}>未答</Text>
                    </View>
                  )}
                </View>

                {/* 答题结果圆圈 */}
                <View style={styles.answerCircles}>
                  {answerResults.map((result, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.answerCircle,
                        result === "correct" && styles.answerCircleCorrect,
                        result === "wrong" && styles.answerCircleWrong,
                        result === "unanswered" && styles.answerCircleUnanswered,
                      ]}
                      onPress={() => showAnalysis(index)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.answerCircleText,
                          result === "correct" && styles.answerCircleTextCorrect,
                          result === "wrong" && styles.answerCircleTextWrong,
                          result === "unanswered" && styles.answerCircleTextUnanswered,
                        ]}
                      >
                        {index + 1}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* 操作按钮 */}
            <View style={styles.resultActions}>{/* 操作按钮区域（根据需要可添加） */}</View>
          </View>
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = createStyles({
  practiceResultContainer: {
    width: "100%",
    height: "100%",
    minWidth: 750,
    minHeight: "100%",
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 29,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  resultContent: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  // 左侧奖杯
  trophySection: {
    width: 182.8125,
    height: 264.06325,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginLeft: 40,
  },
  trophyImg: {
    width: 182.8125,
    height: 264.06325,
    marginBottom: 12,
  },
  trophyTitle: {
    fontSize: 14.0625,
    color: "#8F5600",
    textAlign: "center",
    position: "absolute",
    top: 152.9,
    fontWeight: "bold",
  },
  trophyScore: {
    fontSize: 10.9375,
    color: "#B06D07",
    textAlign: "center",
    position: "absolute",
    top: 183,
    fontWeight: "bold",
  },
  trophyTotal: {
    fontSize: 8.6,
    color: "#B06D07",
    textAlign: "center",
    position: "absolute",
    top: 196,
  },
  // 右侧答题卡
  answerSheet: {
    width: 378.125,
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    shadowColor: "#4173FD",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 9.375,
    elevation: 3,
    backgroundColor: "#EFF7FF",
    borderRadius: 11.8175,
  },
  // 标题
  resultHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 14.84375,
  },
  headerDot: {
    backgroundColor: "#6BB2FF",
    width: 6.4,
    height: 6.4,
    borderRadius: 3.2,
  },
  resultHeaderTitle: {
    fontSize: 14.84375,
    color: "#0E65E7",
    fontWeight: "bold",
    marginHorizontal: 9.375,
  },
  // 答题信息
  correctionInfo: {
    backgroundColor: "#FAFCFF",
    borderRadius: 8,
    paddingHorizontal: 15.6,
    paddingVertical: 12,
    width: 320.3125,
    marginTop: 4.8,
    position: "relative",
  },
  correctionRate: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  correctionLabel: {
    fontSize: 11.8175,
    color: "rgba(0, 0, 0, 0.6)",
    fontWeight: "bold",
  },
  correctionRightInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  rateItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  rateLabel: {
    fontSize: 11.8175,
    color: "rgba(0, 0, 0, 0.6)",
  },
  rateValue: {
    fontSize: 11.8175,
    color: "rgba(0, 0, 0, 0.6)",
    fontWeight: "bold",
  },
  timeItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeItemMargin: {
    marginLeft: 10.9375,
  },
  timeIcon: {
    marginRight: 4,
  },
  timeText: {
    fontSize: 11.8175,
    color: "rgba(0, 0, 0, 0.6)",
  },
  correctedBadge: {
    width: 104,
    height: 104,
    position: "absolute",
    right: 0,
    bottom: 39,
  },
  // 状态图例
  statusLegend: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  legendItemMargin: {
    marginLeft: 20,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
    flexShrink: 0,
  },
  legendDotCorrect: {
    backgroundColor: "#36D516",
  },
  legendDotWrong: {
    backgroundColor: "#FF2626",
  },
  legendDotUnanswered: {
    backgroundColor: "#FF7300",
  },
  legendText: {
    fontSize: 8.6,
    color: "#333",
  },
  // 答题结果圆圈
  answerCircles: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 20,
  },
  answerCircle: {
    width: 34.375,
    height: 34.375,
    borderRadius: 17.1875,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    marginBottom: 8,
  },
  answerCircleCorrect: {
    backgroundColor: "#D0FFC4",
  },
  answerCircleWrong: {
    backgroundColor: "#FFD9D9",
  },
  answerCircleUnanswered: {
    backgroundColor: "#FFE6B3",
  },
  answerCircleText: {
    fontSize: 14,
  },
  answerCircleTextCorrect: {
    color: "#36D516",
  },
  answerCircleTextWrong: {
    color: "#FF2626",
  },
  answerCircleTextUnanswered: {
    color: "#FF7300",
  },
  // 操作按钮
  resultActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14.0625,
  },
})
