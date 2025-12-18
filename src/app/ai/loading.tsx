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
import { useActivityTracking } from "../../hooks/useActivityTracking"

// 生成初始 HTML（只生成一次）
const generateInitialHTML = () => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <script>
    // 辅助函数：同时打印到 console 和发送到 React Native
    // 提前定义，确保在资源加载事件中可用
    function logToRN(message) {
      // console.log(message);
      if (window.ReactNativeWebView) {
        try {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'log', message: message }));
        } catch (e) {
          console.error('发送日志失败:', e);
        }
      }
    }
    
    var webviewStartTime = Date.now();
  </script>
  <link rel="stylesheet" href="file:///android_asset/katex/katex.min.css" 
    onload="if(typeof logToRN==='function'){var loadTime=Date.now();var elapsed=loadTime-webviewStartTime;logToRN('✅ KaTeX CSS 加载成功 ('+elapsed+'ms)');}else{var loadTime=Date.now();console.log('✅ KaTeX CSS 加载成功 ('+(loadTime-webviewStartTime)+'ms)');}" 
    onerror="if(typeof logToRN==='function'){var errorTime=Date.now();var elapsed=errorTime-webviewStartTime;logToRN('❌ KaTeX CSS 加载失败 ('+elapsed+'ms)');}else{var errorTime=Date.now();console.error('❌ KaTeX CSS 加载失败 ('+(errorTime-webviewStartTime)+'ms)');}">
  <script src="file:///android_asset/katex/katex.min.js" defer 
    onload="if(typeof logToRN==='function'){var loadTime=Date.now();var elapsed=loadTime-webviewStartTime;logToRN('✅ KaTeX JS 加载成功 ('+elapsed+'ms)');}else{var loadTime=Date.now();console.log('✅ KaTeX JS 加载成功 ('+(loadTime-webviewStartTime)+'ms)');}" 
    onerror="if(typeof logToRN==='function'){var errorTime=Date.now();var elapsed=errorTime-webviewStartTime;logToRN('❌ KaTeX JS 加载失败 ('+elapsed+'ms)');}else{var errorTime=Date.now();console.error('❌ KaTeX JS 加载失败 ('+(errorTime-webviewStartTime)+'ms)');}"></script>
  <script src="file:///android_asset/katex/auto-render.min.js" defer 
    onload="if(typeof logToRN==='function'){var loadTime=Date.now();var elapsed=loadTime-webviewStartTime;logToRN('✅ KaTeX auto-render 加载成功 ('+elapsed+'ms)');}else{var loadTime=Date.now();console.log('✅ KaTeX auto-render 加载成功 ('+(loadTime-webviewStartTime)+'ms)');}" 
    onerror="if(typeof logToRN==='function'){var errorTime=Date.now();var elapsed=errorTime-webviewStartTime;logToRN('❌ KaTeX auto-render 加载失败 ('+elapsed+'ms)');}else{var errorTime=Date.now();console.error('❌ KaTeX auto-render 加载失败 ('+(errorTime-webviewStartTime)+'ms)');}"></script>
  <script src="file:///android_asset/katex/marked.min.js" defer 
    onload="if(typeof logToRN==='function'){var loadTime=Date.now();var elapsed=loadTime-webviewStartTime;logToRN('✅ Marked 加载成功 ('+elapsed+'ms)');}else{var loadTime=Date.now();console.log('✅ Marked 加载成功 ('+(loadTime-webviewStartTime)+'ms)');}" 
    onerror="if(typeof logToRN==='function'){var errorTime=Date.now();var elapsed=errorTime-webviewStartTime;logToRN('❌ Marked 加载失败 ('+elapsed+'ms)');}else{var errorTime=Date.now();console.error('❌ Marked 加载失败 ('+(errorTime-webviewStartTime)+'ms)');}"></script>
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
    // logToRN 已在 head 中定义
    
    // 立即发送测试消息
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage('SCRIPT_START');
    }
    
    // webviewStartTime 已在 head 中定义
    logToRN('🚀 WebView 脚本开始执行, 时间戳: ' + webviewStartTime);
    logToRN('📍 document.readyState: ' + document.readyState);
    
    // 监控文档加载状态
    document.addEventListener('DOMContentLoaded', function() {
      var elapsed = Date.now() - webviewStartTime;
      logToRN('📄 DOMContentLoaded 触发 (' + elapsed + 'ms)');
    });
    
    // 监控所有资源加载
    window.addEventListener('load', function() {
      var loadTime = Date.now();
      var elapsed = loadTime - webviewStartTime;
      logToRN('✅ window.load 事件触发：所有资源加载完成 (' + elapsed + 'ms)');
    });
    
    // 监控资源加载错误
    window.addEventListener('error', function(e) {
      console.error('❌ 资源加载错误:', e.target.tagName, e.target.src || e.target.href);
    }, true);
    
    // 立即检查依赖
    logToRN('🔍 立即检查依赖: marked=' + (typeof marked !== 'undefined') + ', katex=' + (typeof katex !== 'undefined') + ', renderMathInElement=' + (typeof renderMathInElement !== 'undefined'));
    
    // 100ms 后再检查一次
    setTimeout(function() {
      var checkTime = Date.now();
      var elapsed = checkTime - webviewStartTime;
      logToRN('🔍 100ms后检查依赖(' + elapsed + 'ms): marked=' + (typeof marked !== 'undefined') + ', katex=' + (typeof katex !== 'undefined') + ', renderMathInElement=' + (typeof renderMathInElement !== 'undefined'));
    }, 100);
    
    // 重试机制：尝试发送 WEBVIEW_READY 消息
    var readyMessageSent = false;
    var maxRetries = 20; // 最多重试20次（总共约2秒）
    var retryCount = 0;
    
    function trySendReadyMessage() {
      retryCount++;
      var currentTime = Date.now();
      var elapsed = currentTime - webviewStartTime;
      
      if (readyMessageSent) {
        return; // 已经发送成功，不再重试
      }
      
      logToRN('⏰ 尝试发送 WEBVIEW_READY (第' + retryCount + '次, ' + elapsed + 'ms)');
      logToRN('🔍 最终依赖状态: marked=' + (typeof marked !== 'undefined') + ', katex=' + (typeof katex !== 'undefined'));
      logToRN('🔍 检查 window.ReactNativeWebView 是否存在: ' + typeof window.ReactNativeWebView);
      
      if (window.ReactNativeWebView) {
        try {
        window.ReactNativeWebView.postMessage('WEBVIEW_READY');
          readyMessageSent = true;
          logToRN('✅ window.ReactNativeWebView 存在，发送 WEBVIEW_READY 消息成功 (第' + retryCount + '次尝试)');
          logToRN('✅ postMessage(WEBVIEW_READY) 已调用');
        } catch (e) {
          logToRN('❌ postMessage 调用失败: ' + e.toString());
          // 继续重试
          if (retryCount < maxRetries) {
            setTimeout(trySendReadyMessage, 100);
      } else {
            logToRN('❌ 达到最大重试次数，停止重试');
          }
        }
      } else {
        logToRN('⚠️ window.ReactNativeWebView 不存在 (第' + retryCount + '次尝试)');
        // 继续重试
        if (retryCount < maxRetries) {
          setTimeout(trySendReadyMessage, 100);
        } else {
          logToRN('❌ 达到最大重试次数，window.ReactNativeWebView 仍未就绪');
        }
      }
    }
    
    // 500ms 后开始第一次尝试（不等待 CDN）
    setTimeout(trySendReadyMessage, 500);
    
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
          var elapsedFromStart = renderEnd - webviewStartTime;
          var renderTime = renderEnd - renderStart;
          logToRN('🎨 首次渲染完成 (' + elapsedFromStart + 'ms from start, ' + renderTime + 'ms render time)');
        }
      } catch (e) {
        logToRN('❌ 渲染错误: ' + e.toString());
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
    
    logToRN('✅ 消息监听器已设置');
    
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
  
  // 活动追踪 - 追踪AI批改行为
  const { startHomework, endHomework, startComposition, endComposition } = useActivityTracking({
    autoExitOnUnmount: true,
  })
  const cursorOpacity = useRef(new Animated.Value(1)).current
  const contentBuffer = useRef("") // 完整内容缓冲区
  const displayIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const xhrRef = useRef<XMLHttpRequest | null>(null)
  const webViewRef = useRef<WebView>(null)
  const canStartDisplay = useRef(false) // 是否可以开始显示（WebView 就绪 + 有内容）
  const isFormattingRef = useRef(false) // 是否在格式化阶段（用于停止接收内容）
  const webViewReadyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null) // WebView 就绪超时定时器
  const webViewReadyFallbackTriggered = useRef(false) // 是否已触发降级机制
  const webViewRetryCount = useRef(0) // WebView 重试次数
  const MAX_WEBVIEW_RETRIES = 2 // 最大重试次数
  
  const MAX_DISPLAY_LENGTH = 800 // 最大显示字符数
  const WEBVIEW_READY_TIMEOUT = 2000 // WebView 就绪超时时间（2秒）
  
  // 性能监控时间戳
  const perfTimestamps = useRef({
    pageEnter: Date.now(),
    xhrStart: 0,
    webviewLoadStart: 0, // WebView 开始加载时间
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
    console.log(`📊 初始状态: webViewReady=${webViewReady}, isStreaming=${isStreaming}, isCompleted=${isCompleted}`)
  }, [])
  
  // 监控关键状态变化
  useEffect(() => {
    console.log(`🔄 状态变化: webViewReady=${webViewReady}, isStreaming=${isStreaming}, isCompleted=${isCompleted}`)
    if (isCompleted) {
      console.log('🎯🎯🎯 isCompleted 状态变为 true，应该触发跳转检查')
    }
  }, [webViewReady, isStreaming, isCompleted])
  
  // 专门监控 webViewReady 状态
  useEffect(() => {
    console.log(`📺 WebView 就绪状态变化: webViewReady=${webViewReady}`)
    if (webViewReady) {
      console.log('✅✅✅ WebView 已就绪！可以开始显示内容了')
      // 如果已经就绪，清除超时定时器
      if (webViewReadyTimeoutRef.current) {
        clearTimeout(webViewReadyTimeoutRef.current)
        webViewReadyTimeoutRef.current = null
      }
    } else {
      console.log('⏳⏳⏳ WebView 未就绪，等待中...')
    }
  }, [webViewReady])

  // 超时降级机制：如果 2 秒后仍未收到 WEBVIEW_READY，强制标记为就绪
  useEffect(() => {
    // 基于 WebView 开始加载或 HTML 加载完成时间启动超时（哪个先有就用哪个）
    const webViewStartTime = perfTimestamps.current.webviewHtmlLoaded > 0 
      ? perfTimestamps.current.webviewHtmlLoaded 
      : perfTimestamps.current.webviewLoadStart
    
    if (webViewStartTime > 0 && !webViewReady && !webViewReadyFallbackTriggered.current) {
      const elapsed = Date.now() - webViewStartTime
      const remainingTimeout = Math.max(0, WEBVIEW_READY_TIMEOUT - elapsed)
      
      console.log(`⏰ 启动 WebView 就绪超时降级机制，${remainingTimeout}ms 后强制标记为就绪 (已等待 ${elapsed}ms)`)
      
      webViewReadyTimeoutRef.current = setTimeout(() => {
        if (!webViewReady) {
          webViewReadyFallbackTriggered.current = true
          perfTimestamps.current.webviewReady = Date.now()
          console.log('⚠️ WebView 就绪超时，启用降级机制：强制标记为就绪')
          if (perfTimestamps.current.webviewHtmlLoaded > 0) {
            logDuration('WebView HTML 加载 → 降级就绪', 'webviewHtmlLoaded', perfTimestamps.current.webviewReady)
          } else {
            logDuration('WebView 开始加载 → 降级就绪', 'webviewLoadStart', perfTimestamps.current.webviewReady)
          }
          logDuration('页面进入 → WebView 降级就绪', 'pageEnter', perfTimestamps.current.webviewReady)
          setWebViewReady(true)
          console.log('✅ setWebViewReady(true) 已调用（降级机制）')
        }
      }, remainingTimeout)
      
      return () => {
        if (webViewReadyTimeoutRef.current) {
          clearTimeout(webViewReadyTimeoutRef.current)
          webViewReadyTimeoutRef.current = null
        }
      }
    }
    
    return undefined
  }, [perfTimestamps.current.webviewLoadStart, perfTimestamps.current.webviewHtmlLoaded, webViewReady])

  // 确保全屏沉浸式
  useFocusEffect(
    useCallback(() => {
      RNStatusBar.setHidden(true, "none")
      globalImmersive.forceRestore()
      
      return () => {
        // 页面失焦时发送退出消息（如果还在批改中）
        console.log("📊 [活动追踪] loading页面失焦，退出批改")
        const correctionType = params.type as string
        if (correctionType === "composition") {
          endComposition()
        } else if (correctionType === "question") {
          endHomework()
        }
      }
    }, [params.type, endHomework, endComposition]),
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

    // 📊 启动活动追踪
    if (correctionType === "composition") {
      console.log("📊 [活动追踪] 启动作文批改追踪")
      startComposition({
        compositionId: uuid,
        compositionName: "AI作文批改",
      })
    } else if (correctionType === "question") {
      console.log("📊 [活动追踪] 启动作业批改追踪")
      startHomework({
        homeworkId: uuid,
        homeworkName: "AI作业批改",
      })
    }

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
            // console.log('trimmedLine', trimmedLine)
            if (!trimmedLine) continue
            
            if (trimmedLine === "[DONE]" || trimmedLine === "data: [DONE]") {
              //  console.log('✅ 流式接收完成1')
              // console.log('🔄 准备设置 isCompleted=true, isStreaming=false')
              setIsCompleted(true)
              setIsStreaming(false)
              // console.log('✅ setIsCompleted(true) 已调用')
              continue
            }
            
            if (trimmedLine.startsWith("data:")) {
              const jsonStr = trimmedLine.substring(5).trim()
              if (!jsonStr) continue
              
              try {
                const json = JSON.parse(jsonStr)
                // console.log('json', json)
                // 优先检测 done 信号（无论什么阶段都要处理）
                if (json.status === "done" || json.done || json.finished) {
                  // console.log('✅ 流式接收完成2') 
                  // console.log('🔄 准备设置 isCompleted=true (JSON done信号)')
                  isFormattingRef.current = false
                  setIsCompleted(true)
                  setIsStreaming(false)
                  setIsFormatting(false)
                  // console.log('✅ setIsCompleted(true) 已调用 (JSON done信号)')
                  return
                }
                
                // 检测格式化阶段
                if (json.status === "stage_end" && json.stage === 1) {
                  // console.log('📋 进入格式化阶段:', json.message)
                  isFormattingRef.current = true
                  setIsFormatting(true)
                  // 不要设置 isStreaming = false，否则定时器会停止
                  return
                }
                
                // 格式化阶段不处理内容
                if (isFormattingRef.current) {
                  // console.log('⚠️ 格式化阶段，跳过内容处理')
                  return
                }
                
                let content = json.content || json.text || json.data || json.message || ""
                
                if (content) {
                  const beforeLength = contentBuffer.current.length
                  contentBuffer.current += content
                  const afterLength = contentBuffer.current.length
                  
                  // 记录第一次接收数据
                  if (perfTimestamps.current.firstDataReceived === 0) {
                    perfTimestamps.current.firstDataReceived = Date.now()
                    logDuration('页面进入 → 首次接收数据', 'pageEnter', perfTimestamps.current.firstDataReceived)
                    logDuration('XHR 开始 → 首次接收数据', 'xhrStart', perfTimestamps.current.firstDataReceived)
                  }
                  
                  // 每500字符打印一次，或者每次添加内容时打印（前几次）
                  // if (contentBuffer.current.length % 500 < content.length || contentBuffer.current.length < 100) {
                  //   console.log(`📥 已接收 ${contentBuffer.current.length} 字符 (本次添加 ${content.length} 字符, 从 ${beforeLength} 到 ${afterLength})`)
                  // }
                } else {
                  console.log('⚠️ JSON 中无内容字段:', JSON.stringify(json).substring(0, 100))
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
            // if (fullText.length % 10000 < newChunk.length) {
            //   console.log(`📡 接收进度: ${(fullText.length / 1024).toFixed(1)} KB`)
            // }
            previousLength = fullText.length
            processChunk(newChunk)
          }
        }
        
        xhr.onload = () => {
          console.log('📡 XHR onload 触发')
          if (previousLength < xhr.responseText.length) {
            const remaining = xhr.responseText.substring(previousLength)
            if (remaining.trim()) {
              processChunk(remaining)
            }
          }
          
          // console.log('🔄 XHR onload: 准备设置 isCompleted=true')
          setIsCompleted(true)
          setIsStreaming(false)
          xhrRef.current = null
          // console.log('✅ XHR onload: setIsCompleted(true) 已调用')
          resolve()
        }
        
        xhr.onerror = (error) => {
          console.error("AI 分析请求失败:", error)
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
    console.log(`🔍 显示条件检查: webViewReady=${webViewReady}, isStreaming=${isStreaming}, isCompleted=${isCompleted}`)
    
    // 必须 WebView 就绪才能开始
    if (!webViewReady) {
      console.log('⏳ WebView 未就绪，等待...')
      return
    }
    
    if (!isStreaming && !isCompleted) {
      console.log('⏳ 等待流式开始或完成...')
      return
    }

    console.log('🚀 开始逐字符显示定时器')
    console.log(`📊 定时器创建时状态: isCompleted=${isCompleted}, isStreaming=${isStreaming}, buffer长度=${contentBuffer.current.length}`)
    displayIntervalRef.current = setInterval(() => {
      const bufferLength = contentBuffer.current.length
      const isFormatting = isFormattingRef.current
      
      // 🔍 优先检查 isCompleted，如果已完成，立即跳转（不处理 buffer）
      if (isCompleted) {
        console.log('🎯🎯🎯 定时器检测到 isCompleted=true, buffer长度=' + bufferLength + ', 立即准备跳转')
        if (displayIntervalRef.current) {
          console.log('🛑 清除定时器，准备跳转')
          clearInterval(displayIntervalRef.current)
          displayIntervalRef.current = null
          console.log('✅ 定时器已清除')
          
          const imguuid = params.imguuid as string
          const type = params.type as string
          console.log(`🚀 准备跳转到 /ai/result, imguuid=${imguuid}, type=${type}`)
          
          setTimeout(() => {
            console.log('⏰ 500ms延迟后执行跳转')
            router.replace({ pathname: "/ai/result", params: { batch_id: imguuid, type } })
            console.log('✅ router.replace 已调用')
          }, 500)
        } else {
          console.log('⚠️ displayIntervalRef.current 为 null，无法清除定时器')
        }
        return // 立即返回，不处理 buffer
      }
      
      // 格式化阶段时，如果 contentBuffer 有内容，继续显示；如果没有内容，才暂停
      if (isFormatting && bufferLength === 0) {
        // console.log('⏸️ 格式化阶段，buffer为空，暂停显示')
        return
      }
      
      if (bufferLength > 0) {
        const charsToAdd = Math.min(5, bufferLength)
        const nextChars = contentBuffer.current.substring(0, charsToAdd)
        contentBuffer.current = contentBuffer.current.substring(charsToAdd)
        
        // 减少日志频率，但前几次和每500字符时打印
        // if (contentBuffer.current.length % 500 === 0 || contentBuffer.current.length < 100) {
        //   console.log(`📝 显示进度: buffer剩余 ${contentBuffer.current.length} 字符 (取出了 ${charsToAdd} 字符, 格式化阶段: ${isFormatting})`)
        // }
        
        setStreamContent(prev => {
          // 本地保存完整内容（不删除）
          const newContent = prev + nextChars
          
          // console.log(`📝 setStreamContent: prev长度=${prev.length}, 新增=${nextChars.length}, 总长度=${newContent.length}`)
          
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
      } else {
        // buffer 为空，但还没完成
        // 每100次打印一次，避免日志过多
        if (Math.random() < 0.01) {
          console.log(`⏳ buffer为空，等待数据 (格式化阶段: ${isFormattingRef.current}, isStreaming: ${isStreaming}, isCompleted: ${isCompleted})`)
        }
      }
    }, 30)

    return () => {
      console.log('🧹 useEffect cleanup: 清除定时器, isCompleted=' + isCompleted)
      if (displayIntervalRef.current) {
        clearInterval(displayIntervalRef.current)
        displayIntervalRef.current = null
        console.log('✅ 定时器已清除 (cleanup)')
      } else {
        console.log('⚠️ displayIntervalRef.current 为 null (cleanup)')
      }
    }
  }, [webViewReady, isStreaming, isCompleted, params.imguuid, params.type, router])

  // 实时更新 WebView 内容（只在 WebView 就绪后发送，并限制长度）
  useEffect(() => {
    // console.log(`🔍 WebView 发送检查: streamContent长度=${streamContent.length}, webViewReady=${webViewReady}, webViewRef存在=${!!webViewRef.current}`)
    
    if (!streamContent) {
      console.log('⚠️ streamContent 为空，跳过发送')
      return
    }
    
    // 只有在 WebView 就绪后才发送
    if (webViewReady && webViewRef.current) {
      // 实现"阅后即焚"：只发送最新的 2000 字符到 WebView
      const displayContent = streamContent.length > MAX_DISPLAY_LENGTH 
        ? streamContent.slice(-MAX_DISPLAY_LENGTH) 
        : streamContent
      
      // 每次都打印发送信息（调试用）
      if (streamContent.length % 100 < 10 || streamContent.length < 100) {
        // console.log(`🔄 发送到 WebView: 总${streamContent.length}字符, 显示${displayContent.length}字符`)
        // console.log(`📝 显示内容前100字符:`, displayContent.substring(0, 100))
      }
      
      // 使用 postMessage 发送更新
      webViewRef.current.postMessage(JSON.stringify({
        type: 'update',
        content: displayContent
      }))
    } else {
      console.log(`⏳ WebView 未就绪(${webViewReady})，内容长度: ${streamContent.length}`)
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
            source={{ html: generateInitialHTML(), baseUrl: 'https://xiaohetx.cn' }}
            style={styles.webView}
            scrollEnabled={true}
            showsVerticalScrollIndicator={true}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={false}
            androidLayerType="hardware"
            mixedContentMode="always"
            allowFileAccess={true}
            allowUniversalAccessFromFileURLs={true}
            cacheEnabled={false}
            incognito={true}
            onLoadStart={() => {
              perfTimestamps.current.webviewLoadStart = Date.now()
              console.log('🌐 WebView onLoadStart: 开始加载 HTML')
              logDuration('页面进入 → WebView 开始加载', 'pageEnter', perfTimestamps.current.webviewLoadStart)
              
              // 立即启动超时降级机制（不等待 useEffect）
              if (!webViewReady && !webViewReadyFallbackTriggered.current && !webViewReadyTimeoutRef.current) {
                console.log(`⏰ 在 onLoadStart 中启动 WebView 就绪超时降级机制，${WEBVIEW_READY_TIMEOUT}ms 后强制标记为就绪`)
                
                webViewReadyTimeoutRef.current = setTimeout(() => {
                  if (!webViewReady) {
                    webViewReadyFallbackTriggered.current = true
                    perfTimestamps.current.webviewReady = Date.now()
                    console.log('⚠️ WebView 就绪超时，启用降级机制：强制标记为就绪')
                    logDuration('WebView 开始加载 → 降级就绪', 'webviewLoadStart', perfTimestamps.current.webviewReady)
                    logDuration('页面进入 → WebView 降级就绪', 'pageEnter', perfTimestamps.current.webviewReady)
                    setWebViewReady(true)
                    console.log('✅ setWebViewReady(true) 已调用（降级机制）')
                  }
                }, WEBVIEW_READY_TIMEOUT)
              }
            }}
            onLoad={() => {
              perfTimestamps.current.webviewHtmlLoaded = Date.now()
              console.log('🔄 WebView onLoad 触发：HTML 加载完成，等待资源就绪...')
              logDuration('页面进入 → WebView HTML 加载', 'pageEnter', perfTimestamps.current.webviewHtmlLoaded)
              
              // 如果超时机制还没启动，基于 onLoad 时间启动（更准确）
              if (!webViewReady && !webViewReadyFallbackTriggered.current && !webViewReadyTimeoutRef.current) {
                const elapsed = Date.now() - perfTimestamps.current.webviewHtmlLoaded
                const remainingTimeout = Math.max(0, WEBVIEW_READY_TIMEOUT - elapsed)
                console.log(`⏰ 在 onLoad 中启动 WebView 就绪超时降级机制，${remainingTimeout}ms 后强制标记为就绪 (已等待 ${elapsed}ms)`)
                
                webViewReadyTimeoutRef.current = setTimeout(() => {
                  if (!webViewReady) {
                    webViewReadyFallbackTriggered.current = true
                    perfTimestamps.current.webviewReady = Date.now()
                    console.log('⚠️ WebView 就绪超时，启用降级机制：强制标记为就绪')
                    logDuration('WebView HTML 加载 → 降级就绪', 'webviewHtmlLoaded', perfTimestamps.current.webviewReady)
                    logDuration('页面进入 → WebView 降级就绪', 'pageEnter', perfTimestamps.current.webviewReady)
                    setWebViewReady(true)
                    console.log('✅ setWebViewReady(true) 已调用（降级机制）')
                  }
                }, remainingTimeout)
              }
            }}
            onLoadEnd={() => {
              console.log('🌐 WebView onLoadEnd: HTML 加载结束')
              
              // onLoadEnd 时，如果还没收到 WEBVIEW_READY，尝试通过 injectedJavaScript 触发
              // 这是一个额外的保障机制
              if (!webViewReady && webViewRef.current) {
                console.log('🔄 onLoadEnd: 尝试通过 injectedJavaScript 触发就绪检测')
                // 通过注入 JavaScript 来触发就绪检测
                webViewRef.current.injectJavaScript(`
                  (function() {
                    if (window.ReactNativeWebView) {
                      try {
                        window.ReactNativeWebView.postMessage('WEBVIEW_READY_FROM_INJECT');
                        console.log('✅ injectedJavaScript 发送 WEBVIEW_READY_FROM_INJECT');
                      } catch (e) {
                        console.error('❌ injectedJavaScript postMessage 失败:', e);
                      }
                    } else {
                      console.error('❌ injectedJavaScript: window.ReactNativeWebView 不存在');
                    }
                  })();
                  true; // 必须返回 true
                `)
              }
            }}
            injectedJavaScript={`
              // 立即尝试发送就绪消息（在页面加载时）
              (function() {
                var attempts = 0;
                var maxAttempts = 10;
                
                function trySendReady() {
                  attempts++;
                  if (window.ReactNativeWebView) {
                    try {
                      window.ReactNativeWebView.postMessage('WEBVIEW_READY_FROM_INJECT');
                      console.log('✅ injectedJavaScript 发送 WEBVIEW_READY_FROM_INJECT (尝试 ' + attempts + ')');
                      return true;
                    } catch (e) {
                      console.error('❌ injectedJavaScript postMessage 失败:', e);
                      if (attempts < maxAttempts) {
                        setTimeout(trySendReady, 100);
                      }
                      return false;
                    }
                  } else {
                    if (attempts < maxAttempts) {
                      setTimeout(trySendReady, 100);
                    } else {
                      console.error('❌ injectedJavaScript: window.ReactNativeWebView 不存在 (尝试 ' + attempts + ' 次后放弃)');
                    }
                    return false;
                  }
                }
                
                // 立即尝试
                trySendReady();
                
                // 监听 DOMContentLoaded
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', trySendReady);
                } else {
                  trySendReady();
                }
                
                // 监听 window.load
                window.addEventListener('load', function() {
                  setTimeout(trySendReady, 100);
                });
              })();
              true; // 必须返回 true
            `}
            onMessage={(event) => {
              const message = event.nativeEvent.data
              
              // 处理日志消息
              try {
                const parsed = JSON.parse(message)
                if (parsed.type === 'log') {
                  console.log('📱 [WebView]', parsed.message)
                  return
                }
              } catch (e) {
                // 不是 JSON，继续处理其他消息
              }
              
              console.log('📨 WebView onMessage 收到消息:', message)
              
              // 收到 WEBVIEW_READY 或 WEBVIEW_READY_FROM_INJECT 消息都认为就绪
              if (message === 'WEBVIEW_READY' || message === 'WEBVIEW_READY_FROM_INJECT') {
                if (message === 'WEBVIEW_READY_FROM_INJECT') {
                  console.log('✅ 收到 injectedJavaScript 发送的就绪消息')
                }
                // 清除超时定时器
                if (webViewReadyTimeoutRef.current) {
                  clearTimeout(webViewReadyTimeoutRef.current)
                  webViewReadyTimeoutRef.current = null
                }
                
                perfTimestamps.current.webviewReady = Date.now()
                console.log('✅ WebView 收到 WEBVIEW_READY，设置 webViewReady=true')
                logDuration('WebView HTML 加载 → 资源就绪', 'webviewHtmlLoaded', perfTimestamps.current.webviewReady)
                logDuration('页面进入 → WebView 资源就绪', 'pageEnter', perfTimestamps.current.webviewReady)
                setWebViewReady(true)
                console.log('✅ setWebViewReady(true) 已调用')
              } else {
                console.log('⚠️ WebView 收到非 WEBVIEW_READY 消息，忽略')
              }
            }}
            onError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent
              console.error('❌ WebView onError 加载错误:', nativeEvent)
              
              // 错误恢复：如果 WebView 未就绪且未超过最大重试次数，尝试重新加载
              if (!webViewReady && webViewRetryCount.current < MAX_WEBVIEW_RETRIES) {
                webViewRetryCount.current++
                console.log(`🔄 WebView 错误恢复：尝试重新加载 (第 ${webViewRetryCount.current}/${MAX_WEBVIEW_RETRIES} 次)`)
                
                // 延迟重新加载，避免立即重试
                setTimeout(() => {
                  if (webViewRef.current && !webViewReady) {
                    console.log('🔄 执行 WebView 重新加载...')
                    webViewRef.current.reload()
                  }
                }, 500)
              } else if (!webViewReady) {
                console.error('❌ WebView 错误恢复失败：已达到最大重试次数，启用降级机制')
                // 如果重试失败，启用降级机制
                if (!webViewReadyFallbackTriggered.current) {
                  webViewReadyFallbackTriggered.current = true
                  perfTimestamps.current.webviewReady = Date.now()
                  setWebViewReady(true)
                  console.log('✅ setWebViewReady(true) 已调用（错误恢复降级）')
                }
              }
            }}
            onHttpError={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent
              console.error('❌ WebView HTTP 错误:', nativeEvent)
              
              // HTTP 错误通常是 CDN 资源加载失败，不影响基本功能，可以降级处理
              if (!webViewReady && !webViewReadyFallbackTriggered.current) {
                console.log('⚠️ CDN 资源加载失败，但可以降级使用基本功能')
                // 不立即降级，等待超时机制处理
              }
            }}
            onRenderProcessGone={(syntheticEvent) => {
              const { nativeEvent } = syntheticEvent
              console.error('❌ WebView 渲染进程崩溃:', nativeEvent)
              
              // 渲染进程崩溃是最严重的情况，需要重新初始化
              if (!webViewReady && webViewRetryCount.current < MAX_WEBVIEW_RETRIES) {
                webViewRetryCount.current++
                console.log(`🔄 WebView 渲染进程崩溃恢复：尝试重新初始化 (第 ${webViewRetryCount.current}/${MAX_WEBVIEW_RETRIES} 次)`)
                
                // 延迟重新加载
                setTimeout(() => {
                  if (webViewRef.current && !webViewReady) {
                    console.log('🔄 执行 WebView 重新初始化...')
                    webViewRef.current.reload()
                  }
                }, 1000)
              } else if (!webViewReady) {
                console.error('❌ WebView 渲染进程崩溃恢复失败：已达到最大重试次数，启用降级机制')
                // 如果重试失败，启用降级机制
                if (!webViewReadyFallbackTriggered.current) {
                  webViewReadyFallbackTriggered.current = true
                  perfTimestamps.current.webviewReady = Date.now()
                  setWebViewReady(true)
                  console.log('✅ setWebViewReady(true) 已调用（崩溃恢复降级）')
                }
              }
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

