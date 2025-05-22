// import LinearGradient from '@basicComponents/linear-gradient';
import theme from '@style';
import React, {ReactNode, useMemo, useState} from 'react';
import {LayoutChangeEvent, StyleSheet, View} from 'react-native';
import Text from '@basicComponents/text';
import {useTranslation} from 'react-i18next';
import {useResponsiveDimensions} from '@/utils';

const {flex, margin, font, fontSize} = theme;

export interface VipProgressInfo {
  currentBadge: ReactNode;
  nextBadge?: ReactNode;
  current: number;
  total: number;
  hasCurrentText?: boolean;
}

export function useVipProgressList(list: VipProgressInfo[]) {
  const [width, setWidth] = useState<number>(0);
  const size = useResponsiveDimensions();
  const height = (4 * size.width) / 375;
  const {i18n} = useTranslation();
  const styles = StyleSheet.create({
    progressBg: {
      width,
      height,
      borderRadius: height / 2,
      backgroundColor: '#B2AFE4',
      overflow: 'hidden',
    },
    alighStratch: {alignSelf: 'stretch'},
    opacity: {
      opacity: 0.5,
    },
  });
  const handleLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };
  const resultList = useMemo(() => {
    return list.map(
      ({currentBadge, nextBadge, current, total, hasCurrentText = false}) => {
        const progressWidth = (width * current) / total;
        const innerStyles = StyleSheet.create({
          progress: {
            width: progressWidth,
            height,
          },
        });
        return (
          <View
            onLayout={handleLayout}
            style={[flex.col, flex.flex1, margin.lrm]}>
            <View style={[flex.row, flex.between, margin.btmxxs]}>
              <View style={[flex.row, flex.centerByCol]}>
                {currentBadge}
                {hasCurrentText && (
                  <Text
                    style={[styles.opacity, font.main, margin.leftxxs]}
                    fontSize={fontSize.xs}>
                    {i18n.t('vip.currentLevel')}
                  </Text>
                )}
              </View>

              {nextBadge}
            </View>
            {/* 此处shadow不好做，目前暂时换为纯色做 */}
            <View style={[styles.progressBg]}>
              {/* <LinearGradient
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                colors={['#7601F7', '#8501E0']}
                style={[innerStyles.progress]}
              /> */}
              <View style={[innerStyles.progress, theme.background.primary]} />
            </View>
          </View>
        );
      },
    );
  }, [height, i18n, list, styles.opacity, styles.progressBg, width]);
  return resultList;
}
