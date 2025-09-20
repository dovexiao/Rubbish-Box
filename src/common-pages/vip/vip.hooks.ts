import {useScreenSize} from '@/common-pages/hooks/size.hooks';
import theme from '@style';
import {useMemo} from 'react';
import {StyleSheet} from 'react-native';

function useSize() {
  const {screenWidth, screenHeight, designWidth} = useScreenSize();
  const rechargeButtonWidth = (335 * screenWidth) / designWidth;
  const size = useMemo(() => {
    return {
      screenWidth,
      screenHeight,
      // vipCardWidth: screenWidth - theme.paddingSize.l * 2,
      vipCardWidth: screenWidth,
      designWidth,
      rechargeButtonWidth,
    };
  }, [screenWidth, screenHeight, designWidth, rechargeButtonWidth]);
  return size;
}

export function useInnerStyle() {
  const size = useSize();
  const vipStyle = StyleSheet.create({
    container: {
      height: size.screenHeight,
    },
    cardListContent: {
      // paddingHorizontal: theme.paddingSize.m * 2,
      // height: (115 * size.screenWidth) / size.designWidth,
      // height: 210,
    },
    cardList: {
      marginHorizontal: theme.paddingSize.l,
      flexGrow: 0,
      flexShrink: 0,
      flexBasis: 'auto',
      // height: (115 * size.screenWidth) / size.designWidth,
    },
  });

  const cardStyle = StyleSheet.create({
    cardContainerStyle: {
      width: size.screenWidth - theme.paddingSize.l * 2,
      height: 140,
      overflow: 'hidden',
      justifyContent: 'flex-end',
    },
    topTag: {
      marginBottom: 5,
      marginLeft: 4,
    },
    sign: {
      top: -26,
      right: theme.paddingSize.m * 2,
    },
    progressTextContainer: {
      backgroundColor: 'rgba(255, 255, 255, 0.30)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.20)',
    },
    box: {
      right: theme.paddingSize.m * 2,
      bottom: 2,
    },
    opacity: {
      opacity: 0.5,
    },
    text: {
      // maxWidth: scaleSize(232),
    },
    notice: {
      height: 32,
    },
  });

  const tableStyle = StyleSheet.create({
    header: {
      height: 44,
    },
    points: {
      width: (22 * size.screenWidth) / size.designWidth,
    },
    level: {},
    item: {
      height: 54,
    },
    itemLevelFirst: {
      borderTopLeftRadius: theme.borderRadiusSize.m,
    },
    itemLevelLast: {
      borderBottomLeftRadius: theme.borderRadiusSize.m,
    },
    itemLevel: {
      backgroundColor: '#EEE',
    },
    itemReward: {
      backgroundColor: theme.basicColor.white,
    },
    itemLevelLight: {
      backgroundColor: '#E3D9FA',
    },
    itemRewardLight: {
      backgroundColor: '#F6F2FF',
    },
    itemRewardItem: {
      minWidth: 80,
    },
    itemCompletedItem: {
      minWidth: 80,
    },
  });

  const rechargeStyle = StyleSheet.create({
    button: {
      width: size.rechargeButtonWidth,
      height: 48,
    },
  });

  const tableSeperatorStyle = StyleSheet.create({
    line: {
      height: 40,
      position: 'absolute',
      top: -20,
      left: -13,
      width: 1,
      backgroundColor: '#CED2D6',
    },
    container: {
      height: 1,
      marginLeft: 22,
      backgroundColor: theme.backgroundColor.grey,
      position: 'relative',
    },
  });
  return {
    size,
    vipStyle,
    cardStyle,
    tableStyle,
    rechargeStyle,
    tableSeperatorStyle,
  };
}
