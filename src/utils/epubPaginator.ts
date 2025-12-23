/**
 * EPUB分页器
 * 100%还原UniApp epubReaderNew.vue中的分页逻辑
 */

export interface PaginationOptions {
  containerWidth: number
  containerHeight: number
  fontSize: number
  fontFamily: string
  lineHeight: number
  padding: number
  textColor: string
  backgroundColor: string
}

export interface PaginationResult {
  pages: string[]
  totalPages?: number
  debugInfo?: {
    averageCharsPerPage: number
    containerSize: string
    effectiveSize: string
  }
}

export class EpubPaginator {
  private options: PaginationOptions
  private canvas: HTMLCanvasElement | null = null
  private context: CanvasRenderingContext2D | null = null

  constructor(options: PaginationOptions) {
    this.options = options
    this.initCanvas()
  }

  private initCanvas() {
    // 在React Native环境中，我们需要模拟Canvas功能
    // 这里使用简化的文本测量方法
    if (typeof document !== "undefined") {
      this.canvas = document.createElement("canvas")
      this.context = this.canvas.getContext("2d")

      if (this.context) {
        this.context.font = `${this.options.fontSize}px ${this.options.fontFamily}`
      }
    }
  }

  // 更新分页选项
  updateOptions(options: PaginationOptions) {
    this.options = options
    if (this.context) {
      this.context.font = `${options.fontSize}px ${options.fontFamily}`
    }
  }

  // 测量文本宽度
  private measureText(text: string): number {
    if (this.context) {
      return this.context.measureText(text).width
    }

    // 简化的文本宽度估算（React Native环境）
    // 中文字符宽度约等于 fontSize，英文字符约为 fontSize * 0.6
    // 这里简化为统一使用 fontSize（偏保守，适合中文为主的内容）
    return text.length * this.options.fontSize
  }

  // 计算有效区域尺寸
  private getEffectiveSize() {
    return {
      width: this.options.containerWidth,
      height: this.options.containerHeight,
    }
  }

  // 计算每行可容纳的字符数
  private getCharsPerLine(): number {
    const effectiveWidth = this.getEffectiveSize().width
    // 中文字符宽度约等于 fontSize，但需要考虑 letterSpacing 和实际渲染差异
    // 使用 1.1 倍作为安全系数
    const avgCharWidth = this.options.fontSize * 1.1
    return Math.floor(effectiveWidth / avgCharWidth)
  }

  // 计算每页可容纳的行数
  private getLinesPerPage(): number {
    const effectiveHeight = this.getEffectiveSize().height
    const lineHeight = this.options.fontSize * this.options.lineHeight
    // 减少 10% 作为安全边距，防止内容溢出
    return Math.floor(effectiveHeight / lineHeight * 0.95)
  }

  // 检测是否是 base64 字符串
  private isBase64String(content: string): boolean {
    // base64 图片通常很长（至少几百个字符）
    if (content.length < 100) {
      return false;
    }

    // 移除可能的空白字符（换行、空格等）
    const cleaned = content.replace(/\s+/g, '');
    
    // base64 字符集：A-Z, a-z, 0-9, +, /, =
    // 检查是否主要由 base64 字符组成（允许少量其他字符，但应该主要是 base64）
    const base64Pattern = /^[A-Za-z0-9+/=]+$/;
    
    // 如果清理后的内容长度足够且符合 base64 模式
    if (cleaned.length >= 100 && base64Pattern.test(cleaned)) {
      // 进一步验证：base64 字符串中 = 应该只在末尾（填充字符）
      const equalsCount = (cleaned.match(/=/g) || []).length;
      const lastEqualsIndex = cleaned.lastIndexOf('=');
      const hasValidPadding = equalsCount === 0 || 
        (equalsCount <= 2 && lastEqualsIndex >= cleaned.length - 2);
      
      return hasValidPadding;
    }
    
    return false;
  }

