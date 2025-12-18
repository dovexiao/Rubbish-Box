import React, {useMemo, useState, useCallback, useEffect, useRef} from 'react';
import {View, StyleSheet, Dimensions, TouchableOpacity, Text, ActivityIndicator, Pressable} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {useRouter, useLocalSearchParams} from 'expo-router';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {StatusBar} from '../../components/StatusBar';
import {createStyles, rpx} from '../../utils/rpxStyleSheet';
import {useReaderThemeStore} from '../../stores/readerThemeStore';
import {useReadingProgress} from '../../hooks/useReadingProgress';
import useBookStore, {
  handleBookDetailInitialized,
  loadChapterContent,
  formatChapterContent,
  initializeChapterPaginate,
  initializeChapterContent,
  resetLoadedChaptersToCurrent,
  prependPages,
  appendPages,
  calculateChapterProgress,
  turnNext,
  turnPrev,
} from './store/useBookStore';
import type { Chapter } from './store/useBookStore';
import BookPage from './components/BookPage';
import BookOperationPanel from './components/BookOperationPanel';
import BackButton from './components/BackButton';
import ThemeSettingsModal from './components/ThemeSettingsModal';
import CatalogPanel from './components/CatalogPanel';
import {EpubPaginator, PaginationOptions} from '../../utils/epubPaginator';
import {showError, showInfo} from '../../utils/toast';
import {Ionicons} from '@expo/vector-icons';
import {useActivityTracking} from '../../hooks/useActivityTracking';
import {useFocusEffect} from 'expo-router';

type Direction = 'idle' | 'forward' | 'backward'; // idle: 不移动, forward: 向前拖动（向后翻页）, backward: 向后拖动（向前翻页）

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');


const PERSPECTIVE = 1600;

