import React from 'react';
import {View, Text, TouchableOpacity, ScrollView} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {useReaderTheme} from '../../../hooks/useReaderTheme';
import {useBookStore} from '../store/useBookStore';
import {createStyles, rpx} from '../../../utils/rpxStyleSheet';

export interface CatalogPanelProps {
  /** 是否显示目录面板 */
  visible: boolean;
  /** 关闭目录面板回调 */
  onClose: () => void;
  /** 书籍ID，用于获取主题 */
  bookId?: number;
}

/**
 * 目录面板组件
 * 显示书本章节列表，支持跳转到指定章节
 */
const CatalogPanel: React.FC<CatalogPanelProps> = ({
  visible,
  onClose,
  bookId,
}) => {
  // 从 store 获取章节数据
  const bookChapters = useBookStore(state => state.bookChapters);
  const currentChapter = useBookStore(state => state.currentChapter);
  const loadChapterContent = useBookStore(state => state.loadChapterContent);

  // 获取主题
  const {theme} = useReaderTheme(bookId);

  // 处理章节点击
  const handleChapterPress = async (chapterId: number) => {
    try {
      await loadChapterContent(chapterId);
      onClose();
    } catch (error) {
      console.error('跳转章节失败:', error);
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.tocPanel, {backgroundColor: theme.bgColor}]}>
      <View style={styles.tocHeader}>
        <Text style={[styles.tocTitle, {color: theme.textColor}]}>目录</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={rpx(24)} color={theme.textColor} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.tocContent}>
        {bookChapters.map(chapter => (
          <TouchableOpacity
            key={chapter.id}
            style={[
              styles.tocItem,
              currentChapter?.id === chapter.id && styles.tocItemActive,
            ]}
            onPress={() => handleChapterPress(chapter.id)}>
            <Text
              style={[
                styles.tocItemText,
                {color: theme.textColor},
                currentChapter?.id === chapter.id && {color: theme.highlightColor},
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
  );
};

const styles = createStyles({
  tocPanel: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 60,
    zIndex: 15,
  },
  tocHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  tocTitle: {
    fontSize: 18,
    fontWeight: 'bold' as const,
  },
  tocContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tocItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  tocItemActive: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  tocItemText: {
    fontSize: 16,
  },
});

export default CatalogPanel;

