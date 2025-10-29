import globalStore from '@/services/global.state';
import theme from '@/style';
import {BasicObject} from '@/types';
import {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {scaleSize} from '@utils';
import {useSettingWindowDimensions} from '@/store/useSettingStore';

function useSize() {
  const {screenWidth, screenHeight, designWidth, calculateItemWidth} =
    useSettingWindowDimensions();
  const rightIconSize = (14 * screenWidth) / designWidth;
  const itemWidth = (screenWidth - theme.paddingSize.l * 4 - 20) / 3;
  const itemHeight = calculateItemWidth(64);
  const size = useMemo(() => {
    return {
      screenWidth,
      screenHeight,
      designWidth,
      rightIconSize,
      itemWidth,
      itemHeight,
    };
  }, [
    screenWidth,
    screenHeight,
    designWidth,
    rightIconSize,
    itemWidth,
    itemHeight,
  ]);
  return size;
}

export function useInnerStyle() {
  const size = useSize();

  const amountStyle = StyleSheet.create({
    opacity: {
      opacity: 0.7,
    },
  });

  const baseInputStyle = {
    minHeight: 48,
    maxHeight: 48,
    height: 48,
    padding: 0,
    ...theme.font.white,
    ...theme.font.m,
  } as BasicObject;

  const inputStyle = globalStore.isWeb
    ? {
        ...baseInputStyle,
        outline: 'none',
        caretColor: theme.fontColor.main,
      }
    : baseInputStyle;

  const inputStyles = StyleSheet.create({
    inputContainer: {
      borderBottomWidth: 0,
    },
    container: {
      paddingBottom: 0,
    },
    error: {
      margin: 0,
      height: 0,
    },
  });

  const selectStyles = StyleSheet.create({
    item: {
      width: size.itemWidth,
      height: size.itemHeight - 20,
    },
    itemMargin: {
      marginLeft:
        (size.screenWidth - theme.paddingSize.l * 3 - size.itemWidth * 3 - 1) /
        3,
      marginBottom:
        (size.screenWidth - theme.paddingSize.l * 3 - size.itemWidth * 3 - 1) /
        3,
    },
    inputWrap: {
      backgroundColor: theme.basicColor.newBgInOne,
    },
  });

  const balanceStyles = StyleSheet.create({
    cardBg: {
      position: 'absolute',
    },
    container: {
      height: scaleSize(143),
      borderRadius: theme.borderRadiusSize.l,
      // borderTopLeftRadius: theme.borderRadiusSize.l,
      // borderTopRightRadius: theme.borderRadiusSize.l,
      overflow: 'hidden',
    },
    bgBox: {
      width: size.screenWidth - theme.paddingSize.l * 2,
      height: (459 / 1053) * (size.screenWidth - theme.paddingSize.l * 2),
    },
    balanceContainer: {
      paddingHorizontal: 20,
      paddingTop: 20,
      alignItems: 'center',
    },
    methodContainer: {
      backgroundColor: 'rgba(0,0,0,0.2)',
    },
  });

  const payMethodStyles = StyleSheet.create({
    item: {
      height: 92,
    },
    itemSelected: {
      borderColor: theme.basicColor.primary,
    },
    itemNoSelectedIcon: {
      width: 18,
      height: 18,
      right: 0,
      borderRadius: 18,
      borderColor: theme.basicColor.primary,
      borderWidth: 1,
    },
    itemSelectedIcon: {
      width: 18,
      height: 18,
      right: 0,
      backgroundColor: theme.basicColor.newButtonYellow,
      borderRadius: 18,
    },
    itemText: {},
  });

  return {
    size,
    amountStyle,
    inputStyle,
    inputStyles,
    selectStyles,
    payMethodStyles,
    balanceStyles,
  };
}
