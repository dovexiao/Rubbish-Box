import { PDFViewerApplication } from './app'

// 导出 PDFViewerApplication 到全局作用域
window.PDFViewerApplication = PDFViewerApplication

// 初始化 PDF 查看器
function initPDFViewer() {
  const viewerContainer = document.getElementById('viewerContainer')
  const viewer = document.getElementById('viewer')

  // 配置 PDF 查看器
  const config = {
    appContainer: document.body,
    mainContainer: viewerContainer,
    viewerContainer: viewer,
    toolbar: {
      container: null,
      numPages: null,
      pageNumber: null,
      scaleSelect: null,
      customScaleOption: null,
      previous: null,
      next: null,
      zoomIn: null,
      zoomOut: null,
      print: null,
      download: null,
    },
    sidebar: {
      outerContainer: null,
      sidebarContainer: null,
      toggleButton: null,
      resizer: null,
      thumbnailButton: null,
      outlineButton: null,
      attachmentsButton: null,
      layersButton: null,
      thumbnailView: null,
      outlineView: null,
      attachmentsView: null,
      layersView: null,
      currentOutlineItemButton: null,
    },
    findBar: {
      bar: null,
      toggleButton: null,
      findField: null,
      highlightAllCheckbox: null,
      caseSensitiveCheckbox: null,
      matchDiacriticsCheckbox: null,
      entireWordCheckbox: null,
      findMsg: null,
      findResultsCount: null,
      findPreviousButton: null,
      findNextButton: null,
    },
    passwordOverlay: {
      dialog: null,
      label: null,
      input: null,
      submitButton: null,
      cancelButton: null,
    },
    documentProperties: {
      dialog: null,
      closeButton: null,
      fields: {
        fileName: null,
        fileSize: null,
        title: null,
        author: null,
        subject: null,
        keywords: null,
        creationDate: null,
        modificationDate: null,
        creator: null,
        producer: null,
        version: null,
        pageCount: null,
        pageSize: null,
        linearized: null,
      },
    },
  }

  // 初始化 PDF 查看器
  PDFViewerApplication.initialize(config)
}

// 等待 DOM 加载完成后初始化
document.addEventListener('DOMContentLoaded', initPDFViewer)
