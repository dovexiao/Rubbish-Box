import { useState, useMemo, useCallback, useRef, useEffect } from "react"
import { View, Text as RNText, StyleSheet } from "react-native"
import { WebView } from "react-native-webview"
import { rpx } from "../utils/rpxStyleSheet"

const Text = RNText

// 全局缓存 KaTeX 基础模板，避免重复生成
const KATEX_BASE_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://cdn.bootcdn.net/ajax/libs/KaTeX/0.16.9/katex.min.css">
  <script src="https://cdn.bootcdn.net/ajax/libs/KaTeX/0.16.9/katex.min.js"></script>
  <script src="https://cdn.bootcdn.net/ajax/libs/KaTeX/0.16.9/contrib/auto-render.min.js"></script>
</head>
<body>
  <div id="content"></div>
</body>
</html>
`

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
  const webViewRef = useRef<any>(null)
  const [isWebViewReady, setIsWebViewReady] = useState(false)
  const contentVersionRef = useRef(0)
  
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
  
  // ⚡ 方案3：使用本地资源 + 提供动态更新接口（HTML 模板固定，不包含内容）
  const htmlContent = useMemo(() => {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="file:///android_asset/katex/katex.min.css">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{margin:0;padding:0;width:100%;height:auto;background:transparent;word-wrap:break-word;font-size:${fontSize}px;line-height:${typeof lineHeight === 'number' ? lineHeight : fontSize * 1.5}px;color:#333}
    #content{width:100%;height:auto;word-wrap:break-word;white-space:normal}
    .katex{font-size:${fontSize}px;display:inline-block;background:transparent;line-height:${typeof lineHeight === 'number' ? lineHeight : fontSize * 1.5}px}
  </style>
  <script src="file:///android_asset/katex/katex.min.js"></script>
  <script src="file:///android_asset/katex/auto-render.min.js"></script>
</head>
<body>
  <div id="content"></div>
  <script>
    var lastHeight=0;
    var currentVersion=0;
    
    function updateHeight(){
      try{
        var el=document.getElementById('content');
        if(!el)return;
        var h=el.getBoundingClientRect().height||el.scrollHeight||${minHeight};
        h=Math.ceil(h+2);
        if(window.ReactNativeWebView&&Math.abs(h-lastHeight)>1){
          lastHeight=h;
          window.ReactNativeWebView.postMessage(JSON.stringify({type:'height',height:h}));
        }
      }catch(e){}
    }
    
    function renderContent(content){
      try{
        var el=document.getElementById('content');
        if(!el)return;
        el.innerHTML=content;
        
        if(typeof renderMathInElement!=='undefined'){
          renderMathInElement(el,{
            delimiters:[
              {left:'\\\\[',right:'\\\\]',display:false},
              {left:'\\\\(',right:'\\\\)',display:false},
              {left:'$$',right:'$$',display:false},
              {left:'$',right:'$',display:false}
            ],
            throwOnError:false
          });
        }
        setTimeout(updateHeight,100);
      }catch(e){
        console.error('Render error:',e);
        updateHeight();
      }
    }
    
    // ⚡ 动态更新接口 - 供 React Native 调用
    window.updateContent=function(newContent,version){
      if(version>currentVersion){
        currentVersion=version;
        renderContent(newContent);
      }
    };
    
    // 通知 React Native WebView 已就绪（不渲染初始内容，等待 JS 注入）
    if(window.ReactNativeWebView){
      window.ReactNativeWebView.postMessage(JSON.stringify({type:'ready'}));
    }
  </script>
</body>
</html>
    `
  }, [fontSize, lineHeight, minHeight])
  
  // ⚡ 处理 WebView 消息（高度更新 + 就绪通知）
  const handleMessage = useCallback((event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data)
      
      if (data.type === 'ready') {
        // WebView 已就绪，可以接收动态更新
        setIsWebViewReady(true)
      } else if (data.type === 'height' && data.height > 0) {
        const maxHeight = typeof minHeight === 'number' ? minHeight * 50 : 5000
        setContentHeight(Math.min(Math.max(data.height, minHeight), maxHeight))
      }
    } catch (e) {}
  }, [minHeight])
  
  // ⚡ 当内容变化或 WebView 就绪时，动态更新内容
  useEffect(() => {
    if (isWebViewReady && webViewRef.current && hasMath && combinedExpression) {
      contentVersionRef.current += 1
      const version = contentVersionRef.current
      
      // 转义内容中的特殊字符
      const escapedContent = combinedExpression
        .replace(/\\/g, '\\\\')
        .replace(/`/g, '\\`')
        .replace(/\$/g, '\\$')
      
      // 注入 JavaScript 动态更新内容
      const script = `window.updateContent(\`${escapedContent}\`, ${version});`
      
      // 使用 setTimeout 确保 WebView 完全就绪
      setTimeout(() => {
        webViewRef.current?.injectJavaScript(script)
      }, 50)
    }
  }, [safeContent, isWebViewReady, hasMath, combinedExpression])
  
  // 根据内容类型返回不同的组件
  // 如果内容为空或只有文本，直接使用 Text 组件
  if (segments.length === 0 || !hasMath) {
    return <Text style={style}>{safeContent}</Text>
  }
  
  // ⚡ 使用本地资源 + 动态更新，不再使用 key 强制重新挂载
  return (
    <View style={{ width: "100%" }}>
      <WebView
        ref={webViewRef}
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
        androidLayerType="hardware"
        androidHardwareAccelerationDisabled={false}
        onLoad={() => {
          // WebView 加载完成，等待 ready 消息
        }}
      />
    </View>
  )
}

