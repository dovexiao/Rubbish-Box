import { useState, useMemo, useCallback } from "react"
import { View, Text as RNText, StyleSheet } from "react-native"
import { WebView } from "react-native-webview"
import { rpx } from "../utils/rpxStyleSheet"

const Text = RNText

/**
 * 解析内容，提取文本和数学公式
 * 返回一个数组，每个元素包含类型（text/math）和内容
 * 
 * 支持的公式格式：
 * 1. \[ ... \] - 块级公式（display mode）
 * 2. \( ... \) - 内联公式（inline mode）
 * 3. $$ ... $$ - 块级公式（兼容）
 * 4. $ ... $ - 内联公式（兼容）
 */
interface ContentSegment {
  type: "text" | "math"
  content: string
  displayMode?: boolean // 是否为块级公式
}

const parseContentSegments = (html: string): ContentSegment[] => {
  if (!html) return []
  
  const segments: ContentSegment[] = []
  let currentText = html
  let position = 0
  
  // 定义所有公式分隔符的正则表达式（按优先级排序）
  const patterns = [
    { regex: /\\\[([\s\S]*?)\\\]/g, displayMode: true },   // \[ ... \]
    { regex: /\\\(([\s\S]*?)\\\)/g, displayMode: false },  // \( ... \)
    { regex: /\$\$([\s\S]*?)\$\$/g, displayMode: true },   // $$ ... $$
    { regex: /\$([^\$\n]+?)\$/g, displayMode: false },     // $ ... $
  ]
  
  // 收集所有匹配项及其位置
  interface Match {
    start: number
    end: number
    content: string
    displayMode: boolean
  }
  
  const allMatches: Match[] = []
  
  for (const pattern of patterns) {
    let match: RegExpExecArray | null
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags)
    
    while ((match = regex.exec(currentText)) !== null) {
      allMatches.push({
        start: match.index,
        end: match.index + match[0].length,
        content: match[1].trim(),
        displayMode: pattern.displayMode
      })
    }
  }
  
  // 按位置排序并去重（如果有重叠，保留最先匹配的）
  allMatches.sort((a, b) => a.start - b.start)
  
  const validMatches: Match[] = []
  let lastEnd = 0
  
  for (const match of allMatches) {
    if (match.start >= lastEnd) {
      validMatches.push(match)
      lastEnd = match.end
    }
  }
  
  // 构建 segments
  position = 0
  for (const match of validMatches) {
    // 添加公式前的文本
    if (match.start > position) {
      const textBefore = currentText.substring(position, match.start)
      if (textBefore.trim()) {
        segments.push({ 
          type: "text", 
          content: textBefore 
        })
      }
    }
    
    // 添加公式
    if (match.content) {
      segments.push({
        type: "math",
        content: match.content,
        displayMode: match.displayMode
      })
    }
    
    position = match.end
  }
  
  // 添加最后的文本
  if (position < currentText.length) {
    const textAfter = currentText.substring(position)
    if (textAfter.trim()) {
      segments.push({ 
        type: "text", 
        content: textAfter 
      })
    }
  }
  
  // 清理文本段落中的 HTML 标签和实体
  return segments.map(seg => {
    if (seg.type === "text") {
      let cleaned = seg.content
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<\/p>/gi, "\n\n")
        .replace(/<p[^>]*>/gi, "")
        .replace(/<\/div>/gi, "\n")
        .replace(/<div[^>]*>/gi, "")
        .replace(/<[^>]*>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n\s*\n\s*\n/g, "\n\n")
        .trim()
      
      return { ...seg, content: cleaned }
    }
    return seg
  }).filter(seg => seg.content) // 过滤空内容
}

/**
 * 混合内容渲染组件
 * 智能识别文本和数学公式，分别使用 Text 和 WebView 渲染
 */
interface MixedContentProps {
  content: string
  style?: any
  mathStyle?: any
}

