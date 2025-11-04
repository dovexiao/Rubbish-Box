import { useState, useEffect, useCallback, useRef } from "react"
import { View, Text, ScrollView, StatusBar as RNStatusBar, ActivityIndicator } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router"

import { globalImmersive } from "../../utils/globalImmersive"
import { createStyles } from "../../utils/rpxStyleSheet"
import { showError, showWarning } from "../../utils/toast"
import { API_BASE_URL } from "../../config/api"
import { getDeviceInfoForAPI } from "../../utils/deviceInfo"
import { useUserStore } from "../../stores/userStore"

/**
 * AI加载页面 - 流式输出版本
 * 使用 SSE 流式接收 AI 分析结果
 */
export default function AILoadingScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const [streamContent, setStreamContent] = useState("") // 流式内容
  const [isStreaming, setIsStreaming] = useState(false) // 是否正在流式输出
  const [isCompleted, setIsCompleted] = useState(false) // 是否完成
  const hasStartedStream = useRef(false)
  const scrollViewRef = useRef<ScrollView>(null)

  // 打印组件加载日志
  console.log("🎯 AILoadingScreen 组件已加载")
  console.log("📦 接收到的参数:", params)

  // 确保全屏沉浸式
  useFocusEffect(
    useCallback(() => {
      console.log("👁️ 页面获得焦点")
      RNStatusBar.setHidden(true, "none")
      globalImmersive.forceRestore()
    }, []),
  )

  // 流式接收 AI 分析结果
  const startStreamingOCR = useCallback(async () => {
    console.log("🎬 startStreamingOCR 函数被调用")
    console.log("📋 params.imguuid:", params.imguuid)
    console.log("📋 params.type:", params.type)

    if (!params.imguuid) {
      console.error("❌ 参数缺失：imguuid")
      showWarning("参数缺失")
      setTimeout(() => router.back(), 1500)
      return
    }

    const uuid = params.imguuid as string
    const correctionType = params.type as string

    console.log("📝 UUID:", uuid)
    console.log("📝 类型:", correctionType)

    // 只处理作文类型
    if (correctionType !== "composition") {
      console.error("❌ 不支持的类型:", correctionType)
      showWarning("当前仅支持作文流式输出")
      setTimeout(() => router.back(), 1500)
      return
    }

    try {
      setIsStreaming(true)
      console.log("🚀 开始流式接收 AI 分析...")

      // 获取设备信息
      const deviceInfo = await getDeviceInfoForAPI()
      
      // 获取 Token
      const token = useUserStore.getState().token
      
      const url = `${API_BASE_URL}/AppStart/aiStream/ai_ocr_stream/`
      console.log("📍 请求URL:", url)
      
      const requestBody = {
        imguuid: uuid,
        type: correctionType,
        ...deviceInfo, // 添加设备信息
      }
      console.log("📝 请求体:", JSON.stringify(requestBody))
      
      // 使用 XMLHttpRequest 实现流式响应（React Native 的 fetch 不支持 ReadableStream）
      return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        
        let previousLength = 0
        let chunkCount = 0
        let chunkBuffer = ""
        
        // 处理数据块的函数
        const processChunk = (newData: string) => {
          chunkBuffer += newData
          
          // 处理 SSE 格式的数据流
          // 格式：data: {...}\n\n
          const lines = chunkBuffer.split("\n")
          
          // 保留最后一行（可能不完整）
          chunkBuffer = lines.pop() || ""
          
          for (const line of lines) {
            const trimmedLine = line.trim()
            
            // 跳过空行
            if (!trimmedLine) continue
            
            // 检查 [DONE] 标记
            if (trimmedLine === "[DONE]" || trimmedLine === "data: [DONE]") {
              console.log("🎉 接收到 [DONE] 完成标记")
              setIsCompleted(true)
              setIsStreaming(false)
              continue
            }
            
            // 处理 SSE 格式：data: {...}
            if (trimmedLine.startsWith("data:")) {
              const jsonStr = trimmedLine.substring(5).trim()
              
              // 跳过空数据
              if (!jsonStr) continue
              
              console.log("🔍 提取到JSON:", jsonStr.substring(0, 100))
              
              try {
                const json = JSON.parse(jsonStr)
                
                // 提取内容
                let content = ""
                if (json.content) {
                  content = json.content
                } else if (json.text) {
                  content = json.text
                } else if (json.data) {
                  content = json.data
                } else if (json.message) {
                  content = json.message
                }
                
                if (content) {
                  console.log("✅ 添加内容:", content)
                  setStreamContent((prev) => prev + content)
                }
                
                // 检查完成标记
                if (json.status === "done" || json.done || json.finished) {
                  console.log("🎉 JSON中包含完成标记")
                  setIsCompleted(true)
                  setIsStreaming(false)
                }
              } catch (e) {
                console.error("❌ JSON解析失败:", e)
                console.error("❌ 字符串:", jsonStr.substring(0, 100))
              }
            }
          }
        }
        
        xhr.onprogress = () => {
          // 获取当前接收到的所有文本
          const fullText = xhr.responseText
          
          // 只处理新增的部分
          if (fullText.length > previousLength) {
            const newChunk = fullText.substring(previousLength)
            previousLength = fullText.length
            
            chunkCount++
            console.log(`\n📦 收到第 ${chunkCount} 个数据块`)
            console.log(`📏 新增长度: ${newChunk.length} 字符`)
            console.log(`📏 总长度: ${fullText.length} 字符`)
            console.log(`📄 新增内容:`, newChunk.substring(0, 200))
            
            // 处理新增的数据
            processChunk(newChunk)
          }
        }
        
        xhr.onload = () => {
          console.log("✅ 流式输出完成，共接收", chunkCount, "个数据块")
          console.log("📊 总数据长度:", xhr.responseText.length)
          
          // 确保处理完所有剩余数据
          if (previousLength < xhr.responseText.length) {
            const remaining = xhr.responseText.substring(previousLength)
            if (remaining.trim()) {
              console.log("📦 处理剩余数据:", remaining.substring(0, 100))
              processChunk(remaining)
            }
          }
          
          setIsCompleted(true)
          setIsStreaming(false)
          resolve()
        }
        
        xhr.onerror = (error) => {
          console.error("❌ XHR 请求失败:", error)
          setIsStreaming(false)
          showError("AI 分析失败，请重试")
          setTimeout(() => router.back(), 2000)
          reject(error)
        }
        
        // 配置并发送请求
        xhr.open("POST", url, true)
        xhr.setRequestHeader("Content-Type", "application/json")
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`)
          console.log("🔐 已添加Token")
        }
        
        console.log("📤 发送XHR请求...")
        xhr.send(JSON.stringify(requestBody))
      })
    } catch (error) {
      console.error("❌ 流式接收失败:", error)
      setIsStreaming(false)
      showError("AI 分析失败，请重试")
      setTimeout(() => router.back(), 2000)
    }
  }, [params.imguuid, params.type, router])

  useEffect(() => {
    console.log("🔄 useEffect 触发，hasStartedStream:", hasStartedStream.current)
    if (!hasStartedStream.current) {
      console.log("✅ 准备开始流式接收")
      hasStartedStream.current = true
      startStreamingOCR()
    } else {
      console.log("⏭️ 已经开始过流式接收，跳过")
    }
  }, [startStreamingOCR])

  // 自动滚动到底部
  useEffect(() => {
    console.log("📜 streamContent 更新，长度:", streamContent.length)
    if (streamContent && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true })
    }
  }, [streamContent])

  return (
    <LinearGradient
      colors={["#93abff", "#e4f4ff", "#ecf8ff", "#ffffff"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.loadingContainer}
    >
      <View style={styles.contentContainer}>
        {/* 标题 */}
        <Text style={styles.title}>AI 正在分析中...</Text>

        {/* 流式内容显示区域 */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.streamContainer}
          contentContainerStyle={styles.streamContent}
          showsVerticalScrollIndicator={true}
        >
          {streamContent ? (
            <Text style={styles.streamText}>{streamContent}</Text>
          ) : (
            <View style={styles.loadingPlaceholder}>
              <ActivityIndicator size="large" color="#4891FF" />
              <Text style={styles.loadingText}>等待 AI 响应...</Text>
            </View>
          )}
        </ScrollView>

        {/* 状态指示器 */}
        {isStreaming && (
          <View style={styles.statusBar}>
            <ActivityIndicator size="small" color="#4891FF" />
            <Text style={styles.statusText}>正在接收数据...</Text>
          </View>
        )}

        {isCompleted && (
          <View style={styles.statusBar}>
            <Text style={styles.completedText}>✓ 分析完成</Text>
          </View>
        )}
      </View>
    </LinearGradient>
  )
}

const styles = createStyles({
  loadingContainer: {
    flex: 1,
    padding: 40,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  title: {
    fontSize: 1,
    fontWeight: "bold" as const,
    color: "#333",
    marginBottom: 30,
    textAlign: "center" as const,
  },
  streamContainer: {
    flex: 1,
    alignSelf: "stretch" as const,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  streamContent: {
    flexGrow: 1,
  },
  streamText: {
    fontSize: 9.375,
    lineHeight: 28,
    color: "#333",
  },
  loadingPlaceholder: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    minHeight: 200,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 9.375,
    color: "#666",
  },
  statusBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  statusText: {
    fontSize: 9.375,
    color: "#4891FF",
  },
  completedText: {
    fontSize: 9.375,
    color: "#52C41A",
    fontWeight: "500" as const,
  },
})
