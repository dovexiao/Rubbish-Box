import { useState, useEffect, useCallback } from "react"
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import { StatusBar } from "../../components/StatusBar"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"

interface PracticeParams {
  courseId?: string
  pointId?: string
  title?: string
  videoCode?: string
}

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  type: string
}

/**
 * 同步课堂练习页面
 * 100%还原UniApp项目 /src/pages/sync-classroom/practice.vue
 */
export default function PracticeScreen() {
  const router = useRouter()
  const params = useLocalSearchParams() as PracticeParams

  // 页面参数
  const [lessonTitle] = useState(decodeURIComponent(params.title || "练习题"))

  // 题目数据（模拟数据，实际应从API获取）
  const [questions] = useState<Question[]>([
    {
      id: 1,
      question: "在（  ）里填上合适的数。\n（  ）×5=45  （  ）×8<72  63÷（  ）=9  （  ）×6>54",
      options: ["9  8  7  10", "8  9  6  8", "9  9  7  10", "7  8  9  9"],
      correctAnswer: 0,
      type: "multiple-choice",
    },
    {
      id: 2,
      question: "小明买了3支铅笔，每支2元，又买了5本练习本，每本3元。\n小明一共花了多少钱？",
      options: ["18元", "21元", "15元", "24元"],
      correctAnswer: 1,
      type: "multiple-choice",
    },
    {
      id: 3,
      question: "计算：48÷6+5×7=？",
      options: ["43", "53", "41", "51"],
      correctAnswer: 0,
      type: "multiple-choice",
    },
    {
      id: 4,
      question: "下面哪个图形是轴对称图形？",
      options: ["正方形", "平行四边形", "梯形", "三角形"],
      correctAnswer: 0,
      type: "multiple-choice",
    },
    {
      id: 5,
      question: "一个长方形的长是8厘米，宽是5厘米。\n这个长方形的周长是多少厘米？",
      options: ["26厘米", "40厘米", "13厘米", "24厘米"],
      correctAnswer: 0,
      type: "multiple-choice",
    },
  ])

  // 答题状态
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({})
  const [showResult, setShowResult] = useState(false)
  const [showResultDialog, setShowResultDialog] = useState(false)
  const [timeLeft, setTimeLeft] = useState(1800) // 30分钟

  // 当前题目
  const currentQuestion = questions[currentQuestionIndex]

  // 计算分数
  const score = Object.keys(selectedAnswers).filter(
    (key) => selectedAnswers[parseInt(key)] === questions[parseInt(key)].correctAnswer,
  ).length

  const correctCount = score
  const wrongCount = Object.keys(selectedAnswers).length - score

  // 格式化时间
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // 获取选项标签
  const getOptionLabel = (index: number): string => {
    return String.fromCharCode(65 + index) // A, B, C, D
  }

  // 选择选项
  const selectOption = useCallback(
    (index: number) => {
      if (showResult) return

      setSelectedAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: index,
      }))
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

  // 跳转到指定题目
  const goToQuestion = useCallback((index: number) => {
    setCurrentQuestionIndex(index)
  }, [])

  // 提交答案
  const submitAnswers = useCallback(() => {
    const unansweredCount = questions.length - Object.keys(selectedAnswers).length

    if (unansweredCount > 0) {
      Alert.alert("提示", `还有 ${unansweredCount} 道题未作答，确定要提交吗？`, [
        { text: "取消", style: "cancel" },
        {
          text: "确定",
          onPress: () => {
            setShowResultDialog(true)
          },
        },
      ])
    } else {
      setShowResultDialog(true)
    }
  }, [questions.length, selectedAnswers])

  // 查看答案
  const reviewAnswers = useCallback(() => {
    setShowResultDialog(false)
    setShowResult(true)
    setCurrentQuestionIndex(0)
  }, [])

  // 完成练习
  const finishPractice = useCallback(() => {
    router.back()
  }, [router])

  // 返回
  const goBack = useCallback(() => {
    Alert.alert("提示", "确定要退出练习吗？未提交的答案将丢失。", [
      { text: "取消", style: "cancel" },
      {
        text: "确定",
        style: "destructive",
        onPress: () => router.back(),
      },
    ])
  }, [router])

  // 倒计时
  useEffect(() => {
    if (timeLeft <= 0) {
      Alert.alert("提示", "时间到！自动提交答案。")
      setShowResultDialog(true)
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  return (
    <View style={styles.container}>
      <StatusBar theme="light" />

      {/* 顶部导航栏 */}
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navLeft} onPress={goBack}>
          <Ionicons name="arrow-back" size={rpx(20)} color="#333" />
        </TouchableOpacity>
        <View style={styles.navCenter}>
          <View style={styles.timerDisplay}>
            <Ionicons name="time-outline" size={rpx(15)} color="#666" />
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
          <Text style={styles.progressText}>
            {currentQuestionIndex + 1}/{questions.length}
          </Text>
        </View>
        <TouchableOpacity style={styles.navRight} onPress={submitAnswers}>
          <Text style={styles.submitBtn}>提交答案</Text>
        </TouchableOpacity>
      </View>

      {/* 题目类型标签 */}
      <View style={styles.questionType}>
        <View style={styles.typeTag}>
          <Text style={styles.tagText}>选择题</Text>
        </View>
      </View>

      {/* 题目内容 */}
      <ScrollView style={styles.questionContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        {/* 选择题选项 */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswers[currentQuestionIndex] === index
            const isCorrect = showResult && index === currentQuestion.correctAnswer
            const isWrong =
              showResult && selectedAnswers[currentQuestionIndex] === index && index !== currentQuestion.correctAnswer

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.optionItem,
                  isSelected && styles.optionSelected,
                  isCorrect && styles.optionCorrect,
                  isWrong && styles.optionWrong,
                ]}
                onPress={() => selectOption(index)}
                disabled={showResult}
              >
                <Text style={styles.optionLabel}>{getOptionLabel(index)}.</Text>
                <View style={styles.optionContent}>
                  <Text style={styles.optionText}>{option}</Text>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      </ScrollView>

      {/* 底部导航 */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity
          style={[styles.navBtn, currentQuestionIndex === 0 && styles.navBtnDisabled]}
          onPress={previousQuestion}
          disabled={currentQuestionIndex === 0}
        >
          <Text style={styles.btnText}>上一题</Text>
        </TouchableOpacity>

        <View style={styles.questionDots}>
          {questions.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.questionDot,
                index === currentQuestionIndex && styles.questionDotCurrent,
                selectedAnswers[index] !== undefined && styles.questionDotAnswered,
              ]}
              onPress={() => goToQuestion(index)}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.navBtn, currentQuestionIndex === questions.length - 1 && styles.navBtnDisabled]}
          onPress={nextQuestion}
          disabled={currentQuestionIndex === questions.length - 1}
        >
          <Text style={styles.btnText}>下一题</Text>
        </TouchableOpacity>
      </View>

      {/* 答题结果弹窗 */}
      {showResultDialog && (
        <View style={styles.resultOverlay}>
          <View style={styles.resultDialog}>
            <View style={styles.resultContent}>
              <Text style={styles.resultTitle}>答题完成！</Text>
              <Text style={styles.resultScore}>
                {score}/{questions.length}
              </Text>
              <Text style={styles.resultDesc}>
                你答对了 {correctCount} 道题，答错了 {wrongCount} 道题
              </Text>
            </View>
            <View style={styles.resultActions}>
              <TouchableOpacity style={styles.reviewBtn} onPress={reviewAnswers}>
                <Text style={styles.reviewBtnText}>查看答案</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.finishBtn} onPress={finishPractice}>
                <Text style={styles.finishBtnText}>完成练习</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}

const styles = createStyles({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  navbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rpx(16),
    paddingVertical: rpx(12),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  navLeft: {
    padding: rpx(4),
  },
  navCenter: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rpx(20),
  },
  timerDisplay: {
    flexDirection: "row",
    alignItems: "center",
    gap: rpx(4),
  },
  timerText: {
    fontSize: rpx(8.6),
    color: "#666",
  },
  progressText: {
    fontSize: rpx(8.6),
    color: "#666",
  },
  navRight: {
    padding: rpx(4),
  },
  submitBtn: {
    fontSize: rpx(8.6),
    color: "#4891FF",
  },
  questionType: {
    paddingHorizontal: rpx(16),
    paddingVertical: rpx(12),
  },
  typeTag: {
    alignSelf: "flex-start",
    paddingHorizontal: rpx(12),
    paddingVertical: rpx(6),
    backgroundColor: "#E8F4FF",
    borderRadius: rpx(4),
  },
  tagText: {
    fontSize: rpx(8.6),
    color: "#333",
  },
  questionContent: {
    flex: 1,
    paddingHorizontal: rpx(16),
  },
  questionText: {
    fontSize: rpx(12),
    color: "#333",
    fontWeight: "bold",
    marginBottom: rpx(20),
    lineHeight: rpx(20),
  },
  optionsContainer: {
    gap: rpx(12),
  },
  optionItem: {
    flexDirection: "row",
    padding: rpx(12),
    backgroundColor: "#fff",
    borderRadius: rpx(8),
    borderWidth: 2,
    borderColor: "#E5E5E5",
  },
  optionSelected: {
    borderColor: "#4891FF",
    backgroundColor: "#E8F4FF",
  },
  optionCorrect: {
    borderColor: "#52C41A",
    backgroundColor: "#F6FFED",
  },
  optionWrong: {
    borderColor: "#FF4D4F",
    backgroundColor: "#FFF1F0",
  },
  optionLabel: {
    fontSize: rpx(12),
    color: "#333",
    fontWeight: "bold",
    marginRight: rpx(8),
  },
  optionContent: {
    flex: 1,
  },
  optionText: {
    fontSize: rpx(9.375),
    color: "#333",
    lineHeight: rpx(16),
  },
  bottomNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: rpx(16),
    paddingVertical: rpx(12),
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  navBtn: {
    paddingHorizontal: rpx(16),
    paddingVertical: rpx(8),
    backgroundColor: "#4891FF",
    borderRadius: rpx(6),
    minWidth: rpx(70),
    alignItems: "center",
  },
  navBtnDisabled: {
    backgroundColor: "#D9D9D9",
  },
  btnText: {
    fontSize: rpx(8.6),
    color: "#fff",
  },
  questionDots: {
    flexDirection: "row",
    gap: rpx(8),
    flexWrap: "wrap",
    maxWidth: rpx(200),
    justifyContent: "center",
  },
  questionDot: {
    width: rpx(8),
    height: rpx(8),
    borderRadius: rpx(4),
    backgroundColor: "#D9D9D9",
  },
  questionDotCurrent: {
    backgroundColor: "#4891FF",
    width: rpx(12),
    height: rpx(12),
    borderRadius: rpx(6),
  },
  questionDotAnswered: {
    backgroundColor: "#52C41A",
  },
  resultOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  resultDialog: {
    width: rpx(300),
    backgroundColor: "#fff",
    borderRadius: rpx(12),
    padding: rpx(24),
  },
  resultContent: {
    alignItems: "center",
    marginBottom: rpx(24),
  },
  resultTitle: {
    fontSize: rpx(12),
    color: "#333",
    fontWeight: "bold",
    marginBottom: rpx(12),
  },
  resultScore: {
    fontSize: rpx(24),
    color: "#4891FF",
    fontWeight: "bold",
    marginBottom: rpx(8),
  },
  resultDesc: {
    fontSize: rpx(9.375),
    color: "#666",
  },
  resultActions: {
    flexDirection: "row",
    gap: rpx(12),
  },
  reviewBtn: {
    flex: 1,
    paddingVertical: rpx(12),
    backgroundColor: "#F0F0F0",
    borderRadius: rpx(8),
    alignItems: "center",
  },
  reviewBtnText: {
    fontSize: rpx(8.6),
    color: "#333",
  },
  finishBtn: {
    flex: 1,
    paddingVertical: rpx(12),
    backgroundColor: "#4891FF",
    borderRadius: rpx(8),
    alignItems: "center",
  },
  finishBtnText: {
    fontSize: rpx(8.6),
    color: "#fff",
  },
})

