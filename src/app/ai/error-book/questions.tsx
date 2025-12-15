import { useState, useEffect, useCallback } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Pressable,
} from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"

import { StatusBar } from "../../../components/StatusBar"
import { NavBar } from "../../../components/NavBar"
import { createStyles, rpx } from "../../../utils/rpxStyleSheet"
import { MixedContent } from "../../../components/MixedContent"
import {
  getSubjectQuestions,
  type SubjectQuestionsParams,
  type WrongQuestion,
} from "../../../services/ai"

/**
 * 错题列表页面
 * 100%还原UniApp项目 /src/pages/AI/error-questions.vue
 */
export default function ErrorQuestionsScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()

  const currentSubject = params.subject as string
  const initialType = params.type as string

  const [loading, setLoading] = useState(false) // 🔴 修复：改为 false，避免首次加载时被 loading 检查拦截
  const [questionList, setQuestionList] = useState<WrongQuestion[]>([])
  const [totalQuestions, setTotalQuestions] = useState(0) // 🔴 修复：正确的 useState 用法
  
  // 分页相关
  const [page, setPage] = useState(1)
  const [pageSize] = useState(5)
  const [hasMore, setHasMore] = useState(true)

  // 筛选相关
  const [showFilter, setShowFilter] = useState(false)
  const [selectedErrorCount, setSelectedErrorCount] = useState("asc")
  const [selectedCorrectStatus, setSelectedCorrectStatus] = useState("all")
  const [selectTimeSort, setSelectTimeSort] = useState(false)
  const [selectedErrorCountLabel, setSelectedErrorCountLabel] = useState("正序")
  const [selectedCorrectStatusLabel, setSelectedCorrectStatusLabel] = useState("全部")
  const [selectTimeSortLabel, setSelectTimeSortLabel] = useState("全部错题")

  const errorCountOptions = [
    { label: "正序", value: "asc" },
    { label: "倒叙", value: "desc" },
  ]

  const correctStatusOptions = [
    { label: "全部", value: "all" },
    { label: "未订正", value: "unCorrect" },
    { label: "已订正", value: "correct" },
  ]

  const selectTimeSortOptions = [
    { label: "全部错题", value: false },
    { label: "本周错题", value: true },
  ]

  // 获取错题列表
  const fetchSubjectQuestions = useCallback(async (isRefresh = false) => {
    if (!currentSubject || loading) return

    try {
      setLoading(true)
      const currentPage = isRefresh ? 1 : page
      
      const res = await getSubjectQuestions({
        subject: currentSubject,
        is_corrected: selectedCorrectStatus,
        this_week_only: selectTimeSort,
        order_by_error_count: selectedErrorCount,
        page: currentPage,
        page_size: pageSize,
      })
      
      // 刷新时重置列表，否则追加
      if (isRefresh) {
        setQuestionList(res.wrong_questions || [])
        setPage(2)
      } else {
        setQuestionList(prev => [...prev, ...(res.wrong_questions || [])])
        setPage(prev => prev + 1)
      }
      console.log('res.total_questions', res.total_questions)
      setTotalQuestions(res.total_questions || 0) // 🔴 修复：使用 setState 函数更新状态
      // 使用后端返回的 has_next 判断是否还有更多数据
      setHasMore(res.has_next || false)
      
    } catch (error) {
      console.error("获取错题列表失败:", error)
    } finally {
      setLoading(false)
    }
  }, [currentSubject, selectedCorrectStatus, selectTimeSort, selectedErrorCount, page, pageSize])


  // 初始化：根据type参数设置初始筛选条件
  useEffect(() => {
    if (initialType === "corrected") {
      setSelectedCorrectStatus("correct")
      setSelectedCorrectStatusLabel("已订正")
    } else if (initialType === "selectTime") {
      setSelectTimeSort(true)
      setSelectTimeSortLabel("本周错题")
    }
  }, [initialType])

  // 加载数据
  useEffect(() => {
    fetchSubjectQuestions(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSubject])

  // 显示筛选弹窗
  const showFilterPopup = () => setShowFilter(true)

  // 选择答错次数
  const selectErrorCountOption = (count: { label: string; value: string }) => {
    setSelectedErrorCount(count.value)
    setSelectedErrorCountLabel(count.label)
  }

  // 选择订正状态
  const selectCorrectStatusOption = (status: { label: string; value: string }) => {
    setSelectedCorrectStatus(status.value)
    setSelectedCorrectStatusLabel(status.label)
  }

  // 选择时间排序
  const selectTimeStatusOption = (status: { label: string; value: boolean }) => {
    setSelectTimeSort(status.value)
    setSelectTimeSortLabel(status.label)
  }

  // 重置筛选
  const resetFilters = () => {
    setSelectedErrorCount("asc")
    setSelectedCorrectStatus("all")
    setSelectTimeSort(false)
    setSelectedErrorCountLabel("正序")
    setSelectedCorrectStatusLabel("全部")
    setSelectTimeSortLabel("全部错题")
  }

  // 应用筛选
  const applyFilters = async () => {
    await fetchSubjectQuestions(true) // 重新加载第一页
    setShowFilter(false)
  }
  
  // 加载更多
  const loadMore = () => {
    if (!loading && hasMore) {
      fetchSubjectQuestions(false)
    }
  }

  // 查看解析
  const showAnalysis = (question: WrongQuestion) => {
    router.push(
      `/ai/question-analysis?questionId=${question.id}&questionType=${question.question_type}`,
    )
  }

  // 举一反三 - 跳转到练习页面
  const practiceAgain = (question: WrongQuestion) => {
    router.push(
      `/ai/error-book/practice?mode=multiple&type=error&questionId=${question.id}&from=errorbook&questionType=${question.question_type}`,
    )
  }

  return (
    <LinearGradient
      colors={["#93ABFF", "#E4F4FF", "#ECF8FF", "#FFFFFF"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.errorQuestionsContainer}
    >
      <StatusBar theme="dark" />
      <NavBar title={`错题—${currentSubject}`} leftArrow />

      {/* 🔴 修复：移除 !loading 条件，避免加载下一页时页面空白 */}
      <View style={styles.mainContent}>
          {/* 筛选栏 */}
          <View style={styles.filterSection}>
            <TouchableOpacity style={styles.filterTrigger} onPress={showFilterPopup}>
              <Text style={styles.filterTriggerText}>筛选</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.filterItem} onPress={showFilterPopup}>
              <Text style={styles.filterItemText}>{selectedErrorCountLabel}</Text>
              <Ionicons name="chevron-down" size={rpx(12)} color="#999" style={styles.filterIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.filterItem} onPress={showFilterPopup}>
              <Text style={styles.filterItemText}>{selectedCorrectStatusLabel}</Text>
              <Ionicons name="chevron-down" size={rpx(12)} color="#999" style={styles.filterIcon} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.filterItem} onPress={showFilterPopup}>
              <Text style={styles.filterItemText}>{selectTimeSortLabel}</Text>
              <Ionicons name="chevron-down" size={rpx(12)} color="#999" style={styles.filterIcon} />
            </TouchableOpacity>
          </View>

          {/* 题目总数 */}
          <View style={styles.questionCount}>
            <Text style={styles.questionCountText}>{totalQuestions}道错题</Text>
          </View>

          {/* 错题列表 */}
          <View style={styles.questionListContainer}>
            <FlatList
              data={questionList}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item: question, index }) => (
                <View style={styles.questionCard}>
                  {/* 日期和答错次数 */}
                  <View style={styles.questionHeader}>
                    <Text style={styles.questionDate}>{question.created_at}</Text>
                    <Text style={styles.separator}>|</Text>
                    <Text style={styles.errorCountText}>答错 {question.error_count} 次</Text>
                  </View>

                  {/* 题目内容 */}
                  <View style={styles.questionContent}>
                    <Text style={styles.questionIndex}>{index + 1}.</Text>
                    <MixedContent 
                      content={question.question_text || ""} 
                      style={styles.questionText}
                    />
                  </View>

                  {/* 选项 */}
                  <View style={styles.optionsContainer}>
                    {question.options &&
                      question.options.map((option, optIndex) => (
                        <View key={optIndex} style={styles.optionItem}>
                          <View style={styles.optionTextWrapper}>
                            <Text style={styles.optionLetter}>{option.letter}. </Text>
                            <MixedContent 
                              content={option.text || ""} 
                              style={styles.optionText}
                            />
                          </View>
                        </View>
                      ))}
                  </View>

                  {/* 底部按钮 */}
                  <View style={styles.questionActions}>
                    {!question.is_corrected || question.is_corrected === "false" ? (
                      <>
                        <TouchableOpacity
                          style={styles.actionBtn1}
                          onPress={() => practiceAgain(question)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.actionBtnText}>举一反三</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionBtn2, styles.actionBtnMargin]}
                          onPress={() => showAnalysis(question)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.actionBtnText}>查看解析</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity
                        style={styles.actionBtn2}
                        onPress={() => showAnalysis(question)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.actionBtnText}>查看解析</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              )}
              ListEmptyComponent={
                !loading && questionList.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyIcon}>📚</Text>
                    <Text style={styles.emptyText}>暂无符合条件的错题</Text>
                    <Text style={styles.emptyHint}>调整筛选条件试试看</Text>
                  </View>
                ) : null
              }
              ListFooterComponent={
                questionList.length > 0 ? (
                  <View style={styles.loadMoreContainer}>
                    {loading ? (
                      <ActivityIndicator size="small" color="#007AFF" />
                    ) : !hasMore ? (
                      <Text style={styles.noMoreText}>没有更多数据了</Text>
                    ) : null}
                  </View>
                ) : null
              }
              onEndReached={loadMore}
              onEndReachedThreshold={0.1}
              showsVerticalScrollIndicator={false}
              style={styles.questionList}
            />
          </View>
        </View>

      {/* 🔴 修复：初次加载时的全屏加载指示器 */}
      {loading && questionList.length === 0 && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1571FC" />
          <Text style={styles.loadingText}>正在加载错列表...</Text>
        </View>
      )}

      {/* 筛选弹窗 */}
      {showFilter && (
        <Pressable style={styles.modalOverlay} onPress={() => setShowFilter(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.filterPopup}>
              <Text style={styles.popupTitle}>筛选条件</Text>

              {/* 答错次数 */}
              <View style={styles.filterGroup}>
                <Text style={styles.groupTitle}>答错次数</Text>
                <View style={styles.optionGrid}>
                  {errorCountOptions.map((count) => (
                    <Pressable
                      key={count.value}
                      style={[
                        styles.gridOption,
                        selectedErrorCount === count.value && styles.gridOptionSelected,
                      ]}
                      onPress={() => selectErrorCountOption(count)}
                    >
                      <Text
                        style={[
                          styles.gridOptionText,
                          selectedErrorCount === count.value && styles.gridOptionTextSelected,
                        ]}
                      >
                        {count.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* 订正状态 */}
              <View style={styles.filterGroup}>
                <Text style={styles.groupTitle}>订正状态</Text>
                <View style={styles.optionGrid}>
                  {correctStatusOptions.map((status) => (
                    <Pressable
                      key={status.value}
                      style={[
                        styles.gridOption,
                        selectedCorrectStatus === status.value && styles.gridOptionSelected,
                      ]}
                      onPress={() => selectCorrectStatusOption(status)}
                    >
                      <Text
                        style={[
                          styles.gridOptionText,
                          selectedCorrectStatus === status.value && styles.gridOptionTextSelected,
                        ]}
                      >
                        {status.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* 时间排序 */}
              <View style={styles.filterGroup}>
                <Text style={styles.groupTitle}>时间排序</Text>
                <View style={styles.optionGrid}>
                  {selectTimeSortOptions.map((status) => (
                    <Pressable
                      key={status.label}
                      style={[
                        styles.gridOption,
                        selectTimeSort === status.value && styles.gridOptionSelected,
                      ]}
                      onPress={() => selectTimeStatusOption(status)}
                    >
                      <Text
                        style={[
                          styles.gridOptionText,
                          selectTimeSort === status.value && styles.gridOptionTextSelected,
                        ]}
                      >
                        {status.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* 弹窗操作按钮 */}
              <View style={styles.popupActions}>
                <TouchableOpacity
                  style={styles.resetBtn}
                  onPress={resetFilters}
                  activeOpacity={0.8}
                >
                  <Text style={styles.resetBtnText}>重置</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmBtn}
                  onPress={applyFilters}
                  activeOpacity={0.8}
                >
                  <Text style={styles.confirmBtnText}>确定</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      )}
    </LinearGradient>
  )
}

const styles = createStyles({
  errorQuestionsContainer: {
    width: "100%",
    height: "100%",
    minWidth: 750,
    minHeight: "100%",
  },
  mainContent: {
    flex: 1,
    paddingBottom: 20,
    paddingHorizontal: 29,
    height: "100%",
    overflow: "hidden",
    flexDirection: "column",
  },
  // 筛选栏
  filterSection: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8.4,
    flexShrink: 0,
  },
  filterTrigger: {
    paddingRight: 12,
    paddingVertical: 8,
  },
  filterTriggerText: {
    fontSize: 10.9375,
    color: "#1A2D58",
  },
  filterItem: {
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 15.625,
    paddingHorizontal: 7.2,
    paddingVertical: 4.8,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3.90625 },
    shadowOpacity: 0.05,
    shadowRadius: 7.8125,
    elevation: 2,
  },
  filterItemText: {
    fontSize: 10.9375,
    color: "#626262",
  },
  filterIcon: {
    marginLeft: 4,
  },
  // 题目总数
  questionCount: {
    marginVertical: 8,
    flexShrink: 0,
  },
  questionCountText: {
    fontSize: 10.935,
    color: "#373737",
    fontWeight: "bold",
  },
  // 错题列表容器
  questionListContainer: {
    flex: 1,
    height: 0,
  },
  questionList: {
    height: "100%",
  },
  // 题目卡片
  questionCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 23.4375,
    paddingVertical: 10.9375,
    marginBottom: 10.9375,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  questionDate: {
    fontSize: 10.9375,
    color: "#989898",
  },
  separator: {
    fontSize: 10.9375,
    color: "#D9D9D9",
    marginHorizontal: 10.9375,
  },
  errorCountText: {
    fontSize: 10.9375,
    color: "#989898",
  },
  // 题目内容
  questionContent: {
    marginTop: 16,
    flexDirection: "row",
  },
  questionIndex: {
    fontSize: 9.375,
    color: "#000000",
    marginRight: 4,
  },
  questionTextWrapper: {
    flex: 1,
    fontSize: 9.375,
    color: "#000000",
    lineHeight: 14,
  },
    questionText: {
    fontSize: 9.375,
    color: "#000000",
    lineHeight: 14,
  },
  // 选项
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 16,
  },
  optionItem: {
    marginRight: 18,
    marginBottom: 8,
  },
  optionLetter: {
    fontSize: 9.375,
    color: "#000000",
  },
  optionText: {
    fontSize: 9.375,
    color: "#000000",
    lineHeight: 14,
    flexShrink: 1,
  },
  optionTextWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexShrink: 1,
  },
  // 底部操作按钮
  questionActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12.5,
  },
  actionBtn1: {
    width: 59.375,
    height: 24,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#124CA9",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8.2,
    elevation: 3,
    // Note: Use LinearGradient component for gradient background
    backgroundColor: "#7EBFFF",
  },
  actionBtn2: {
    width: 59.375,
    height: 24,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    // Note: Use LinearGradient component for gradient background
    backgroundColor: "#7BB9FF",
  },
  actionBtnMargin: {
    marginLeft: 12,
  },
  actionBtnText: {
    fontSize: 9.375,
    color: "#FFFFFF",
  },
  // 空状态
  emptyState: {
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    minHeight: 300,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 12,
    color: "#999",
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 9.375,
    color: "#ccc",
  },
  // 加载更多
  loadMoreContainer: {
    paddingVertical: 20,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  noMoreText: {
    fontSize: 11,
    color: "#999",
  },
  // 加载中
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
  // 筛选弹窗
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
    zIndex: 10000,
  },
  filterPopup: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  popupTitle: {
    fontSize: 12,
    color: "#333",
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  filterGroup: {
    marginBottom: 10,
  },
  groupTitle: {
    fontSize: 10,
    color: "#333",
    fontWeight: "bold",
    marginBottom: 6,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridOption: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  gridOptionSelected: {
    backgroundColor: "#4891FF",
  },
  gridOptionText: {
    fontSize: 8.6,
    color: "#666",
  },
  gridOptionTextSelected: {
    color: "#fff",
  },
  popupActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  resetBtn: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    borderRadius: 11.625,
    paddingHorizontal: 30,
    paddingVertical: 8,
    marginRight: 10,
    alignItems: "center",
  },
  resetBtnText: {
    fontSize: 10,
    color: "#666",
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: "#4891FF",
    borderRadius: 11.625,
    paddingHorizontal: 30,
    paddingVertical: 8,
    marginLeft: 10,
    alignItems: "center",
  },
  confirmBtnText: {
    fontSize: 10,
    color: "#fff",
  },
})
