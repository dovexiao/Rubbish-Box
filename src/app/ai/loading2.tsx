import { useState, useEffect, useCallback, useRef } from "react"
import { View, Text as RNText, StatusBar as RNStatusBar, ActivityIndicator, ImageBackground, Animated } from "react-native"
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router"
import { WebView } from "react-native-webview"

import { globalImmersive } from "../../utils/globalImmersive"
import { createStyles } from "../../utils/rpxStyleSheet"
import { showError, showWarning } from "../../utils/toast"
import { API_BASE_URL } from "../../config/api"
import { getDeviceInfoForAPI } from "../../utils/deviceInfo"
import { useUserStore } from "../../stores/userStore"

// 生成初始 HTML（只生成一次）
const generateInitialHTML = () => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked@11.1.0/marked.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body {
      background-color: transparent;
      color: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      font-size: 16px;
      line-height: 1.6;
      padding: 8px;
      overflow-x: hidden;
    }
    #content { word-wrap: break-word; overflow-wrap: break-word; }
    h1, h2, h3 { color: #FFFFFF; font-weight: bold; margin: 12px 0 8px; }
    h1 { font-size: 22px; } h2 { font-size: 20px; } h3 { font-size: 18px; }
    p { margin: 4px 0; color: #FFFFFF; }
    strong { color: #FFD700; font-weight: bold; }
    code { background: rgba(255,255,255,0.2); padding: 2px 4px; border-radius: 4px; color: #00FF00; font-size: 14px; }
    pre { background: rgba(255,255,255,0.1); padding: 8px; border-radius: 4px; margin: 4px 0; overflow-x: auto; }
    ul, ol { margin: 4px 0; padding-left: 20px; }
    .katex { font-size: 16px; color: #FFFFFF !important; }
    .katex-display { margin: 8px 0; text-align: center; }
    .katex-display .katex { font-size: 18px; }
    .katex * { color: #FFFFFF !important; }
  </style>
</head>
<body>
  <div id="content"></div>
  <script>
    // 等待所有资源加载完成
    window.addEventListener('load', function() {
      console.log('✅ 所有资源加载完成，通知 React Native');
      // 通知 React Native WebView 已就绪
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage('WEBVIEW_READY');
      }
    });
    
    marked.setOptions({ breaks: true, gfm: true });
    
    function renderContent(text) {
      try {
        console.log('📝 WebView 收到内容 (前100字符):', text.substring(0, 100));
        
        // 先用 Markdown 渲染
        const html = marked.parse(text);
        document.getElementById('content').innerHTML = html;
        
        // 再用 KaTeX 渲染公式
        console.log('🔍 开始渲染公式，原始内容前100字符:', text.substring(0, 100));
        console.log('🔍 查找公式格式: \\( ... \\) 和 \\[ ... \\]');
        
        renderMathInElement(document.getElementById('content'), {
          delimiters: [
            {left: '\\[', right: '\\]', display: true},   // \[ \] - 块级
            {left: '$$', right: '$$', display: true},      // $$ $$ - 块级
            {left: '\\(', right: '\\)', display: false},   // \( \) - 行内
            {left: '$', right: '$', display: false}        // $ $ - 行内
          ],
          throwOnError: false,
          errorCallback: function(msg, err) {
            console.error('❌ KaTeX 渲染错误:', msg, err);
          }
        });
        
        console.log('✅ 公式渲染完成');
        
        // 自动滚动到底部
        window.scrollTo(0, document.body.scrollHeight);
      } catch (e) {
        console.error('❌ 渲染错误:', e);
      }
    }
    
    // 监听来自 React Native 的消息
    // React Native WebView 使用 document 而不是 window
    document.addEventListener('message', function(event) {
      console.log('📨 document 收到消息:', event.data);
      const data = event.data;
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'update' && parsed.content) {
            renderContent(parsed.content);
          }
        } catch (e) {
          console.log('⚠️ 非 JSON 消息，直接渲染:', e);
          // 如果不是 JSON，直接作为内容渲染
          renderContent(data);
        }
      }
    });
    
    // 同时也监听 window.addEventListener（兼容性）
    window.addEventListener('message', function(event) {
      console.log('📨 window 收到消息:', event.data);
      const data = event.data;
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'update' && parsed.content) {
            renderContent(parsed.content);
          }
        } catch (e) {
          console.log('⚠️ 非 JSON 消息，直接渲染:', e);
          renderContent(data);
        }
      }
    });
    
    console.log('✅ 消息监听器已设置');
    
    // 初始化空内容
    renderContent('');
  </script>
