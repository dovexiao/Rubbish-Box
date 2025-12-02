import React, { useMemo, useEffect } from 'react';
import {View, Text} from 'react-native';
import {createStyles, rpx} from '../../../utils/rpxStyleSheet';
import {useReaderThemeStore} from '../store/useReaderTheme';

type Page = {
  id: string;
  order: string;
  content: string;
};

type BookPageProps = {
  page?: Page;
};

const BookPage: React.FC<BookPageProps> = ({
  page,
}) => {
  const {fontSize, currentThemeIndex, themes} = useReaderThemeStore();

  const themeStyles = useMemo(() => {
    return createStyles({
      page:{
        backgroundColor: themes[currentThemeIndex].bgColor,
      },
      paragraph: {
        fontSize: fontSize * 750 / 1920,
        color: themes[currentThemeIndex].textColor,
        lineHeight: fontSize * 1.8 * 750 / 1920,
      },
    });
  }, [fontSize, currentThemeIndex, themes]);
  
  return (
    <View
      style={[styles.page, themeStyles.page]}>
      {page ? (
        <>
          <View key={page.id} style={styles.paragraphContainer} onLayout={event => {
            const {width, height} = event.nativeEvent.layout;
            console.log(`📖 [EPUB阅读器] 📏 段落容器布局信息:`, {
              '容器宽度': `${width}dp`,
              '容器高度': `${height}dp`,
            });
          }}>
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
          </View>
          <View style={styles.pageNumberContainer}>
            <Text style={styles.pageNumber}>
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
    borderColor: '#E5DCCD' as const,
    borderWidth: 1,
    justifyContent: 'flex-start' as const,
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
