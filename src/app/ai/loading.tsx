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
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" onerror="console.error('KaTeX CSS 加载失败')">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js" onerror="console.error('KaTeX JS 加载失败')"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js" onerror="console.error('KaTeX auto-render 加载失败')"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked@11.1.0/marked.min.js" onerror="console.error('Marked 加载失败')"></script>
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
    var webviewStartTime = Date.now();
    console.log('🚀 WebView 脚本开始执行, 时间戳:', webviewStartTime);
    
    // 立即通知 React Native（不等待外部资源）
    setTimeout(function() {
      var timeoutTime = Date.now();
      console.log('⏰ 超时触发(' + (timeoutTime - webviewStartTime) + 'ms)，立即通知 React Native');
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage('WEBVIEW_READY');
      }
    }, 500); // 500ms 后强制就绪
    
    // 等待所有资源加载完成（备用）
    window.addEventListener('load', function() {
      var loadTime = Date.now();
      console.log('✅ 所有资源加载完成 (' + (loadTime - webviewStartTime) + 'ms)');
    });
    
    // 检查依赖是否加载成功
    setTimeout(function() {
      var checkTime = Date.now();
      console.log('🔍 检查依赖(' + (checkTime - webviewStartTime) + 'ms): marked=' + (typeof marked !== 'undefined') + ', katex=' + (typeof katex !== 'undefined'));
    }, 100);
    
    // 安全初始化 marked
    if (typeof marked !== 'undefined') {
      marked.setOptions({ breaks: true, gfm: true });
    }
    
    var firstRenderTime = 0;
    
    function renderContent(text) {
      try {
        var renderStart = Date.now();
        
        const contentDiv = document.getElementById('content');
        if (!contentDiv) return;
        
        // 如果 marked 可用，用 Markdown 渲染；否则直接显示文本
        if (typeof marked !== 'undefined' && marked.parse) {
          const html = marked.parse(text);
          contentDiv.innerHTML = html;
        } else {
          // 降级方案：直接显示纯文本，保留换行
          contentDiv.innerHTML = '<pre style="white-space: pre-wrap; font-family: inherit;">' + 
            text.replace(/</g, '&lt;').replace(/>/g, '&gt;') + 
            '</pre>';
        }
        
        // 如果 KaTeX 可用，渲染公式
        if (typeof renderMathInElement !== 'undefined') {
          renderMathInElement(contentDiv, {
            delimiters: [
              {left: '\\[', right: '\\]', display: true},
              {left: '$$', right: '$$', display: true},
              {left: '\\(', right: '\\)', display: false},
              {left: '$', right: '$', display: false}
            ],
            throwOnError: false
          });
        }
        
        // 自动滚动到底部
        window.scrollTo(0, document.body.scrollHeight);
        
        var renderEnd = Date.now();
        if (firstRenderTime === 0 && text.length > 0) {
          firstRenderTime = renderEnd;
          console.log('🎨 首次渲染完成 (' + (renderEnd - webviewStartTime) + 'ms from start, ' + (renderEnd - renderStart) + 'ms render time)');
        }
      } catch (e) {
        console.error('❌ 渲染错误:', e);
        // 最后的降级方案：直接显示文本
        document.getElementById('content').textContent = text;
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
  const [webViewReady, setWebViewReady] = useState(false) // WebView 就绪状态
  const [isFormatting, setIsFormatting] = useState(false) // 是否在格式化数据
  const hasStartedStream = useRef(false)
  const cursorOpacity = useRef(new Animated.Value(1)).current
  const contentBuffer = useRef("") // 完整内容缓冲区
  const displayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const xhrRef = useRef<XMLHttpRequest | null>(null)
  const webViewRef = useRef<WebView>(null)
  const canStartDisplay = useRef(false) // 是否可以开始显示（WebView 就绪 + 有内容）
  const isFormattingRef = useRef(false) // 是否在格式化阶段（用于停止接收内容）
  
  const MAX_DISPLAY_LENGTH = 800 // 最大显示字符数
  
  // 性能监控时间戳
  const perfTimestamps = useRef({
    pageEnter: Date.now(),
    xhrStart: 0,
    webviewHtmlLoaded: 0,
    webviewReady: 0,
    firstDataReceived: 0,
    firstContentDisplayed: 0,
  })
  
  // 打印耗时
  const logDuration = (label: string, startKey: keyof typeof perfTimestamps.current, endTime = Date.now()) => {
    const startTime = perfTimestamps.current[startKey]
    if (startTime > 0) {
      console.log(`⏱️ ${label}: ${endTime - startTime}ms`)
    }
  }
  
  // 页面进入时打印
  useEffect(() => {
    console.log('📍 ============ 页面加载开始 ============')
    console.log(`⏱️ 页面进入时间戳: ${perfTimestamps.current.pageEnter}`)
  }, [])

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
                
                // 优先检测 done 信号（无论什么阶段都要处理）
                if (json.status === "done" || json.done || json.finished) {
                  console.log('✅ 流式接收完成')
                  isFormattingRef.current = false
                  setIsCompleted(true)
                  setIsStreaming(false)
                  setIsFormatting(false)
                  return
                }
                
                // 检测格式化阶段
                if (json.status === "stage_end" && json.stage === 1) {
                  console.log('📋 进入格式化阶段:', json.message)
                  isFormattingRef.current = true
                  setIsFormatting(true)
                  // 不要设置 isStreaming = false，否则定时器会停止
                  return
                }
                
                // 格式化阶段不处理内容
                if (isFormattingRef.current) {
                  return
                }
                
                let content = json.content || json.text || json.data || json.message || ""
                
                if (content) {
                  contentBuffer.current += content
                  
                  // 记录第一次接收数据
                  if (perfTimestamps.current.firstDataReceived === 0) {
                    perfTimestamps.current.firstDataReceived = Date.now()
                    logDuration('页面进入 → 首次接收数据', 'pageEnter', perfTimestamps.current.firstDataReceived)
                    logDuration('XHR 开始 → 首次接收数据', 'xhrStart', perfTimestamps.current.firstDataReceived)
                  }
                  
                  // 每500字符打印一次
                  if (contentBuffer.current.length % 500 < content.length) {
                    console.log(`📥 已接收 ${contentBuffer.current.length} 字符`)
                  }
                }
              } catch (e) {
                console.error("❌ JSON解析失败:", e)
              }
            }
          }
        }
        
        xhr.onprogress = () => {
          const fullText = xhr.responseText
          if (fullText.length > previousLength) {
            const newChunk = fullText.substring(previousLength)
            // 每10KB打印一次进度
            if (fullText.length % 10000 < newChunk.length) {
              console.log(`📡 接收进度: ${(fullText.length / 1024).toFixed(1)} KB`)
            }
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
        
        // 记录 XHR 开始时间（在 send 之前）
        perfTimestamps.current.xhrStart = Date.now()
        console.log('📤 XHR 请求开始发送...')
        logDuration('页面进入 → XHR 开始', 'pageEnter', perfTimestamps.current.xhrStart)
        
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

  // WebView 就绪后才允许开始显示
  useEffect(() => {
    if (webViewReady && isStreaming) {
      canStartDisplay.current = true
      console.log('✅ WebView 就绪 + 流式开始，允许显示内容')
      
      // 打印总耗时
      console.log('📊 ============ 性能汇总 ============')
      logDuration('总耗时（页面进入 → WebView 就绪）', 'pageEnter', perfTimestamps.current.webviewReady)
      console.log('🔍 细分耗时：')
      logDuration('  ├─ 页面进入 → XHR 开始', 'pageEnter', perfTimestamps.current.xhrStart)
      logDuration('  ├─ 页面进入 → WebView HTML 加载', 'pageEnter', perfTimestamps.current.webviewHtmlLoaded)
      logDuration('  ├─ WebView HTML 加载 → CDN 资源就绪', 'webviewHtmlLoaded', perfTimestamps.current.webviewReady)
      if (perfTimestamps.current.firstDataReceived > 0) {
        logDuration('  ├─ XHR 开始 → 后端首次响应', 'xhrStart', perfTimestamps.current.firstDataReceived)
      }
      console.log('📊 ===================================')
    }
  }, [webViewReady, isStreaming])

  // 逐字符显示效果（只在 WebView 就绪后执行）
  useEffect(() => {
    // 必须 WebView 就绪才能开始
    if (!webViewReady) {
      console.log('⏳ WebView 未就绪，等待...')
      return
    }
    
    if (!isStreaming && !isCompleted) {
      // console.log('⏳ 等待流式开始或完成...')
      return
    }

    // console.log('🚀 开始逐字符显示定时器')
    displayIntervalRef.current = setInterval(() => {
      // 格式化阶段不再显示新内容
      if (isFormattingRef.current) {
        return
      }
      
      if (contentBuffer.current.length > 0) {
        const charsToAdd = Math.min(5, contentBuffer.current.length)
        const nextChars = contentBuffer.current.substring(0, charsToAdd)
        contentBuffer.current = contentBuffer.current.substring(charsToAdd)
        
        // 减少日志频率
        if (contentBuffer.current.length % 500 === 0) {
          // console.log(`📝 显示进度: buffer剩余 ${contentBuffer.current.length} 字符`)
        }
        
        setStreamContent(prev => {
          // 本地保存完整内容（不删除）
          const newContent = prev + nextChars
          
          // 记录第一次显示内容
          if (prev.length === 0 && newContent.length > 0 && perfTimestamps.current.firstContentDisplayed === 0) {
            perfTimestamps.current.firstContentDisplayed = Date.now()
            console.log('🎨 首次内容显示到 WebView')
            logDuration('页面进入 → 首次显示', 'pageEnter', perfTimestamps.current.firstContentDisplayed)
            logDuration('首次接收 → 首次显示', 'firstDataReceived', perfTimestamps.current.firstContentDisplayed)
          }
          
          // 返回完整内容（不截取）
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
  }, [webViewReady, isStreaming, isCompleted, params.imguuid, params.type, router])

  // 实时更新 WebView 内容（只在 WebView 就绪后发送，并限制长度）
  useEffect(() => {
    if (!streamContent) return
    
    // 只有在 WebView 就绪后才发送
    if (webViewReady && webViewRef.current) {
      // 实现"阅后即焚"：只发送最新的 2000 字符到 WebView
      const displayContent = streamContent.length > MAX_DISPLAY_LENGTH 
        ? streamContent.slice(-MAX_DISPLAY_LENGTH) 
        : streamContent
      
      // 只在发送时打印（减少日志）
      // if (streamContent.length % 200 === 0 || streamContent.length < 100) {
      //   console.log(`🔄 发送到 WebView: 总${streamContent.length}字符, 显示${displayContent.length}字符`)
      //   console.log(`📝 显示内容前100字符:`, displayContent.substring(0, 100))
      // }
      
      // 使用 postMessage 发送更新
      webViewRef.current.postMessage(JSON.stringify({
        type: 'update',
        content: displayContent
      }))
    } else {
      console.log(`⏳ WebView 未就绪，等待加载完成...`)
    }
  }, [streamContent, webViewReady])

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
          {/* 立即创建 WebView，不等待条件 */}
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
              perfTimestamps.current.webviewHtmlLoaded = Date.now()
              console.log('🔄 WebView HTML 加载完成，等待资源就绪...')
              logDuration('页面进入 → WebView HTML 加载', 'pageEnter', perfTimestamps.current.webviewHtmlLoaded)
            }}
            onMessage={(event) => {
              const message = event.nativeEvent.data
              console.log('📨 收到 WebView 消息:', message)
              
              // 只有收到 WEBVIEW_READY 消息才认为真正就绪（确保 KaTeX 等库已加载）
              if (message === 'WEBVIEW_READY') {
                perfTimestamps.current.webviewReady = Date.now()
                console.log('✅ WebView 所有资源已就绪，可以开始渲染内容')
                logDuration('WebView HTML 加载 → 资源就绪', 'webviewHtmlLoaded', perfTimestamps.current.webviewReady)
                logDuration('页面进入 → WebView 资源就绪', 'pageEnter', perfTimestamps.current.webviewReady)
                setWebViewReady(true)
              }
            }}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent
              console.error('❌ WebView 加载错误:', nativeEvent)
            }}
          />
          
          {/* 格式化提示 */}
          {isFormatting && (
            <View style={styles.formattingContainer}>
              <ActivityIndicator size="small" color="#4891FF" />
              <RNText style={styles.formattingText}>正在格式化数据...</RNText>
            </View>
          )}
          
          {/* 光标动画 - 格式化时不显示 */}
          {(isStreaming || !isCompleted) && !isFormatting && (
            <Animated.Text style={[styles.cursor, { opacity: cursorOpacity }]}>
              ▌
            </Animated.Text>
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
  formattingContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginTop: 10,
  },
  formattingText: {
    marginLeft: 8,
    fontSize: 12,
    color: "#4891FF",
    fontWeight: "500" as const,
  },
})

