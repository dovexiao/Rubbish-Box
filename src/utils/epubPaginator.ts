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
  totalPages: number
  debugInfo: {
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
      width: this.options.containerWidth - this.options.padding * 2,
      height: this.options.containerHeight - this.options.padding * 2,
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
    return Math.floor(effectiveHeight / lineHeight * 0.9)
  }

  // 分页处理
  async paginate(content: string): Promise<PaginationResult> {
    const pages: string[] = []
    const charsPerLine = this.getCharsPerLine()
    const linesPerPage = this.getLinesPerPage()
    const charsPerPage = charsPerLine * linesPerPage

    // 清理和格式化内容
    const cleanContent = this.formatContent(content)
    const paragraphs = cleanContent.split("\n").filter((p) => p.trim())

    let currentPage = ""
    let currentPageChars = 0

    for (const paragraph of paragraphs) {
      const paragraphWithIndent = "　　" + paragraph.trim()

      // 检查当前段落是否能放入当前页
      if (currentPageChars + paragraphWithIndent.length > charsPerPage && currentPage) {
        // 当前页已满，开始新页
        pages.push(currentPage.trim())
        currentPage = paragraphWithIndent + "\n"
        currentPageChars = paragraphWithIndent.length + 1
      } else {
        // 添加到当前页
        currentPage += paragraphWithIndent + "\n"
        currentPageChars += paragraphWithIndent.length + 1
      }
    }

    // 添加最后一页
    if (currentPage.trim()) {
      pages.push(currentPage.trim())
    }

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

  // 销毁分页器
  destroy() {
    this.canvas = null
    this.context = null
  }
}



