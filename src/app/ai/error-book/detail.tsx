import { useState, useEffect } from "react"
import { View, Text, ScrollView } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { StatusBar } from "../../../components/StatusBar"
import { NavBar } from "../../../components/NavBar"
import { createStyles } from "../../../utils/rpxStyleSheet"
import { parseContent } from "../../../utils/mathmlParser"
import type { WrongQuestion } from "../../../services/ai"

/**
 * 错题详情页面
 * 100%还原UniApp项目 /src/pages/AI/error-question-detail.vue
 */
export default function ErrorDetailScreen() {
  const _router = useRouter()
  const params = useLocalSearchParams()

  const [showAnalysisSection] = useState(true)
  const [practiveList, setPractiveList] = useState<WrongQuestion[]>([])
  const [practiveListIndex, setPractiveListIndex] = useState(0)

  const currentQuestion = practiveList[practiveListIndex]

  // 加载题目详情
  useEffect(() => {
    const loadQuestionDetail = async () => {
      if (params.index) {
        setPractiveListIndex(Number(params.index))
      }

      try {
        // 从AsyncStorage获取练习题列表
        const storedData = await AsyncStorage.getItem("practiveList")
        if (storedData) {
          const list = JSON.parse(storedData)
          setPractiveList(list)
        }
      } catch (error) {
        console.error("加载题目详情失败:", error)
      }
    }

    loadQuestionDetail()
  }, [params.index])

  if (!currentQuestion) {
    return (
      <LinearGradient
        colors={["#93ABFF", "#E4F4FF", "#ECF8FF", "#FFFFFF"]}
        locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.errorDetailContainer}
      >
        <StatusBar theme="dark" />
        <NavBar title="查看解析" leftArrow />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>加载中...</Text>
        </View>
      </LinearGradient>
    )
  }

  const getOptionLabel = (index: number) => ["A", "B", "C", "D"][index]

  return (
    <LinearGradient
      colors={["#93ABFF", "#E4F4FF", "#ECF8FF", "#FFFFFF"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.errorDetailContainer}
    >
      <StatusBar theme="dark" />
      <NavBar title="查看解析" leftArrow />

      <ScrollView style={styles.mainContent} showsVerticalScrollIndicator={false}>
        {/* 题目卡片 */}
        <View style={styles.questionCard}>
          {/* 题目内容 */}
          <View style={styles.questionContent}>
            <Text style={styles.questionType}>选择题</Text>
            <Text style={styles.questionText}>
              {parseContent(currentQuestion.question_text || "")}
            </Text>
          </View>

          {/* 选项列表 */}
          <View style={styles.optionsList}>
            {currentQuestion.options &&
              currentQuestion.options.map((option, index) => {
                const isCorrect = index.toString() === currentQuestion.correct_answer
                const isStudentAnswer = index.toString() === currentQuestion.student_answer
                const isWrong = isStudentAnswer && !isCorrect

                return (
                  <View key={index} style={styles.optionRow}>
                    <View
                      style={[
                        styles.optionLabel,
                        isCorrect && styles.optionLabelCorrect,
                        isWrong && styles.optionLabelWrong,
                        !isCorrect && !isWrong && styles.optionLabelNeutral,
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionLabelText,
                          (isCorrect || isWrong) && styles.optionLabelTextActive,
                        ]}
                      >
                        {getOptionLabel(index)}
                      </Text>
                    </View>
                    <Text style={styles.optionTextWrapper}>
                      {parseContent(typeof option === 'string' ? option : option.text || "")}
                    </Text>
                  </View>
                )
              })}
          </View>

          {/* 答题状态图例 */}
          <View style={styles.answerStatus}>
            <View style={styles.statusLegend}>
              <View style={[styles.statusDot, styles.statusDotCorrect]} />
              <Text style={styles.statusText}>正确</Text>
              <View style={[styles.statusDot, styles.statusDotWrong, styles.statusDotMargin]} />
              <Text style={styles.statusText}>错误</Text>
              <View style={[styles.statusDot, styles.statusDotNeutral, styles.statusDotMargin]} />
              <Text style={styles.statusText}>未答</Text>
            </View>
          </View>
        </View>

        {/* 解析部分 */}
        {showAnalysisSection && (
          <View style={styles.analysisCard}>
            {/* 答案部分 */}
            <View style={styles.answerSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.headerIcon} />
                <Text style={styles.sectionTitle}>答案</Text>
              </View>
              <View style={styles.answerContent}>
                <Text style={styles.answerText}>
                  {getOptionLabel(Number(currentQuestion.correct_answer))}.{" "}
                  {parseContent(
                    typeof currentQuestion.options[Number(currentQuestion.correct_answer)] === 'string'
                      ? currentQuestion.options[Number(currentQuestion.correct_answer)]
                      : currentQuestion.options[Number(currentQuestion.correct_answer)]?.text || ""
                  )}
                </Text>
              </View>
            </View>

            {/* 解析部分 */}
            <View style={styles.analysisSection}>
              <View style={styles.sectionHeader}>
                <View style={styles.headerIcon} />
                <Text style={styles.sectionTitle}>解析</Text>
              </View>
              <View style={styles.analysisContentWrapper}>
                <Text style={styles.analysisText}>
                  {parseContent(currentQuestion.explanation || "")}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  )
}

const styles = createStyles({
  errorDetailContainer: {
    width: "100%",
    height: "100%",
    minWidth: 750,
    minHeight: "100%",
  },
  mainContent: {
    flex: 1,
    paddingTop: 15,
    paddingBottom: 60,
    paddingHorizontal: 29,
    height: "100%",
  },
  // 题目卡片
  questionCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15.625,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3.90625 },
    shadowOpacity: 0.05,
    shadowRadius: 7.8125,
    elevation: 2,
  },
  questionContent: {
    marginBottom: 15,
  },
  questionType: {
    fontSize: 9.375,
    color: "#333",
    fontWeight: "bold",
    marginBottom: 8,
  },
  questionText: {
    fontSize: 9.375,
    color: "#333",
    lineHeight: 16.875,
  },
  // 选项列表
  optionsList: {
    marginBottom: 15,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  optionLabel: {
    width: 24,
    height: 24,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  optionLabelCorrect: {
    backgroundColor: "#4CAF50",
  },
  optionLabelWrong: {
    backgroundColor: "#F44336",
  },
  optionLabelNeutral: {
    backgroundColor: "#F5F5F5",
  },
  optionLabelText: {
    fontSize: 8.6,
    color: "#666",
  },
  optionLabelTextActive: {
    color: "#fff",
  },
  optionTextWrapper: {
    flex: 1,
    fontSize: 8.6,
    color: "#333",
    lineHeight: 15.48,
  },
  // 答题状态图例
  answerStatus: {
    marginTop: 6,
  },
  statusLegend: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusDotCorrect: {
    backgroundColor: "#4CAF50",
  },
  statusDotWrong: {
    backgroundColor: "#F44336",
  },
  statusDotNeutral: {
    backgroundColor: "#999",
  },
  statusDotMargin: {
    marginLeft: 15,
  },
  statusText: {
    fontSize: 8.6,
    color: "#333",
  },
  // 解析卡片
  analysisCard: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15.625,
    padding: 15,
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3.90625 },
    shadowOpacity: 0.05,
    shadowRadius: 7.8125,
    elevation: 2,
  },
  // 答案部分
  answerSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  headerIcon: {
    width: 4,
    height: 15,
    backgroundColor: "#4891FF",
    borderRadius: 2,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 10,
    color: "#333",
    fontWeight: "bold",
  },
  answerContent: {
    flexDirection: "row",
    backgroundColor: "#F0F8FF",
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: "#4891FF",
  },
  answerText: {
    fontSize: 9.375,
    color: "#333",
  },
  // 解析部分
  analysisSection: {
    marginTop: 0,
  },
  analysisContentWrapper: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 15,
  },
  analysisText: {
    fontSize: 9.375,
    color: "#333",
    lineHeight: 16.875,
  },
  // 空状态
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 12.5,
    color: "#999",
  },
})
