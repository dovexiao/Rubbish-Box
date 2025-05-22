import {useScreenSize} from '@/common-pages/hooks/size.hooks';
import globalStore from '@/services/global.state';
import theme from '@/style';
import {BasicObject} from '@/types';
import {useMemo} from 'react';
import {StatusBar, StyleSheet} from 'react-native';

function useSize() {
  const {screenWidth, screenHeight, designWidth} = useScreenSize();
  const rechargeButtonWidth = 88;
  const rechargeButtonHeight = 32;
  const transferButtonWidth = (screenWidth * 304) / designWidth;
  const transferButtonHeight = 48;
  const rechargeIconSize = (50 * screenWidth) / designWidth;
  const walletWidth =
    (screenWidth - theme.paddingSize.l * 2 - theme.paddingSize.xs * 2) / 3;
  const walletHeight = (walletWidth / 114) * 80;
  const walletIconSize = (64 * screenWidth) / designWidth;
  const walletLrGap =
    (screenWidth - theme.paddingSize.l * 2 - walletWidth * 3) / 2;
  const size = useMemo(() => {
    return {
      screenWidth,
      screenHeight,
      rechargeButtonWidth,
      rechargeButtonHeight,
      transferButtonWidth,
      transferButtonHeight,
      rechargeIconSize,
      walletWidth,
      walletHeight,
      walletIconSize,
      walletLrGap,
      bottomNavSize: (screenWidth / designWidth) * 80,
      bottomNavItemSize: (screenWidth / designWidth) * 104,
      topBgWidth: screenWidth,
      topBgHeight: (screenWidth / designWidth) * 273,
      topClipHeight: globalStore.isWeb ? 44 : StatusBar.currentHeight || 0,
    };
  }, [
    screenWidth,
    screenHeight,
    walletIconSize,
    transferButtonWidth,
    rechargeIconSize,
    walletWidth,
    walletHeight,
    designWidth,
    walletLrGap,
  ]);
  return size;
}

export function useInnerStyle() {
  const size = useSize();

  const walletStyle = StyleSheet.create({
    page: {
      paddingTop: 0,
      height: size.screenHeight,
    },
    topArea: {
      top: -size.topClipHeight,
      left: 0,
    },
    container: {
      paddingBottom: 72,
    },
  });
  const totalWalletStyle = StyleSheet.create({
    rechargeButton: {
      height: size.rechargeButtonHeight,
      backgroundColor: theme.basicColor.transparent,
      paddingVertical: 0,
      paddingHorizontal: 0,
    },
  });
  const transferStyle = StyleSheet.create({
    container: {
      borderRadius: theme.borderRadiusSize.m * 2,
    },
    percent: {
      marginBottom: theme.paddingSize.xxs / 2,
    },
    circleTopView: {
      marginTop: 32,
    },
    button: {
      width: size.transferButtonWidth,
      height: size.transferButtonHeight,
      backgroundColor: theme.basicColor.transparent,
      paddingVertical: 0,
      paddingHorizontal: 0,
    },
    bottomNav: {
      height: size.bottomNavSize,
    },
    bottomNavItem: {
      width: size.bottomNavItemSize,
    },
  });
  const listStyle = StyleSheet.create({
    wallet: {
      width: size.walletWidth,
      height: size.walletWidth,
    },
  });
  const rechargeButtonShadow = useMemo(() => {
    const _shadow = {
      startColor: '#0000003f',
      distance: 4,
      offset: [0, 1],
      style: [
        theme.flex.col,
        theme.flex.alignStart,
        theme.flex.center,
        {
          borderTopWidth: 1,
          borderTopColor: '#ffffff33',
          backgroundColor: '#0000003f',
          height: size.rechargeButtonHeight,
          width: size.rechargeButtonWidth,
          borderRadius: 23,
        },
      ] as BasicObject[],
    } as BasicObject;

    if (globalStore.isWeb) {
      _shadow.distance = 0;
      delete _shadow.offset;
      _shadow.style.push({
        boxShadow: '0px 1px 0px 0px #ffffff33 inset, 0px 1px 4px 0px #0000003f',
      });
    }
    return _shadow;
  }, [size.rechargeButtonHeight, size.rechargeButtonWidth]);

  const transferButtonShadow = useMemo(() => {
    const _shadow = {
      startColor: '#0000003f',
      distance: 4,
      offset: [0, 1],
      style: [
        theme.flex.col,
        theme.flex.alignStart,
        theme.flex.center,
        theme.borderRadius.s,
        {
          borderTopWidth: 1,
          borderTopColor: '#ffffff33',
          backgroundColor: '#0000003f',
          height: size.transferButtonHeight,
          width: size.transferButtonWidth,
          borderRadius: 28,
        },
      ] as BasicObject[],
    } as BasicObject;

    if (globalStore.isWeb) {
      _shadow.distance = 0;
      delete _shadow.offset;
      _shadow.style.push({
        boxShadow: '0px 1px 0px 0px #ffffff33 inset, 0px 1px 4px 0px #0000003f',
      });
    }
    return _shadow;
  }, [size.transferButtonWidth, size.transferButtonHeight]);

  return {
    size,
    walletStyle,
    totalWalletStyle,
    rechargeButtonShadow,
    transferButtonShadow,
    transferStyle,
    listStyle,
  };
}
