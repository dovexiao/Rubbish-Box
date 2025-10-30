import { useState, useEffect, useCallback } from "react"
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"

import { StatusBar } from "../../../components/StatusBar"
import { NavBar } from "../../../components/NavBar"
import { createStyles, rpx } from "../../../utils/rpxStyleSheet"
import { parseContent } from "../../../utils/mathmlParser"
import {
  getWrongTransferSelection,
  confirmWrongTransfer,
  type WrongQuestion,
} from "../../../services/ai"
import { showSuccess, showError, showWarning } from "../../../utils/toast"
import { showConfirm } from "../../../utils/dialog"

/**
 * 错题录入选择页面
 * 100%还原UniApp项目 /src/pages/AI/error-selection.vue
 * 从相机拍照后选择要加入错题本的题目
 */
export default function ErrorSelectionScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()

  const imguuid = params.imguuid as string

  const [loading, setLoading] = useState(true)
  const [questionList, setQuestionList] = useState<WrongQuestion[]>([])
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([])
  const [cacheId, setCacheId] = useState("")

  // 获取错题列表
  const fetchQuestionList = useCallback(async () => {
    if (!imguuid) {
      showWarning("缺少必要参数")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const res = await getWrongTransferSelection({ imguuid })
      if (res && res.questions && res.questions.length > 0) {
        setQuestionList(res.questions)
        setCacheId(res.cache_id)
      }
    } catch (err: any) {
      showError(err.message || "获取错题列表失败")
    } finally {
      setLoading(false)
    }
  }, [imguuid])

  useEffect(() => {
    fetchQuestionList()
  }, [fetchQuestionList])

  // 切换选择状态
  const toggleSelection = useCallback((index: number) => {
    setSelectedQuestions((prev) => {
      const position = prev.indexOf(index)
      if (position > -1) {
        // 已选中，取消选择
        return prev.filter((i) => i !== index)
      } else {
        // 未选中，添加选择
        return [...prev, index]
      }
    })
  }, [])

  // 确认选择
  const confirmSelection = useCallback(async () => {
    if (selectedQuestions.length === 0) {
      showWarning("请至少选择一道错题")
      return
    }

    showConfirm(
      "确认",
      `已选${selectedQuestions.length}道错题，加入后将进行自动分类`,
      async () => {
        try {
          await confirmWrongTransfer({
            batch_id: imguuid,
            cache_id: cacheId,
            selected_indices: selectedQuestions,
          })
          showSuccess("添加成功")
          setTimeout(() => {
            // 返回到错题本页面
            router.back()
            router.back()
          }, 500)
        } catch (err: any) {
          showError(err.message || "提交失败，请重试")
        }
      }
    )
  }, [selectedQuestions, imguuid, cacheId, router])

  // 返回拍照页面
  const goBack = () => {
    router.back()
  }

  if (loading) {
    return (
      <LinearGradient
        colors={["#93ABFF", "#E4F4FF", "#CDEDFF", "#FFFFFF"]}
        locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.indexContainer}
      >
        <StatusBar theme="dark" />
        <NavBar title="错题录入" leftArrow />
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1571FC" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </LinearGradient>
    )
  }

  if (!loading && questionList.length === 0) {
    return (
      <LinearGradient
        colors={["#93ABFF", "#E4F4FF", "#CDEDFF", "#FFFFFF"]}
        locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.indexContainer}
      >
        <StatusBar theme="dark" />
        <NavBar title="错题录入" leftArrow />
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={rpx(156.25)} color="#D9D9D9" />
          <Text style={styles.emptyText}>未识别到错题，请重新拍照</Text>
          <TouchableOpacity style={styles.retryButton} onPress={goBack} activeOpacity={0.8}>
            <Text style={styles.retryButtonText}>重新拍照</Text>
          </TouchableOpacity>
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
      style={styles.indexContainer}
    >
      <StatusBar theme="dark" />

      {/* 顶部导航栏 */}
      <View style={styles.navbarContainer}>
        <NavBar title="错题录入" leftArrow />
      </View>

      <View style={styles.indexContent}>
        {/* 主要内容区 */}
        <View style={styles.mainContent}>
          {/* 顶部提示 */}
          <View style={styles.topTips}>
            <View style={styles.tipsRow}>
              <Text style={styles.tipsText}>{questionList.length || 0}道错题</Text>
              {selectedQuestions.length > 0 && (
                <View style={styles.selectedInfo}>
                  <Text style={styles.selectedText}>已选择</Text>
                  <Text style={styles.selectedCount}>{selectedQuestions.length}</Text>
                  <Text style={styles.selectedText}>道错题</Text>
                </View>
              )}
            </View>
          </View>

          {/* 错题列表 */}
          <ScrollView style={styles.questionList} showsVerticalScrollIndicator={false}>
            {questionList.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.questionItem,
                  selectedQuestions.includes(index) && styles.questionSelected,
                ]}
                onPress={() => toggleSelection(index)}
                activeOpacity={0.8}
              >
                {/* 复选框 */}
                <View
                  style={[
                    styles.questionCheckbox,
                    selectedQuestions.includes(index)
                      ? styles.checkboxSelected
                      : styles.checkboxUnselected,
                  ]}
                >
                  <Ionicons
                    name="checkmark"
                    size={rpx(10.9375)}
                    color={selectedQuestions.includes(index) ? "#FFFFFF" : "#fff"}
                  />
                </View>

                {/* 题目内容 */}
                <View style={styles.questionContentWrapper}>
                  <View style={styles.questionTextContainer}>
                    <Text style={styles.questionText}>
                      {parseContent(item.question_text || "")}
                    </Text>
                  </View>

                  {/* 选项 */}
                  {item.options && Array.isArray(item.options) && item.options.length > 0 && (
                    <View style={styles.optionsContainer}>
                      {item.options.map((optionText, optIndex) => {
                        // 选项字母：A, B, C, D...
                        const optionLetter = String.fromCharCode(65 + optIndex)
                        // 如果是对象格式 {letter: "A", text: "..."}
                        if (typeof optionText === "object" && optionText !== null) {
                          const option = optionText as any
                          return (
                            <View key={optIndex} style={styles.optionItem}>
                              <Text style={styles.optionText}>
                                <Text style={styles.optionLetter}>{option.letter}. </Text>
                                {parseContent(option.text || "")}
                              </Text>
                            </View>
                          )
                        }
                        // 如果是字符串格式 ["选项内容1", "选项内容2"]
                        return (
                          <View key={optIndex} style={styles.optionItem}>
                            <Text style={styles.optionText}>
                              <Text style={styles.optionLetter}>{optionLetter}. </Text>
                              {parseContent(optionText as string)}
                            </Text>
                          </View>
                        )
                      })}
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 底部操作栏 */}
          <View style={styles.bottomBar}>
            <View style={styles.selectionInfo}>
              <Text style={styles.selectionCountText}>
                已选择 {selectedQuestions.length} 道错题
              </Text>
            </View>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={confirmSelection}
              activeOpacity={0.8}
            >
              <Text style={styles.confirmText}>确认</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = createStyles({
  indexContainer: {
    width: "100%",
    height: "100%",
    minWidth: 750,
    minHeight: "100%",
  },
  indexContent: {
    flex: 1,
    flexDirection: "column",
  },
  navbarContainer: {
    position: "relative",
  },
  navRightBtn: {
    position: "absolute",
    top: "50%",
    right: 12,
    transform: [{ translateY: -12 }],
    backgroundColor: "rgba(200, 200, 200, 0.8)",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    zIndex: 10,
  },
  btnText: {
    fontSize: 8.6,
    color: "#333",
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 29,
    flexDirection: "column",
  },
  topTips: {
    marginVertical: 8,
  },
  tipsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  tipsText: {
    fontSize: 10.9375,
    color: "#373737",
  },
  selectedInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 12,
  },
  selectedText: {
    fontSize: 10.9375,
    color: "#373737",
  },
  selectedCount: {
    fontSize: 10.9375,
    color: "#1571FC",
    marginHorizontal: 4,
  },
  // 错题列表
  questionList: {
    height: "calc(100% - 96rpx)",
    flex: 1,
  },
  questionItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 9.375,
    paddingHorizontal: 13.4375,
    paddingVertical: 3.4375,
    marginBottom: 11.71875,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#91CDFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8.4,
    elevation: 3,
  },
  questionSelected: {
    borderWidth: 1.5,
    borderColor: "#4891FF",
  },
  questionCheckbox: {
    width: 20.3125,
    height: 20.3125,
    borderRadius: 10.15625,
    minWidth: 20.3125,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  checkboxSelected: {
    backgroundColor: "#4891FF",
    borderColor: "#4891FF",
  },
  checkboxUnselected: {
    backgroundColor: "#D3D3D3",
    borderColor: "#D3D3D3",
  },
  questionContentWrapper: {
    flex: 1,
    marginLeft: 12.5,
    maxWidth: 586,
  },
  questionTextContainer: {
    marginBottom: 7.8125,
  },
  questionText: {
    fontSize: 9.375,
    color: "#000000",
    lineHeight: 16.875,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
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
    lineHeight: 16.875,
  },
  // 底部操作栏
  bottomBar: {
    height: 50.3125,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 9.375,
    marginBottom: 10.625,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 15.625,
    shadowColor: "#91CDFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8.4,
    elevation: 3,
  },
  selectionInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectionCountText: {
    fontSize: 9.375,
    color: "#333",
  },
  confirmButton: {
    width: 78.125,
    height: 31.25,
    backgroundColor: "#4891FF",
    borderRadius: 15.625,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: {
    fontSize: 9.375,
    color: "#fff",
    fontWeight: "bold",
  },
  // 加载中
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    zIndex: 100,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontSize: 12.5,
    color: "#333",
    marginTop: 7.8125,
  },
  // 空状态
  emptyState: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 90,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 12.5,
    color: "#666",
  },
  retryButton: {
    width: 156.25,
    height: 39.0625,
    backgroundColor: "#4891FF",
    borderRadius: 19.53125,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 23.4375,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3.90625 },
    shadowOpacity: 0.1,
    shadowRadius: 7.8125,
    elevation: 3,
  },
  retryButtonText: {
    fontSize: 9.375,
    color: "#fff",
  },
})
