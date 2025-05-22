import {useScreenSize} from '@/common-pages/hooks/size.hooks';
import globalStore from '@/services/global.state';
import theme from '@style';
import {useMemo} from 'react';
import {StatusBar, StyleSheet} from 'react-native';

function useSize() {
  const {screenWidth, screenHeight, designWidth} = useScreenSize();
  const size = useMemo(() => {
    const itemImgWidth = screenWidth - 2 * theme.paddingSize.l;
    return {
      screenWidth,
      screenHeight,
      designWidth,
      topClipHeight: globalStore.isWeb ? 44 : StatusBar.currentHeight || 0,
      itemImgWidth,
      signImgHeight: (itemImgWidth * 192) / 351,
      itemImgHeight: (itemImgWidth * 192) / 351,
      itemButtonWidth: (screenWidth * 96) / designWidth,
    };
  }, [screenWidth, screenHeight, designWidth]);
  return size;
}

export function useInnerStyle() {
  const size = useSize();
  const itemStyle = StyleSheet.create({
    leftText: {
      maxWidth: (size.screenWidth * 204) / size.designWidth,
    },
    button: {
      padding: theme.paddingSize.l,
      width: size.itemButtonWidth,
    },
  });
  const listStyle = StyleSheet.create({
    list: {
      paddingBottom: 72,
    },
  });
  const detailStyle = StyleSheet.create({
    title: {
      maxWidth: 300,
    },
  });
  return {
    size,
    itemStyle,
    listStyle,
    detailStyle,
  };
}
