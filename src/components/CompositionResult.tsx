import { useState, useMemo } from "react"
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from "react-native"
import { useRouter } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { createStyles } from "../utils/rpxStyleSheet"
import { Images } from "../constants/Assets"
import { type AiResponse } from "../services/ai"
import { CompositionCanvas } from "./CompositionCanvas"
import { WritingAnalysis } from "./WritingAnalysis"

interface Props {
  compositionInfo: AiResponse
}

interface SentenceReview {
  sentence: string
  advantage: string
  suggestion: string
}

/**
 * 作文批改结果组件
 * 100%还原UniApp项目 /src/pages/AI/components/CompositionResult.vue
 */
export function CompositionResult({ compositionInfo }: Props) {
  const router = useRouter()
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [currentStep, setCurrentStep] = useState(1)

  // 提取作文标题
  const originalTitle = useMemo(() => {
    return compositionInfo?.compositionTitle || "作文原文"
  }, [compositionInfo])

  // 提取作文原文数组
  const originalTextArray = useMemo(() => {
    const originalText = compositionInfo?.originalText || ""
    console.log("📝 原文内容:", originalText ? `${originalText.substring(0, 100)}...` : "空")
    
    if (originalText) {
      // 分割成段落，保留有效段落
      const result = originalText
        .split(/\n+/)
        .map((p: string) => p.trim())
        .filter((p: string) => p.length > 0)
      console.log("📝 分段后数量:", result.length)
      return result
    }
    return []
  }, [compositionInfo])

  // 计算最终得分
  const finalScore = useMemo(() => {
    return compositionInfo?.overallScore || 0
  }, [compositionInfo])

  // 检查是否是英文作文
  const isChinese = useMemo(() => {
    // 兼容大小写，统一转为小写比较
    const lang = compositionInfo?.compositionLanguage?.toLowerCase()
    return lang !== "english"
  }, [compositionInfo?.compositionLanguage])

  // 分页处理作文内容
  const compositionPages = useMemo(() => {
    const textArray = originalTextArray

    // 英文分页
    if (!isChinese) {
      const allText = textArray.join("\n")
      const words = allText.split(" ")
      const maxWordsPerLine = 10
      const lines: string[] = []
      let currentLine = ""

      for (const word of words) {
        const testLine = currentLine ? currentLine + " " + word : word
        if (testLine.split(" ").length > maxWordsPerLine && currentLine) {
          lines.push(currentLine)
          currentLine = word
        } else {
          currentLine = testLine
        }
      }
      if (currentLine) lines.push(currentLine)

      // 按行数分页
      const pages: string[][] = []
      let i = 0
      let first = true
      while (i < lines.length) {
        const pageLines = lines.slice(i, i + (first ? 12 : 13))
        pages.push(pageLines)
        i += first ? 12 : 13
        first = false
      }

      return pages
    }

    // 中文作文分页
    const CHARS_PER_LINE = 13
    const LINES_PER_PAGE = 14
    const FIRST_PAGE_LINES = 13
    const INDENT_CHARS = "　　"

    const pages: string[][] = []
    let currentPage: string[] = []
    let lineCount = 0
    let isFirstPage = true

    // 将文本按行分割
    const splitTextIntoLines = (text: string, isNewParagraph = true) => {
      const lines: string[] = []
      let currentLineChars = ""
      const chars = Array.from(text)

      if (isNewParagraph) {
        currentLineChars = INDENT_CHARS
      }

      for (let i = 0; i < chars.length; i++) {
        const char = chars[i]
        if (currentLineChars.length + 1 <= CHARS_PER_LINE) {
          currentLineChars += char
        } else {
          while (currentLineChars.length < CHARS_PER_LINE) {
            currentLineChars += "　"
          }
          lines.push(currentLineChars)
          currentLineChars = char
        }
      }
      if (currentLineChars.length > 0) {
        while (currentLineChars.length < CHARS_PER_LINE) {
          currentLineChars += "　"
        }
        lines.push(currentLineChars)
      }
      return lines
    }

    for (const paragraph of textArray) {
      const content = paragraph.trim()
      const lines = splitTextIntoLines(content)

      for (const line of lines) {
        if (lineCount >= (isFirstPage ? FIRST_PAGE_LINES : LINES_PER_PAGE)) {
          pages.push([...currentPage])
          currentPage = []
          lineCount = 0
          isFirstPage = false
        }

        currentPage.push(line)
        lineCount++
      }
    }

    if (currentPage.length > 0) {
      const lastLine = currentPage[currentPage.length - 1]
      if (lastLine.length < CHARS_PER_LINE) {
        currentPage[currentPage.length - 1] = lastLine.padEnd(CHARS_PER_LINE, "　")
      }
      pages.push(currentPage)
    }

    return pages
  }, [originalTextArray, isChinese])

  // 解析评分项目
  const scoreItems = useMemo(() => {
    if (!compositionInfo?.gradingCriteria) return []

    const { centerFocus, healthyThought, languageFluency, structureRigor, writingStandard } =
      compositionInfo.gradingCriteria

    const items: Array<{
      name: string
      grade: string
      progress: string
      description: string
      color: string
    }> = []

    if (centerFocus) {
      items.push({
        name: "中心突出",
        grade: centerFocus.grade || "C",
        progress: centerFocus.percentage || "0%",
        description: centerFocus.reason || "",
        color: centerFocus.grade?.startsWith("A") ? "#4CAF50" : "#FF9800",
      })
    }

    if (healthyThought) {
      items.push({
        name: "思想健康",
        grade: healthyThought.grade || "C",
        progress: healthyThought.percentage || "0%",
        description: healthyThought.reason || "",
        color: healthyThought.grade?.startsWith("A") ? "#4CAF50" : "#FF9800",
      })
    }

    if (languageFluency) {
      items.push({
        name: "语言流畅",
        grade: languageFluency.grade || "C",
        progress: languageFluency.percentage || "0%",
        description: languageFluency.reason || "",
        color: languageFluency.grade?.startsWith("A") ? "#4CAF50" : "#FF9800",
      })
    }

    if (structureRigor) {
      items.push({
        name: "结构严谨",
        grade: structureRigor.grade || "C",
        progress: structureRigor.percentage || "0%",
        description: structureRigor.reason || "",
        color: structureRigor.grade?.startsWith("A") ? "#4CAF50" : "#FF9800",
      })
    }

    if (writingStandard) {
      items.push({
        name: "书写规范",
        grade: writingStandard.grade || "C",
        progress: writingStandard.percentage || "0%",
        description: writingStandard.reason || "",
        color: writingStandard.grade?.startsWith("A") ? "#4CAF50" : "#FF9800",
      })
    }

    return items
  }, [compositionInfo])

  // 提取分句点评
  const sentenceReviews = useMemo<SentenceReview[]>(() => {
    console.log("=============== 调试信息 ===============")
    console.log("1. compositionInfo:", compositionInfo)
    console.log("2. compositionInfo 的 keys:", compositionInfo ? Object.keys(compositionInfo) : [])
    
    const sentenceReview = compositionInfo?.sentenceReview || []
    console.log("3. 原始sentenceReview数据:", sentenceReview)
    console.log("4. sentenceReview 类型:", Array.isArray(sentenceReview) ? "数组" : typeof sentenceReview)
    console.log("5. sentenceReview 长度:", sentenceReview.length)

    if (!Array.isArray(sentenceReview) || sentenceReview.length === 0) {
      console.log("6. ⚠️ sentenceReview为空，返回空数组")
      return []
    }

    const result = sentenceReview.map((review: any) => ({
      sentence: review.originalSentence || review.sentence || "",
      advantage: review.advantages || review.advantage || "",
      suggestion: review.improvements || review.suggestion || "",
    }))
    
    console.log("7. ✅ 处理后的sentenceReviews:", result)
    console.log("=======================================")
    
    return result
  }, [compositionInfo])

  // 点评颜色
  const reviewColors = ["#4CAF50", "#FF9800", "#2196F3", "#9C27B0", "#FF5722", "#6078FF"]

  // 提取评分理由
  const commentSummary = useMemo(() => {
    return compositionInfo?.basicInfo?.gradingReason || ""
  }, [compositionInfo])

  // 提取全文总评
  const overallSummary = useMemo(() => {
    return compositionInfo?.overallReview?.summary || ""
  }, [compositionInfo])

  // 提取亮点
  const highlights = useMemo(() => {
    const highlightsText = compositionInfo?.overallReview?.highlights || ""
    if (!highlightsText) return []

    return highlightsText.split(/\d+\.\s*/).filter((item: string) => item.trim())
  }, [compositionInfo])

  // 提取缺点
  const shortcomings = useMemo(() => {
    const weaknesses = compositionInfo?.overallReview?.weaknesses || ""
    if (!weaknesses) return []

    return weaknesses.split(/\d+\.\s*/).filter((item: string) => item.trim())
  }, [compositionInfo])

  // 提取提升建议
  const improvementSuggestions = useMemo(() => {
    if (!compositionInfo?.improvementSuggestions) return []

    const suggestions: Array<{
      tag: string
      text?: string
      pairs?: Array<{ originalText: string; revisedText: string }>
    }> = []

    // 结构优化
    if (compositionInfo.improvementSuggestions.structureOptimization) {
      suggestions.push({
        tag: "结构优化",
        text: compositionInfo.improvementSuggestions.structureOptimization,
      })
    }

    // 细节补充
    if (compositionInfo.improvementSuggestions.detailEnhancement) {
      suggestions.push({
        tag: "细节补充",
        text: compositionInfo.improvementSuggestions.detailEnhancement,
      })
    }

    // 语言润色
    if (
      compositionInfo.improvementSuggestions.languagePolishing &&
      Array.isArray(compositionInfo.improvementSuggestions.languagePolishing) &&
      compositionInfo.improvementSuggestions.languagePolishing.length > 0
    ) {
      const pairs = compositionInfo.improvementSuggestions.languagePolishing.map((item: any) => ({
        originalText: item.originalSentence || item.originalText || "",
        revisedText: item.improvedSentence || item.revisedText || "",
      }))

      if (pairs.length > 0) {
        suggestions.push({
          tag: "语言润色",
          pairs,
        })
      }
    }

    console.log("解析后的suggestions:", suggestions)
    return suggestions
  }, [compositionInfo])

  // 提取鼓励语
  const encouragement = useMemo(() => {
    return compositionInfo?.encouragement || ""
  }, [compositionInfo])

  // 评分标准文本
  const standardText = useMemo(() => {
    const compositionType = compositionInfo?.basicInfo?.compositionType || ""
    const wordCount = compositionInfo?.basicInfo?.wordCount || ""
    return `评分标准：${compositionType} ${wordCount}字`
  }, [compositionInfo])

  // 当前显示的点评内容
  const currentReview = useMemo(() => {
    const review = sentenceReviews[currentStep - 1]
    if (!review) return "暂无点评数据"

    let content = ""
    if (review.sentence) content += review.sentence
    if (review.advantage) content += `\n优点：${review.advantage}`
    if (review.suggestion) content += `\n建议：${review.suggestion}`

    return content || "暂无点评数据"
  }, [sentenceReviews, currentStep])

  // 处理步骤切换
  const handleStepChange = (step: number) => {
    setCurrentStep(step)
  }

  // 显示完整内容 - 跳转到润色后作文页面
  const showFullContent = async () => {
    try {
      // 提取标题
      const title = compositionInfo?.compositionTitle || "润色后作文"

      console.log("准备跳转，AI响应长度:", compositionInfo ? Object.keys(compositionInfo).length : 0)
      console.log("提取到的标题:", title)

      // 检查AI响应是否有效
      if (!compositionInfo) {
        Alert.alert("提示", "暂无润色内容")
        return
      }

      // 使用 AsyncStorage 临时存储数据，避免 URL 长度限制
      const tempData = {
        aiResponse: compositionInfo,
        title,
        timestamp: Date.now(),
      }

      await AsyncStorage.setItem("temp_polished_data", JSON.stringify(tempData))

      // 跳转到润色后作文页面
      router.push("/ai/polished-composition")
    } catch (error) {
      console.error("跳转失败:", error)
      Alert.alert("错误", "跳转失败，请重试")
    }
  }

  // 准备 FlatList 数据源
  const commentCardData = useMemo(() => {
    return [
      { id: "writing-analysis", type: "writing-analysis" },
      { id: "paragraph-review", type: "paragraph-review" },
      { id: "read-button", type: "read-button" },
    ]
  }, [])

  // 渲染 FlatList 项目
  const renderCommentItem = ({ item }: { item: { id: string; type: string } }) => {
    if (item.type === "writing-analysis") {
      return (
            <View style={styles.writingAnalysis}>
              <View style={styles.analysisHeader}>
                <View style={styles.analysisTitleWrapper}>
                  <Image
                    source={Images.rectangle1312320903}
                    style={styles.titleDecorationLeft}
                    resizeMode="contain"
                  />
                  <Text style={styles.analysisTitle}>写作能力分析</Text>
                  <Image
                    source={Images.frame2090059195}
                    style={styles.titleDecorationRight}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.analysisStandard} numberOfLines={1} ellipsizeMode="tail">
                  {standardText}
                </Text>
              </View>

              <View style={styles.analysisContent}>
                <View style={styles.chartSection}>
                  <WritingAnalysis scoreItems={scoreItems} />
                </View>
                <View style={styles.reviewSection}>
                  <Text style={styles.reviewSectionText}>{commentSummary}</Text>
                </View>
              </View>
            </View>
      )
    }

    if (item.type === "paragraph-review") {
      return (
            <View style={styles.paragraphReview}>
          <Image style={styles.aiCardImg} source={Images.frame2090059194} resizeMode="contain" />
              <View style={styles.reviewHeader}>
                <View style={styles.reviewTitleTips} />
                <Text style={styles.reviewTitle}>分段点评</Text>
              </View>
              <View style={styles.reviewProgress}>
                {sentenceReviews.map((_, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.progressItem,
                      {
                        backgroundColor:
                      currentStep === index + 1 ? reviewColors[index] : `${reviewColors[index]}4D`,
                      },
                    ]}
                    onPress={() => handleStepChange(index + 1)}
                  >
                    <Text
                      style={[
                        styles.progressItemText,
                        {
                          color: currentStep === index + 1 ? "#fff" : reviewColors[index],
                        },
                      ]}
                    >
                      {index + 1}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.reviewContent}>{currentReview}</Text>
            </View>
      )
    }

    if (item.type === "read-button") {
      return (
            <TouchableOpacity style={styles.readButtonCardBtn} onPress={showFullContent}>
              <Image
                style={styles.readButtonCardImg}
                source={Images.frame2090059962}
                resizeMode="contain"
              />
            </TouchableOpacity>
      )
    }

    return null
  }

  return (
    <ScrollView
      style={styles.compositionResult}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled={true}
    >
      <View style={styles.contentWrapper}>
        {/* 左侧：作文原文展示 */}
        <View style={styles.compositionPreview}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const pageIndex = Math.round(
                e.nativeEvent.contentOffset.x / e.nativeEvent.layoutMeasurement.width,
              )
              setCurrentPageIndex(pageIndex)
            }}
            style={styles.compositionSwiper}
          >
            {compositionPages.map((pageContent, index) => (
              <CompositionCanvas
                key={index}
                id={`compositionCanvas_${index}`}
                title={index === 0 ? originalTitle : "续"}
                score={finalScore}
                isChinese={isChinese}
                content={pageContent}
              />
            ))}
          </ScrollView>

          {/* 分页指示器 */}
          {compositionPages.length > 1 && (
            <View style={styles.swiperDots}>
              {compositionPages.map((_, index) => (
                <View
                  key={index}
                  style={[styles.dot, currentPageIndex === index && styles.dotActive]}
                />
              ))}
            </View>
          )}
        </View>

        {/* 右侧：作文点评 */}
        <View style={styles.commentCard}>
          {/* 标题 */}
          <View style={styles.commentTitle}>
            <Image
              source={Images.aiResultTitleBg}
              style={styles.commentTitleBg}
              resizeMode="contain"
            />
            <Text style={styles.commentTitleText}>作文点评</Text>
          </View>

          <ScrollView
            style={styles.commentCardCont}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {commentCardData.map((item) => (
              <View key={item.id}>
                {renderCommentItem({ item })}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* 作文总评 */}
      <View style={styles.commentSection}>
        <View style={styles.commentSectionHeader}>
          <View style={styles.reviewTitleTips} />
          <View style={styles.reviewTitleContainer}>
            <Text style={styles.commentSectionTitle}>作文总评</Text>
            <Image style={styles.reviewTitleBg1} source={Images.vector3417} resizeMode="contain" />
            <Image
              style={styles.reviewTitleBg2}
              source={Images.frame2090059195}
              resizeMode="contain"
            />
          </View>
          <View style={styles.commentSectionTips}>
            <Image
              style={styles.tipsImage}
              source={Images.rectangle1312320897}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* 总评 */}
        {overallSummary && (
          <View style={styles.evaluationBlock}>
            <View style={[styles.blockHeader, styles.bgBlue]}>
              <Text style={styles.blockHeaderText}>总评</Text>
            </View>
            <View style={styles.blockContent}>
              <Text style={styles.blockText}>{overallSummary}</Text>
            </View>
          </View>
        )}

        {/* 亮点 */}
        {highlights.length > 0 && (
          <View style={styles.evaluationBlock}>
            <View style={[styles.blockHeader, styles.bgGreen]}>
              <Text style={styles.blockHeaderText}>亮点</Text>
            </View>
            <View style={styles.blockContent}>
              {highlights.map((highlight: string, index: number) => (
                <View key={index} style={styles.pointItem}>
                  <Text style={styles.pointNumber}>{index + 1}.</Text>
                  <Text style={styles.pointContent}>{highlight}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 不足 */}
        {shortcomings.length > 0 && (
          <View style={styles.evaluationBlock}>
            <View style={[styles.blockHeader, styles.bgYellow]}>
              <Text style={styles.blockHeaderText}>不足</Text>
            </View>
            <View style={styles.blockContent}>
              {shortcomings.map((shortcoming: string, index: number) => (
                <View key={index} style={styles.pointItem}>
                  <Text style={styles.pointNumber}>{index + 1}.</Text>
                  <Text style={styles.pointContent}>{shortcoming}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* 提升建议 */}
      {improvementSuggestions.length > 0 && (
        <View style={styles.commentSection}>
          <View style={styles.commentSectionHeader}>
            <View style={styles.reviewTitleTips} />
            <View style={styles.reviewTitleContainer}>
              <Text style={styles.commentSectionTitle}>提升建议</Text>
              <Image
                style={styles.reviewTitleBg1}
                source={Images.vector3417}
                resizeMode="contain"
              />
              <Image
                style={styles.reviewTitleBg2}
                source={Images.frame2090059195}
                resizeMode="contain"
              />
            </View>
          </View>

          <View style={styles.suggestionList}>
            {improvementSuggestions.map((suggestion, index) => (
              <View key={index} style={styles.evaluationBlock}>
                <View style={[styles.blockHeader1, styles.bgBlue]}>
                  <Text style={styles.blockHeaderText}>{suggestion.tag}</Text>
                </View>
                {/* 根据不同类型显示不同内容 */}
                {suggestion.tag === "语言润色" && suggestion.pairs ? (
                  <View style={styles.blockContent}>
                    {suggestion.pairs.map((pair, pairIndex) => (
                      <View key={pairIndex}>
                        <View style={styles.originalTextRow}>
                          <Text style={styles.label}>原句：</Text>
                          <Text style={styles.maxWidthText}>{pair.originalText}</Text>
                        </View>
                        <View style={styles.originalTextRow}>
                          <Text style={styles.label}>改句：</Text>
                          <Text style={styles.maxWidthText}>{pair.revisedText}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : (
                <View style={styles.blockContent}>
                  <Text style={styles.suggestionText}>{suggestion.text}</Text>
                </View>
                )}
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 鼓励语 */}
      {encouragement && (
        <View style={styles.encouragementSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionIcon}>🌟</Text>
            <Text style={styles.sectionTitle}>老师寄语</Text>
          </View>
          <View style={styles.encouragementContent}>
            <Text style={styles.encouragementText}>{encouragement}</Text>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

const styles = createStyles({
  compositionResult: {
    flex: 1,
    width: "100%",
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
  contentWrapper: {
    flexDirection: "row",
    width: "100%",
  },
  compositionPreview: {
    position: "relative",
    flexShrink: 0,
    paddingLeft: 17.5, // 17.5rpx
  },
  compositionSwiper: {
    width: 257.8125, // 257.8125rpx
    height: 320, // 320rpx
  },
  swiperDots: {
    position: "absolute",
    bottom: -10, // -10rpx
    left: "50%",
    marginLeft: -3, // 负的一半宽度 (7+10+7+10+7)/2 = 20.5rpx
    flexDirection: "row",
    gap: 10, // 10rpx
  },
  dot: {
    width: 7, // 7rpx
    height: 7, // 7rpx
    borderRadius: 3.5,
    backgroundColor: "#0000001f",
  },
  dotActive: {
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 9.8,
    elevation: 3,
  },
  commentCard: {
    flex: 1,
    backgroundColor: "#e4f0ff",
    borderRadius: 11.7185, // 11.7185rpx
    minWidth: 0,
    shadowColor: "#2a75ee",
    shadowOffset: { width: 0, height: -1.4 },
    shadowOpacity: 0.25,
    shadowRadius: 8.4,
    elevation: 4,
    marginLeft: 48.90625, // 48.90625rpx
    marginRight: 17.5, // 17.5rpx
    position: "relative",
    padding: 10.9375, // 10.9375rpx
    height: 320, // 320rpx
    paddingBottom: 16.64, // 16.64rpx
    marginTop: 5,
  },
  commentCardCont: {
    height: 308, // 308rpx - 固定高度
    marginTop: -29, // -29rpx
  },
  commentTitle: {
    position: "relative",
    width: "100%",
    height: 29.6875, // 29.6875rpx
    justifyContent: "center",
    alignItems: "center",
    zIndex: 3,
  },
  commentTitleBg: {
    position: "absolute",
    top: -15.46875, // -15.46875rpx
    left: "50%",
    marginLeft: -71.09375, // 负的一半宽度 (142.1875/2 = 71.09375)
    width: 142.1875, // 142.1875rpx
    height: 29.6875, // 29.6875rpx
  },
  commentTitleText: {
    zIndex: 1,
    fontSize: 11.71875, // 11.71875rpx
    fontWeight: "bold",
    color: "#fff",
    position: "absolute",
    top: -12.46875, // -12.46875rpx
    fontFamily: "kingnam_bobo",
  },
  writingAnalysis: {
    backgroundColor: "#ffffff",
    shadowColor: "#707cff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 1.6,
    elevation: 2,
    borderRadius: 7.8125, // 7.8125rpx
    paddingVertical: 10, // 10rpx
    paddingHorizontal: 11.9, // 11.9rpx
    marginBottom: 8, // 8rpx
  },
  analysisHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  analysisTitleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3.9, // 3.9rpx
  },
  titleDecorationLeft: {
    height: 11.7188, // 11.7188rpx
    width: 3.125, // 3.125rpx
  },
  analysisTitle: {
    fontSize: 11.7188, // 11.7188rpx
    fontWeight: "bold",
    color: "#1571FC",
    fontFamily: "kingnam_bobo",
  },
  titleDecorationRight: {
    height: 11.7188, // 11.7188rpx
    width: 4.6875, // 4.6875rpx
  },
  analysisStandard: {
    fontSize: 7.8125, // 7.8125rpx
    color: "#3881ff",
    backgroundColor: "#458fff1a",
    paddingVertical: 2, // 2rpx
    paddingHorizontal: 7.8125, // 7.8125rpx
    borderRadius: 11.7185, // 11.7185rpx
    width: "40%", // w-40% ellipsis
    ellipsizeMode: "tail",
  },
  analysisContent: {
    flexDirection: "row",
  },
  chartSection: {
    height: 169, // 169rpx 恢复原尺寸
    width: 194, // 194rpx 恢复原尺寸
    marginLeft: -14, // -14rpx
  },
  reviewSection: {
    borderWidth: 0.5, // 0.5rpx
    borderColor: "#cbffc9",
    backgroundColor: "#d7ffe533",
    borderRadius: 7.8125, // 7.8125rpx
    justifyContent: "center",
    alignItems: "center",
    width: 146.1,
    height: 125,
    paddingHorizontal: 6.6, // 6.6rpx
    marginTop: 19.53125, // 19.53125rpx
  },
  reviewSectionText: {
    color: "#183d2a",
    fontSize: 8, // 8rpx
    lineHeight: 16, // lineHeight = fontSize * 2
  },
  paragraphReview: {
    position: "relative",
    backgroundColor: "#ffffff",
    borderRadius: 7.8125, // 7.8125rpx
    paddingVertical: 10, // 10rpx
    paddingHorizontal: 11.9, // 11.9rpx
    overflow: "hidden",
    shadowColor: "#707cff",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 1.6,
    elevation: 2,
  },
  aiCardImg: {
    position: "absolute",
    right: -2, // -2rpx
    top: -1.5, // -1.5rpx
    width: 67.1875, // 67.1875rpx
    height: 67.1875, // 67.1875rpx
    opacity: 0.58,
    transform: [{ rotate: "152.26deg" }], // angle: 152.26 deg
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewTitleTips: {
    backgroundColor: "#1571fc",
    width: 3.2, // 3.2rpx
    height: 11.2, // 11.2rpx
    borderRadius: 3.6, // 3.6rpx
    marginRight: 4, // 4rpx
  },
  reviewTitle: {
    fontSize: 11.7188, // 11.7188rpx
    fontWeight: "bold",
    color: "#1571FC",
    fontFamily: "kingnam_bobo",
  },
  reviewProgress: {
    flexDirection: "row",
    gap: 15.625, // 15.625rpx
    marginTop: 11, // 11rpx
  },
  progressItem: {
    width: 18.75, // 18.75rpx
    height: 18.75, // 18.75rpx
    borderRadius: 9.375,
    alignItems: "center",
    justifyContent: "center",
  },
  progressItemText: {
    fontSize: 9.8, // 9.8rpx
  },
  reviewContent: {
    color: "#000",
    fontSize: 7.8125, // 7.8125rpx
    marginTop: 11, // 11rpx
    lineHeight: 12.48, // 7.8125 * 1.6
    whiteSpace: "pre-wrap", // white-space: pre-wrap
  },
  readButtonCardBtn: {
    marginTop: 12, // 12rpx
  },
  readButtonCardImg: {
    width: 345.3125, // 345.3125rpx
    height: 32.03125, // 32.03125rpx
  },
  commentSection: {
    marginTop: 20, // 20rpx
    marginHorizontal: 17.5, // 17.5rpx
    backgroundColor: "#ffffff",
    shadowColor: "#2a75ee",
    shadowOffset: { width: 0, height: -1.2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    borderRadius: 7.8125, // 7.8125rpx
    paddingVertical: 10, // 10rpx
    paddingHorizontal: 11.9, // 11.9rpx
    position: "relative",
  },
  commentSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10.15, // 10.15rpx
    marginRight: 25, // 25rpx
    borderBottomWidth: 1, // 1rpx
    borderBottomColor: "#4098ff1a",
    position: "relative",
    paddingBottom: 4, // 4rpx
  },
  reviewTitleContainer: {
    position: "relative",
  },
  commentSectionTitle: {
    fontSize: 11.7188, // 11.7188rpx
    fontWeight: "bold",
    color: "#1571FC",
    fontFamily: "kingnam_bobo",
    position: "relative",
    zIndex: 3,
  },
  reviewTitleBg1: {
    width: 53.9, // 53.9rpx
    height: 5.8593, // 5.8593rpx
    position: "absolute",
    left: -2, // -2rpx
    bottom: 2, // 2rpx
    zIndex: 2,
  },
  reviewTitleBg2: {
    width: 5.478125, // 5.478125rpx
    height: 5.078125, // 5.078125rpx
    position: "absolute",
    left: 50, // 50rpx
    bottom: 5, // 5rpx
    zIndex: 1,
  },
  commentSectionTips: {
    position: "absolute",
    top: 0, // 0rpx
    left: "50%",
    transform: [{ translateX: -50 }],
  },
  tipsImage: {
    width: 58.59375, // 58.59375rpx
    height: 2.7343, // 2.7343rpx
  },
  evaluationBlock: {
    marginBottom: 14.0625, // 14.0625rpx
    flexDirection: "row",
    alignItems: "flex-start",
    fontSize: 9.375, // 9.375rpx
    marginTop: 15.625, // 15.625rpx
    marginLeft: 17.968, // 17.968rpx
    marginRight: 12.5, // 12.5rpx
  },
  blockHeader: {
    color: "white",
    fontSize: 9.375, // 9.375rpx
    borderRadius: 17, // 17rpx
    width: 41.4, // 41.4rpx
    height: 19.92, // 19.92rpx
    alignItems: "center",
    justifyContent: "center",
  },
  blockHeader1: {
    color: "white",
    fontSize: 9.375, // 9.375rpx
    borderRadius: 17, // 17rpx
    width: 54, // 54rpx
    height: 19.92, // 19.92rpx
    alignItems: "center",
    justifyContent: "center",
  },
  bgBlue: {
    backgroundColor: "#4682ff",
  },
  bgGreen: {
    backgroundColor: "#2BD80D",
  },
  bgYellow: {
    backgroundColor: "#FFC338",
  },
  blockHeaderText: {
    color: "#fff",
    fontSize: 9.375, // 9.375rpx
  },
  blockContent: {
    flex: 1,
    marginLeft: 8, // 8rpx
  },
  blockText: {
    fontSize: 9.375, // 9.375rpx (与blockHeader font-size相同)
    color: "#000",
    lineHeight: 14.0625, // 9.375 * 1.5
  },
  pointItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 5, // 5rpx
  },
  pointNumber: {
    fontWeight: "bold",
    marginRight: 5, // 5rpx
    flexShrink: 0,
    fontSize: 9.375, // 9.375rpx
    color: "#000",
  },
  pointContent: {
    lineHeight: 14.0625, // 9.375 * 1.5
    flex: 1,
    fontSize: 9.375, // 9.375rpx
    color: "#000",
  },
  suggestionList: {},
  suggestionText: {
    fontSize: 8.6, // 8.6rpx
    color: "#000",
    lineHeight: 17.2, // 8.6 * 2
    flexWrap: "wrap",
  },
  originalTextRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5, // 5rpx
  },
  label: {
    fontSize: 8.6, // 8.6rpx
    color: "#000",
  },
  maxWidthText: {
    maxWidth: 540, // 540rpx
    fontSize: 8.6, // 8.6rpx
    color: "#000",
    flex: 1,
  },
  encouragementSection: {
    marginTop: 20, // 20rpx
    marginHorizontal: 17.5, // 17.5rpx
    backgroundColor: "#ffffffcc",
    shadowColor: "#2a75ee",
    shadowOffset: { width: 0, height: -1.2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
    borderRadius: 7.8125, // 7.8125rpx
    padding: 10, // 10rpx
    paddingHorizontal: 11.9, // 11.9rpx
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8, // 8rpx
  },
  sectionIcon: {
    marginRight: 4, // 4rpx
    fontSize: 13, // 13rpx
  },
  sectionTitle: {
    fontSize: 13, // 13rpx
    fontWeight: "bold",
    color: "#333",
  },
  encouragementContent: {
    paddingVertical: 8, // 8rpx
  },
  encouragementText: {
    fontSize: 8.6, // 8.6rpx
    color: "#333",
    lineHeight: 15.48, // 8.6 * 1.8
    textAlign: "justify",
  },
})

export default CompositionResult