  // 分页处理
  async paginate(content: string): Promise<PaginationResult> {
    // 检测是否是 base64 字符串
    if (this.isBase64String(content)) {
      // console.log('📖 [EPUB阅读器] 🖼️ 检测到 base64 图片内容，直接返回单页');
      return {
        pages: [content],
        totalPages: 1,
      };
    }

    const pages: string[] = []
    const charsPerLine = this.getCharsPerLine()
    const linesPerPage = this.getLinesPerPage()
    const charsPerPage = charsPerLine * linesPerPage

    // console.log('📖 [EPUB阅读器] 📏 每行可容纳的字符数:', charsPerLine);
    // console.log('📖 [EPUB阅读器] 📏 每页可容纳的行数:', linesPerPage);
    // console.log('📖 [EPUB阅读器] 📏 每页可容纳的字符数:', charsPerPage);

    // 清理和格式化内容
    const cleanContent = this.formatContent(content)
    const paragraphs = cleanContent.split("\n").filter((p) => p.trim())

    let currentPage = ""
    let currentPageLines = 0

    for (let index = 0; index < paragraphs.length; index = index + 1) {
      const paragraph = paragraphs[index];
      paragraphs[index] = "　　" + paragraph.trim()
    }

    for (let index = 0; index < paragraphs.length; index = index + 1) {
      const paragraph = paragraphs[index];
      // const paragraphWithIndent = "　　" + paragraph.trim()

      const paragraphLines = this.calculateParagraphLines(paragraph);

      if (currentPageLines + paragraphLines > linesPerPage) {
          const { remainingText, newPageText } = this.splitParagraphAcrossPages(paragraph, linesPerPage - currentPageLines);
          currentPage += remainingText;
          pages.push(currentPage)
          // console.log('📖 [EPUB阅读器] 📏 最后一段:', {
          //   '剩余文本': remainingText,
          //   '新页文本': newPageText,
          //   '页未处理最后一段行数': currentPageLines,
          //   '每页行数': linesPerPage,
          //   '字体大小': this.options.fontSize,
          //   '当前页内容:': currentPage,
          //   '每页计算容纳行数': linesPerPage,
          //   '每行计算容纳字符数': charsPerLine,
          //   '总页新加': pages[pages.length - 1],
          // });
          currentPage = ""
          currentPageLines = 0
          if (newPageText.length > 0) {
            paragraphs[index] = newPageText
            index = index - 1
          }
      } else {
        currentPage += paragraph + "\n"
        currentPageLines += paragraphLines
      }

      // // 检查当前段落是否能放入当前页
      // if (currentPageChars + paragraphWithIndent.length > charsPerPage && currentPage) {
      //   // 当前页已满，开始新页
      //   pages.push(currentPage)
      //   currentPage = paragraphWithIndent + "\n"
      //   currentPageChars = paragraphWithIndent.length + 1
      // } else {
      //   // 添加到当前页
      //   currentPage += paragraphWithIndent + "\n"
      //   currentPageChars += paragraphWithIndent.length + 1
      // }
    }

    // 添加最后一页
    if (currentPage) {
      pages.push(currentPage)
      // console.log('📖 [EPUB阅读器] 📏 最后一段:', {
      //   '页未处理最后一段行数': currentPageLines,
      //   '每页行数': linesPerPage,
      //   '字体大小': this.options.fontSize,
      //   '当前页内容:': currentPage,
      // });
    }

    // console.log('📖 [EPUB阅读器] 📏 最后章节总页:', pages);

    const effectiveSize = this.getEffectiveSize()
    const debugInfo = {
      averageCharsPerPage: Math.round(
        pages.reduce((sum, page) => sum + page.length, 0) / pages.length,
      ),
      containerSize: `${this.options.containerWidth}x${this.options.containerHeight}`,
      effectiveSize: `${effectiveSize.width}x${effectiveSize.height}`,
    }

    return {
      pages,
      totalPages: pages.length,
      debugInfo,
    }
  }

