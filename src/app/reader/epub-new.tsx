import React, {useMemo, useState, useCallback, useEffect, useRef} from 'react';
import {View, StyleSheet, useWindowDimensions, Dimensions, TouchableOpacity, Image, Text} from 'react-native';
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
import {useReaderTheme} from '../../hooks/useReaderTheme';
import {useReadingProgress} from '../../hooks/useReadingProgress';
import {useBookStore} from './store/useBookStore';
import BookPage from './components/BookPage';
import BookOperationPanel from './components/BookOperationPanel';
import ThemeSettingsModal from './components/ThemeSettingsModal';
import CatalogPanel from './components/CatalogPanel';
import {EpubPaginator, PaginationOptions} from '../../utils/epubPaginator';
import {showError} from '../../utils/toast';
import {Ionicons} from '@expo/vector-icons';

type Direction = 'idle' | 'forward' | 'backward'; // idle: 不移动, forward: 向前拖动（向后翻页）, backward: 向后拖动（向前翻页）

type Chapter = {
  id: number;
  title: string;
  order: number;
};

const {width: screenWidth, height: screenHeight} = Dimensions.get('window');

const clamp = (value: number, min: number, max: number) => {
  'worklet';
  return Math.max(min, Math.min(value, max));
};

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
  const {fontSize, theme} = useReaderTheme(bookId);

  useEffect(() => {
    console.log('📖 [EPUB阅读器] 📏 字体大小变化: ', fontSize);
  }, [fontSize]);

  const {
    currentProgress,
    updateProgress,
    updateAndSaveProgress,
    saveProgressImmediately,
    cleanup: cleanupProgress,
  } = useReadingProgress(bookId);

  // 加载状态，用于等待占位和幂等性处理
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  // 书页尺寸相关状态与方法
  // const {width: screenWidth, height: screenHeight} = useWindowDimensions();
  // const bookWidth = useMemo(() => screenWidth, [screenWidth]);
  // const bookHeight = useMemo(() => screenHeight, [screenHeight]);
  const [bookWidth, setBookWidth] = useState(screenWidth);
  const [bookHeight, setBookHeight] = useState(screenHeight);
  const pageWidth = useMemo(() => bookWidth / 2, [bookWidth]);
  const pageHeight = useMemo(() => bookHeight, [bookHeight]);

  // 书本相关状态与方法
  const currentChapter = useBookStore(state => state.currentChapter);
  const handleBookDetailInitialized = useCallback(async (bookDetail: any) => {
    try {
      return await useBookStore.getState().handleBookDetailInitialized(bookDetail);
    } catch (error: unknown) {
      throw error;
    }
  }, []);
  const loadChapterContent = useCallback(async (chapterId: number) => {
    try {
      await useBookStore.getState().loadChapterContent(chapterId);
    } catch (error: unknown) {
      console.error('📖 [EPUB阅读器] ❌ 加载章节内容失败:', error);
      showError('加载章节内容失败');
      throw error;
    }
  }, []);

  // 分页相关状态
  const pages = useBookStore(state => state.pages); // 分页数据
  const updatePages = useCallback((pages: string[]) => { // 更新分页数据
    useBookStore.getState().setPages(pages);
  }, []);
  const currentPageIndex = useBookStore(state => state.currentPageIndex); // 当前分页索引（用于保存和恢复进度）
  // const setCurrentPageIndex = useCallback((index: number) => {
  //   useBookStore.getState().setCurrentPageIndex(index);
  // }, []);
  const leftShowPageIndex = useBookStore(state => state.leftShowPageIndex); // 左书页展示分页索引
  const setLeftShowPageIndex = useCallback(() => {
    useBookStore.getState().setLeftShowPageIndex();
  }, []);
  const rightShowPageIndex = useBookStore(state => state.rightShowPageIndex); // 右书页展示分页索引
  const setRightShowPageIndex = useCallback(() => {
    useBookStore.getState().setRightShowPageIndex();
  }, []);
  const leftShowPage = useMemo(() => pages[leftShowPageIndex], [pages, leftShowPageIndex]); // 左书页展示分页内容
  const rightShowPage = useMemo(() => pages[rightShowPageIndex], [pages, rightShowPageIndex]); // 右书页展示分页内容
  const canForward = useMemo(() => true, []); // 是否可以向前翻页
  const canBackward = useMemo(() => true, []); // 是否可以向后翻页
  const paginatorRef = useRef<EpubPaginator | null>(null); // 分页器实例引用
  const formatContentForPagination = useCallback((content: string) => { // 格式化章节内容
    return useBookStore.getState().formatChapterContent(content);
  }, []);
  const turnNext = useCallback(() => {
    useBookStore.getState().turnNext();
  }, []);
  const turnPrev = useCallback(() => {
    useBookStore.getState().turnPrev();
  }, []);
  const resetShowPageIndex = useCallback(() => {
    useBookStore.getState().resetShowPageIndex();
  }, []);

  // 翻动书页相关状态
  const directionSV = useSharedValue<Direction>('idle'); // 书页翻转方向
  const rotation = useSharedValue(0); // 书页翻转角度
  const frontPage = useMemo(() => { // 翻动书页正面内容
    if (directionSV.value === 'forward') {
      return pages[currentPageIndex + 1];
    }
    if (directionSV.value === 'backward') {
      return pages[currentPageIndex];
    }
    return undefined;
  }, [directionSV.value, pages, currentPageIndex]);
  const backPage = useMemo(() => { // 翻动书页背面内容
    if (directionSV.value === 'forward') {
      return pages[currentPageIndex + 2];
    }
    if (directionSV.value === 'backward') {
      return pages[currentPageIndex - 1];
    }
    return undefined;
  }, [directionSV.value, pages, currentPageIndex]);

  const handleTurnComplete = useCallback(
    (dir: Direction) => {
      if (dir === 'forward') {
        turnNext();
      } else if (dir === 'backward') {
        turnPrev();
      }
    },
    [turnNext, turnPrev],
  );

  const animateTo = (target: number, dir: Direction, shouldTurn: boolean) => {
    'worklet';
    rotation.value = withTiming(
      target,
      {
        duration: 320,
        easing: Easing.bezier(0.33, 0.01, 0.23, 0.99),
      },
      finished => {
        if (!finished) {
          return;
        }
        if (shouldTurn && dir !== 'idle') {
          runOnJS(handleTurnComplete)(dir);
        }
        rotation.value = 0;
        directionSV.value = 'idle';
        runOnJS(resetShowPageIndex)();
      },
    );
  };

  // 分页处理
  const paginateContent = useCallback(async () => {
    if (!currentChapter?.content || !pageWidth || !pageHeight) {
      console.log(`📖 [EPUB阅读器] ⚠️ 分页条件不满足:`, {
        hasContent: !!currentChapter?.content,
        pageWidth,
        pageHeight,
      });
      return;
    }

    // 防止重复分页
    if (loadingRef.current) {
      return;
    }
    // 设置加载状态
    setLoading(true);
    loadingRef.current = true;

    console.log(`📖 [EPUB阅读器] 📄 开始分页处理，内容长度: ${currentChapter.content.length} 字符`);

    try {
      const formattedText = formatContentForPagination(currentChapter?.content ?? '');
      console.log(`📖 [EPUB阅读器] 📄 格式化后内容长度: ${formattedText.length} 字符`);

      // 屏幕内容相关参数配置用于计算分页
      const options: PaginationOptions = {
        containerWidth: 1920 / 2 - 65 * 2,
        containerHeight: (pageHeight * 1920 / screenWidth) - 196, // pageHeight = 内容高度 +（页码高度40px + 安全边距上下30px + 移动设备顶部的状态栏96px）
        fontSize,
        fontFamily: "'Source Han Serif', 'Noto Serif SC', '方正书宋', serif",
        lineHeight: 1.8,
        padding: 0,
        textColor: theme.textColor,
        backgroundColor: theme.bgColor,
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

      const result = await paginatorRef.current.paginate(formattedText);
      updatePages(result.pages ?? []);
    } catch (error: unknown) {
      console.error('📖 [EPUB阅读器] ❌ 分页处理失败:', error);
      showError('分页处理失败');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [fontSize, theme, currentChapter, pageWidth, pageHeight])

  // 加载书本详情
  const loadBookDetail = useCallback(async () => {
    try {
      // 考虑幂等，防止重复加载
      if (loadingRef.current) {
        return;
      }
      loadingRef.current = true;
      setLoading(true);

      const chapterId: number = await handleBookDetailInitialized(bookId);
      if (chapterId !== -1) {
        await loadChapterContent(chapterId);
      } else {
        console.error('📖 [EPUB阅读器] ❌ 加载书籍详情失败:', '参数id缺失或无效');
        showError('加载书籍详情失败');
      }
    } catch (error: unknown) {
      console.error('📖 [EPUB阅读器] ❌ 加载书籍详情失败:', error);
      showError('加载书籍详情失败');
    } finally {
      setLoading(false)
      loadingRef.current = false;
    }
  }, [bookId]);

  // 监听字体和主题变化，重新分页
  useEffect(() => {
    console.log(`📖 [EPUB阅读器] 📏 字体和主题变化:`, {fontSize, currentChapter, pageWidth, pageHeight});

    if (currentChapter?.content && pageWidth && pageHeight) {
      paginateContent();
    }
  }, [fontSize, currentChapter, pageWidth, pageHeight])

  // 初始化
  useEffect(() => {
    loadBookDetail();
  }, []);

  // 书页翻转手势处理
  const panGesture = Gesture.Pan()
    .onStart(event => {
      let dir: Direction = 'idle';
      if (event.x > pageWidth && canForward) {
        dir = 'forward';
        runOnJS(setRightShowPageIndex)();
      } else if (event.x <= pageWidth && canBackward) {
        dir = 'backward';
        runOnJS(setLeftShowPageIndex)();
      }
      directionSV.value = dir;
    })
    .onChange(event => {
      const dir = directionSV.value;
      if (dir === 'idle') {
        return;
      }
      const delta =
        dir === 'forward'
          ? clamp(-event.translationX, 0, pageWidth)
          : clamp(event.translationX, 0, pageWidth);
      const progress = delta / pageWidth;
      const sign = dir === 'forward' ? -1 : 1;
      rotation.value = progress * 180 * sign;
    })
    .onFinalize(() => {
      if (directionSV.value === 'idle') {
        return;
      }
      const projected = Math.abs(rotation.value);
      const shouldTurn = projected > 75;
      const dir = directionSV.value;
      const target = shouldTurn ? (dir === 'forward' ? -180 : 180) : 0;
      animateTo(target, dir, shouldTurn);
    });

  // 翻动书页样式处理
  const flipPageSideStyle = useAnimatedStyle(() => {
    // const pivot = directionSV.value === 'forward' ? -pageWidth / 2 : pageWidth / 2;
    return {
      transform: [
        {perspective: PERSPECTIVE},
        // {translateX: pivot},
        {rotateY: `${rotation.value}deg`},
        // {translateX: -pivot},
      ],
      opacity: directionSV.value === 'idle' ? withTiming(0, {duration: 100}) : withTiming(1, {duration: 100}),
      display: directionSV.value === 'idle' ? 'none' : 'flex',
    };
  }, [pageWidth]);

  // 翻动书页正面样式处理
  const frontSideStyle = useAnimatedStyle(() => {
    const rotationAbs = Math.abs(rotation.value);
    return {
      display: rotationAbs < 90 ? 'flex' : 'none',
      left: directionSV.value === 'forward' ? pageWidth : 0,
    };
  });

  // 翻动书页背面样式处理
  const backSideStyle = useAnimatedStyle(() => {
    const rotationAbs = Math.abs(rotation.value);
    return {
      transform: [
        {rotateY: '180deg'}
      ],
      display: rotationAbs >= 90 ? 'flex' : 'none',
      left: directionSV.value === 'forward' ? pageWidth : 0,
    };
  }, [pageWidth]);

  // 翻动书页阴影样式处理
  const shadowStyle = useAnimatedStyle(() => {
    const opacity = clamp((90 - Math.abs(rotation.value - 90)) / 140, 0, 0.75);
    return {
      opacity,
    };
  });

  // 主题设置弹窗状态
  const [showSettings, setShowSettings] = useState(false);
  // 目录面板状态
  const [showToc, setShowToc] = useState(false);

  // 处理主题设置按钮点击
  const handleThemePress = useCallback(() => {
    setShowSettings(true);
  }, []);

  // 处理目录按钮点击
  const handleCatalogPress = useCallback(() => {
    setShowToc(true);
  }, []);

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.spread} onLayout={event => {
        const {width, height} = event.nativeEvent.layout;
        setBookWidth(width);
        setBookHeight(height);
      }}>
        {/* 状态栏 */}
        <View style={styles.statusBarContainer}>
          <TouchableOpacity onPress={() => {router.back()}}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
        </View>
        {/* 书页操作面板 */}
        <BookOperationPanel
          containerStyle={styles.Panel}
          onCatalogPress={handleCatalogPress}
          onThemePress={handleThemePress}
        />
        {/* 书页 */}
        <View style={[styles.pageSlot, {width: pageWidth}]}>
          <BookPage page={leftShowPage} bookId={bookId} />
        </View>
        <View style={[styles.pageSlot, {width: pageWidth}]}>
          <BookPage page={rightShowPage} bookId={bookId} />
        </View>
        {/* 书页翻动动画 */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.flipContainer,
            {
              width: '100%',
              height: '100%',
            },
            flipPageSideStyle,
          ]}>
          <Animated.View style={[styles.flipSide, frontSideStyle]}>
            <BookPage page={frontPage} />
            <Animated.View style={[styles.shade, shadowStyle]} />
          </Animated.View>
          <Animated.View style={[styles.flipSide, backSideStyle]}>
            <BookPage page={backPage} />
            <Animated.View style={[styles.shade, shadowStyle]} />
          </Animated.View>
        </Animated.View>

        {/* 主题设置弹窗 */}
        <ThemeSettingsModal
          visible={showSettings}
          onClose={() => setShowSettings(false)}
          bookId={bookId}
        />

        {/* 目录面板 */}
        <CatalogPanel
          visible={showToc}
          onClose={() => setShowToc(false)}
          bookId={bookId}
        />
      </View>
    </GestureDetector>
  );
};

const styles = createStyles({
  spread: {
    flex: 1,
    alignSelf: 'center' as const,
    backgroundColor: '#F8F2E6',
    flexDirection: 'row' as const,
    overflow: 'visible' as const,
  },
  statusBarContainer: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
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
