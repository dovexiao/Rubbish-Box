import {useScreenSize} from '@/common-pages/hooks/size.hooks';
import globalStore from '@/services/global.state';
import theme from '@style';
import {useMemo} from 'react';
import {StatusBar, StyleSheet} from 'react-native';

function useSize() {
  const {screenWidth, screenHeight} = useScreenSize();
  const indicatorWidth = 20;
  const tabCount = 2;
  const size = useMemo(() => {
    return {
      screenWidth,
      screenHeight,
      topClipHeight: globalStore.isWeb ? 44 : StatusBar.currentHeight || 0,
      indicatorWidth: indicatorWidth,
      indicatorHeight: 4,
      tabCount,
      indicatorLeft: (screenWidth / tabCount - indicatorWidth) / 2,
      listItemImageSize: theme.iconSize.xxl,
    };
  }, [screenWidth, screenHeight, indicatorWidth, tabCount]);
  return size;
}

export function useInnerStyle() {
  const size = useSize();
  const tabStyle = StyleSheet.create({
    indicator: {
      width: size.indicatorWidth,
      height: size.indicatorHeight,
      bottom: 0,
      // marginLeft: size.indicatorLeft,
    },
    noneMargin: {
      margin: 0,
    },
    nonePadding: {
      padding: 0,
    },
    borderLeft: {
      borderLeftColor: theme.backgroundColor.grey,
      borderLeftWidth: 1,
    },
    tag: {
      top: 0,
      right: 0,
    },
  });
  const detailStyle = StyleSheet.create({
    title: {
      maxWidth: 300,
    },
  });
  return {
    size,
    tabStyle,
    detailStyle,
  };
}
