import { useState, useEffect } from "react"
import { View, ScrollView, Text, Alert, ActivityIndicator } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useLocalSearchParams, router } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"

import { NavBar } from "../../components/NavBar"
import { StatusBar } from "../../components/StatusBar"
import { CompositionCanvas } from "../../components/CompositionCanvas"
import { createStyles } from "../../utils/rpxStyleSheet"

/**
 * 润色后作文页面
 * 还原UniApp项目 /src/pages/AI/polished-composition.vue
 */
export default function PolishedCompositionScreen() {
  const params = useLocalSearchParams()
  const [aiResponse, setAiResponse] = useState<any>(null)
  const [title, setTitle] = useState("")
  const [compositionPages, setCompositionPages] = useState<string[][]>([])
  const [isChinese, setIsChinese] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true) // 开始加载
        
        // 从 AsyncStorage 获取数据
        const tempDataStr = await AsyncStorage.getItem("temp_polished_data")
        console.log("读取到的数据:", tempDataStr ? "有数据" : "无数据")

        if (!tempDataStr) {
          setLoading(false)
          Alert.alert("提示", "暂无润色内容")
          router.back()
          return
        }

        const tempData = JSON.parse(tempDataStr)
        console.log("解析后的数据:", tempData)

        // 检查数据是否过期（超过1小时）
        const now = Date.now()
        if (now - tempData.timestamp > 3600000) {
          setLoading(false)
          Alert.alert("提示", "数据已过期，请重新查看")
          await AsyncStorage.removeItem("temp_polished_data")
          router.back()
          return
        }

        // 设置数据（保持 loading 状态，等待分页处理完成）
        setAiResponse(tempData.aiResponse)
        setTitle(tempData.title || "润色后作文")

        console.log("数据加载成功:", {
          title: tempData.title,
          hasPolishedComposition: !!tempData.aiResponse?.polishedComposition,
        })
      } catch (error) {
        console.error("加载数据失败:", error)
        setLoading(false)
        Alert.alert("错误", "加载数据失败")
        router.back()
      }
    }

    loadData()
  }, [])

  // 处理分页
  useEffect(() => {
    if (!aiResponse?.polishedComposition) {
      // 如果没有润色内容，关闭 loading
      if (aiResponse) {
        setLoading(false)
      }
      return
    }

    // 开始渲染，保持 loading 状态（数据加载时已经设置为 true）
    console.log("开始分页处理...")

    const text = aiResponse.polishedComposition
    const isEnglish = aiResponse.compositionLanguage === "english"
    setIsChinese(!isEnglish)

    // 分页逻辑与CompositionResult相同
    const textArray = text
      .split(/\n+/)
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 0)

    if (isEnglish) {
      // 英文分页
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

      const pages: string[][] = []
      let i = 0
      let first = true
      while (i < lines.length) {
        const pageLines = lines.slice(i, i + (first ? 12 : 13))
        pages.push(pageLines)
        i += first ? 12 : 13
        first = false
      }

      setCompositionPages(pages)
    } else {
      // 中文分页
      const CHARS_PER_LINE = 13
      const LINES_PER_PAGE = 14
      const FIRST_PAGE_LINES = 13
      const INDENT_CHARS = "　　"

      const pages: string[][] = []
      let currentPage: string[] = []
      let lineCount = 0
      let isFirstPage = true

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

      setCompositionPages(pages)
    }

    // 渲染完成后，延迟关闭 loading（确保页面已经渲染）
    console.log("分页处理完成，准备关闭 loading")
    setTimeout(() => {
      setLoading(false)
      console.log("Loading 已关闭")
    }, 100)
  }, [aiResponse])

  return (
    <LinearGradient
      colors={["#93abff", "#e4f4ff", "#ecf8ff", "#ffffff"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      {/* 头部 */}
      <View style={styles.header}>
        <StatusBar theme="dark" backgroundColor="transparent" translucent={true} />
        <NavBar title="润色后作文" leftArrow goBackDelta={1} />
      </View>

      {/* 滚动内容 */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4891FF" />
          <Text style={styles.loadingText}>正在加载润色内容...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* <Text style={styles.pageTitle}>{title || "润色后作文"}</Text> */}

            {/* 作文页面列表 */}
            {compositionPages.length > 0 ? (
              <View style={styles.pagesContainer}>
                {compositionPages.map((pageContent, index) => (
                  <View key={index} style={styles.pageWrapper}>
                    <CompositionCanvas
                      id={`polishedCanvas_${index}`}
                      title={index === 0 ? title || "润色后作文" : "续"}
                      score={0}
                      isChinese={isChinese}
                      content={pageContent}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>暂无润色内容</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </LinearGradient>
  )
}

const styles = createStyles({
  container: {
    width: "100%",
    height: "100%",
    flex: 1,
    flexDirection: "column",
  },
  header: {
    flexShrink: 0,
  },
  scrollContent: {
    flex: 1,
    height: 0,
  },
  content: {
    paddingHorizontal: 15.625, // 20rpx
    paddingBottom: 15.625,
  },
  pageTitle: {
    fontSize: 15.625, // 20rpx
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginVertical: 15.625, // 20rpx
  },
  pagesContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 15.625, // 20rpx
  },
  pageWrapper: {
    marginBottom: 15.625, // 20rpx
  },
  emptyContainer: {
    paddingVertical: 78.125, // 100rpx
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 13.28125, // 17rpx
    color: "#999",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 78.125, // 100rpx
  },
  loadingText: {
    marginTop: 15.625, // 20rpx
    fontSize: 11.71875, // 15rpx
    color: "#666",
  },
})

