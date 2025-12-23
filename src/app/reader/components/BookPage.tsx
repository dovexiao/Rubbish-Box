import React, { useMemo } from 'react';
import { View, Text, TextStyle } from 'react-native';
import { createStyles, rpx } from '../../../utils/rpxStyleSheet';
import { useReaderThemeStore } from '../../../stores/readerThemeStore';
import ImageWithPlaceholder from '../../../components/common/ImageWithPlaceholder';
import {
  isBase64ImageFromArray,
  getBase64ImageUriFromArray,
} from '../../../utils/base64ImageUtils';

type Page = {
  id: string;
  order: string;
  content: string;
  chapterId: number; // 所属章节ID
};

type BookPageProps = {
  page: Page;
  position: 'left' | 'right';
};

const BookPage: React.FC<BookPageProps> = ({
  page,
  position,
}) => {
  // 检测是否是 base64 图片
  const isBase64Image = useMemo(() => {
    return isBase64ImageFromArray(page.content);
  }, [page.content]);

  // 获取 base64 图片的 URI（所有判定逻辑都在函数内部）
  const base64ImageUri = useMemo(() => {
    return getBase64ImageUriFromArray(page.content);
  }, [page.content]);

  const { fontSize, currentThemeIndex, themes } = useReaderThemeStore();

  const themeStyles = useMemo(() => {
    return createStyles({
      page: {
        backgroundColor: themes[currentThemeIndex].bgColor,
      },
      paragraph: {
        fontSize: fontSize * 750 / 1920,
        color: themes[currentThemeIndex].textColor,
        fontWeight: themes[currentThemeIndex].fontWeight as TextStyle['fontWeight'],
        lineHeight: fontSize * 1.8 * 750 / 1920,
      },
      pageNumber: {
        color: themes[currentThemeIndex].textColor,
      },
    });
  }, [fontSize, currentThemeIndex, themes]);

  return (
    <View
      style={[styles.page, themeStyles.page, position === 'left' ? styles.leftPage : styles.rightPage]}>
      <View
        key={page.id}
        style={styles.paragraphContainer}
        onLayout={event => {
          // const { width, height } = event.nativeEvent.layout;
          // console.log(`📖 [EPUB阅读器] 📏 段落容器布局信息:`, {
          //   '容器宽度': `${width}dp`,
          //   '容器高度': `${height}dp`,
          // });
        }}>
        {isBase64Image && base64ImageUri ? (
          // base64 图片展示
          <ImageWithPlaceholder
            source={{ uri: base64ImageUri }}
            style={styles.base64Image}
            resizeMode="contain"
          />
        ) : (
          // 文本内容展示
          <Text
            style={[styles.paragraph, themeStyles.paragraph]}
            onTextLayout={(event) => {
              const { lines } = event.nativeEvent;
              console.log(`📖 [EPUB阅读器] 📏 文本布局信息:`, {
                '总行数': lines.length,
                '首行高度': lines[0]?.height ? `${lines[0].height}dp` : 'N/A',
              });
            }}
          >
            {page.content}
          </Text>
        )}
      </View>
      <View style={styles.pageNumberContainer}>
        <Text style={[styles.pageNumber, themeStyles.pageNumber]}>
          {page.order}
        </Text>
      </View>
    </View>
  );
};

const styles = createStyles({
  page: {
    flex: 1,
    paddingHorizontal: 25.390625, // 65
    // borderColor: '#E5DCCD' as const,
    // borderWidth: 1,
    justifyContent: 'flex-start' as const,
  },
  leftPage: {
    borderRightColor: '#E5DCCD' as const,
    borderRightWidth: 0.9765625, // 2.5
  },
  rightPage: {
    borderLeftColor: '#E5DCCD' as const,
    borderLeftWidth: 0.9765625, // 2.5
  },
  paragraphContainer: {
    flex: 1,
    marginTop: 64.0625,
  },
  paragraph: {
    color: '#3F2D20' as const,
    fontFamily: "'Source Han Serif', 'Noto Serif SC', '方正书宋', serif" as const,
    // borderWidth: 1,
    // borderColor: 'blue',
    letterSpacing: 0.9765625, // 2.5
  },
  base64Image: {
    width: '100%' as const,
    height: '100%' as const,
    // borderWidth: 1,
    // borderColor: 'blue',
  },
  pageNumberContainer: {
    width: '100%' as const,
    height: 15.625,
    marginVertical: 11.71875,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  pageNumber: {
    fontFamily: "'PingFang SC" as const,
    fontSize: 10.9375,
    color: '#C4B39E' as const,
  },
});

export default BookPage;