const EpubReader: React.FC = () => {
  const router = useRouter()
  const params = useLocalSearchParams()
  const insets = useSafeAreaInsets()

  // 获取传入参数
  const bookId = parseInt(params.bookId as string)
  const _bookUrl = params.bookUrl as string
  const _readRecord = params.readRecord as string

  // 页面初始化接收参数日志打印
  useEffect(() => {
    console.log(`📖 [EPUB阅读器] 页面初始化，接收参数:`, {
      bookId,
      bookUrl: _bookUrl,
      readRecord: _readRecord,
      decodedBookUrl: _bookUrl ? decodeURIComponent(_bookUrl) : undefined,
    });
  }, []);

  // 主题和进度管理
  const fontSize = useReaderThemeStore(state => state.fontSize);
  const currentThemeIndex = useReaderThemeStore(state => state.currentThemeIndex);
  const themes = useReaderThemeStore(state => state.themes);
  const {loadReaderSettings, saveReaderSettings} = useReaderThemeStore();

  const {
    currentProgress,
    updateProgress,
    updateAndSaveProgress,
    saveProgressImmediately,
    cleanup: cleanupProgress,
  } = useReadingProgress(bookId);

  // 加载状态，用于等待占位和幂等性处理
  const [loading, setLoading] = useState(false);
  const loadingBookDetailRef = useRef(false);
  const loadingPaginateRef = useRef(false);

  // 分页放行标志
  const paginateAllowedRef = useRef(false);

  // 书页尺寸相关状态与方法
  const [bookWidth, setBookWidth] = useState(screenWidth);
  const [bookHeight, setBookHeight] = useState(screenHeight);
  const pageWidth = useMemo(() => bookWidth / 2, [bookWidth]);
  const pageHeight = useMemo(() => bookHeight, [bookHeight]);

  // 书本与章节相关状态与方法
  const saveBookId = useBookStore(state => state.bookId);
  const bookTitle = useBookStore(state => state.bookTitle);
  const bookChapters = useBookStore(state => state.bookChapters);
  const currentChapter = useBookStore(state => state.currentChapter);
  const loadedChapters = useBookStore(state => state.loadedChapters); // 章节池
  
  // 活动追踪 - 追踪阅读行为
  const { startReading, updateReadingProgress, endReading } = useActivityTracking({
    throttleDelay: 3000, // 阅读进度更新节流3秒
    autoExitOnUnmount: true,
  })

  // 分页相关状态
  const pages = useBookStore(state => state.pages); // 分页数据 // 更新分页数据
  const currentPageIndex = useBookStore(state => state.currentPageIndex); // 当前分页索引（用于保存和恢复进度
  const leftShowPageIndex = useBookStore(state => state.leftShowPageIndex); // 左书页展示分页索引
  const rightShowPageIndex = useBookStore(state => state.rightShowPageIndex); // 右书页展示分页索引
  const paginatorRef = useRef<EpubPaginator | null>(null); // 分页器实例引用

  // 翻动书页相关状态
  const directionSV = useSharedValue<Direction>('idle'); // 书页翻转方向
  const isFirstChapterPageSV = useSharedValue(false);
  const isLastChapterPageSV = useSharedValue(false);
  useEffect(() => {
    isFirstChapterPageSV.value = currentChapter?.id === bookChapters[0]?.id && currentPageIndex - 2 < 0;
    isLastChapterPageSV.value = currentChapter?.id === bookChapters[bookChapters.length - 1]?.id && currentPageIndex + 2 >= pages.length;
  }, [currentChapter, bookChapters, currentPageIndex, pages]);

  // 弹窗状态与方法
  const [showSettings, setShowSettings] = useState(false); // 主题设置弹窗状态
  const [showToc, setShowToc] = useState(false); // 目录面板状态
  const [showOperationPanel, setShowOperationPanel] = useState(false); // 操作面板显示状态
  const [showBackButton, setShowBackButton] = useState(false); // 返回键显示状态

  // 加载章节内容 (需要处理反馈状态)
  const loadChapterContentWithFeedback = useCallback(async (chapterId: number): Promise<Chapter> => {
    try {
      return await loadChapterContent(chapterId);
    } catch (error: unknown) {
      console.error('📖 [EPUB阅读器] ❌ 加载章节内容失败:', error);
      showError('加载章节内容失败');
      throw error;
    }
  }, []);

  // 加载书本详情
  const loadBookDetail = useCallback(async () => {
    try {
      if (pages && pages.length > 0 && bookId === saveBookId) {
        console.log(`📖 [EPUB阅读器] 📚 书本详情已加载，跳过加载:`, {
          bookId: bookId,
          saveBookId: saveBookId,
          pages: pages,
          pagesLength: pages.length,
        });
        setLoading(false);
        return;
      }
      
      // 考虑幂等，防止重复加载
      if (loadingBookDetailRef.current) {
        return;
      }
      loadingBookDetailRef.current = true;

      const chapterId: number = await handleBookDetailInitialized(bookId);
      if (chapterId !== -1) {
        const chapter = await loadChapterContentWithFeedback(chapterId);
        initializeChapterContent(chapter);
      } else {
        console.error('📖 [EPUB阅读器] ❌ 加载书籍详情失败:', '参数id缺失或无效');
        showError('加载书籍详情失败');
      }
      loadingBookDetailRef.current = false;
      console.log(`📖 [EPUB阅读器] 📏 加载书籍详情完成:`, {
        bookId: bookId,
        loadingRef: loadingBookDetailRef.current,
      });
    } catch (error: unknown) {
      console.error('📖 [EPUB阅读器] ❌ 加载书籍详情失败:', error);
      showError('加载书籍详情失败');
    } finally {
      loadingBookDetailRef.current = false;
    }
  }, [bookId]);

  // 初始化
  useEffect(() => {
    setLoading(true);
    loadReaderSettings().then(() => {
      loadBookDetail();
    })

    return () => {
      cleanupProgress()
      if (paginatorRef.current) {
        paginatorRef.current.destroy()
      }
    }
  }, []);

  // 📊 启动阅读追踪（当书本详情加载完成后）
  useEffect(() => {
    if (bookTitle && saveBookId && saveBookId > 0) {
      console.log("📊 [活动追踪] 启动阅读追踪", { bookId: saveBookId, bookTitle, currentProgress })
      startReading({
        bookId: String(saveBookId),
        bookName: bookTitle,
        progress: Math.round(currentProgress * 100), // 转换为0-100的百分比
        currentPage: currentPageIndex + 1,
        totalPages: pages.length,
        chapterId: currentChapter?.id ? String(currentChapter.id) : undefined,
        chapterName: currentChapter?.title,
      })
    }
  }, [bookTitle, saveBookId, startReading, currentProgress, currentPageIndex, pages.length, currentChapter]); // 只在书本信息加载时触发一次

  // 📊 更新阅读进度（当进度变化时）
  useEffect(() => {
    if (saveBookId && saveBookId > 0 && currentProgress > 0 && bookTitle) {
      const progressPercent = Math.round(currentProgress * 100)
      updateReadingProgress(progressPercent, {
        currentPage: currentPageIndex + 1,
        totalPages: pages.length,
        chapterId: currentChapter?.id ? String(currentChapter.id) : undefined,
        chapterName: currentChapter?.title,
      })
    }
  }, [currentProgress, currentPageIndex, pages.length, currentChapter, updateReadingProgress, saveBookId, bookTitle]);

  // 📊 监听页面失焦，确保退出消息发送
  useFocusEffect(
    useCallback(() => {
      return () => {
        console.log("📊 [活动追踪] 阅读页面失焦，退出阅读")
        endReading()
      }
    }, [endReading])
  );

  // 分页处理
  const paginateContent = useCallback(async (chapter: Chapter) => {
    if (!chapter?.content || !pageWidth || !pageHeight) {
      console.log(`📖 [EPUB阅读器] ⚠️ 分页条件不满足:`, {
        hasContent: !!chapter?.content,
        pageWidth,
        pageHeight
      });
      return null;
    }

    // 防止重复分页
    if (loadingPaginateRef.current) {
      console.log(`📖 [EPUB阅读器] 📏 分页处理中，跳过分页:`, {
        bookId: bookId,
        loadingRef: loadingPaginateRef.current,
      });
      return null;
    }
    loadingPaginateRef.current = true;

    console.log(`📖 [EPUB阅读器] 📄 开始分页处理，内容长度: ${chapter.content.length} 字符`);

    try {
      const formattedText = formatChapterContent(chapter?.content ?? '');
      console.log(`📖 [EPUB阅读器] 📄 格式化后内容长度: ${formattedText.length} 字符`);

      // 屏幕内容相关参数配置用于计算分页
      const options: PaginationOptions = {
        containerWidth: 1920 / 2 - 65 * 2,
        containerHeight: (pageHeight * 1920 / screenWidth) - 264, // pageHeight = 内容高度 +（页码高度40px + 安全边距上下30px + 移动设备顶部的状态栏164px）
        fontSize,
        fontFamily: "'Source Han Serif', 'Noto Serif SC', '方正书宋', serif",
        lineHeight: 1.8,
        padding: 0,
        textColor: '',
        backgroundColor: '',
      }

      console.log('📖 [EPUB阅读器] 📏 分页选项:', {
        '屏幕内容宽度': `${options.containerWidth}px`,
        '屏幕内容高度': `${options.containerHeight}px ${screenWidth} ${pageHeight}`,
        '字号': `${options.fontSize}px`,
        '行高': options.lineHeight,
      });

      if (paginatorRef.current) {
        paginatorRef.current.updateOptions(options)
      } else {
        paginatorRef.current = new EpubPaginator(options)
      }

      return await paginatorRef.current.paginate(formattedText);
    } catch (error: unknown) {
      console.error('📖 [EPUB阅读器] ❌ 分页处理失败:', error);
      showError('分页处理失败');
      return null;
    } finally {
      loadingPaginateRef.current = false;
      setLoading(false);
    }
  }, [fontSize, pageWidth, pageHeight])

  // 初始化当前章节分页
  const initializeCurrentChapterPaginate = useCallback(async (chapter: Chapter) => {
    const result = await paginateContent(chapter);
    if (!result?.pages) {
      return;
    }
    initializeChapterPaginate(result?.pages ?? []);
  }, [paginateContent])

  // 监听当前章节和章节池变化，对当前章节重新分页，期望为重置整个章节状态
  useEffect(() => {
    console.log(`📖 [EPUB阅读器] 📏 当前章节或章节池变化:`, {currentChapter, loadedChapters});

    const canPaginate = 
      !!pageWidth && 
      !!pageHeight && 
      !!currentChapter && !!currentChapter?.content && !currentChapter?.isPaginated &&
      !!loadedChapters && loadedChapters.length === 1 && loadedChapters[0]?.id === currentChapter?.id;

    if (!canPaginate) {
      console.log(`📖 [EPUB阅读器] 📏 当前章节分页条件不足:`, {
        pageWidth: pageWidth,
        pageHeight: pageHeight,
        hasContent: !!currentChapter?.content,
        isPaginated: !!currentChapter?.isPaginated,
        hasOneChapterInPool: loadedChapters.length === 1,
        isFirstChapterInPool: loadedChapters[0]?.id === currentChapter?.id,
        canPaginate: false,
      });
      return;
    }

    // 初始化当前章节分页
    setLoading(true);
    initializeCurrentChapterPaginate(currentChapter);
  }, [currentChapter, loadedChapters, pageWidth, pageHeight])

  // 监听字号变化，处理当前章节
  useEffect(() => {
    console.log(`📖 [EPUB阅读器] 📏 字体或者屏幕尺寸变化:`, {fontSize, pageWidth, pageHeight});
    // 规避组件初始化第一次无意义的分页处理
    if (!paginateAllowedRef.current) {
      paginateAllowedRef.current = true;
      return;
    }

    const currentChapter = useBookStore.getState().currentChapter;
    if (!currentChapter?.content || !pageWidth || !pageHeight) {
      console.log(`📖 [EPUB阅读器] 📏 字号变化处理当前章节条件不足:`, {
        pageWidth: pageWidth,
        pageHeight: pageHeight,
        hasContent: !!currentChapter?.content,
        canPaginate: false,
      });
      return;
    }
    resetLoadedChaptersToCurrent();
  }, [fontSize, pageWidth, pageHeight])

  // 动态加载相邻章节并分页
  const loadAdjacentChapterAndPaginate = useCallback(async (previousChapterId: number | null, nextChapterId: number | null, validationToken: string) => {
    if (!previousChapterId && !nextChapterId) {
      console.log('📖 [EPUB阅读器] 📏 动态加载相邻章节: 没有相邻章节', {
        previousChapterId,
        nextChapterId,
      });
      return;
    }

    try {
      const [previousChapterResult, nextChapterResult] = await Promise.allSettled([
        previousChapterId ? loadChapterContentWithFeedback(previousChapterId) : Promise.resolve(null),
        nextChapterId ? loadChapterContentWithFeedback(nextChapterId) : Promise.resolve(null),
      ]);

      const previousChapter = previousChapterResult.status === 'fulfilled' ? previousChapterResult.value : null;
      const nextChapter = nextChapterResult.status === 'fulfilled' ? nextChapterResult.value : null;

      console.log('📖 [EPUB阅读器] 📏 动态加载相邻章节:', {
        previousChapter,
        nextChapter,
      });

      const previousPagesResult = previousChapter ? await paginateContent(previousChapter) : null;
      const nextPagesResult = nextChapter ? await paginateContent(nextChapter) : null;

      console.log('📖 [EPUB阅读器] 📏 动态加载相邻章节分页数组:', {
        previousPagesResult,
        nextPagesResult,
      });

      if (previousChapter && previousChapter.content && previousPagesResult && previousPagesResult?.pages) {
        prependPages(previousChapter, previousPagesResult?.pages, validationToken);
      }
      if (nextChapter && nextChapter.content && nextPagesResult && nextPagesResult?.pages) {
        appendPages(nextChapter, nextPagesResult?.pages, validationToken);
      }
    } catch (error: unknown) {
      console.error('📖 [EPUB阅读器] ❌ 动态加载相邻章节失败:', error);
    }
  }, []);

  // 监听 currentChapter 和 loadedChapters 变化，检查是否需要动态加载相邻章节
  useEffect(() => {
    if (!currentChapter || !currentChapter?.content || !currentChapter?.isPaginated || !loadedChapters || loadedChapters.length === 0) {
      console.log('📖 [EPUB阅读器] 📏 监听 currentChapter 和 loadedChapters 变化: 动态加载相邻章节条件不满足', {
        currentChapter: !!currentChapter,
        hasContent: !!currentChapter?.content,
        isPaginated: !!currentChapter?.isPaginated,
        loadedChapters: !!loadedChapters && loadedChapters.length > 0,
      });
      return;
    }
    console.log('📖 [EPUB阅读器] 📏 监听 currentChapter 和 loadedChapters 变化:', {
      currentChapter: currentChapter,
      loadedChapters: loadedChapters,
    });

    const currentChapterIndexInPool = loadedChapters.findIndex(ch => ch.id === currentChapter.id);
    const isFirstInPool = currentChapterIndexInPool === 0;
    const isLastInPool = currentChapterIndexInPool === loadedChapters.length - 1;

    console.log('📖 [EPUB阅读器] 📏 当前章节在章节池中的索引状态和边界判断:', {
      currentChapterIndexInPool,
      isFirstInPool,
      isLastInPool,
      loadedChapters: loadedChapters.map(ch => `${ch.id}-${ch.title}`).join(','),
    });

    const currentChapterIndexInBook = bookChapters.findIndex(ch => ch.id === currentChapter.id);
    const isFirstInBook = currentChapterIndexInBook === 0;
    const isLastInBook = currentChapterIndexInBook === bookChapters.length - 1;
    const previousChapterId = isFirstInBook || !isFirstInPool ? null : bookChapters[currentChapterIndexInBook - 1].id; 
    const nextChapterId = isLastInBook || !isLastInPool ? null : bookChapters[currentChapterIndexInBook + 1].id;

    console.log('📖 [EPUB阅读器] 📏 动态加载相邻章节:', {
      currentChapterIndexInBook,
      isFirstInBook,
      isLastInBook,
      currentChapterIndexInPool,
      isFirstInPool,
      isLastInPool,
      previousChapterId,
      nextChapterId,
    });

    if (previousChapterId !== null || nextChapterId !== null) {
      console.log('📖 [EPUB阅读器] 📏 动态加载相邻章节: 执行分页:', {
        canPaginate: previousChapterId !== null || nextChapterId !== null,
      });
      loadAdjacentChapterAndPaginate(previousChapterId, nextChapterId, useBookStore.getState().validationToken);
    }
  }, [currentChapter, loadedChapters]);

  // 监听字号和主题变化，保存设置
  useEffect(() => {
    saveReaderSettings();
  }, [fontSize, currentThemeIndex]);

  // 组件卸载时保存进度
  useEffect(() => {
    return () => {
      console.log('📖 [EPUB阅读器] 🚪 组件卸载，保存阅读进度')
      const chapterId = useBookStore.getState().currentChapter?.id
      const progress = calculateChapterProgress() ?? 0
      
      if (chapterId && progress >= 0) {
        console.log('📖 [EPUB阅读器] 💾 保存进度:', {
          chapterId,
          progress,
          chapterTitle: useBookStore.getState().currentChapter?.title,
        })
        // 注意：cleanup 中不能使用 await，直接调用异步函数
        saveProgressImmediately(chapterId, progress)
      } else {
        console.log('📖 [EPUB阅读器] ⚠️ 无有效进度可保存')
      }
    }
  }, [])

  // 处理主题设置按钮点击
  const handleThemePress = useCallback(() => { setShowSettings(true); }, []);
  // 处理目录按钮点击
  const handleCatalogPress = useCallback(() => { setShowToc(true); }, []);
  // 处理章节点击
  const handleChapterPress = useCallback(async (chapterId: number) => { 
    setLoading(true); 
    return await loadChapterContentWithFeedback(chapterId);
  }, [loadChapterContentWithFeedback]);

  // 提示用户无法翻页的回调函数
  const showCannotTurnPageInfo = useCallback((isForward: boolean) => {
    if (isForward) {
      showInfo('已经是最后一页了');
    } else {
      showInfo('已经是第一页了');
    }
  }, []);

  // 滑动手势处理
  const slideGesture = Gesture.Pan()
    .onStart(event => {
      // 手势开始，可以在这里记录初始状态
    })
    .onChange(event => {
      // 手势变化中，可以在这里实现跟随动画
    })
    .onFinalize(event => {
      'worklet';
      // 判断水平滑动方向（无所谓距离，只看方向）
      const translationX = event.translationX;
      
      if (translationX < 0) {
        // 向左滑动（向前滑动，向后翻页）
        const isLastPage = isLastChapterPageSV.value;
        if (!isLastPage) {
          // 不是最后一页，执行向后翻页
          runOnJS(turnNext)();
        } else {
          // 已经是最后一页，反馈提示
          runOnJS(showCannotTurnPageInfo)(true);
        }
      } else if (translationX > 0) {
        // 向右滑动（向后滑动，向前翻页）
        const isFirstPage = isFirstChapterPageSV.value;
        if (!isFirstPage) {
          // 不是第一页，执行向前翻页
          runOnJS(turnPrev)();
        } else {
          // 已经是第一页，反馈提示
          runOnJS(showCannotTurnPageInfo)(false);
        }
      }
      // translationX === 0 时不处理（没有滑动）
    });
  
  if (loading) {
    return (
      <View style={[styles.spread, { backgroundColor: themes[currentThemeIndex].bgColor }]}>
        <StatusBar 
          backgroundColor={'transparent'}
          theme={themes[currentThemeIndex].bgColor === '#4A4A4C' ? 'dark' : 'light'}
        />
        <View style={styles.backContainer}>
          <TouchableOpacity onPress={() => {router.back()}}>
            <Ionicons name="close-circle" size={rpx(23.4375)} color={themes[currentThemeIndex].textColor + '80'} />
          </TouchableOpacity>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={themes[currentThemeIndex].highlightColor} />
          <Text style={[styles.loadingText, { color: themes[currentThemeIndex].textColor }]}>加载中...</Text>
        </View>
      </View>
    )
  }

  return (
    <Pressable 
      onPress={() => {
        // 点击整屏，控制返回键和操作面板显隐（每次取反）
        setShowOperationPanel(prev => !prev);
        setShowBackButton(prev => !prev);
      }} 
      style={styles.spread}>
      <View style={styles.spread} onLayout={event => {
        const {width, height} = event.nativeEvent.layout;
        setBookWidth(width);
        setBookHeight(height);
      }}>
        <StatusBar
          backgroundColor={'transparent'}
          theme={themes[currentThemeIndex].bgColor === '#4A4A4C' ? 'dark' : 'light'}
        />
        {/* 返回键 */}
        <BackButton
          visible={showBackButton}
          containerStyle={styles.backContainer}
          onPress={() => {
            console.log("📊 [活动追踪] 手动退出阅读")
            endReading()
            router.back()
          }}
        />

        {/* 书页翻动手势 */}
        <GestureDetector gesture={slideGesture}>
          <View style={styles.pageContainer}>
            {/* 书页 */}
            <View style={[styles.pageSlot, {width: pageWidth}]}>
              {pages[leftShowPageIndex] && <BookPage page={pages[leftShowPageIndex]} position="left" />}
            </View>
            <View style={[styles.pageSlot, {width: pageWidth}]}>
              {pages[rightShowPageIndex] && <BookPage page={pages[rightShowPageIndex]} position="right" />}
            </View>
          </View>
        </GestureDetector>

        {/* 书页操作面板 */}
        <BookOperationPanel
          containerStyle={styles.Panel}
          visible={showOperationPanel}
          onCatalogPress={handleCatalogPress}
          onThemePress={handleThemePress}
        />
        
        {/* 主题设置弹窗 */}
        <ThemeSettingsModal
          visible={showSettings}
          onClose={() => setShowSettings(false)}
        />

        {/* 目录面板 */}
        <CatalogPanel
          visible={showToc}
          onChapterPress={handleChapterPress}
          onClose={() => setShowToc(false)}
        />
      </View>
    </Pressable>
  );
};

