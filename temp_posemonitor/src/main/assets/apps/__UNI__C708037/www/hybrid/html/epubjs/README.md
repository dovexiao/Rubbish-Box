# EPUB阅读器

本项目是一个基于epub.js的EPUB电子书阅读器，专为UniApp应用设计。

## 目录结构

```
epubjs/
├── epub.min.js              # epub.js 核心库
├── jszip.min.js             # 用于解压EPUB文件
├── uni.webview.1.5.6.js     # UniApp WebView SDK
├── epub-viewer.html         # 旧版阅读器
├── epub-viewer-new.html     # 新版阅读器入口（推荐使用）
└── modern/                  # 现代版阅读器目录
    ├── index.html           # 现代版阅读器入口
    ├── css/                 # CSS样式文件
    │   ├── modern-reader.css    # 阅读器基础样式
    │   ├── modern-controls.css  # 控制面板样式
    │   └── modern-toc.css       # 目录样式
    ├── js/                  # JavaScript文件
    │   ├── modern-utils.js      # 工具函数
    │   ├── modern-pagination.js # 分页和定位
    │   ├── modern-reader.js     # 阅读器核心
    │   ├── modern-column.js     # 分栏布局管理
    │   ├── modern-ui.js         # UI管理
    │   ├── uni-bridge.js        # UniApp通信桥接
    │   └── ui-fixes.js          # UI修复和优化
    └── lib/                 # 第三方库（从根目录复制）
```

## 使用方法

### 在UniApp中集成

1. 在UniApp项目中，使用WebView组件加载阅读器：

```html
<template>
  <view>
    <web-view :src="readerUrl" @message="handleMessage"></web-view>
  </view>
</template>

<script>
  export default {
    data() {
      return {
        readerUrl: '/hybrid/html/epubjs/epub-viewer-new.html?bookUrl=https://example.com/book.epub',
      }
    },
    methods: {
      handleMessage(event) {
        const data = event.detail.data
        console.log('收到阅读器消息:', data)

        // 处理不同类型的消息
        switch (data.type) {
          case 'progress':
            // 处理阅读进度
            break
          case 'error':
            // 处理错误
            break
          case 'readerReady':
            // 阅读器已就绪
            break
        }
      },
    },
  }
</script>
```

### URL参数

阅读器支持以下URL参数：

- `bookUrl`: EPUB电子书的URL
- `readRecord`: 阅读记录（CFI字符串）
- `theme`: 主题（light、dark、sepia）
- `fontSize`: 字体大小
- `brightness`: 亮度值

### 消息通信

#### 从UniApp发送到阅读器的消息

```javascript
// 翻到下一页
this.webView.evalJS('uni.postMessage({data: {type: "nextPage"}})')

// 翻到上一页
this.webView.evalJS('uni.postMessage({data: {type: "prevPage"}})')

// 设置主题
this.webView.evalJS('uni.postMessage({data: {type: "setTheme", theme: "dark"}})')

// 设置字体大小
this.webView.evalJS('uni.postMessage({data: {type: "setFontSize", size: 18}})')

// 跳转到指定位置
this.webView.evalJS(
  'uni.postMessage({data: {type: "jumpTo", location: "epubcfi(/6/4[chap01]!/4/2/1:0)"}})',
)

// 加载Base64格式的EPUB
this.webView.evalJS(
  'uni.postMessage({data: {type: "loadBase64", base64: "' + base64Content + '"}})',
)
```

#### 从阅读器发送到UniApp的消息

```javascript
// 阅读进度
{
  type: 'progress',
  cfi: 'epubcfi(/6/4[chap01]!/4/2/1:0)',
  percentage: 0.25,
  page: 25,
  totalPages: 100,
  chapterTitle: '第一章'
}

// 错误信息
{
  type: 'error',
  message: '加载书籍失败'
}

// 阅读器就绪
{
  type: 'readerReady',
  version: '2.0.0',
  features: ['pagination', 'themes', 'bookmarks', 'columns']
}

// 位置变化
{
  type: 'locationChanged',
  start: { ... },
  end: { ... }
}
```

## 升级指南

如果您正在使用旧版阅读器（epub-viewer.html），建议升级到新版阅读器（epub-viewer-new.html）。升级步骤：

1. 将WebView的URL从`/hybrid/html/epubjs/epub-viewer.html`更改为`/hybrid/html/epubjs/epub-viewer-new.html`
2. 确保URL参数保持不变，新版阅读器兼容旧版的所有参数
3. 消息处理方式保持不变，新版阅读器会发送与旧版相同格式的消息

## 特性

- 支持分栏阅读（双栏布局）
- 自动适应设备方向
- 支持多种主题（亮色、暗色、护眼）
- 支持字体大小、行高调整
- 支持亮度调节
- 支持目录导航
- 支持阅读进度保存和恢复
- 支持触摸和手势操作
- 与UniApp深度集成

## 兼容性

- 支持Android 5.0+
- 支持iOS 10.0+
- 支持主流移动浏览器
- 支持UniApp WebView组件
