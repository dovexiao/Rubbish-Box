import { useState, useEffect, useCallback, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
} from "react-native"
import { PanGestureHandler, State } from "react-native-gesture-handler"
import { useRouter, useLocalSearchParams } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import { useSafeAreaInsets } from "react-native-safe-area-context"

import { StatusBar } from "../../components/StatusBar"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import { useReaderTheme } from "../../hooks/useReaderTheme"
import { NavBar } from "../../components/NavBar"
import { useReadingProgress } from "../../hooks/useReadingProgress"
import { EpubPaginator, PaginationOptions } from "../../utils/epubPaginator"
import {
  getBookDetail,
  getChapterDetail,
  updateReadingProgress,
  BookDetailResponse,
  ChapterDetailResponse,
} from "../../services/reader"

// 定义本地使用的类型
interface Chapter {
  id: number
  title: string
  order: number
}

/**
 * EPUB阅读器页面
 * 100%还原UniApp epubReaderNew.vue的双页阅读功能
 */
export default function EpubReader() {
  const router = useRouter()
  const params = useLocalSearchParams()
  const insets = useSafeAreaInsets()

  // 获取传入参数
  const bookId = parseInt(params.bookId as string)
  const _bookUrl = params.bookUrl as string
  const _readRecord = params.readRecord as string

  console.log(`📖 [EPUB阅读器] 页面初始化，接收参数:`, {
    bookId,
    bookUrl: _bookUrl,
    readRecord: _readRecord,
    decodedBookUrl: _bookUrl ? decodeURIComponent(_bookUrl) : undefined,
  })

  // 主题和进度管理
  const { theme, themes, currentTheme, changeTheme, fontSize, increaseFontSize, decreaseFontSize } =
    useReaderTheme(bookId)

  const {
    currentProgress,
    updateProgress,
    updateAndSaveProgress,
    saveProgressImmediately,
    cleanup: cleanupProgress,
  } = useReadingProgress(bookId)

  // 状态管理
  const [loading, setLoading] = useState(true)
  const [bookTitle, setBookTitle] = useState("")
  const [bookChapters, setBookChapters] = useState<Chapter[]>([])
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null)
  const [chapterContent, setChapterContent] = useState("")

  // 分页相关状态
  const [allPages, setAllPages] = useState<string[]>([])
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [leftPageContent, setLeftPageContent] = useState("")
  const [rightPageContent, setRightPageContent] = useState("")
  const [currentPageNumber, setCurrentPageNumber] = useState(1)

  // UI控制状态
  const [showControls, setShowControls] = useState(false)
  const [showToc, setShowToc] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  // 页面尺寸
  const [pageWidth, setPageWidth] = useState(0)
  const [pageHeight, setPageHeight] = useState(0)
  const [_contentHeight, setContentHeight] = useState(0)

  // 分页器实例
  const paginatorRef = useRef<EpubPaginator | null>(null)
  const chapterCacheRef = useRef<Map<number, { content: string; pages: string[] }>>(new Map())

  // 计算页面尺寸
  const calculatePageSize = useCallback(() => {
    const { width: screenWidth, height: screenHeight } = Dimensions.get("window")

    const containerPadding = 40
    const pagePadding = 20
    const pageGap = 40
    const availableWidth = screenWidth - containerPadding * 2
    const availableHeight = screenHeight - containerPadding * 2 - insets.top - insets.bottom

    const calculatedPageWidth = (availableWidth - pageGap) / 2 - pagePadding * 2
    const calculatedPageHeight = availableHeight - pagePadding * 2

    setPageWidth(calculatedPageWidth)
    setPageHeight(calculatedPageHeight)
    setContentHeight(screenHeight - insets.top - insets.bottom)

    console.log(`屏幕尺寸: ${screenWidth}x${screenHeight}`)
    console.log(`单页尺寸: ${calculatedPageWidth}x${calculatedPageHeight}`)
  }, [insets])

  // 格式化内容用于分页
  const formatContentForPagination = useCallback((content: string): string => {
    const isHtml =
      content.includes("<!DOCTYPE html") || content.includes("<html") || content.includes("<body")

    let textContent = content

    if (isHtml) {
      const bodyMatch = content.match(/<body[^>]*>([\s\S]*)<\/body>/i)
      if (bodyMatch && bodyMatch[1]) {
        textContent = bodyMatch[1]
      }

      textContent = textContent
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, "")
        .replace(/&nbsp;/g, " ")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
    }

    return textContent
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/\n\s*\n/g, "\n")
      .replace(/^\s+|\s+$/g, "")
  }, [])

  // 分页处理
  const paginateContent = useCallback(async () => {
    if (!chapterContent || !pageWidth || !pageHeight) {
      console.log(`📖 [EPUB阅读器] ⚠️ 分页条件不满足:`, {
        hasContent: !!chapterContent,
        pageWidth,
        pageHeight,
      })
      return
    }

    setLoading(true)
    console.log(`📖 [EPUB阅读器] 📄 开始分页处理，内容长度: ${chapterContent.length} 字符`)

    try {
      const formattedText = formatContentForPagination(chapterContent)
      console.log(`📖 [EPUB阅读器] 📄 格式化后内容长度: ${formattedText.length} 字符`)

      const options: PaginationOptions = {
        containerWidth: pageWidth,
        containerHeight: pageHeight,
        fontSize,
        fontFamily: "'Source Han Serif', 'Noto Serif SC', '方正书宋', serif",
        lineHeight: 1.8,
        padding: 30,
        textColor: theme.textColor,
        backgroundColor: theme.bgColor,
      }

      console.log(`📖 [EPUB阅读器] 📄 分页参数:`, options)

      if (paginatorRef.current) {
        paginatorRef.current.updateOptions(options)
        console.log(`📖 [EPUB阅读器] 📄 更新分页器选项`)
      } else {
        paginatorRef.current = new EpubPaginator(options)
        console.log(`📖 [EPUB阅读器] 📄 创建新分页器`)
      }

      const result = await paginatorRef.current.paginate(formattedText)

      console.log(`📖 [EPUB阅读器] ✅ 分页完成:`, {
        totalPages: result.totalPages,
        averageCharsPerPage: result.debugInfo.averageCharsPerPage,
        containerSize: result.debugInfo.containerSize,
        effectiveSize: result.debugInfo.effectiveSize,
      })

      setAllPages(result.pages)
      setTotalPages(result.totalPages)
      setCurrentPageIndex(0)
      updateCurrentPageContent(0, result.pages)

      // 更新缓存中的分页信息
      if (currentChapter) {
        const cached = chapterCacheRef.current.get(currentChapter.id)
        if (cached) {
          cached.pages = result.pages
          chapterCacheRef.current.set(currentChapter.id, cached)
          console.log(`📖 [EPUB阅读器] 💾 更新缓存中的分页信息`)
        }
      }
    } finally {
      setLoading(false)
      console.log(`📖 [EPUB阅读器] 🔄 分页处理完成`)
    }
  }, [
    chapterContent,
    pageWidth,
    pageHeight,
    fontSize,
    theme,
    formatContentForPagination,
    updateCurrentPageContent,
    currentChapter,
  ])

  // 更新当前页面内容
  const updateCurrentPageContent = useCallback(
    (pageIndex: number, pages?: string[]) => {
      const pagesArray = pages || allPages
      const leftIndex = pageIndex
      const rightIndex = pageIndex + 1

      setLeftPageContent(pagesArray[leftIndex] || "")
      setRightPageContent(pagesArray[rightIndex] || "")
      setCurrentPageNumber(leftIndex + 1)

      // 只更新本地进度，不立即保存到服务器
      const progress =
        pagesArray.length > 1 ? Math.round((leftIndex / (pagesArray.length - 1)) * 100) : 0
      updateProgress(progress)
    },
    [allPages, updateProgress],
  )

  // 跳转到指定页面
  const jumpToPage = useCallback(
    (pageIndex: number) => {
      const clampedIndex = Math.max(0, Math.min(pageIndex, totalPages - 1))
      console.log(
        `📖 [EPUB阅读器] 📄 跳转到页面: ${pageIndex} -> ${clampedIndex} (总页数: ${totalPages})`,
      )
      setCurrentPageIndex(clampedIndex)
      updateCurrentPageContent(clampedIndex)
    },
    [totalPages, updateCurrentPageContent],
  )

  // 上一页
  const prevPage = useCallback(() => {
    console.log(`📖 [EPUB阅读器] ⬅️ 用户请求上一页，当前页: ${currentPageIndex}`)

    if (currentPageIndex > 0) {
      console.log(`📖 [EPUB阅读器] ⬅️ 翻到上一页`)
      jumpToPage(currentPageIndex - 2) // 双页模式，每次翻2页
    } else {
      // 尝试跳转到上一章
      const currentIndex = bookChapters.findIndex((c) => c.id === currentChapter?.id)
      console.log(`📖 [EPUB阅读器] ⬅️ 当前章节索引: ${currentIndex}`)

      if (currentIndex > 0) {
        const prevChapter = bookChapters[currentIndex - 1]
        console.log(`📖 [EPUB阅读器] ⬅️ 跳转到上一章: ${prevChapter.title}`)
        jumpToChapter(prevChapter)
      } else {
        console.log(`📖 [EPUB阅读器] ⬅️ 已经是第一页`)
        Alert.alert("提示", "已经是第一页")
      }
    }
  }, [currentPageIndex, jumpToPage, bookChapters, currentChapter, jumpToChapter])

  // 下一页
  const nextPage = useCallback(() => {
    console.log(
      `📖 [EPUB阅读器] ➡️ 用户请求下一页，当前页: ${currentPageIndex}, 总页数: ${totalPages}`,
    )

    if (currentPageIndex + 2 < totalPages) {
      console.log(`📖 [EPUB阅读器] ➡️ 翻到下一页`)
      jumpToPage(currentPageIndex + 2) // 双页模式，每次翻2页
    } else {
      // 尝试跳转到下一章
      const currentIndex = bookChapters.findIndex((c) => c.id === currentChapter?.id)
      console.log(
        `📖 [EPUB阅读器] ➡️ 当前章节索引: ${currentIndex}, 总章节数: ${bookChapters.length}`,
      )

      if (currentIndex < bookChapters.length - 1) {
        const nextChapter = bookChapters[currentIndex + 1]
        console.log(`📖 [EPUB阅读器] ➡️ 跳转到下一章: ${nextChapter.title}`)
        jumpToChapter(nextChapter)
      } else {
        console.log(`📖 [EPUB阅读器] ➡️ 已经是最后一页`)
        Alert.alert("提示", "已经是最后一页")
      }
    }
  }, [currentPageIndex, totalPages, jumpToPage, bookChapters, currentChapter, jumpToChapter])

  // 加载章节内容
  const loadChapterContent = useCallback(
    async (chapterId: number) => {
      try {
        setLoading(true)
        console.log(`📖 [EPUB阅读器] 🔄 开始加载章节内容，chapterId: ${chapterId}`)

        // 检查缓存
        const cached = chapterCacheRef.current.get(chapterId)
        if (cached) {
          console.log(`📖 [EPUB阅读器] 💾 使用缓存章节内容，页数: ${cached.pages.length}`)
          setChapterContent(cached.content)
          setAllPages(cached.pages)
          setTotalPages(cached.pages.length)
          setCurrentPageIndex(0)
          updateCurrentPageContent(0, cached.pages)
          return
        }

        console.log(`📖 [EPUB阅读器] 🌐 从服务器获取章节内容`)
        const chapterData = await getChapterDetail(chapterId)

        if (!chapterData || !chapterData.content) {
          throw new Error("章节内容为空")
        }

        // 处理HTML内容，提取纯文本
        let processedContent = chapterData.content
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "") // 移除script标签
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "") // 移除style标签
          .replace(/<img[^>]*>/gi, "[图片]") // 替换图片为占位符
          .replace(/<br\s*\/?>/gi, "\n") // br标签转换为换行
          .replace(/<\/p>/gi, "\n\n") // p标签结束转换为双换行
          .replace(/<[^>]*>/g, "") // 移除所有其他HTML标签
          .replace(/&#13;/g, "\n") // 替换HTML实体
          .replace(/&nbsp;/g, " ") // 替换空格实体
          .replace(/&lt;/g, "<") // 替换小于号实体
          .replace(/&gt;/g, ">") // 替换大于号实体
          .replace(/&amp;/g, "&") // 替换&实体
          .replace(/\n\s*\n\s*\n/g, "\n\n") // 合并多余的换行
          .trim()

        // 如果处理后内容为空，使用原始内容
        if (!processedContent) {
          processedContent = `第${chapterData.order}章 ${chapterData.title}\n\n章节内容加载中...`
        }

        console.log(
          `📖 [EPUB阅读器] ✅ 章节内容获取成功，处理后长度: ${processedContent.length} 字符`,
        )
        setChapterContent(processedContent)

        // 缓存内容
        chapterCacheRef.current.set(chapterId, {
          content: processedContent,
          pages: [], // 分页后会更新
        })
        console.log(`📖 [EPUB阅读器] 💾 章节内容已缓存`)
      } catch (error) {
        console.error("📖 [EPUB阅读器] ❌ 加载章节内容失败:", error)
        Alert.alert("提示", "加载章节内容失败")
      } finally {
        setLoading(false)
      }
    },
    [updateCurrentPageContent],
  )

  // 跳转到指定章节
  const jumpToChapter = useCallback(
    async (chapter: Chapter) => {
      console.log(`📖 [EPUB阅读器] 📚 跳转到章节:`, {
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        chapterOrder: chapter.order,
      })
      setCurrentChapter(chapter)
      await loadChapterContent(chapter.id)
    },
    [loadChapterContent],
  )

  // 加载书籍详情
  // 在 loadBookDetail 中确保正确设置章节
  const loadBookDetail = useCallback(async () => {
    try {
      setLoading(true)
      const bookData = await getBookDetail(bookId)

      setBookTitle(bookData.title)
      setBookChapters(bookData.chapters || [])

      // 加载第一章或恢复阅读位置
      if (bookData.reading_history && bookData.chapters.length > 0) {
        const lastChapterId = bookData.reading_history.chapter
        const lastChapter = bookData.chapters.find((c) => c.id === lastChapterId)

        if (lastChapter) {
          setCurrentChapter(lastChapter)
          await loadChapterContent(lastChapter.id)
        } else if (bookData.chapters.length > 0) {
          setCurrentChapter(bookData.chapters[0])
          await loadChapterContent(bookData.chapters[0].id)
        }
      } else if (bookData.chapters.length > 0) {
        setCurrentChapter(bookData.chapters[0])
        await loadChapterContent(bookData.chapters[0].id)
      }
    } catch (error) {
      console.error("加载书籍详情失败:", error)
      Alert.alert("提示", "加载书籍详情失败")
    } finally {
      setLoading(false)
    }
  }, [bookId, loadChapterContent])

  // 手势处理
  const onGestureEvent = useCallback(
    (event: any) => {
      const { translationX, state } = event.nativeEvent

      console.log(`📖 [手势] 状态: ${state}, 位移: ${translationX}`)

      // State.END = 5, State.CANCELLED = 3, State.FAILED = 1
      // 但由于ScrollView拦截，可能收不到END状态，所以在ACTIVE状态下也处理
      if (state === State.END || state === 5) {
        console.log(`📖 [手势] 手势结束，位移: ${translationX}`)
        if (Math.abs(translationX) > 50) {
          if (translationX > 0) {
            console.log(`📖 [手势] 右滑，上一页`)
            prevPage()
          } else {
            console.log(`📖 [手势] 左滑，下一页`)
            nextPage()
          }
        } else {
          console.log(`📖 [手势] 位移不足，忽略`)
        }
      } else if (state === State.ACTIVE || state === 4) {
        // 在滑动过程中，如果位移足够大，也触发翻页
        if (Math.abs(translationX) > 150) {
          console.log(`📖 [手势] ACTIVE状态触发翻页，位移: ${translationX}`)
          if (translationX > 0) {
            console.log(`📖 [手势] 右滑，上一页`)
            prevPage()
          } else {
            console.log(`📖 [手势] 左滑，下一页`)
            nextPage()
          }
        }
      }
    },
    [prevPage, nextPage],
  )

  // 切换控制面板
  const toggleControls = useCallback(() => {
    setShowControls(!showControls)
    if (showControls) {
      setShowToc(false)
      setShowSettings(false)
    }
  }, [showControls])

  // 进度条变化
  const _onProgressChange = useCallback(
    (value: number) => {
      const targetPageIndex = Math.floor((value / 100) * (totalPages - 1))
      jumpToPage(targetPageIndex)
    },
    [totalPages, jumpToPage],
  )

  // 初始化
  useEffect(() => {
    calculatePageSize()
    loadBookDetail()

    return () => {
      cleanupProgress()
      if (paginatorRef.current) {
        paginatorRef.current.destroy()
      }
    }
  }, []) // 移除依赖项，只在组件挂载时执行一次

  // 监听字体和主题变化，重新分页
  useEffect(() => {
    if (chapterContent && pageWidth && pageHeight) {
      paginateContent()
    }
  }, [fontSize, currentTheme, chapterContent, pageWidth, pageHeight]) // 移除 paginateContent 依赖

  // 页面隐藏时保存进度
  useEffect(() => {
    const handleAppStateChange = () => {
      saveProgressImmediately(currentChapter?.id, currentProgress)
    }

    return handleAppStateChange
  }, [currentChapter, currentProgress, saveProgressImmediately])

  if (loading && !chapterContent) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bgColor }]}>
        <StatusBar />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.highlightColor} />
          <Text style={[styles.loadingText, { color: theme.textColor }]}>加载中...</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bgColor }]}>
      <StatusBar />

      {/* 阅读区域 */}
      <PanGestureHandler onGestureEvent={onGestureEvent}>
        <View style={styles.readingArea}>
          <TouchableOpacity
            style={styles.readingBackground}
            onPress={toggleControls}
            activeOpacity={1}
          >
            {/* 双页布局 */}
            <View style={styles.dualPageLayout}>
              {/* 左页 */}
              <View style={[styles.leftPage, { width: pageWidth, height: pageHeight }]}>
                <ScrollView style={styles.pageScrollView} showsVerticalScrollIndicator={false}>
                  <Text
                    style={[
                      styles.pageContent,
                      {
                        color: theme.textColor,
                        fontSize: fontSize,
                        lineHeight: fontSize * 1.8,
                      },
                    ]}
                  >
                    {leftPageContent}
                  </Text>
                </ScrollView>
                {leftPageContent && (
                  <Text style={[styles.pageNumber, { color: theme.textColor }]}>
                    {String(currentPageNumber).padStart(2, "0")}
                  </Text>
                )}
              </View>

              {/* 右页 */}
              <View style={[styles.rightPage, { width: pageWidth, height: pageHeight }]}>
                <ScrollView style={styles.pageScrollView} showsVerticalScrollIndicator={false}>
                  <Text
                    style={[
                      styles.pageContent,
                      {
                        color: theme.textColor,
                        fontSize: fontSize,
                        lineHeight: fontSize * 1.8,
                      },
                    ]}
                  >
                    {rightPageContent}
                  </Text>
                </ScrollView>
                {rightPageContent && (
                  <Text style={[styles.pageNumber, { color: theme.textColor }]}>
                    {String(currentPageNumber + 1).padStart(2, "0")}
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </PanGestureHandler>

      {/* 控制栏 */}
      {showControls && (
        <View style={styles.controlsOverlay}>
          {/* 顶部标题栏 */}
          <NavBar title={bookTitle} leftArrow onBackPress={() => router.back()} />

          {/* 底部控制栏 */}
          <View style={styles.footerOverlay}>
            {/* 进度条 */}
            <View style={styles.progressContainer}>
              <Text style={[styles.progressText, { color: theme.textColor }]}>
                {currentProgress}%
              </Text>
              {/* 这里需要实现一个Slider组件 */}
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${currentProgress}%`,
                      backgroundColor: theme.highlightColor,
                    },
                  ]}
                />
              </View>
            </View>

            {/* 控制按钮 */}
            <View style={styles.controlButtons}>
              <TouchableOpacity style={styles.controlButton} onPress={prevPage}>
                <Ionicons name="chevron-back" size={rpx(24)} color={theme.textColor} />
                <Text style={[styles.controlButtonText, { color: theme.textColor }]}>上一页</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton} onPress={() => setShowToc(!showToc)}>
                <Ionicons name="list" size={rpx(24)} color={theme.textColor} />
                <Text style={[styles.controlButtonText, { color: theme.textColor }]}>目录</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.controlButton}
                onPress={() => setShowSettings(!showSettings)}
              >
                <Ionicons name="settings" size={rpx(24)} color={theme.textColor} />
                <Text style={[styles.controlButtonText, { color: theme.textColor }]}>设置</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton} onPress={nextPage}>
                <Ionicons name="chevron-forward" size={rpx(24)} color={theme.textColor} />
                <Text style={[styles.controlButtonText, { color: theme.textColor }]}>下一页</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* 目录面板 */}
      {showToc && (
        <View style={[styles.tocPanel, { backgroundColor: theme.bgColor }]}>
          <View style={styles.tocHeader}>
            <Text style={[styles.tocTitle, { color: theme.textColor }]}>目录</Text>
            <TouchableOpacity onPress={() => setShowToc(false)}>
              <Ionicons name="close" size={rpx(24)} color={theme.textColor} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.tocContent}>
            {bookChapters.map((chapter) => (
              <TouchableOpacity
                key={chapter.id}
                style={[styles.tocItem, currentChapter?.id === chapter.id && styles.tocItemActive]}
                onPress={() => {
                  jumpToChapter(chapter)
                  setShowToc(false)
                }}
              >
                <Text
                  style={[
                    styles.tocItemText,
                    { color: theme.textColor },
                    currentChapter?.id === chapter.id && { color: theme.highlightColor },
                  ]}
                >
                  {chapter.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 设置面板 */}
      {showSettings && (
        <View style={[styles.settingsPanel, { backgroundColor: theme.bgColor }]}>
          <View style={styles.settingsHeader}>
            <Text style={[styles.settingsTitle, { color: theme.textColor }]}>设置</Text>
            <TouchableOpacity onPress={() => setShowSettings(false)}>
              <Ionicons name="close" size={rpx(24)} color={theme.textColor} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.settingsContent}>
            {/* 主题选择 */}
            <View style={styles.settingSection}>
              <Text style={[styles.sectionTitle, { color: theme.textColor }]}>主题</Text>
              <View style={styles.themeOptions}>
                {themes.map((themeOption, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.themeOption,
                      { backgroundColor: themeOption.bgColor },
                      currentTheme === index && styles.themeOptionActive,
                    ]}
                    onPress={() => changeTheme(index)}
                  >
                    <Text style={[styles.themeOptionText, { color: themeOption.textColor }]}>
                      {themeOption.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 字体大小 */}
            <View style={styles.settingSection}>
              <Text style={[styles.sectionTitle, { color: theme.textColor }]}>字体大小</Text>
              <View style={styles.fontSizeControls}>
                <TouchableOpacity style={styles.fontButton} onPress={decreaseFontSize}>
                  <Ionicons name="remove" size={rpx(20)} color={theme.textColor} />
                </TouchableOpacity>
                <Text style={[styles.fontSizeText, { color: theme.textColor }]}>{fontSize}px</Text>
                <TouchableOpacity style={styles.fontButton} onPress={increaseFontSize}>
                  <Ionicons name="add" size={rpx(20)} color={theme.textColor} />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      )}

      {/* 加载遮罩 */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.highlightColor} />
        </View>
      )}
    </View>
  )
}

const styles = createStyles({
  container: {
    flex: 1,
    width: "100%" as const,
    height: "100%" as const,
  },
  readingArea: {
    flex: 1,
  },
  readingBackground: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  dualPageLayout: {
    flexDirection: "row" as const,
    gap: 40,
    flex: 1,
  },
  leftPage: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 20,
    position: "relative" as const,
  },
  rightPage: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 8,
    padding: 20,
    position: "relative" as const,
  },
  pageScrollView: {
    flex: 1,
  },
  pageContent: {
    textAlign: "justify" as const,
    letterSpacing: 0.5,
  },
  pageNumber: {
    position: "absolute" as const,
    bottom: 10,
    right: 15,
    fontSize: 12,
    opacity: 0.6,
  },
  controlsOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between" as const,
  },
  headerOverlay: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold" as const,
    flex: 1,
    textAlign: "center" as const,
    marginHorizontal: 20,
  },
  placeholder: {
    width: 40,
  },
  footerOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  progressContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 15,
  },
  progressText: {
    fontSize: 14,
    marginRight: 15,
    minWidth: 40,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
  },
  progressFill: {
    height: "100%" as const,
    borderRadius: 2,
  },
  controlButtons: {
    flexDirection: "row" as const,
    justifyContent: "space-around" as const,
  },
  controlButton: {
    alignItems: "center" as const,
    padding: 10,
  },
  controlButtonText: {
    fontSize: 12,
    marginTop: 4,
  },
  tocPanel: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 60,
  },
  tocHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  tocTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
  },
  tocContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tocItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  tocItemActive: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  tocItemText: {
    fontSize: 16,
  },
  settingsPanel: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 60,
  },
  settingsHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  settingsTitle: {
    fontSize: 18,
    fontWeight: "bold" as const,
  },
  settingsContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  settingSection: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold" as const,
    marginBottom: 15,
  },
  themeOptions: {
    flexDirection: "row" as const,
    gap: 15,
  },
  themeOption: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center" as const,
    borderWidth: 2,
    borderColor: "transparent",
  },
  themeOptionActive: {
    borderColor: "#007AFF",
  },
  themeOptionText: {
    fontSize: 14,
    fontWeight: "500" as const,
  },
  fontSizeControls: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 30,
  },
  fontButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  fontSizeText: {
    fontSize: 16,
    fontWeight: "bold" as const,
    minWidth: 60,
    textAlign: "center" as const,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 15,
  },
  loadingOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
})
