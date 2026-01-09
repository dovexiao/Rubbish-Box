import { useState, useEffect, useCallback, useRef } from "react"
import { View, Text as RNText, StatusBar as RNStatusBar, ActivityIndicator, ImageBackground, Animated } from "react-native"
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router"
import { WebView } from "react-native-webview"
import DeviceInfo from 'react-native-device-info'

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
    onerror="if(typeof logToRN==='function'){var errorTime=Date.now();var elapsed=errorTime-webviewStartTime;logToRN('❌ KaTeX CSS 加载失败 ('+elapsed+'ms)');}">
  <script src="file:///android_asset/katex/katex.min.js" defer 
    onerror="if(typeof logToRN==='function'){var errorTime=Date.now();var elapsed=errorTime-webviewStartTime;logToRN('❌ KaTeX JS 加载失败 ('+elapsed+'ms)');}"></script>
  <script src="file:///android_asset/katex/auto-render.min.js" defer 
    onerror="if(typeof logToRN==='function'){var errorTime=Date.now();var elapsed=errorTime-webviewStartTime;logToRN('❌ KaTeX auto-render 加载失败 ('+elapsed+'ms)');}"></script>
  <script src="file:///android_asset/katex/marked.min.js" defer 
    onerror="if(typeof logToRN==='function'){var errorTime=Date.now();var elapsed=errorTime-webviewStartTime;logToRN('❌ Marked 加载失败 ('+elapsed+'ms)');}"></script>
    <style>
    * { margin: 0; padding: 0; box-sizing: border-box; background-color: transparent;}
    html, body {
      background-color: transparent;
      color: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      font-size: 16px;
      line-height: 1.6;
      padding: 8px;
      overflow-x: hidden;
    }
    #content { 
      word-wrap: break-word; 
      overflow-wrap: break-word; 
      background-color: transparent !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
      min-height: 1px;
      position: relative;
      z-index: 1;
    }
    h1, h2, h3 { color: #FFFFFF; font-weight: bold; margin: 12px 0 8px; }
    h1 { font-size: 22px; } h2 { font-size: 20px; } h3 { font-size: 18px; }
    p { margin: 4px 0; color: #FFFFFF; }
    strong { color: #FFD700; font-weight: bold; }
    code { padding: 2px 4px; border-radius: 4px; color: #00FF00; font-size: 14px; }
    pre { padding: 8px; border-radius: 4px; margin: 4px 0; overflow-x: auto; }
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
    
    // webviewStartTime 已在 head 中定义
    
    // 监控资源加载错误（关键）
    window.addEventListener('error', function(e) {
      logToRN('❌ 资源加载错误: ' + (e.target.tagName || '') + ' ' + (e.target.src || e.target.href || ''));
    }, true);
    
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
      
      if (window.ReactNativeWebView) {
        try {
        window.ReactNativeWebView.postMessage('WEBVIEW_READY');
          readyMessageSent = true;
          logToRN('✅ WEBVIEW_READY 发送成功 (第' + retryCount + '次尝试, ' + elapsed + 'ms)');
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
        
        // 确保内容 div 可见
        contentDiv.style.display = 'block';
        contentDiv.style.visibility = 'visible';
        contentDiv.style.opacity = '1';
        contentDiv.style.minHeight = '1px';
        
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
        
        // 确保内容可见后，再次检查并强制显示
        setTimeout(function() {
          if (contentDiv.offsetHeight === 0 || contentDiv.offsetWidth === 0) {
            contentDiv.style.display = 'block';
            contentDiv.style.visibility = 'visible';
            contentDiv.style.opacity = '1';
            contentDiv.style.position = 'relative';
            contentDiv.style.zIndex = '1';
          }
        }, 50);
        
        // 自动滚动到底部
        window.scrollTo(0, document.body.scrollHeight);
        
        var renderEnd = Date.now();
        if (firstRenderTime === 0 && text.length > 0) {
          firstRenderTime = renderEnd;
          var elapsedFromStart = renderEnd - webviewStartTime;
          logToRN('🎨 首次渲染完成 (' + elapsedFromStart + 'ms)');
        }
      } catch (e) {
        logToRN('❌ 渲染错误: ' + e.toString());
        // 最后的降级方案：直接显示文本
        const contentDiv = document.getElementById('content');
        if (contentDiv) {
          contentDiv.style.display = 'block';
          contentDiv.style.visibility = 'visible';
          contentDiv.style.opacity = '1';
          contentDiv.textContent = text;
        }
      }
    }
    
    // 监听来自 React Native 的消息
    // React Native WebView 使用 document 而不是 window
    document.addEventListener('message', function(event) {
      const data = event.data;
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'update' && parsed.content) {
            renderContent(parsed.content);
          }
        } catch (e) {
          // 如果不是 JSON，直接作为内容渲染
          renderContent(data);
        }
      }
    });
    
    // 同时也监听 window.addEventListener（兼容性）
    window.addEventListener('message', function(event) {
      const data = event.data;
      if (typeof data === 'string') {
        try {
          const parsed = JSON.parse(data);
          if (parsed.type === 'update' && parsed.content) {
            renderContent(parsed.content);
          }
        } catch (e) {
          renderContent(data);
        }
      }
    });
    
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
  const [isRK3566, setIsRK3566] = useState(false) // 检测RK3566设备，用于智能降级
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
  const healthCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null) // WebView 健康检查定时器
  const healthCheckFailureCount = useRef(0) // 健康检查失败次数
  const lastHealthCheckTime = useRef(0) // 最后一次健康检查时间
  const lastContentLength = useRef(0) // 最后一次检查时的内容长度
  const healthCheckStartedRef = useRef(false) // 健康检查是否已启动（防止重复启动）
  const firstContentReceivedRef = useRef(false) // 是否已收到第一次内容
  
  const MAX_DISPLAY_LENGTH = 800 // 最大显示字符数
  const WEBVIEW_READY_TIMEOUT = 2000 // WebView 就绪超时时间（2秒）
  const HEALTH_CHECK_INTERVAL = 500 // 健康检查间隔（500ms）
  const MAX_HEALTH_CHECK_FAILURES = 3 // 最大健康检查失败次数（连续3次失败触发恢复）
  const HEALTH_CHECK_GRACE_PERIOD = 5000 // 健康检查宽限期（5秒内内容为空不算失败）
  
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
  
  // WebView 健康检查：停止
  const stopHealthCheck = useCallback(() => {
    if (healthCheckIntervalRef.current) {
      clearInterval(healthCheckIntervalRef.current)
      healthCheckIntervalRef.current = null
      healthCheckStartedRef.current = false
      console.log('🛑 停止 WebView 健康检查')
    }
  }, [])
  
  // WebView 健康检查：启动
  const startHealthCheck = useCallback(() => {
    // 防止重复启动
    if (healthCheckStartedRef.current) {
      return
    }
    
    // 清除旧的健康检查
    stopHealthCheck()
    
    // 重置失败计数
    healthCheckFailureCount.current = 0
    lastHealthCheckTime.current = Date.now()
    lastContentLength.current = streamContent.length
    healthCheckStartedRef.current = true
    
    console.log('🔍 启动 WebView 健康检查')
    
    // 启动定期健康检查
    healthCheckIntervalRef.current = setInterval(() => {
      if (!webViewRef.current || !webViewReady) {
        return
      }
      
      const now = Date.now()
      const timeSinceStart = now - lastHealthCheckTime.current
      
      // 注入 JavaScript 检查 WebView 内容
      const checkScript = `
        (function() {
          try {
            const contentDiv = document.getElementById('content');
            if (!contentDiv) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'health_check',
                status: 'failed',
                reason: 'content_div_not_found',
                contentLength: 0,
                hasContent: false
              }));
              return;
            }
            
            const contentText = contentDiv.textContent || contentDiv.innerText || '';
            const contentLength = contentText.length;
            const hasContent = contentLength > 0;
            const hasVisibleContent = contentDiv.offsetHeight > 0 && contentDiv.offsetWidth > 0;
            
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'health_check',
              status: hasContent && hasVisibleContent ? 'healthy' : 'failed',
              reason: !hasContent ? 'no_content' : (!hasVisibleContent ? 'not_visible' : 'unknown'),
              contentLength: contentLength,
              hasContent: hasContent,
              hasVisibleContent: hasVisibleContent,
              offsetHeight: contentDiv.offsetHeight,
              offsetWidth: contentDiv.offsetWidth,
              timeSinceStart: ${timeSinceStart}
            }));
          } catch (e) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'health_check',
              status: 'error',
              reason: 'check_failed',
              error: e.toString()
            }));
          }
        })();
        true;
      `
      
      webViewRef.current.injectJavaScript(checkScript)
    }, HEALTH_CHECK_INTERVAL)
  }, [webViewReady, streamContent, stopHealthCheck])
  
  // 监控关键状态变化
  useEffect(() => {
    if (webViewReady) {
      console.log('✅ WebView 已就绪')
      // 如果已经就绪，清除超时定时器
      if (webViewReadyTimeoutRef.current) {
        clearTimeout(webViewReadyTimeoutRef.current)
        webViewReadyTimeoutRef.current = null
      }
      // 启动健康检查（只启动一次）
      if (!healthCheckStartedRef.current) {
        startHealthCheck()
      }
    } else {
      // WebView 未就绪时停止健康检查
      stopHealthCheck()
    }
    if (isCompleted) {
      console.log('✅ 流式接收完成，准备跳转')
      // 完成后停止健康检查
      stopHealthCheck()
    }
  }, [webViewReady, isCompleted, startHealthCheck, stopHealthCheck])
  
  // WebView 健康检查：处理失败
  const handleHealthCheckFailure = useCallback((reason: string, contentLength: number, timeSinceStart: number) => {
    // 如果内容为空，但在宽限期内，不算失败（可能是内容还没到达）
    if (reason === 'no_content' && timeSinceStart < HEALTH_CHECK_GRACE_PERIOD) {
      // 宽限期内，不计数失败
      return
    }
    
    // 如果已经收到过内容，但现在内容消失了，这是真正的失败
    // 或者内容不可见，这也是真正的失败
    if (reason === 'not_visible' || (reason === 'no_content' && firstContentReceivedRef.current)) {
      healthCheckFailureCount.current++
      console.log(`⚠️ WebView 健康检查失败 (${healthCheckFailureCount.current}/${MAX_HEALTH_CHECK_FAILURES}): ${reason}`)
      
      // 如果连续失败次数达到阈值，触发恢复
      if (healthCheckFailureCount.current >= MAX_HEALTH_CHECK_FAILURES) {
        console.error('❌ WebView 健康检查连续失败，触发恢复机制')
        
        // 重置失败计数
        healthCheckFailureCount.current = 0
        
        // 如果 WebView 未就绪，尝试重新加载
        if (!webViewReady && webViewRetryCount.current < MAX_WEBVIEW_RETRIES) {
          webViewRetryCount.current++
          console.log(`🔄 健康检查失败，尝试重新加载 WebView (${webViewRetryCount.current}/${MAX_WEBVIEW_RETRIES})`)
          
          setTimeout(() => {
            if (webViewRef.current && !webViewReady) {
              webViewRef.current.reload()
            }
          }, 500)
        } else if (webViewReady && streamContent.length > 0) {
          // 如果 WebView 已就绪但内容未显示，尝试强制刷新内容
          console.log('🔄 健康检查失败，尝试强制刷新内容')
          if (webViewRef.current) {
            const displayContent = streamContent.length > MAX_DISPLAY_LENGTH 
              ? streamContent.slice(-MAX_DISPLAY_LENGTH) 
              : streamContent
            
            webViewRef.current.postMessage(JSON.stringify({
              type: 'update',
              content: displayContent
            }))
            
            // 再次注入检查脚本，延迟一点时间
            setTimeout(() => {
              if (webViewRef.current) {
                webViewRef.current.injectJavaScript(`
                  (function() {
                    const contentDiv = document.getElementById('content');
                    if (contentDiv) {
                      contentDiv.style.display = 'block';
                      contentDiv.style.visibility = 'visible';
                      contentDiv.style.opacity = '1';
                    }
                  })();
                  true;
                `)
              }
            }, 100)
          }
        }
      }
    }
  }, [webViewReady, streamContent])
  
  // WebView 健康检查：处理成功
  const handleHealthCheckSuccess = useCallback(() => {
    // 重置失败计数
    if (healthCheckFailureCount.current > 0) {
      console.log('✅ WebView 健康检查恢复成功')
      healthCheckFailureCount.current = 0
    }
  }, [])

  // 超时降级机制：如果 2 秒后仍未收到 WEBVIEW_READY，强制标记为就绪
  useEffect(() => {
    // 基于 WebView 开始加载或 HTML 加载完成时间启动超时（哪个先有就用哪个）
    const webViewStartTime = perfTimestamps.current.webviewHtmlLoaded > 0 
      ? perfTimestamps.current.webviewHtmlLoaded 
      : perfTimestamps.current.webviewLoadStart
    
    if (webViewStartTime > 0 && !webViewReady && !webViewReadyFallbackTriggered.current) {
      const elapsed = Date.now() - webViewStartTime
      const remainingTimeout = Math.max(0, WEBVIEW_READY_TIMEOUT - elapsed)
      
      console.log(`⏰ WebView 就绪超时降级机制启动，${remainingTimeout}ms 后强制标记为就绪`)
      
      webViewReadyTimeoutRef.current = setTimeout(() => {
        if (!webViewReady) {
          webViewReadyFallbackTriggered.current = true
          perfTimestamps.current.webviewReady = Date.now()
          console.log('⚠️ WebView 就绪超时，启用降级机制')
          logDuration('页面进入 → WebView 降级就绪', 'pageEnter', perfTimestamps.current.webviewReady)
          setWebViewReady(true)
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
                    console.log('📥 首次接收数据')
                    logDuration('页面进入 → 首次接收数据', 'pageEnter', perfTimestamps.current.firstDataReceived)
                    logDuration('XHR 开始 → 首次接收数据', 'xhrStart', perfTimestamps.current.firstDataReceived)
                  }
                  
                  // 每500字符打印一次，或者每次添加内容时打印（前几次）
                  // if (contentBuffer.current.length % 500 < content.length || contentBuffer.current.length < 100) {
                  //   console.log(`📥 已接收 ${contentBuffer.current.length} 字符 (本次添加 ${content.length} 字符, 从 ${beforeLength} 到 ${afterLength})`)
                  // }
                } else {
                  // console.log('⚠️ JSON 中无内容字段:', JSON.stringify(json).substring(0, 100))
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
          console.log('📡 XHR 请求完成')
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
        console.log('📤 XHR 请求开始')
        logDuration('页面进入 → XHR 开始', 'pageEnter', perfTimestamps.current.xhrStart)
        
        xhr.send(JSON.stringify(requestBody))
      })
    } catch (error) {
      setIsStreaming(false)
      showError("AI 分析失败，请重试")
      setTimeout(() => router.back(), 2000)
    }
  }, [params.imguuid, params.type, router])

  // 页面初始化：设备检测和流式启动
  useEffect(() => {
    console.log('📍 ============ 页面加载开始 ============')
    console.log(`⏱️ 页面进入时间戳: ${perfTimestamps.current.pageEnter}`)
    console.log(`📊 初始状态: webViewReady=${webViewReady}, isStreaming=${isStreaming}, isCompleted=${isCompleted}`)
    console.log(`🔍 页面来源: ${params.from || 'unknown'}, 参数:`, params)

    // 检测RK3566设备，用于智能降级策略
    const detectDevice = async () => {
      try {
        // console.log('DeviceInfo', DeviceInfo.getModel())
        const model = await DeviceInfo.getModel()
        const isRK3566Device = model.includes('3566') || model.includes('RK3566')
        setIsRK3566(isRK3566Device)
        console.log(`📱 设备检测: ${model}, 是否RK3566: ${isRK3566Device}`)
      } catch (error) {
        console.error('设备检测失败:', error)
        setIsRK3566(false)
      }
    }
    detectDevice()

    // 启动流式请求
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
      console.log('✅ WebView 就绪 + 流式开始')
      logDuration('页面进入 → WebView 就绪', 'pageEnter', perfTimestamps.current.webviewReady)
      if (perfTimestamps.current.webviewHtmlLoaded > 0) {
        logDuration('WebView HTML 加载 → 资源就绪', 'webviewHtmlLoaded', perfTimestamps.current.webviewReady)
      }
    }
  }, [webViewReady, isStreaming])

  // 逐字符显示效果（只在 WebView 就绪后执行）
  useEffect(() => {
    // 必须 WebView 就绪才能开始
    if (!webViewReady) {
      return
    }
    
    if (!isStreaming && !isCompleted) {
      return
    }

    displayIntervalRef.current = setInterval(() => {
      const bufferLength = contentBuffer.current.length
      const isFormatting = isFormattingRef.current
      
      // 🔍 优先检查 isCompleted，如果已完成，立即跳转（不处理 buffer）
      if (isCompleted) {
        if (displayIntervalRef.current) {
          clearInterval(displayIntervalRef.current)
          displayIntervalRef.current = null
          
          const imguuid = params.imguuid as string
          const type = params.type as string
          console.log('✅ 流式接收完成，跳转到结果页')
          
          setTimeout(() => {
            // router.replace({ pathname: "/ai/result", params: { batch_id: imguuid, type } })
          }, 500)
        }
        return // 立即返回，不处理 buffer
      }
      
      // 格式化阶段时，如果 contentBuffer 有内容，继续显示；如果没有内容，才暂停
      if (isFormatting && bufferLength === 0) {
        return
      }
      
      if (bufferLength > 0) {
        const charsToAdd = Math.min(5, bufferLength)
        const nextChars = contentBuffer.current.substring(0, charsToAdd)
        contentBuffer.current = contentBuffer.current.substring(charsToAdd)
        
        setStreamContent(prev => {
          const newContent = prev + nextChars
          
          // 记录第一次显示内容
          if (prev.length === 0 && newContent.length > 0 && perfTimestamps.current.firstContentDisplayed === 0) {
            perfTimestamps.current.firstContentDisplayed = Date.now()
            firstContentReceivedRef.current = true // 标记已收到内容
            console.log('🎨 首次内容显示')
            logDuration('页面进入 → 首次显示', 'pageEnter', perfTimestamps.current.firstContentDisplayed)
            if (perfTimestamps.current.firstDataReceived > 0) {
              logDuration('首次接收 → 首次显示', 'firstDataReceived', perfTimestamps.current.firstContentDisplayed)
            }
          }
          
          return newContent
        })
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
    if (!streamContent) {
      return
    }
    
    // 只有在 WebView 就绪后才发送
    if (webViewReady && webViewRef.current) {
      // 实现"阅后即焚"：只发送最新的 2000 字符到 WebView
      const displayContent = streamContent.length > MAX_DISPLAY_LENGTH 
        ? streamContent.slice(-MAX_DISPLAY_LENGTH) 
        : streamContent
      
      // 更新内容长度记录
      lastContentLength.current = displayContent.length
      
      // 使用 postMessage 发送更新
      webViewRef.current.postMessage(JSON.stringify({
        type: 'update',
        content: displayContent
      }))
    }
  }, [streamContent, webViewReady])
  
  // 组件卸载时清理健康检查
  useEffect(() => {
    return () => {
      stopHealthCheck()
    }
  }, [stopHealthCheck])

  // webview显示变量 - 智能延迟策略
  const [webviewDisplayContent, setWebviewDisplayContent] = useState(false)
  useEffect(() => {
    // 从camera页面跳转时需要更长的延迟等待GPU资源释放
    const delay = params.from === 'camera' ? 2000 : 1000
    console.log(`⏰ WebView显示延迟: ${delay}ms (来源: ${params.from || 'unknown'})`)

    const timer = setTimeout(() => {
      setWebviewDisplayContent(true)
      console.log('✅ WebView显示延迟结束，开始渲染')
    }, delay)

    return () => clearTimeout(timer)
  }, [streamContent, params.from])

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
          {webviewDisplayContent && (
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
              androidLayerType={isRK3566 && params.from === 'camera' ? 'software' : 'hardware'}
              mixedContentMode="always"
              allowFileAccess={true}
              allowUniversalAccessFromFileURLs={true}
              cacheEnabled={false}
              incognito={true}
              onLoadStart={() => {
                perfTimestamps.current.webviewLoadStart = Date.now()
                console.log('🌐 WebView 开始加载')
                logDuration('页面进入 → WebView 开始加载', 'pageEnter', perfTimestamps.current.webviewLoadStart)

                // 立即启动超时降级机制（不等待 useEffect）
                if (!webViewReady && !webViewReadyFallbackTriggered.current && !webViewReadyTimeoutRef.current) {
                  webViewReadyTimeoutRef.current = setTimeout(() => {
                    if (!webViewReady) {
                      webViewReadyFallbackTriggered.current = true
                      perfTimestamps.current.webviewReady = Date.now()
                      console.log('⚠️ WebView 就绪超时，启用降级机制')
                      logDuration('页面进入 → WebView 降级就绪', 'pageEnter', perfTimestamps.current.webviewReady)
                      setWebViewReady(true)
                    }
                  }, WEBVIEW_READY_TIMEOUT)
                }
              }}
              onLoad={() => {
                perfTimestamps.current.webviewHtmlLoaded = Date.now()
                console.log('🔄 WebView HTML 加载完成')
                logDuration('页面进入 → WebView HTML 加载', 'pageEnter', perfTimestamps.current.webviewHtmlLoaded)

                // 如果超时机制还没启动，基于 onLoad 时间启动（更准确）
                if (!webViewReady && !webViewReadyFallbackTriggered.current && !webViewReadyTimeoutRef.current) {
                  const elapsed = Date.now() - perfTimestamps.current.webviewHtmlLoaded
                  const remainingTimeout = Math.max(0, WEBVIEW_READY_TIMEOUT - elapsed)

                  webViewReadyTimeoutRef.current = setTimeout(() => {
                    if (!webViewReady) {
                      webViewReadyFallbackTriggered.current = true
                      perfTimestamps.current.webviewReady = Date.now()
                      console.log('⚠️ WebView 就绪超时，启用降级机制')
                      logDuration('页面进入 → WebView 降级就绪', 'pageEnter', perfTimestamps.current.webviewReady)
                      setWebViewReady(true)
                    }
                  }, remainingTimeout)
                }
              }}
              onLoadEnd={() => {
                console.log('🌐 WebView onLoadEnd')

                // onLoadEnd 时，如果还没收到 WEBVIEW_READY，尝试通过 injectedJavaScript 触发
                if (!webViewReady && webViewRef.current) {
                  webViewRef.current.injectJavaScript(`
                  (function() {
                    if (window.ReactNativeWebView) {
                      try {
                        window.ReactNativeWebView.postMessage('WEBVIEW_READY_FROM_INJECT');
                      } catch (e) {
                        console.error('❌ injectedJavaScript postMessage 失败:', e);
                      }
                    }
                  })();
                  true;
                `)
                }
              }}
              injectedJavaScript={`
              (function() {
                var attempts = 0;
                var maxAttempts = 10;
                
                function trySendReady() {
                  attempts++;
                  if (window.ReactNativeWebView) {
                    try {
                      window.ReactNativeWebView.postMessage('WEBVIEW_READY_FROM_INJECT');
                      return true;
                    } catch (e) {
                      if (attempts < maxAttempts) {
                        setTimeout(trySendReady, 100);
                      }
                      return false;
                    }
                  } else {
                    if (attempts < maxAttempts) {
                      setTimeout(trySendReady, 100);
                    }
                    return false;
                  }
                }
                
                trySendReady();
                
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', trySendReady);
                } else {
                  trySendReady();
                }
                
                window.addEventListener('load', function() {
                  setTimeout(trySendReady, 100);
                });
              })();
              true;
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
                  
                  // 处理健康检查消息
                  if (parsed.type === 'health_check') {
                    const checkTime = Date.now()
                    lastHealthCheckTime.current = checkTime
                    
                    if (parsed.status === 'healthy') {
                      // 健康检查通过
                      if (parsed.contentLength !== lastContentLength.current) {
                        lastContentLength.current = parsed.contentLength
                        // 标记已收到内容
                        if (parsed.contentLength > 0) {
                          firstContentReceivedRef.current = true
                        }
                        handleHealthCheckSuccess()
                      }
                    } else {
                      // 健康检查失败
                      const timeSinceStart = parsed.timeSinceStart || (checkTime - lastHealthCheckTime.current)
                      console.log(`⚠️ WebView 健康检查失败: ${parsed.reason}, 内容长度: ${parsed.contentLength}, 可见: ${parsed.hasVisibleContent}, 启动后: ${timeSinceStart}ms`)
                      handleHealthCheckFailure(parsed.reason, parsed.contentLength, timeSinceStart)
                    }
                    return
                  }
                } catch (e) {
                  // 不是 JSON，继续处理其他消息
                }

                // 收到 WEBVIEW_READY 或 WEBVIEW_READY_FROM_INJECT 消息都认为就绪
                if (message === 'WEBVIEW_READY' || message === 'WEBVIEW_READY_FROM_INJECT') {
                  // 清除超时定时器
                  if (webViewReadyTimeoutRef.current) {
                    clearTimeout(webViewReadyTimeoutRef.current)
                    webViewReadyTimeoutRef.current = null
                  }

                  perfTimestamps.current.webviewReady = Date.now()
                  console.log('✅ WebView 就绪')
                  logDuration('页面进入 → WebView 就绪', 'pageEnter', perfTimestamps.current.webviewReady)
                  if (perfTimestamps.current.webviewHtmlLoaded > 0) {
                  logDuration('WebView HTML 加载 → 资源就绪', 'webviewHtmlLoaded', perfTimestamps.current.webviewReady)
                  }
                  setWebViewReady(true)
                }
              }}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent
                console.error('❌ WebView onError 加载错误:', nativeEvent)

                // 错误恢复：如果 WebView 未就绪且未超过最大重试次数，尝试重新加载
                if (!webViewReady && webViewRetryCount.current < MAX_WEBVIEW_RETRIES) {
                  webViewRetryCount.current++
                  console.log(`🔄 WebView 错误恢复：重新加载 (${webViewRetryCount.current}/${MAX_WEBVIEW_RETRIES})`)

                  setTimeout(() => {
                    if (webViewRef.current && !webViewReady) {
                      webViewRef.current.reload()
                    }
                  }, 500)
                } else if (!webViewReady) {
                  console.error('❌ WebView 错误恢复失败，启用降级机制')
                  if (!webViewReadyFallbackTriggered.current) {
                    webViewReadyFallbackTriggered.current = true
                    perfTimestamps.current.webviewReady = Date.now()
                    setWebViewReady(true)
                  }
                }
              }}
              onHttpError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent
                console.error('❌ WebView HTTP 错误:', nativeEvent.statusCode, nativeEvent.url)
              }}
              onRenderProcessGone={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent
                console.error('❌ WebView 渲染进程崩溃:', nativeEvent)

                // 渲染进程崩溃是最严重的情况，需要重新初始化
                if (!webViewReady && webViewRetryCount.current < MAX_WEBVIEW_RETRIES) {
                  webViewRetryCount.current++
                  console.log(`🔄 WebView 渲染进程崩溃恢复：重新初始化 (${webViewRetryCount.current}/${MAX_WEBVIEW_RETRIES})`)

                  setTimeout(() => {
                    if (webViewRef.current && !webViewReady) {
                      webViewRef.current.reload()
                    }
                  }, 1000)
                } else if (!webViewReady) {
                  console.error('❌ WebView 渲染进程崩溃恢复失败，启用降级机制')
                  if (!webViewReadyFallbackTriggered.current) {
                    webViewReadyFallbackTriggered.current = true
                    perfTimestamps.current.webviewReady = Date.now()
                    setWebViewReady(true)
                  }
                }
              }}
            />
          )}

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
    overflow: 'hidden' as const,
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

