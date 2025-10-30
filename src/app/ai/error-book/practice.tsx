import { useState, useEffect, useCallback, useRef } from "react"
import { View, Text, TouchableOpacity, Image } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { StatusBar } from "../../../components/StatusBar"
import { createStyles, rpx } from "../../../utils/rpxStyleSheet"
import { parseContent } from "../../../utils/mathmlParser"
import { getQuestionsMore, getCourseQuestions } from "../../../services/ai"
import { generatePracticeQuestions } from "../../../services/classroom"
import { showConfirm } from "../../../utils/dialog"

interface PracticeQuestion {
  id: number
  question_text: string
  options: string[]
  correct_answer: number
  explanation?: string
}

/**
 * AI练习模式页面
 * 100%还原UniApp项目 /src/pages/AI/practice.vue
 * 支持单题模式和多题模式，支持课程练习和错题练习
 */
export default function AIPracticeScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()

  const practiceType = (params.type as string) || "course" // course 或 error
  const practiceMode = (params.mode as string) || "multiple" // single 或 multiple
  const questionId = params.questionId as string
  const questionType = params.questionType as string
  const videoCode = params.videoCode as string
  const _from = params.from as string

  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<PracticeQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<(number | undefined)[]>([])
  const [showResult, setShowResult] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const currentQuestion = questions[currentQuestionIndex]

  // 正确数量
  const correctCount = selectedAnswers.reduce((count, answer, index) => {
    return answer === questions[index]?.correct_answer ? count + 1 : count
  }, 0)

  // 错误数量
  const wrongCount = questions.length - correctCount

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // 开始计时
  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => prev + 1)
    }, 1000)
  }, [])

  // 获取举一反三题目
  const fetchQuestionsMore = useCallback(async () => {
    if (!questionId || !questionType) return

    try {
      setLoading(true)
      const res = await getQuestionsMore({
        question_id: questionId,
        question_type: questionType,
      })
      setQuestions(res.data.questions)
      setSelectedAnswers(Array.from({ length: res.data.questions.length }, () => undefined))
      if (practiceMode === "multiple") {
        startTimer()
      }
    } catch (error) {
      console.error("获取举一反三题目失败:", error)
    } finally {
      setLoading(false)
    }
  }, [questionId, questionType, practiceMode, startTimer])

  // 获取课程练习题
  const fetchCourseQuestions = useCallback(async () => {
    if (!videoCode) return

    try {
      setLoading(true)
      const res = await getCourseQuestions({ video_code: videoCode })
      setQuestions(res.questions || [])
      setSelectedAnswers(Array.from({ length: res.questions?.length || 0 }, () => undefined))
      if (practiceMode === "multiple") {
        startTimer()
      }
    } catch (error) {
      console.error("获取课程练习题失败:", error)
    } finally {
      setLoading(false)
    }
  }, [videoCode, practiceMode, startTimer])

  // 生成练习题
  const handleGeneratePracticeQuestions = useCallback(async () => {
    if (!videoCode) return

    try {
      await generatePracticeQuestions({ video_code: videoCode })
      await fetchCourseQuestions()
    } catch (error) {
      console.error("生成练习题失败:", error)
      setLoading(false)
    }
  }, [videoCode, fetchCourseQuestions])

  // 初始化加载题目
  useEffect(() => {
    if (practiceType === "error") {
      fetchQuestionsMore()
    } else if (practiceType === "course") {
      handleGeneratePracticeQuestions()
    }
  }, [practiceType, fetchQuestionsMore, handleGeneratePracticeQuestions])

  // 清理计时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // 选择选项
  const selectOption = useCallback(
    (index: number) => {
      if (showResult) return

      setSelectedAnswers((prev) => {
        const newAnswers = [...prev]
        newAnswers[currentQuestionIndex] = index
        return newAnswers
      })
    },
    [currentQuestionIndex, showResult],
  )

  // 上一题
  const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1)
    }
  }, [currentQuestionIndex])

  // 下一题
  const nextQuestion = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }, [currentQuestionIndex, questions.length])

  // 提交答案
  const submitAnswers = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // 计算结果
    const results = selectedAnswers.map((answer, index) => {
      if (answer === undefined || answer === null) return "unanswered"
      return answer === questions[index]?.correct_answer ? "correct" : "wrong"
    })

    // 保存到AsyncStorage供详情页使用
    await AsyncStorage.setItem("practiveList", JSON.stringify(questions))

    // 直接跳转到结果页面
    router.replace({
      pathname: "/ai/practice-result",
      params: {
        mode: practiceMode,
        correctCount: correctCount.toString(),
        totalCount: questions.length.toString(),
        results: JSON.stringify(results),
        timeUsed: timeLeft.toString(),
        questionType: questionType,
        questionId: questionId,
        practiceType: practiceType,
      },
    })
  }, [
    selectedAnswers,
    questions,
    correctCount,
    timeLeft,
    practiceMode,
    questionType,
    questionId,
    practiceType,
    router,
  ])

  // 返回
  const goBack = useCallback(() => {
    if (selectedAnswers.some((a) => a !== undefined)) {
      showConfirm("提示", "确定要退出练习吗？未提交的答案将丢失。", () => {
        router.back()
      })
    } else {
      router.back()
    }
  }, [router, selectedAnswers])

  const getOptionLabel = (index: number) => ["A", "B", "C", "D"][index]

  if (loading) {
    return (
      <LinearGradient
        colors={["#93ABFF", "#E4F4FF", "#ECF8FF", "#FFFFFF"]}
        locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.practiceContainer}
      >
        <StatusBar theme="dark" />

        {/* 顶部导航栏 */}
        <View style={styles.practiceNavbar}>
          <TouchableOpacity style={styles.navLeft} onPress={goBack}>
            <Ionicons name="chevron-back" size={rpx(20)} color="#1571FC" />
          </TouchableOpacity>
        </View>

        <View style={styles.loadingContainer}>
          <Image
            source={require("../../../../assets/images/question-loading-boy.png")}
            style={styles.loadingBoyImage}
            resizeMode="contain"
          />
          <Image
            source={require("../../../../assets/images/question-loading-text.png")}
            style={styles.loadingTextImage}
            resizeMode="contain"
          />
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
      style={styles.practiceContainer}
    >
      <StatusBar theme="dark" />

      {/* 顶部导航栏 */}
      <View style={styles.practiceNavbar}>
        <TouchableOpacity style={styles.navLeft} onPress={goBack}>
          <Ionicons name="chevron-back" size={rpx(20)} color="#1571FC" />
        </TouchableOpacity>

        <View style={styles.navCenter}>
          <View style={styles.progressText}>
            <Text style={styles.progressLabel}>题目：</Text>
            <Text style={styles.progressValue}>{currentQuestionIndex + 1}</Text>
            <Text style={styles.progressLabel}>/{questions.length}</Text>
          </View>
          <View style={styles.timerDisplay}>
            <Text style={styles.timerLabel}>已用时间：</Text>
            <Text style={styles.timerValue}>{formatTime(timeLeft)}</Text>
          </View>
        </View>

        <View style={styles.navPlaceholder} />
      </View>

      {!loading && questions.length > 0 && (
        <View style={styles.mainContent}>
          {/* 题目内容 */}
          <View style={styles.questionContent}>
            {currentQuestion && (
              <>
                <View style={styles.questionTextWrapper}>
                  <Text style={styles.questionText}>
                    {parseContent(currentQuestion.question_text || "")}
                  </Text>
                </View>

                {/* 选择题选项 */}
                <View style={styles.optionsContainer}>
                  {currentQuestion.options &&
                    currentQuestion.options.map((option, index) => {
                      const isSelected = selectedAnswers[currentQuestionIndex] === index
                      const isCorrect = showResult && index === currentQuestion.correct_answer
                      const isWrong =
                        showResult &&
                        selectedAnswers[currentQuestionIndex] === index &&
                        index !== currentQuestion.correct_answer

                      return (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.optionItem,
                            isSelected && !showResult && styles.optionSelected,
                            isCorrect && styles.optionCorrect,
                            isWrong && styles.optionWrong,
                          ]}
                          onPress={() => selectOption(index)}
                          disabled={showResult}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.optionTextWrapper}>
                            <Text style={styles.optionLabel}>{getOptionLabel(index)}. </Text>
                            {parseContent(typeof option === "string" ? option : option || "")}
                          </Text>
                        </TouchableOpacity>
                      )
                    })}
                </View>
              </>
            )}
          </View>

          {/* 底部导航 (多题模式) */}
          {practiceMode === "multiple" && (
            <View style={styles.bottomNavigation}>
              <TouchableOpacity
                style={[
                  styles.navBtn,
                  currentQuestionIndex === 0 ? styles.navBtnDisabled : styles.navBtnActive,
                ]}
                onPress={previousQuestion}
                disabled={currentQuestionIndex === 0}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.navBtnText,
                    currentQuestionIndex === 0
                      ? styles.navBtnTextDisabled
                      : styles.navBtnTextActive,
                  ]}
                >
                  上一题
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.navBtn,
                  styles.navBtnMargin,
                  currentQuestionIndex === questions.length - 1
                    ? styles.navBtnDisabled
                    : styles.navBtnActive,
                ]}
                onPress={nextQuestion}
                disabled={currentQuestionIndex === questions.length - 1}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.navBtnText,
                    currentQuestionIndex === questions.length - 1
                      ? styles.navBtnTextDisabled
                      : styles.navBtnTextActive,
                  ]}
                >
                  下一题
                </Text>
              </TouchableOpacity>

              {questions.length - 1 === currentQuestionIndex && (
                <TouchableOpacity
                  style={styles.navRight}
                  onPress={submitAnswers}
                  activeOpacity={0.8}
                >
                  <Text style={styles.submitBtn}>提交答案</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* 单题模式提交按钮 */}
          {practiceMode === "single" && questions.length === currentQuestionIndex + 1 && (
            <View style={styles.singleSubmitSection}>
              <TouchableOpacity
                style={styles.submitSingleBtn}
                onPress={submitAnswers}
                activeOpacity={0.8}
              >
                <Text style={styles.submitSingleText}>提交答案</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </LinearGradient>
  )
}

const styles = createStyles({
  practiceContainer: {
    width: "100%",
    height: "100%",
  },
  // 加载状态
  loadingContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  loadingBoyImage: {
    width: 88.28125,
    marginBottom: 12,
    marginTop: -100,
  },
  loadingTextImage: {
    width: 265.625,
  },
  // 顶部导航栏
  practiceNavbar: {
    paddingHorizontal: 29,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 30,
    paddingBottom: 12,
    backgroundColor: "transparent",
  },
  navLeft: {
    width: 40,
    flexDirection: "row",
    alignItems: "center",
  },
  navCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  navPlaceholder: {
    width: 40,
  },
  progressText: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  progressLabel: {
    fontSize: 10.9375,
    color: "rgba(0, 0, 0, 0.5)",
    lineHeight: 15.625,
  },
  progressValue: {
    fontSize: 15.625,
    color: "#397EFF",
    lineHeight: 15.625,
  },
  timerDisplay: {
    flexDirection: "row",
    alignItems: "baseline",
    marginLeft: 15,
  },
  timerLabel: {
    fontSize: 10.9375,
    color: "rgba(0, 0, 0, 0.5)",
    lineHeight: 15.625,
  },
  timerValue: {
    fontSize: 15.625,
    color: "#397EFF",
    lineHeight: 15.625,
  },
  // 主内容
  mainContent: {
    flex: 1,
    paddingHorizontal: 29,
    flexDirection: "column",
  },
  // 题目内容
  questionContent: {
    backgroundColor: "#fff",
    borderRadius: 9.375,
    paddingHorizontal: 15,
    paddingVertical: 25,
    shadowColor: "#5fb0fc",
    shadowOffset: { width: 0, height: 4.8 },
    shadowOpacity: 0.25,
    shadowRadius: 1.6,
    elevation: 3,
    marginBottom: 15,
    flex: 1,
    maxHeight: "75%",
  },
  questionTextWrapper: {
    marginBottom: 15,
  },
  questionText: {
    fontSize: 11.8175,
    color: "#000",
    lineHeight: 21.27,
  },
  // 选项
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  optionItem: {
    backgroundColor: "#eef9ff",
    padding: 12,
    marginBottom: 15.6,
    borderRadius: 8,
    minWidth: "40%",
    marginLeft: 12,
    shadowColor: "#85afff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 4.4,
    elevation: 2,
  },
  optionSelected: {
    backgroundColor: "#c7dfff",
    shadowColor: "#85afff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 14.4,
    elevation: 4,
  },
  optionCorrect: {
    backgroundColor: "#F6FFED",
    borderWidth: 1,
    borderColor: "#52C41A",
  },
  optionWrong: {
    backgroundColor: "#FFF1F0",
    borderWidth: 1,
    borderColor: "#FF4D4F",
  },
  optionLabel: {
    fontSize: 8.6,
    color: "#333",
  },
  optionTextWrapper: {
    fontSize: 8.6,
    color: "#333",
    lineHeight: 15.48,
  },
  // 底部导航
  bottomNavigation: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  navBtn: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  navBtnActive: {
    backgroundColor: "#CAE5FF",
  },
  navBtnDisabled: {
    backgroundColor: "#F5F5F5",
  },
  navBtnMargin: {
    marginLeft: 9.375,
  },
  navBtnText: {
    fontSize: 8.6,
  },
  navBtnTextActive: {
    color: "#397EFF",
  },
  navBtnTextDisabled: {
    color: "#999",
  },
  navRight: {
    borderRadius: 8,
    marginLeft: 38,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: "#4891FF",
  },
  submitBtn: {
    fontSize: 8.6,
    fontWeight: "bold",
    color: "#fff",
  },
  // 单题模式提交
  singleSubmitSection: {
    flexDirection: "row",
    justifyContent: "center",
  },
  submitSingleBtn: {
    backgroundColor: "#4891FF",
    borderRadius: 15.625,
    paddingHorizontal: 40,
    paddingVertical: 12,
  },
  submitSingleText: {
    fontSize: 10,
    color: "#fff",
  },
})