const styles = createStyles({
  spread: {
    flex: 1,
    width: '100%' as const,
    alignSelf: 'center' as const,
    backgroundColor: '#F8F2E6',
    overflow: 'visible' as const,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  loadingText: {
    fontSize: 15.625,
    marginTop: 15.625,
  },
  pageContainer: {
    flex: 1,
    width: '100%' as const,
    height: '100%' as const,
    overflow: 'visible' as const,
    flexDirection: 'row' as const,
  },
  backContainer: {
    position: 'absolute' as const,
    top: 37.109375,
    left: 25.390625,
    zIndex: 10,
  },
  themeOperationButtonContainer: {
    position: 'absolute' as const,
    left: 31.25,
    bottom: 11.71875,
    width: 23.4375,
    height: 23.4375,
    zIndex: 15,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  themeOperationButtonImage: {
    width: 23.4375,
    height: 23.4375,
    resizeMode: 'contain' as const,
  },
  themeOperationPanel: {
    position: 'absolute' as const,
    left: 31.25,
    bottom: 42.96875,
    width: 117.1875,
    borderRadius: 4.6875,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    gap: 4.6875,
    zIndex: 16,
  },
  themeOperationItem: {
    width: '100%' as const,
    paddingVertical: 3.125,
    borderRadius: 4.6875,
    backgroundColor: '#FFFFFF' as const,
  },
  themeOperationText: {
    color: '#323232' as const,
    fontSize: 10.15625,
    fontFamily: "'PingFang SC" as const,
  },
  pageSlot: {
    height: '100%' as const,
  },
  flipContainer: {
    position: 'absolute' as const,
    top: 0,
  },
  flipSide: {
    position: 'absolute' as const,
    width: '50%' as const,
    height: '100%' as const,
    backfaceVisibility: 'visible' as const,
  },
  shade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000033',
  },
  Panel: {
    left: 25.390625,
    bottom: 11.71875,
    zIndex: 10,
  }
});

export default EpubReader;