</body>
</html>
  `.trim()
}

/**
 * AI加载页面 - 使用统一 WebView 渲染
 */
export default function AILoadingScreen() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const [streamContent, setStreamContent] = useState("") 
  const [isStreaming, setIsStreaming] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [webViewReady, setWebViewReady] = useState(false) // 新增：WebView 就绪状态
  const hasStartedStream = useRef(false)
  const cursorOpacity = useRef(new Animated.Value(1)).current
  const contentBuffer = useRef("") 
  const displayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const xhrRef = useRef<XMLHttpRequest | null>(null)
  const webViewRef = useRef<WebView>(null)
  const pendingContentRef = useRef<string>("") // 新增：暂存等待发送的内容

  // 确保全屏沉浸式
  useFocusEffect(
    useCallback(() => {
      RNStatusBar.setHidden(true, "none")
      globalImmersive.forceRestore()
    }, []),
  )

  // 流式接收 AI 分析结果（保持原有逻辑）
  const startStreamingOCR = useCallback(async () => {
    if (!params.imguuid) {
      showWarning("参数缺失")
      setTimeout(() => router.back(), 1500)
      return
    }

    const uuid = params.imguuid as string
    const correctionType = params.type as string

    try {
      setIsStreaming(true)
      const deviceInfo = await getDeviceInfoForAPI()
      const token = useUserStore.getState().token
      const url = `${API_BASE_URL}/AppStart/aiStream/ai_ocr_stream/`
      const requestBody = { imguuid: uuid, type: correctionType, ...deviceInfo }
      
      return new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhrRef.current = xhr
        
        let previousLength = 0
        let chunkBuffer = ""
        
        const processChunk = (newData: string) => {
          chunkBuffer += newData
          const lines = chunkBuffer.split("\n")
          chunkBuffer = lines.pop() || ""
          
          for (const line of lines) {
            const trimmedLine = line.trim()
            if (!trimmedLine) continue
            
            if (trimmedLine === "[DONE]" || trimmedLine === "data: [DONE]") {
              setIsCompleted(true)
              setIsStreaming(false)
              continue
            }
            
            if (trimmedLine.startsWith("data:")) {
              const jsonStr = trimmedLine.substring(5).trim()
              if (!jsonStr) continue
              
              try {
                const json = JSON.parse(jsonStr)
                let content = json.content || json.text || json.data || json.message || ""
                
                if (content) {
                  contentBuffer.current += content
                }
                
                if (json.status === "done" || json.done || json.finished) {
                  setIsCompleted(true)
                  setIsStreaming(false)
                }
              } catch (e) {
                console.error("JSON解析失败:", e)
              }
            }
          }
        }
        
        xhr.onprogress = () => {
          const fullText = xhr.responseText
          if (fullText.length > previousLength) {
            const newChunk = fullText.substring(previousLength)
            previousLength = fullText.length
            processChunk(newChunk)
          }
        }
        
        xhr.onload = () => {
          if (previousLength < xhr.responseText.length) {
            const remaining = xhr.responseText.substring(previousLength)
            if (remaining.trim()) {
              processChunk(remaining)
            }
          }
          
          setIsCompleted(true)
          setIsStreaming(false)
          xhrRef.current = null
          resolve()
        }
        
        xhr.onerror = (error) => {
          console.error("XHR 请求失败:", error)
          setIsStreaming(false)
          xhrRef.current = null
          showError("AI 分析失败，请重试")
          setTimeout(() => router.back(), 2000)
          reject(error)
        }
        
        xhr.open("POST", url, true)
        xhr.setRequestHeader("Content-Type", "application/json")
        if (token) {
          xhr.setRequestHeader("Authorization", `Bearer ${token}`)
        }
        xhr.send(JSON.stringify(requestBody))
      })
    } catch (error) {
      setIsStreaming(false)
      showError("AI 分析失败，请重试")
      setTimeout(() => router.back(), 2000)
    }
  }, [params.imguuid, params.type, router])

  useEffect(() => {
    if (!hasStartedStream.current) {
      hasStartedStream.current = true
      startStreamingOCR()
    }
    
    return () => {
      if (xhrRef.current) {
        xhrRef.current.abort()
        xhrRef.current = null
      }
    }
  }, [startStreamingOCR])

  // 光标闪烁动画
  useEffect(() => {
    if (isStreaming && !isCompleted) {
      const blinkAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(cursorOpacity, { toValue: 0, duration: 530, useNativeDriver: true }),
          Animated.timing(cursorOpacity, { toValue: 1, duration: 530, useNativeDriver: true }),
        ])
      )
      blinkAnimation.start()
      return () => blinkAnimation.stop()
    }
    
    cursorOpacity.setValue(0)
    return undefined
  }, [isStreaming, isCompleted, cursorOpacity])

  // 逐字符显示效果
  useEffect(() => {
    if (!isStreaming && !isCompleted) return

    displayIntervalRef.current = setInterval(() => {
      if (contentBuffer.current.length > 0) {
        const charsToAdd = Math.min(5, contentBuffer.current.length)
        const nextChars = contentBuffer.current.substring(0, charsToAdd)
        contentBuffer.current = contentBuffer.current.substring(charsToAdd)
        
        setStreamContent(prev => {
          const newContent = prev + nextChars
          // 每50个字符打印一次
          if (newContent.length % 50 === 0) {
            console.log(`📊 当前内容长度: ${newContent.length}, 最后50字符:`, newContent.slice(-50))
          }
          return newContent
        })
      } else if (isCompleted) {
        if (displayIntervalRef.current) {
          clearInterval(displayIntervalRef.current)
          displayIntervalRef.current = null
          
          setTimeout(() => {
            const imguuid = params.imguuid as string
            const type = params.type as string
            router.replace({ pathname: "/ai/result", params: { batch_id: imguuid, type } })
          }, 500)
        }
      }
    }, 30)

    return () => {
      if (displayIntervalRef.current) {
        clearInterval(displayIntervalRef.current)
        displayIntervalRef.current = null
      }
    }
  }, [isStreaming, isCompleted, params.imguuid, params.type, router])

  // 实时更新 WebView 内容
  useEffect(() => {
    if (streamContent) {
      pendingContentRef.current = streamContent
      
      // 只有在 WebView 就绪后才发送
      if (webViewReady && webViewRef.current) {
        console.log(`🔄 发送内容到 WebView, 长度: ${streamContent.length}`)
        console.log(`📝 内容示例 (前200字符):`, streamContent.substring(0, 200))
        
        // 使用 postMessage 发送更新
        webViewRef.current.postMessage(JSON.stringify({
          type: 'update',
          content: streamContent
        }))
      } else {
        console.log(`⏳ WebView 未就绪，暂存内容: ${streamContent.length} 字符`)
      }
    }
  }, [streamContent, webViewReady])
  
  // WebView 就绪后发送暂存的内容
  useEffect(() => {
    if (webViewReady && pendingContentRef.current && webViewRef.current) {
      console.log(`✅ WebView 已就绪，发送暂存内容: ${pendingContentRef.current.length} 字符`)
      webViewRef.current.postMessage(JSON.stringify({
        type: 'update',
        content: pendingContentRef.current
      }))
    }
  }, [webViewReady])

  return (
    <ImageBackground
      source={require("../../../assets/images/al-loading-bg.png")}
      style={styles.loadingContainer}
      resizeMode="cover"
    >
      <View style={styles.contentContainer}>
        <RNText style={styles.title}>
          {params.type === "composition" ? "AI 正在批改作文..." : "AI 正在批改作业..."}
        </RNText>

        <View style={styles.streamContainer}>
          {isStreaming || isCompleted || streamContent ? (
            <>
              <WebView
                ref={webViewRef}
                originWhitelist={['*']}
                source={{ html: generateInitialHTML() }}
                style={styles.webView}
                scrollEnabled={true}
                showsVerticalScrollIndicator={true}
                javaScriptEnabled={true}
                domStorageEnabled={true}
                startInLoadingState={false}
                androidLayerType="hardware"
                onLoad={() => {
                  console.log('✅ WebView 加载完成')
                  setWebViewReady(true)
                }}
                onMessage={(event) => {
                  const message = event.nativeEvent.data
                  console.log('📨 WebView 消息:', message)
                  
                  // 监听 WebView 资源加载完成消息
                  if (message === 'WEBVIEW_READY') {
                    console.log('✅ WebView 资源已就绪（来自 WebView 内部）')
                    setWebViewReady(true)
                  }
                }}
                onError={(syntheticEvent) => {
                  const { nativeEvent } = syntheticEvent
                  console.error('❌ WebView 加载错误:', nativeEvent)
                }}
              />
              {(isStreaming || !isCompleted) && (
                <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>
                  ▌
                </Animated.Text>
              )}
            </>
          ) : (
            <View style={styles.loadingPlaceholder}>
              <ActivityIndicator size="large" color="#fff" />
              <RNText style={styles.loadingText}>准备开始批改...</RNText>
            </View>
          )}
        </View>
      </View>
    </ImageBackground>
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
    alignSelf: "center" as const,
    width: 400,
    height: 155,
    marginTop: -60,
    marginLeft: -15,
  },
  webView: {
    flex: 1,
    width: 400,
    backgroundColor: "transparent",
  },
  cursor: {
    fontSize: 12.375,
    lineHeight: 20,
    color: "#4891FF",
    fontWeight: "bold" as const,
    marginLeft: 2,
    marginTop: 4,
  },
  loadingPlaceholder: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    minHeight: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 9.375,
    color: "#666",
  },
})

