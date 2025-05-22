import {useScreenSize} from '@/common-pages/hooks/size.hooks';
import theme from '@/style';
import {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {invitationColors} from './invitation.variables';

function useSize() {
  const {screenWidth, screenHeight, designWidth} = useScreenSize();
  const invitationCodeCardImgWidth = screenWidth - 2 * theme.paddingSize.xxl;
  const invitationCodeCardImgHeight = (invitationCodeCardImgWidth / 343) * 64;
  const invitationCodeCardLeftWidth = (invitationCodeCardImgWidth / 343) * 213;
  const size = useMemo(() => {
    return {
      screenWidth,
      screenHeight,
      designWidth,
      invitationCodeCardImgWidth,
      invitationCodeCardImgHeight,
      invitationCodeCardLeftWidth,
    };
  }, [
    screenWidth,
    screenHeight,
    designWidth,
    invitationCodeCardImgWidth,
    invitationCodeCardImgHeight,
    invitationCodeCardLeftWidth,
  ]);
  return size;
}

export function useInnerStyle() {
  const size = useSize();

  const whiteSpaceStyle = StyleSheet.create({
    bottom: {
      paddingBottom: 72,
    },
  });

  const ruleStyle = StyleSheet.create({
    tableItem: {
      width: 100,
    },
    tableDataRow: {
      height: 40,
    },
    contentWrap: {
      borderWidth: 2,
      borderColor: theme.basicColor.primary,
    },
    contentItem: {
      width: (311 * size.screenWidth) / size.designWidth,
    },
  });

  const navHeight = 52;

  const homeStyle = StyleSheet.create({
    nav: {
      // 目前暂不考虑覆盖状态栏的情况
      height: navHeight,
    },
    navFloat: {
      zIndex: 1,
    },
    bg: {
      top: -44,
      left: 0,
    },
    scrollView: {
      flex: 1,
    },
    resetLink: {
      height: 28,
      backgroundColor: '#FFEFEF',
    },
    codeTitle: {
      height: 36,
    },
    codeCardLeft: {
      width: size.invitationCodeCardLeftWidth,
    },
    codeCopyBtn: {
      paddingHorizontal: theme.paddingSize.l * 2,
    },
    contentContainer: {},
    infoUpItem: {
      borderBottomWidth: 1,
      borderBottomColor: invitationColors.line,
    },
    infoUpSubItemRight: {},
    infoBottomText: {
      width: 80,
    },
    bounsTitle: {
      height: 40,
      borderBottomWidth: 1,
      borderBottomColor: invitationColors.line,
    },
    bounsUpItem: {
      height: 28,
      backgroundColor: invitationColors.bounsItem,
      borderRadius: 2,
    },
    bounsCirclesContainer: {
      height: 0,
    },
    bounsCircle: {
      width: 14,
      height: 14,
      borderRadius: 7,
    },
    bounsCircleLeft: {
      left: -7,
      top: -7,
    },
    bounsCircleRight: {
      right: -7,
      top: -7,
    },
    bonusButton: {
      height: 40,
    },
    statisticItem: {
      width: 120,
    },
  });

  const recordModalStyle = StyleSheet.create({
    container: {
      height: 500,
    },
    header: {
      paddingHorizontal: theme.paddingSize.m * 2,
      paddingTop: theme.paddingSize.m * 2,
    },
    error: {
      height: 300,
    },
    item: {
      borderBottomWidth: 1,
      borderColor: invitationColors.line,
    },
    bottom: {
      paddingHorizontal: theme.paddingSize.l * 2,
      paddingBottom: theme.paddingSize.l * 2,
    },
    button: {
      height: 40,
      backgroundColor: theme.backgroundColor.main,
      borderRadius: 28,
    },
  });

  return {
    size,
    whiteSpaceStyle,
    ruleStyle,
    homeStyle,
    recordModalStyle,
  };
}