export const MixedContent = ({ content, style, mathStyle }: MixedContentProps) => {
  // 确保 content 是字符串
  const safeContent = content || ""
  
  const segments = useMemo(() => parseContentSegments(safeContent), [safeContent])
  const [contentHeight, setContentHeight] = useState<number | null>(null)
  
  // 检查是否只有文本，没有公式
  const hasMath = useMemo(() => segments.length > 0 && segments.some(seg => seg.type === "math"), [segments])
  
  // 将所有文本和公式合并，使用 HTML 格式
  // 文本直接显示，公式使用 \( ... \) 分隔符包裹以便 KaTeX 识别
  const combinedExpression = useMemo(() => {
    if (segments.length === 0) {
      return ""
    }
    return segments.map(segment => {
      if (segment.type === "text") {
        // 文本部分直接输出，转义 HTML 特殊字符
        return segment.content
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;")
          .replace(/'/g, "&#39;")
      } else {
        // 公式部分使用 \( ... \) 分隔符包裹，确保 KaTeX 能识别
        // 如果公式本身已经有分隔符，则保持原样；否则添加分隔符
        const formula = segment.content.trim()
        if (formula.startsWith('\\(') && formula.endsWith('\\)')) {
          return formula
        } else if (formula.startsWith('\\[') && formula.endsWith('\\]')) {
          return formula
        } else if (formula.startsWith('$') && formula.endsWith('$')) {
          return formula
        } else {
          return `\\(${formula}\\)`
        }
      }
    }).join("")
  }, [segments])
  
  // 根据内容长度估算宽度，使用更大的宽度确保内容能显示
  // 对于解析等需要换行的内容，使用 100% 宽度
  const estimatedWidth = "100%"
  
  // 使用 style 中的 fontSize（已经通过 createStyles 转换为像素值）
  // 如果 style.fontSize 不存在，使用默认值并转换为像素
  const fontSize = style?.fontSize || rpx(18)
  const lineHeight = style?.lineHeight || (fontSize * 1.5)
  const minHeight = typeof lineHeight === 'number' ? lineHeight : rpx(27)
  
  // 生成 HTML 内容，包含脚本用于动态获取高度
  const htmlContent = useMemo(() => {
    // combinedExpression 已经处理了文本的 HTML 转义和公式的分隔符
    // 直接使用即可
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://cdn.bootcdn.net/ajax/libs/KaTeX/0.16.9/katex.min.css">
  <script src="https://cdn.bootcdn.net/ajax/libs/KaTeX/0.16.9/katex.min.js"></script>
  <script src="https://cdn.bootcdn.net/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: auto;
      min-height: 0;
      display: block;
      background-color: transparent;
      word-wrap: break-word;
      overflow-wrap: break-word;
      white-space: normal;
      font-size: ${fontSize}px;
      line-height: ${typeof lineHeight === 'number' ? lineHeight : fontSize * 1.5}px;
      color: #333;
    }
    #content {
      width: 100%;
      height: auto;
      min-height: 0;
      word-wrap: break-word;
      overflow-wrap: break-word;
      white-space: normal;
      display: block;
    }
    .katex {
      font-size: ${fontSize}px;
      margin: 0;
      padding: 0;
      display: inline-block;
      background-color: transparent;
      line-height: ${typeof lineHeight === 'number' ? lineHeight : fontSize * 1.5}px;
      vertical-align: baseline;
      word-wrap: break-word;
      overflow-wrap: break-word;
      white-space: normal;
    }
    .katex * {
      background-color: transparent;
    }
  </style>
</head>
<body>
  <div id="content">${combinedExpression}</div>
  <script>
    var renderAttempts = 0;
    var maxRenderAttempts = 10;
    var lastHeight = 0;
    var updateTimer = null;
    
    function updateHeight() {
      try {
        var contentEl = document.getElementById('content');
        if (!contentEl) {
          return;
        }
        
        // 等待一帧，确保内容已完全渲染
        requestAnimationFrame(function() {
          // 使用 getBoundingClientRect 获取更精确的高度
          var rect = contentEl.getBoundingClientRect();
          var height = rect.height;
          
          // 如果 getBoundingClientRect 不可用，使用 scrollHeight
          if (!height || height <= 0) {
            height = contentEl.scrollHeight || contentEl.offsetHeight;
          }
          
          // 如果内容为空或高度为0，使用最小高度
          if (height <= 0) {
            height = ${minHeight};
          }
          
          // 添加小的边距以确保内容不被裁剪（约2px）
          height = height + 2;
          
          // 只有当高度发生变化时才发送消息，避免频繁更新
          if (window.ReactNativeWebView && Math.abs(height - lastHeight) > 1) {
            lastHeight = height;
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'height',
              height: Math.ceil(height)
            }));
          }
        });
      } catch (e) {
        console.error('Error updating height:', e);
      }
    }
    
    // 防抖函数，避免频繁更新
    function debouncedUpdateHeight() {
      if (updateTimer) {
        clearTimeout(updateTimer);
      }
      updateTimer = setTimeout(updateHeight, 100);
    }
    
    function renderMath() {
      try {
        renderAttempts++;
        if (typeof renderMathInElement !== 'undefined') {
          var contentEl = document.getElementById('content');
          if (contentEl) {
            renderMathInElement(contentEl, {
              delimiters: [
                {left: '\\\\[', right: '\\\\]', display: false},
                {left: '\\\\(', right: '\\\\)', display: false},
                {left: '$$', right: '$$', display: false},
                {left: '$', right: '$', display: false}
              ],
              throwOnError: false,
              errorColor: '#cc0000'
            });
            // 渲染完成后更新高度
            setTimeout(debouncedUpdateHeight, 300);
          } else {
            if (renderAttempts < maxRenderAttempts) {
              setTimeout(renderMath, 100);
            } else {
              debouncedUpdateHeight();
            }
          }
        } else {
          if (renderAttempts < maxRenderAttempts) {
            setTimeout(renderMath, 100);
          } else {
            // KaTeX 加载失败，至少显示文本内容
            debouncedUpdateHeight();
          }
        }
      } catch (e) {
        console.error('Error rendering math:', e);
        debouncedUpdateHeight();
      }
    }
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        renderMath();
      });
    } else {
      renderMath();
    }
    
    window.addEventListener('load', function() {
      renderMath();
    });
    
    // 监听内容变化，使用防抖
    try {
      new MutationObserver(function() {
        debouncedUpdateHeight();
      }).observe(document.getElementById('content'), {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: true
      });
    } catch (e) {
      console.error('Error setting up MutationObserver:', e);
    }
    
    // 初始测量，延迟执行确保内容已渲染
    setTimeout(debouncedUpdateHeight, 400);
  </script>
</body>
</html>
    `
  }, [combinedExpression, fontSize, lineHeight, minHeight])
  
  // 处理 WebView 消息，获取内容高度
  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)
      if (data.type === 'height' && typeof data.height === 'number' && data.height > 0) {
        // 确保高度合理，不超过屏幕高度的10倍（防止异常值）
        const maxHeight = typeof minHeight === 'number' ? minHeight * 50 : 5000
        const finalHeight = Math.min(Math.max(data.height, minHeight), maxHeight)
        setContentHeight(finalHeight)
      }
    } catch (e) {
      // 忽略解析错误
    }
  }, [minHeight])
  
  // 根据内容类型返回不同的组件
  // 如果内容为空或只有文本，直接使用 Text 组件
  if (segments.length === 0 || !hasMath) {
    return <Text style={style}>{safeContent}</Text>
  }
  
  // 使用 WebView 渲染所有内容，支持动态高度
  return (
    <View 
      style={{ 
        width: "100%",
      }}
    >
      <WebView
        source={{ html: htmlContent }}
        style={{
          width: estimatedWidth,
          height: contentHeight || minHeight,
          backgroundColor: "transparent",
        }}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        originWhitelist={['*']}
      />
    </View>
  )
}