  // 格式化内容
  private formatContent(content: string): string {
    // 检查内容是否为HTML格式
    const isHtml =
      content.includes("<!DOCTYPE html>") || content.includes("<html") || content.includes("<body")

    let textContent = content

    if (isHtml) {
      // 提取HTML中的文本内容
      const bodyMatch = content.match(/<body[^>]*>([\s\S]*)<\/body>/i)
      if (bodyMatch && bodyMatch[1]) {
        textContent = bodyMatch[1]
      }

      // 移除HTML标签，保留文本
      textContent = textContent
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, "") // 移除所有HTML标签
        .replace(/&nbsp;/g, " ")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
    }

    // 清理多余的空白字符
    return textContent
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\n\s*\n/g, "\n") // 合并多个空行
      .replace(/^\s+|\s+$/g, "") // 去除开头和结尾空白
  }

  // 计算段落会占用多少行
  private calculateParagraphLines(text: string): number {
    // 实际可用宽度（已弃用 padding ）
    const { width: effectiveWidth } = this.getEffectiveSize()
    if (!text || effectiveWidth <= 0) {
      return 0
    }

    // 参考 getCharsPerLine：使用字号并叠加安全系数
    const baseCharWidth = this.options.fontSize * 1.1 // 非标点的基准宽度
    const punctuationFactor = 0.6 // 标点字符占用宽度比例（相对于完整字号）

    let visualWidth = 0

    for (const ch of text) {
      const isPunctuation = this.isPunctuation(ch)
      const charWidth = isPunctuation ? baseCharWidth * punctuationFactor : baseCharWidth
      visualWidth += charWidth
    }

    // 再给一层整体安全系数，避免边缘溢出
    const safeWidth = effectiveWidth * 0.95
    if (safeWidth <= 0) {
      return 1
    }

    // 段落“总宽度” ÷ 实际可用宽度，向上取整得到估算行数
    return Math.max(1, Math.ceil(visualWidth / safeWidth))
  }

  // 判断是否为标点符号（不区分中英文，只要是符号就按较小宽度处理）
  private isPunctuation(char: string): boolean {
    // 常见中英文标点 + 空格类字符
    return /[，。,．、？！：；“”‘’（）【】《》〈〉「」『』〔〕…—\-·,.!?;:'"(){}\[\]\s]/.test(char)
  }

  // 跨页分割段落（考虑标点宽度与剩余行数）
  private splitParagraphAcrossPages(
    text: string,
    remainingLines: number,
  ): { remainingText: string; newPageText: string } {
    const { width: effectiveWidth } = this.getEffectiveSize()
    if (!text || remainingLines <= 0 || effectiveWidth <= 0) {
      return {
        remainingText: "",
        newPageText: text,
      }
    }

    // 与 calculateParagraphLines 相同的宽度模型
    const baseCharWidth = this.options.fontSize * 1.1
    const punctuationFactor = 0.6

    // 当前页剩余可用“总宽度” = 每行可用宽度 * 剩余行数
    const perLineSafeWidth = effectiveWidth * 0.95
    const maxVisualWidth = perLineSafeWidth * remainingLines

    let visualWidth = 0
    let breakIndex = 0

    for (let i = 0; i < text.length; i++) {
      const ch = text[i]
      const isPunc = this.isPunctuation(ch)
      const charWidth = isPunc ? baseCharWidth * punctuationFactor : baseCharWidth

      // 如果再加当前字符就会超过剩余空间，则在当前索引处截断
      if (visualWidth + charWidth > maxVisualWidth) {
        breakIndex = i
        break
      }

      visualWidth += charWidth
      breakIndex = i + 1
    }

    // 如果整段都放得下，全部留在当前页
    if (breakIndex >= text.length) {
      return {
        remainingText: text,
        newPageText: "",
      }
    }

    return {
      remainingText: text.slice(0, breakIndex),
      newPageText: text.slice(breakIndex),
    }
  }

  // 销毁分页器
  destroy() {
    this.canvas = null
    this.context = null
  }
}



