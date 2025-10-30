import * as pdfjsLib from 'pdfjs-dist'

// 设置 PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = isH5
  ? '/hybrid/pdfjs/web/pdf.worker.js'
  : '_www/hybrid/pdfjs/web/pdf.worker.js'

export class PDFViewerApplication {
  constructor() {
    this.pdfDocument = null
    this.pdfViewer = null
    this.currentScale = 1.0
    this.currentPageNumber = 1
    this.pagesRotation = 0
    this.isInitialized = false
  }

  static async initialize(config) {
    const app = new PDFViewerApplication()
    app.config = config
    await app._initialize()
    return app
  }

  async _initialize() {
    if (this.isInitialized) {
      return
    }

    // 创建 PDF 查看器
    this.pdfViewer = new pdfjsLib.PDFViewer({
      container: this.config.viewerContainer,
      viewer: this.config.viewerContainer,
      renderInteractiveForms: true,
      enableScripting: true,
    })

    this.isInitialized = true
  }

  async open(url) {
    try {
      // 加载 PDF 文档
      const loadingTask = pdfjsLib.getDocument(url)
      this.pdfDocument = await loadingTask.promise

      // 设置文档
      this.pdfViewer.setDocument(this.pdfDocument)

      // 设置初始缩放
      this.pdfViewer.currentScale = this.currentScale

      // 设置初始页码
      this.pdfViewer.currentPageNumber = this.currentPageNumber

      // 设置旋转
      this.pdfViewer.pagesRotation = this.pagesRotation

      console.log('PDF document loaded successfully')
    } catch (error) {
      console.error('Error loading PDF document:', error)
      throw error
    }
  }

  // 缩放控制
  zoomIn() {
    this.currentScale *= 1.2
    this.pdfViewer.currentScale = this.currentScale
  }

  zoomOut() {
    this.currentScale /= 1.2
    this.pdfViewer.currentScale = this.currentScale
  }

  // 页面控制
  nextPage() {
    if (this.currentPageNumber < this.pdfDocument.numPages) {
      this.currentPageNumber++
      this.pdfViewer.currentPageNumber = this.currentPageNumber
    }
  }

  previousPage() {
    if (this.currentPageNumber > 1) {
      this.currentPageNumber--
      this.pdfViewer.currentPageNumber = this.currentPageNumber
    }
  }

  // 旋转控制
  rotatePages(degrees) {
    this.pagesRotation = (this.pagesRotation + degrees) % 360
    this.pdfViewer.pagesRotation = this.pagesRotation
  }
}
