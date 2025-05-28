// import LinearGradient from '@basicComponents/linear-gradient';
import theme from '@style';
import React, {memo, useState} from 'react';
import {LayoutChangeEvent, StyleSheet, View} from 'react-native';
import {useResponsiveDimensions} from '@/utils';
import Text from '@basicComponents/text';
import {vipColors} from './vip.options';
import {fill} from '@/components/style';

const {flex} = theme;

export interface VipProgress {
  currentLevel: number;
  nextCurrentLevel: number;
  current: number;
  total: number;
  hasCurrentText?: boolean;
}

function VipProgress(props: VipProgress) {
  const {currentLevel, nextCurrentLevel, current, total} = props;
  const [width, setWidth] = useState<number>(0);
  const size = useResponsiveDimensions();
  const height = (8 * size.width) / 375;
  const styles = StyleSheet.create({
    progressBg: {
      flex: 1,
      height,
      backgroundColor: '#00000066',
      borderRadius: 8,
      overflow: 'hidden',
      marginHorizontal: 4,
    },
    alighStratch: {alignSelf: 'stretch'},
    opacity: {
      opacity: 0.5,
    },
  });
  const handleLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  };

  const renderBadgeItem = (currenLevel: number) => {
    return (
      <View
        style={[
          theme.borderRadius.xs,
          theme.border.white30,
          {
            backgroundColor: vipColors[currenLevel],
            paddingVertical: 2,
            paddingHorizontal: 4,
          },
        ]}>
        <Text fontSize={8} white fontFamily={'fontDinBold'} style={[]}>
          V.{currenLevel}
        </Text>
      </View>
    );
  };

  const progressWidth = (width * current) / total;
  const innerStyles = StyleSheet.create({
    progress: {
      width: progressWidth,
      height,
      borderRadius: 4,
    },
  });
  return (
    <View onLayout={handleLayout} style={[flex.col, theme.fill.fillW]}>
      <View style={[flex.row, fill.fillW, flex.between, flex.centerByCol]}>
        {renderBadgeItem(currentLevel)}
        {/* 此处shadow不好做，目前暂时换为纯色做 */}
        <View style={[styles.progressBg]}>
          <View
            style={[innerStyles.progress, {backgroundColor: '#CBCBCBFF'}]}
          />
        </View>
        {renderBadgeItem(nextCurrentLevel)}
      </View>
    </View>
  );
}

export default memo(VipProgress);
