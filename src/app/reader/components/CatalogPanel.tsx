import React, {useState, useEffect, useRef} from 'react';
import {View, Text, TouchableOpacity, ScrollView, Modal, Image} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useReaderThemeStore} from '../../../stores/readerThemeStore';
import useBookStore, {initializeChapterContent} from '../store/useBookStore';
import type {Chapter} from '../store/useBookStore';
import {createStyles, rpx} from '../../../utils/rpxStyleSheet';

export interface CatalogPanelProps {
  /** 是否显示目录面板 */
  visible: boolean;
  /** 点击章节回调 */
  onChapterPress: (chapterId: number) => Promise<Chapter>;
  /** 关闭目录面板回调 */
  onClose: () => void;
}

/**
 * 目录面板组件（弹窗形式）
 * 显示书本章节列表，支持跳转到指定章节
 */
const CatalogPanel: React.FC<CatalogPanelProps> = ({
  visible,
  onChapterPress,
  onClose,
}) => {
  // 从 store 获取章节数据
  const bookTitle = useBookStore(state => state.bookTitle);
  const bookCover = useBookStore(state => state.bookCover);
  const bookChapters = useBookStore(state => state.bookChapters);
  const currentChapter = useBookStore(state => state.currentChapter);

  // 获取主题
  const {currentThemeIndex, themes} = useReaderThemeStore();

  // 图片加载错误状态
  const [imageError, setImageError] = useState(false);

  // ScrollView 引用
  const scrollViewRef = useRef<ScrollView>(null);

  // 当 bookCover 变化时，重置错误状态
  useEffect(() => {
    setImageError(false);
  }, [bookCover]);

  // 当 visible 变为 true 时，滚动到当前章节
  useEffect(() => {
    if (visible && currentChapter && bookChapters.length > 0) {
      // 找到当前章节在列表中的索引
      const currentIndex = bookChapters.findIndex(chapter => chapter.id === currentChapter.id);
      
      if (currentIndex !== -1 && scrollViewRef.current) {
        // 每个章节项的高度
        const itemHeight = rpx(35.546875);
        // 计算滚动位置（让当前章节显示在可见区域）
        const scrollPosition = currentIndex * itemHeight;
        
        // 延迟执行，确保 Modal 和 ScrollView 已经渲染完成
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: scrollPosition,
            animated: true,
          });
        }, 100);
      }
    }
  }, [visible, currentChapter, bookChapters]);

  // 判断是否显示占位图
  const showPlaceholder = !bookCover || imageError;

  // 处理章节点击
  const handleChapterPress = async (chapterId: number) => {
    try {
      const chapter = await onChapterPress(chapterId);
      initializeChapterContent(chapter);
      onClose();
    } catch (error) {
      console.error('跳转章节失败:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* 点击背景关闭 */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        {/* 目录卡片主体 */}
        <View style={[styles.catalogCard, {backgroundColor: themes[currentThemeIndex].bgColor}]}>
          {/* 标题栏 */}
          <View style={styles.cardHeader}>
            {showPlaceholder ? (
              <View style={[styles.bookCover, styles.placeholderCover, {backgroundColor: themes[currentThemeIndex].spineColor}]}>
                <Ionicons name="book" size={rpx(28)} color={themes[currentThemeIndex].textColor} />
              </View>
            ) : (
              <Image 
                source={{uri: bookCover}} 
                style={styles.bookCover} 
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            )}
            <View style={styles.cardTitleContainer}>
              <Text style={[styles.cardTitle, {color: themes[currentThemeIndex].textColor}]}>{bookTitle}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={onClose}
                hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              >
                <Ionicons name="close-circle" size={rpx(24)} color="#B0B0B0" />
              </TouchableOpacity> 
            </View>
          </View>

          {/* 章节列表 */}
          <ScrollView 
            ref={scrollViewRef}
            style={styles.catalogContent}
            showsVerticalScrollIndicator={false}
          >
            {bookChapters.map(chapter => (
              <TouchableOpacity
                key={chapter.id}
                style={[
                  styles.catalogItem,
                  currentChapter?.id === chapter.id && styles.catalogItemActive && {backgroundColor: themes[currentThemeIndex].highlightColor},
                ]}
                onPress={() => handleChapterPress(chapter.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.catalogItemText,
                    {color: themes[currentThemeIndex].textColor},
                  ]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {chapter.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = createStyles({
  overlay: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    zIndex: 100,
  },
  backdrop: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // 半透明黑色背景
  },
  // 核心卡片样式
  catalogCard: {
    width: 257.8125, 
    height: 273.4375,
    backgroundColor: '#F4F4F4',
    borderRadius: 11.71875,
    paddingVertical: 12.5,
    paddingHorizontal: 7.8125,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3.90625}, // 10 * 750 / 1920
    shadowOpacity: 0.25,
    shadowRadius: 7.8125, // 20 * 750 / 1920
    elevation: 3.90625, // 10 * 750 / 1920
  },
  cardTitleContainer: {
    flex: 1,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    // alignItems: 'center' as const,
    paddingLeft: 10.9375,
  },
  // 顶部标题栏
  cardHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    // alignItems: 'center' as const,
    marginBottom: 7.8125, // 20 * 750 / 1920
  },
  cardTitle: {
    fontSize: 11.71875, // 30 * 750 / 1920
    fontWeight: '600' as const,
    marginLeft: 1.5625, // 4 * 750 / 1920
  },
  bookCover: {
    width: 56.25,
    height: 72.65625,
    borderRadius: 3.90625, // 10 * 750 / 1920
  },
  placeholderCover: {
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    borderRadius: 3.90625, // 10 * 750 / 1920
  },
  closeButton: {
    padding: 0,
  },
  // 章节列表内容
  catalogContent: {
    flex: 1,
    height: 273.4375,
  },
  catalogItem: {
    height: 35.546875,
    // paddingVertical: 11.71875, // 30 * 750 / 1920
    borderBottomWidth: 0.78125, // 2 * 750 / 1920
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    justifyContent: 'center' as const,
    paddingHorizontal: 23.4375,
  },
  catalogItemActive: {
    borderRadius: 1.953125,
  },
  catalogItemText: {
    fontSize: 9.765625,
  },
});

export default CatalogPanel;

