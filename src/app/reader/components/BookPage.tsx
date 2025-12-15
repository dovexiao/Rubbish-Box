import React, { useMemo, useEffect } from 'react';
import {View, Text, TextStyle, Image} from 'react-native';
import {createStyles, rpx} from '../../../utils/rpxStyleSheet';
import {useReaderThemeStore} from '../store/useReaderTheme';

type Page = {
  id: string;
  order: string;
  content: string;
  chapterId: number; // 所属章节ID
};

type BookPageProps = {
  page?: Page;
  position: 'left' | 'right';
};

/**
 * 检测是否是 base64 字符串
 */
const isBase64String = (content: string): boolean => {
  // base64 图片通常很长（至少几百个字符）
  if (content.length < 100) {
    return false;
  }

  // 移除可能的空白字符（换行、空格等）
  const cleaned = content.replace(/\s+/g, '');
  
  // base64 字符集：A-Z, a-z, 0-9, +, /, =
  const base64Pattern = /^[A-Za-z0-9+/=]+$/;
  
  // 如果清理后的内容长度足够且符合 base64 模式
  if (cleaned.length >= 100 && base64Pattern.test(cleaned)) {
    // 进一步验证：base64 字符串中 = 应该只在末尾（填充字符）
    const equalsCount = (cleaned.match(/=/g) || []).length;
    const lastEqualsIndex = cleaned.lastIndexOf('=');
    const hasValidPadding = equalsCount === 0 || 
      (equalsCount <= 2 && lastEqualsIndex >= cleaned.length - 2);
    
    return hasValidPadding;
  }
  
  return false;
};

const BookPage: React.FC<BookPageProps> = ({
  page,
  position,
}) => {
  const {fontSize, currentThemeIndex, themes} = useReaderThemeStore();

  // 检测是否是 base64 图片
  const isBase64Image = useMemo(() => {
    return page?.content ? isBase64String(page.content) : false;
  }, [page?.content]);

  // 获取 base64 图片的 URI
  const base64ImageUri = useMemo(() => {
    if (!isBase64Image || !page?.content) {
      return null;
    }
    
    // 如果已经包含 data URI 前缀，直接使用
    if (page.content.startsWith('data:image/')) {
      return page.content;
    }
    
    // 否则添加默认的 data URI 前缀（假设是 JPEG）
    return `data:image/jpeg;base64,${page.content}`;
  }, [isBase64Image, page?.content]);

  const themeStyles = useMemo(() => {
    return createStyles({
      page:{
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
      {page ? (
        <>
          <View key={page.id} style={styles.paragraphContainer} onLayout={event => {
            const {width, height} = event.nativeEvent.layout;
            console.log(`📖 [EPUB阅读器] 📏 段落容器布局信息:`, {
              '容器宽度': `${width}dp`,
              '容器高度': `${height}dp`,
            });
          }}>
            {isBase64Image && base64ImageUri ? (
              // base64 图片展示
              <Image
                source={{uri: base64ImageUri}}
                style={styles.base64Image}
                resizeMode="contain"
              />
            ) : (
              // 文本内容展示
              <Text 
                style={[styles.paragraph, themeStyles.paragraph]}
                onTextLayout={(event) => {
                  const {lines} = event.nativeEvent;
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
        </>
      ) : (
        <Text /> 
      )}
    </View>
  );
};

const styles = createStyles({
  page: {
    flex: 1,
    paddingHorizontal: 25.390625,
    // borderColor: '#E5DCCD' as const,
    // borderWidth: 1,
    justifyContent: 'flex-start' as const,
  },
  leftPage: {
    borderRightColor: '#E5DCCD' as const,
    borderRightWidth: 1,
  },
  rightPage: {
    borderLeftColor: '#E5DCCD' as const,
    borderLeftWidth: 1,
  },
  paragraphContainer: {
    flex: 1,
    marginTop: 64.0625,
    // borderWidth: 1,
    // borderColor: 'red',
  },
  paragraph: {
    color: '#3F2D20' as const,
    fontFamily: "'Source Han Serif', 'Noto Serif SC', '方正书宋', serif" as const,
    // borderWidth: 1,
    // borderColor: 'blue',
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
