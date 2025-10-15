import { useState } from "react"
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from "react-native"
import { useRouter } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"

import { StatusBar } from "../../../components/StatusBar"
import { NavBar } from "../../../components/NavBar"
import { createStyles, rpx } from "../../../utils/rpxStyleSheet"

/**
 * 错题练习结果页面
 * 100%还原UniApp项目 /src/pages/AI/error-result.vue
 */
export default function ErrorResultScreen() {
  const router = useRouter()

  // 答题结果数据（实际应从上一页传入）
  const [answerResults] = useState(["correct", "wrong", "correct", "wrong"])
  const correctCount = answerResults.filter((r) => r === "correct").length
  const totalCount = answerResults.length

  // 查看解析
  const showAnalysis = () => {
    Alert.alert("提示", "查看解析功能开发中")
  }

  // 举一反三
  const practiceAgain = () => {
    Alert.alert("提示", "举一反三功能开发中")
  }

  return (
    <LinearGradient
      colors={["#93ABFF", "#E4F4FF", "#ECF8FF", "#FFFFFF"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.errorResultContainer}
    >
      <StatusBar theme="dark" />
      <NavBar title="" leftArrow />

      <View style={styles.mainContent}>
        {/* 结果卡片 */}
        <View style={styles.resultCard}>
          {/* 标题 */}
          <Text style={styles.resultTitle}>错题报告</Text>

          {/* 时间显示 */}
          <View style={styles.timeDisplay}>
            <Ionicons name="time" size={rpx(15)} color="#999" style={styles.timeIcon} />
            <Text style={styles.timeText}>01:20</Text>
          </View>

          {/* 奖杯和成绩 */}
          <View style={styles.trophySection}>
            <Image
              source={require("../../../../assets/images/trophy-3d.png")}
              style={styles.trophyImg}
              resizeMode="contain"
            />
            <Text style={styles.scoreText}>答对{correctCount}题</Text>
            <Text style={styles.totalText}>共{totalCount}题</Text>
          </View>

          {/* 答题卡 */}
          <View style={styles.answerSheetSection}>
            <Text style={styles.sheetTitle}>答题卡</Text>

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
              <View style={[styles.legendItem, styles.legendItemMargin]}>
                <View style={[styles.legendDot, styles.legendDotUnanswered]} />
                <Text style={styles.legendText}>未答</Text>
              </View>
            </View>

            {/* 答题结果圆圈 */}
            <View style={styles.answerCircles}>
              {answerResults.map((result, index) => (
                <View
                  key={index}
                  style={[
                    styles.answerCircle,
                    result === "correct" && styles.answerCircleCorrect,
                    result === "wrong" && styles.answerCircleWrong,
                    result === "unanswered" && styles.answerCircleUnanswered,
                    index < answerResults.length - 1 && styles.answerCircleMargin,
                  ]}
                >
                  <Text style={styles.answerCircleText}>{index + 1}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* 操作按钮 */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnMargin]}
              onPress={showAnalysis}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>查看解析</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={practiceAgain} activeOpacity={0.8}>
              <Text style={styles.actionBtnText}>举一反三</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = createStyles({
  errorResultContainer: {
    width: "100%",
    height: "100%",
    minWidth: 750,
    minHeight: "100%",
  },
  mainContent: {
    flex: 1,
    paddingTop: 50,
    paddingBottom: 60,
    paddingHorizontal: 29,
    height: "100%",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  resultCard: {
    width: "100%",
    maxWidth: 500,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15.625,
    padding: 20,
    textAlign: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3.90625 },
    shadowOpacity: 0.05,
    shadowRadius: 7.8125,
    elevation: 2,
  },
  resultTitle: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  // 时间显示
  timeDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  timeIcon: {
    marginRight: 6,
  },
  timeText: {
    fontSize: 9.375,
    color: "#999",
  },
  // 奖杯和成绩
  trophySection: {
    alignItems: "center",
    marginBottom: 30,
  },
  trophyImg: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "center",
  },
  totalText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  // 答题卡
  answerSheetSection: {
    marginBottom: 30,
  },
  sheetTitle: {
    fontSize: 10,
    color: "#333",
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  // 状态图例
  statusLegend: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
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
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
    flexShrink: 0,
  },
  legendDotCorrect: {
    backgroundColor: "#4CAF50",
  },
  legendDotWrong: {
    backgroundColor: "#F44336",
  },
  legendDotUnanswered: {
    backgroundColor: "#999",
  },
  legendText: {
    fontSize: 8.6,
    color: "#333",
  },
  // 答题结果圆圈
  answerCircles: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  answerCircle: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  answerCircleCorrect: {
    backgroundColor: "#4CAF50",
  },
  answerCircleWrong: {
    backgroundColor: "#F44336",
  },
  answerCircleUnanswered: {
    backgroundColor: "#999",
  },
  answerCircleMargin: {
    marginRight: 12,
  },
  answerCircleText: {
    fontSize: 10,
    color: "#fff",
    textAlign: "center",
  },
  // 操作按钮
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtn: {
    backgroundColor: "#E5E5E5",
    borderRadius: 15.625,
    paddingHorizontal: 25,
    paddingVertical: 10,
  },
  actionBtnMargin: {
    marginRight: 20,
  },
  actionBtnText: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
  },
})
