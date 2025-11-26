import { useState, useMemo, useCallback, useRef } from "react"
import {
  View,
  Text as RNText,
  TouchableWithoutFeedback,
  Image,
  ScrollView,
  Modal,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter } from "expo-router"

import { Images } from "../constants/Assets"
import { useTabbarStore } from "../stores/tabbarStore"
import { createStyles, rpx } from "../utils/rpxStyleSheet"
import { MixedContent } from "./MixedContent"

const Text = RNText

interface GradingResult {
  questionIndex: number
  questionText: string
  studentAnswer: string
  correctAnswer: string
  status: string
  feedback: string
}

interface SummaryData {
  total_score: number
  full_score: number
  accuracy: number
  grade: string
  overall_feedback: string
  correct_count: number
  total_questions: number
  wrong_count: number
}

interface QuestionData {
  original_image?: { url: string }
  grading_results?: GradingResult[]
  summary?: SummaryData
  completed_questions?: number
  is_streaming?: boolean
}

interface Props {
  data: QuestionData
}

/**
 * 题目批改结果组件
 * 100%还原UniApp项目 /src/pages/AI/components/QuestionResult.vue
 */
export function QuestionResult({ data }: Props) {
  const router = useRouter()
  const tabbarStore = useTabbarStore()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [revealAnswer, setRevealAnswer] = useState(false)
  const [filterType, setFilterType] = useState<"all" | "wrong" | "unanswered">("all") // 筛选类型

  // 根据筛选类型过滤题目
  const filteredQuestions = useMemo(() => {
    const results = data.grading_results || []
    
    if (filterType === "wrong") {
      return results.filter((q) => q.status === "答错了")
    } else if (filterType === "unanswered") {
      return results.filter((q) => q.status === "未作答")
    }
    // 默认显示答错和未作答的题目
    return results.filter((q) => q.status === "答错了" || q.status === "未作答")
  }, [data.grading_results, filterType])

  const currentQuestion = useMemo(
    () => filteredQuestions[currentIndex] || {},
    [filteredQuestions, currentIndex],
  )

  // 统计信息
  const statistics = useMemo(() => {
    // 安全检查：确保 data 和 grading_results 存在
    if (!data || !data.grading_results) {
      return {
        total_questions: 0,
        correct_count: 0,
        wrong_count: 0,
        unanswered_count: 0,
        accuracy: 0,
      }
    }
    
    // 如果没有 summary，则自己计算
    const results = data.grading_results || []
    const total = data.summary?.total_questions || results.length || 0
    const  unanswered = results.filter((q) => q.status === "未作答").length
    const wrong = results.filter((q) => q.status === "答错了").length
    const correct = total - unanswered - wrong

    return {
      total_questions: total,
      correct_count: correct,
      wrong_count: wrong,
      unanswered_count: unanswered,
      accuracy: total > 0 ? (correct / total) * 100 : 0,
    }
  }, [data])

  // 判断是否全部答对
  const isAllCorrect = useMemo(
    () =>
      statistics.wrong_count === 0 &&
      statistics.unanswered_count === 0 &&
      statistics.total_questions  > 0,
    [statistics],
  )

  // 点击立即显示答案 - 最灵敏的方式
  const handleRevealAnswer = useCallback(() => {
    if (!revealAnswer) {
      setRevealAnswer(true)
    }
  }, [revealAnswer])

  // 切换题目时重置答案显示
  const handleQuestionChange = useCallback((index: number) => {
    setCurrentIndex(index)
    setRevealAnswer(false)
  }, [])

  // 切换筛选类型
  const handleFilterChange = useCallback(
    (type: "all" | "wrong" | "unanswered") => {
      // 如果点击的是当前已激活的筛选项，则切换回显示全部
      if (filterType === type && type !== "all") {
        setFilterType("all")
      } else {
        setFilterType(type)
      }
      setCurrentIndex(0) // 重置到第一题
      setRevealAnswer(false)
    },
    [filterType],
  )

  // 返回AI学习页面
  const goAI = useCallback(() => {
    router.push("/(tabs)/study")
    tabbarStore.setCurIdx(1)
  }, [router, tabbarStore])

  // 数据为空时显示提示
  if (!data || !data.grading_results || data.grading_results.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>暂无批改结果</Text>
      </View>
    )
  }

  return (
    <View style={styles.questionResultUI}>
      {/* 全部正确弹窗 */}
      {isAllCorrect && (
        <Modal transparent visible={isAllCorrect} animationType="fade">
          <View style={styles.successModal}>
            <View style={styles.successModalContent}>
              <TouchableWithoutFeedback onPress={goAI}>
                <View style={styles.modalContainer}>
                  <Image
                    source={Images.aiResultCorrect}
                    style={styles.successImage}
                    resizeMode="contain"
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </Modal>
      )}

      {/* 主要内容 */}
      {!isAllCorrect && (
        <View style={styles.mainContent}>
          {/* 左侧题目列表 */}
          <View style={styles.mainContentLeft}>
            {/* 顶部统计栏 */}
            <LinearGradient
              colors={["#4ab1ff", "#5387ff"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.topSummary}
            >
              <View style={styles.summaryBadge}>
                <Image
                  source={Images.frame2090059922}
                  style={styles.badgeImage}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.topSummaryItem}>
                <Text style={styles.summaryText}>共</Text>
                <Text style={styles.summaryBoldText}>{statistics.total_questions }</Text>
                <Text style={styles.summaryText}>题</Text>
              </View>
              <View style={styles.topSummaryItem}>
                <Text style={styles.summaryText}>正确率</Text>
                <Text style={styles.summaryBoldText}>{Math.round(statistics.accuracy)}</Text>
                <Text style={styles.summaryText}>%</Text>
              </View>
              <TouchableWithoutFeedback onPress={() => handleFilterChange("wrong")}>
                <View
                  style={[
                    styles.topSummaryItem,
                    styles.clickableSummaryItem,
                    filterType === "wrong" && styles.topSummaryItemActive,
                  ]}
                >
                <Text style={styles.summaryText}>答错</Text>
                <Text style={styles.summaryBoldText}>{statistics.wrong_count}</Text>
                <Text style={styles.summaryText}>题</Text>
              </View>
              </TouchableWithoutFeedback>
              <TouchableWithoutFeedback onPress={() => handleFilterChange("unanswered")}>
                <View
                  style={[
                    styles.topSummaryItem,
                    styles.clickableSummaryItem,
                    styles.lastSummaryItem,
                    filterType === "unanswered" && styles.topSummaryItemActive,
                  ]}
                >
                <Text style={styles.summaryText}>未答</Text>
                <Text style={styles.summaryBoldText}>{statistics.unanswered_count}</Text>
                <Text style={styles.summaryText}>题</Text>
              </View>
              </TouchableWithoutFeedback>
            </LinearGradient>

            {/* 左侧题目列表 */}
            <LinearGradient
              colors={["#f7fcff", "#5ba8ff"]}
              locations={[0.95, 1.4882]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              style={styles.leftList}
            >
              <Image
                style={styles.reviewTitleBg3}
                source={Images.generatedImage}
                resizeMode="contain"
              />
              <View style={styles.listTitle}>
                <Text style={styles.listTitleText}>
                  {filterType === "wrong"
                    ? "错题列表"
                    : filterType === "unanswered"
                      ? "未答题列表"
                      : "错题&未答题列表"}
                </Text>
                <Image
                  style={styles.reviewTitleBg1}
                  source={Images.vector3418}
                  resizeMode="contain"
                />
                <Image
                  style={styles.reviewTitleBg2}
                  source={Images.frame2090059195}
                  resizeMode="contain"
                />
                {filterType !== "all" && (
                  <TouchableWithoutFeedback onPress={() => handleFilterChange("all")}>
                    <View style={styles.resetFilterBtn}>
                      <Text style={styles.resetFilterText}>显示全部</Text>
                    </View>
                  </TouchableWithoutFeedback>
                )}
              </View>

              {/* 题目列表 */}
              <ScrollView 
                style={styles.questionList} 
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
              >
                {filteredQuestions.length > 0 ? (
                  filteredQuestions.map((q, idx) => (
                  <TouchableWithoutFeedback
                    key={idx}
                    onPress={() => handleQuestionChange(idx)}
                  >
                    <View
                      style={[
                        styles.questionItem,
                        idx === currentIndex && styles.questionItemActive,
                      ]}
                    >
                      <Text style={styles.qIndex}>{idx + 1}.</Text>
                        <View style={{ flex: 1 }}>
                          <MixedContent 
                            content={q.questionText || ""} 
                            style={styles.questionText}
                          />
                        </View>
                      </View>
                    </TouchableWithoutFeedback>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                      {filterType === "wrong" ? "没有答错的题目" : "没有未答的题目"}
                    </Text>
                    </View>
                )}
              </ScrollView>
            </LinearGradient>
          </View>

          {/* 右侧答案与解析 */}
          <View style={styles.rightDetail}>
            {filteredQuestions.length > 0 && currentQuestion ? (
              <LinearGradient
                colors={["#f7fcff", "#5ba8ff"]}
                locations={[0.861, 1.4882]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.rightDetailItem}
              >
                <View style={styles.cardCorner}>
                  <Text style={styles.cardCornerText}>第{currentIndex + 1}题</Text>
                </View>

                {/* 可滚动内容区域 */}
                <ScrollView
                  style={styles.scrollableContent}
                  contentContainerStyle={styles.scrollableContentContainer}
                  showsVerticalScrollIndicator={false}
                  nestedScrollEnabled={true}
                >
                  {/* 答案块 */}
                  <View style={styles.answerBlock}>
                    <Text style={styles.answerTitle}>答案</Text>
                    <TouchableWithoutFeedback onPress={handleRevealAnswer}>
                      <View
                        style={[styles.answerContent, revealAnswer && styles.answerContentRevealed]}
                      >
                        {!revealAnswer ? (
                          <Text style={styles.scratchHint}>点击查看答案</Text>
                        ) : (
                          <MixedContent 
                            content={currentQuestion.correctAnswer|| ""} 
                            style={styles.answerText}
                          />
                        )}
                      </View>
                    </TouchableWithoutFeedback>
                  </View>

                  {/* 解析块 */}
                  <View style={styles.analysisBlock}>
                    <Text style={styles.analysisTitle}>解析</Text>
                    <MixedContent 
                      content={currentQuestion.feedback || ""} 
                      style={styles.analysisText}
                    />
                  </View>
                </ScrollView>
              </LinearGradient>
            ) : (
              <LinearGradient
                colors={["#f7fcff", "#5ba8ff"]}
                locations={[0.861, 1.4882]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={styles.rightDetailItem}
              >
                <View style={styles.emptyDetailState}>
                  <Text style={styles.emptyStateText}>
                    {filterType === "wrong" ? "没有答错的题目" : "没有未答的题目"}
                  </Text>
                </View>
              </LinearGradient>
            )}
          </View>
        </View>
      )}
    </View>
  )
}

const styles = createStyles({
  emptyContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 12,
    color: "#999",
  },
  questionResultUI: {
    marginHorizontal: 38.48, // 38.48rpx - UniApp原值
  },
  topSummary: {
    width: 303.125, // 303.125rpx - UniApp原值
    height: 50, // 50rpx - UniApp原值
    position: "relative" as const,
    borderWidth: 0.8, // 0.8rpx - UniApp原值
    borderColor: "rgba(223, 236, 255, 0.5)",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-around" as const,
    borderRadius: 7.8125, // 7.8125rpx - UniApp原值
    marginTop: 12, // 12rpx - UniApp原值
    shadowColor: "#0088ff",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 37.4,
    elevation: 8,
  },
  summaryBadge: {
    position: "absolute" as const,
    transform: [{ rotate: "2.03deg" }],
    top: -18.0625, // -18.0625rpx - UniApp原值
    left: -16.6875, // -16.6875rpx - UniApp原值
  },
  badgeImage: {
    width: 114.0625, // 114.0625rpx - UniApp原值
    height: 29.6875, // 29.6875rpx - UniApp原值
  },
  topSummaryItem: {
    borderRightWidth: 0.5, // 0.5rpx - UniApp原值
    borderRightColor: "rgba(255, 255, 255, 0.6)",
    height: 18.75, // 18.75rpx - UniApp原值
    width: "25%" as const,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  clickableSummaryItem: {
    // 可点击的统计项，添加视觉提示
    opacity: 1,
  },
  topSummaryItemActive: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  lastSummaryItem: {
    borderRightWidth: 0,
  },
  summaryText: {
    color: "#fff",
    fontSize: 10.9375, // 10.9375rpx - UniApp原值
  },
  summaryBoldText: {
    fontSize: 13.28125, // 13.28125rpx - UniApp原值
    fontWeight: "bold" as const,
    color: "#fff",
  },
  mainContent: {
    flexDirection: "row" as const,
    gap: 16, // 左右布局之间添加间距
  },
  mainContentLeft: {
    flexShrink: 0,
  },
  leftList: {
    width: 304.6875, // 304.6875rpx - UniApp原值
    height: 269, // 269rpx - UniApp原值，保持固定高度
    borderRadius: 7.8125, // 7.8125rpx - UniApp原值
    marginTop: 10.9375, // 10.9375rpx - UniApp原值
    padding: 12.5, // 12.5rpx - UniApp原值
    position: "relative" as const,
    shadowColor: "#007bb4",
    shadowOffset: { width: 0, height: -0.8 },
    shadowOpacity: 0.25,
    shadowRadius: 3.6,
    elevation: 3,
  },
  listTitle: {
    fontWeight: "bold" as const,
    color: "#3496fa",
    fontSize: 13.28125, // 13.28125rpx - UniApp原值
    position: "relative" as const,
  },
  listTitleText: {
    color: "#3496fa",
    fontSize: 13.28125, // 13.28125rpx - UniApp原值
    fontWeight: "bold" as const,
    position: "relative" as const,
    zIndex: 3,
  },
  reviewTitleBg1: {
    width: 100, // 100rpx - UniApp原值
    height: 5.8593, // 5.8593rpx - UniApp原值
    position: "absolute" as const,
    left: -2, // -2rpx - UniApp原值
    bottom: -2, // -2rpx - UniApp原值
    zIndex: 2,
  },
  reviewTitleBg2: {
    width: 5.478125, // 5.478125rpx - UniApp原值
    height: 5.078125, // 5.078125rpx - UniApp原值
    position: "absolute" as const,
    left: 104, // 104rpx - UniApp原值
    bottom: 5, // 5rpx - UniApp原值
    zIndex: 1,
  },
  reviewTitleBg3: {
    width: 36.71875, // 36.71875rpx - UniApp原值
    height: 31.25, // 31.25rpx - UniApp原值
    position: "absolute" as const,
    top: 7, // 7rpx - UniApp原值
    right: 9.8, // 9.8rpx - UniApp原值
  },
  resetFilterBtn: {
    position: "absolute" as const,
    right: 0,
    top: -2,
    backgroundColor: "#fff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    borderWidth: 0.5,
    borderColor: "#3496fa",
    zIndex: 10, // 确保按钮在图片上方
  },
  resetFilterText: {
    color: "#3496fa",
    fontSize: 8,
    fontWeight: "bold" as const,
  },
  questionList: {
    marginTop: 12, // 12rpx - UniApp原值
    height: 218, // 218rpx - UniApp原值，固定高度
  },
  questionItem: {
    backgroundColor: "#fff",
    opacity: 0.6,
    borderRadius: 4.6875, // 4.6875rpx - UniApp原值
    color: "#000",
    padding: 8.6, // 8.6rpx - UniApp原值
    marginBottom: 8.6, // 8.6rpx - UniApp原值
    borderWidth: 1, // 1rpx - UniApp原值
    borderColor: "#c9dcff",
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
  },
  questionItemActive: {
    backgroundColor: "#fff",
    borderRadius: 4.6875, // 4.6875rpx - UniApp原值
    borderWidth: 1.5625, // 1.5625rpx - UniApp原值
    borderColor: "rgba(79, 214, 255, 0.68)",
    opacity: 1,
    shadowColor: "#1a6edd",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 19.1,
    elevation: 5,
  },
  qIndex: {
    color: "#1571fc",
    marginRight: 8, // 8rpx - UniApp原值
    fontSize: 8.6, // 8.6rpx - UniApp原值
    flexShrink: 0,
  },
  questionText: {
    flex: 1,
    color: "#000",
    fontSize: 11.375, // 增大题目字体（从 8.6rpx 增加到 18rpx）
    lineHeight: 17.0625, // 相应增加行高
  },
  emptyState: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingVertical: 40,
  },
  emptyStateText: {
    color: "#999",
    fontSize: 10,
    textAlign: "center" as const,
  },
  emptyDetailState: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  rightDetail: {
    flexDirection: "column" as const,
    alignItems: "center" as const,
    justifyContent: "flex-start" as const,
    flex: 1,
  },
  rightDetailItem: {
    width: 355, // 355rpx - UniApp原值
    height: 269, // 269rpx - UniApp原值，固定高度与左侧一致
    marginLeft: 14.84375, // 14.84375rpx - UniApp原值
    borderRadius: 7.8125, // 7.8125rpx - UniApp原值
    marginTop: 10.9375, // 10.9375rpx - UniApp原值
    padding: 12.5, // 12.5rpx - UniApp原值
    paddingTop: 30, // 顶部留空给角标
    paddingBottom: 12.5, // 底部间距与padding一致
    position: "relative" as const,
    shadowColor: "#007bb4",
    shadowOffset: { width: 0, height: -0.8 },
    shadowOpacity: 0.25,
    shadowRadius: 3.6,
    elevation: 3,
  },
  cardCorner: {
    position: "absolute" as const,
    top: 0,
    right: 0,
    backgroundColor: "#eaf2ff",
    borderBottomLeftRadius: 12, // 12rpx - UniApp原值
    borderTopRightRadius: 7.8125, // 7.8125rpx - UniApp原值
    paddingVertical: 6, // 6rpx - UniApp原值
    paddingHorizontal: 18, // 18rpx - UniApp原值
  },
  cardCornerText: {
    color: "#1571fc",
    fontSize: 13,
    fontWeight: "bold" as const,
  },
  answerBlock: {
    marginBottom: 20, // 增加与解析块的间距
    flexShrink: 0, // 防止被压缩
  },
  answerTitle: {
    color: "#1571fc",
    fontWeight: "bold" as const,
    marginBottom: 10, // 10rpx - UniApp原值
    fontSize: 15,
  },
  answerContent: {
    position: "relative" as const,
    minHeight: 60, // 减小最小高度，避免占用过多空间
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    padding: 8, // 8rpx - UniApp原值
    backgroundColor: "#ffb700",
    borderRadius: 16, // 16rpx - UniApp原值
    shadowColor: "#ffd700",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 5,
  },
  answerContentRevealed: {
    backgroundColor: "#fffbe6",
  },
  scratchHint: {
    position: "absolute" as const,
    color: "#fff",
    fontSize: 8.6, // 8.6rpx - UniApp原值
    fontWeight: "bold" as const,
    zIndex: 2,
  },
  answerText: {
    color: "#333",
    fontSize: 11.75, // 增大答案字体（从 9.375rpx 增加到 18rpx）
    textAlign: "center" as const,
    lineHeight: 17.625, // 相应增加行高
  },
  analysisBlock: {
    marginBottom: 20, // 底部留白
    paddingTop: 4, // 顶部增加一点间距
  },
  analysisTitle: {
    color: "#1571fc",
    fontWeight: "bold" as const,
    marginBottom: 10, // 10rpx - UniApp原值
    fontSize: 20, // 增大标题字体
  },
  analysisText: {
    color: "#333",
    fontSize: 9.375, // 解析文字字体大小
    lineHeight: 15.48, // 相应增加行高
  },
  scrollableContent: {
    flex: 1,
  },
  scrollableContentContainer: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  successModal: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    zIndex: 999,
  },
  successModalContent: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  modalContainer: {
    flexDirection: "column" as const,
    alignItems: "center" as const,
  },
  successImage: {
    width: 296.875, // 296.875rpx - UniApp原值
  },
})

export default QuestionResult
