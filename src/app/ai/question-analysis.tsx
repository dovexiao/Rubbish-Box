import { useState, useEffect, useCallback } from "react"
import { View, Text, ScrollView, TouchableOpacity } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"

import { StatusBar } from "../../components/StatusBar"
import { NavBar } from "../../components/NavBar"
import { createStyles } from "../../utils/rpxStyleSheet"
import { parseContent } from "../../utils/mathmlParser"
import { getQuestionDetails } from "../../services/ai"

/**
 * 题目解析页面
 * 100%还原UniApp项目 /src/pages/AI/question-analysis.vue
 */
export default function QuestionAnalysisScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()

  const questionId = params.questionId as string
  const questionType = params.questionType as string

  const [questionDetail, setQuestionDetail] = useState<any>(null)

  // 加载题目详情
  useEffect(() => {
    if (questionId && questionType) {
      getQuestionDetails({
        question_id: questionId,
        question_type: questionType,
      })
        .then((res) => {
          setQuestionDetail(res)
        })
        .catch((error) => {
          console.error("获取题目详情失败:", error)
        })
    }
  }, [questionId, questionType])

  // 举一反三
  const practiceAgain = useCallback(() => {
    if (!questionDetail) return
    router.push(
      `/ai/error-book/practice?mode=multiple&type=error&questionId=${questionDetail.id}&from=errorbook&questionType=${questionDetail.question_type}`,
    )
  }, [questionDetail, router])

  const getOptionLabel = (index: number) => ["A", "B", "C", "D"][index]

  if (!questionDetail) {
    return (
      <LinearGradient
        colors={["#93ABFF", "#E4F4FF", "#ECF8FF", "#FFFFFF"]}
        locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.questionAnalysisContainer}
      >
        <StatusBar theme="dark" />
        <NavBar title="查看解析" leftArrow />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </LinearGradient>
    )
  }

  return (
    <LinearGradient
      colors={["#93ABFF", "#E4F4FF", "#ECF8FF", "#FFFFFF"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.questionAnalysisContainer}
    >
      <StatusBar theme="dark" />
      <NavBar title="查看解析" leftArrow />

      <View style={styles.mainContent}>
        <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
          {/* 题目内容 */}
          <View style={styles.questionContent}>
            <Text style={styles.questionText}>
              {parseContent(questionDetail.question_text || "")}
            </Text>
          </View>

          {/* 选项列表 */}
          <View style={styles.optionsSection}>
            <View style={styles.optionsGrid}>
              {questionDetail.options &&
                questionDetail.options.map((option: any, index: number) => {
                  const isCorrect = index === questionDetail.correctAnswer
                  const isWrong =
                    index === questionDetail.userAnswer && index !== questionDetail.correctAnswer
                  const isNormal =
                    index !== questionDetail.correctAnswer && index !== questionDetail.userAnswer

                  return (
                    <View
                      key={index}
                      style={[
                        styles.optionCard,
                        isCorrect && styles.optionCorrect,
                        isWrong && styles.optionWrong,
                        isNormal && styles.optionNormal,
                      ]}
                    >
                      <View
                        style={[
                          styles.optionLabel,
                          isCorrect && styles.optionLabelCorrect,
                          isWrong && styles.optionLabelWrong,
                          isNormal && styles.optionLabelNormal,
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
                        {parseContent(option.text || "")}
                      </Text>
                    </View>
                  )
                })}
            </View>
          </View>

          {/* 答案部分 */}
          <View style={styles.answerSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.headerIcon} />
              <Text style={styles.sectionTitle}>答案</Text>
            </View>
            <View style={styles.answerContent}>
              <Text style={styles.answerText}>
                {questionDetail.options[questionDetail.correct_answer]?.letter}.{" "}
                {parseContent(questionDetail.options[questionDetail.correct_answer]?.text || "")}
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
                {parseContent(questionDetail.explanation || "")}
              </Text>
            </View>
          </View>

          {/* 操作按钮 */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionBtn} onPress={practiceAgain} activeOpacity={0.8}>
              <Text style={styles.actionBtnText}>举一反三</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </LinearGradient>
  )
}

const styles = createStyles({
  questionAnalysisContainer: {
    width: "100%",
    height: "100%",
    minWidth: 750,
    minHeight: "100%",
  },
  mainContent: {
    flex: 1,
    marginHorizontal: 29,
    borderRadius: 8.6,
    paddingHorizontal: 28,
    paddingVertical: 39,
    marginTop: 8,
    backgroundColor: "#fff",
    height: "100%",
  },
  contentScroll: {
    height: "100%",
  },
  // 题目内容
  questionContent: {
    marginBottom: 15,
  },
  questionText: {
    fontSize: 9.375,
    color: "#000",
    lineHeight: 16.875,
  },
  // 选项区域
  optionsSection: {
    marginBottom: 30,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  optionCard: {
    borderRadius: 15.625,
    padding: 15,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    minHeight: 60,
    shadowColor: "#85AFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 6.4,
    elevation: 2,
  },
  optionCorrect: {
    backgroundColor: "#D6FFCD",
    borderWidth: 2,
    borderColor: "#34E13F",
  },
  optionWrong: {
    backgroundColor: "#FFE1E1",
    borderWidth: 2,
    borderColor: "#FF4242",
  },
  optionNormal: {
    backgroundColor: "#EEF9FF",
  },
  optionLabel: {
    width: 30,
    height: 30,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  optionLabelCorrect: {
    backgroundColor: "#4CAF50",
  },
  optionLabelWrong: {
    backgroundColor: "#F44336",
  },
  optionLabelNormal: {
    backgroundColor: "#F5F5F5",
  },
  optionLabelText: {
    fontSize: 9.375,
    color: "#666",
  },
  optionLabelTextActive: {
    color: "#fff",
  },
  optionTextWrapper: {
    flex: 1,
    fontSize: 9.375,
    color: "#333",
    lineHeight: 16.875,
  },
  // 答案部分
  answerSection: {
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  headerIcon: {
    width: 4,
    height: 15,
    backgroundColor: "#4CA9FF",
    borderRadius: 2,
    marginRight: 8,
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: 10,
    color: "#333",
    fontWeight: "bold",
  },
  answerContent: {
    flexDirection: "row",
    padding: 12,
    backgroundColor: "rgba(72, 145, 255, 0.05)",
    borderLeftWidth: 3,
    borderLeftColor: "#4891FF",
    borderRadius: 4,
  },
  answerText: {
    fontSize: 9.375,
    color: "#333",
  },
  // 解析部分
  analysisSection: {
    marginBottom: 15,
  },
  analysisContentWrapper: {
    padding: 15,
    backgroundColor: "#EEF9FF",
    borderRadius: 8,
    minHeight: 120,
  },
  analysisText: {
    fontSize: 9.375,
    color: "#333",
    lineHeight: 16.875,
  },
  // 操作按钮
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
 
  },
  actionBtn: {
    backgroundColor: "#4891FF",
    borderRadius: 15.625,
    paddingHorizontal: 25,
    paddingVertical: 10,
  },
  actionBtnText: {
    fontSize: 10,
    color: "#fff",
    textAlign: "center",
  },
  // 加载状态
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 12.5,
    color: "#999",
  },
})
