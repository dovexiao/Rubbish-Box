import {useScreenSize} from '@/common-pages/hooks/size.hooks';
import globalStore from '@/services/global.state';
import theme from '@/style';
import {BasicObject} from '@/types';
import {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {proxyColor} from '@/common-pages/proxy/proxy.variable';

function useSize() {
  const {screenWidth, screenHeight, designWidth} = useScreenSize();
  const ruleBgHeight = (screenWidth / designWidth) * 812;
  const bookSize = (screenWidth / designWidth) * 120;
  const bannerWidth = screenWidth - 2 * theme.paddingSize.l;
  const bannerHeight = (bannerWidth / 351) * 120;
  const ruleButtonWidth = (335 * screenWidth) / designWidth;
  const invitationCouponWidth = screenWidth - theme.paddingSize.l * 4;
  const invitationCouponHeight = (invitationCouponWidth / 327) * 84;
  const size = useMemo(() => {
    return {
      screenWidth,
      screenHeight,
      designWidth,
      ruleBgHeight,
      bookSize,
      bannerWidth,
      bannerHeight,
      ruleButtonWidth,
      invitationCouponWidth,
      invitationCouponHeight,
    };
  }, [
    screenWidth,
    screenHeight,
    designWidth,
    ruleBgHeight,
    bookSize,
    bannerWidth,
    bannerHeight,
    ruleButtonWidth,
    invitationCouponWidth,
    invitationCouponHeight,
  ]);
  return size;
}

export function useInnerStyle() {
  const size = useSize();

  const bannerStyle = StyleSheet.create({
    idotBox: {
      bottom: theme.paddingSize.xxl,
    },
    idot: {
      width: theme.paddingSize.xxs,
      height: theme.paddingSize.xxs,
      borderRadius: theme.paddingSize.xxs / 2,
      marginHorizontal: theme.paddingSize.xxs / 2,
      backgroundColor: theme.backgroundColor.palegrey,
    },
    idotActive: {
      backgroundColor: theme.basicColor.primary,
      width: theme.paddingSize.l,
    },
  });

  const filterStyle = StyleSheet.create({
    sort: {
      height: 28,
    },
    dateInline: {
      height: 28,
    },
    date: {
      width: 70,
    },
    dateText: {
      width: 40,
    },
  });

  const userCommissionCardStyle = StyleSheet.create({
    commissionItem: {
      height: 36,
    },
  });

  const homeEarningStyle = StyleSheet.create({
    error: {
      height: 300,
    },
  });

  const homeInvitationStyle = StyleSheet.create({
    image: {
      width: size.invitationCouponWidth,
      height: size.invitationCouponHeight,
    },
  });

  const userInfoStyle = StyleSheet.create({
    line: {
      height: 1,
      backgroundColor: theme.backgroundColor.palegrey,
    },
    lineVert: {
      width: 1,
      backgroundColor: theme.backgroundColor.palegrey,
    },
    tier: {
      marginTop: -theme.paddingSize.xs,
    },
    greyArea: {
      backgroundColor: '#F3F5F8',
    },
    totalItem: {
      height: 24,
    },
    rebate: {
      borderRadius: 28,
    },
    bottomLine: {
      borderBottomWidth: 1,
      borderBottomColor: theme.backgroundColor.palegrey,
    },
    rate: {
      marginTop: theme.paddingSize.xxs / 2,
    },
  });

  const rulesStyle = StyleSheet.create({
    page: {
      paddingTop: -44,
      height: size.screenHeight,
    },
    header: {
      height: 44,
    },
    headerBack: {
      top: theme.paddingSize.m,
      left: theme.paddingSize.l,
    },
    bg: {
      top: 0,
      left: 0,
    },
    book: {
      right: 18,
      top: 0,
    },
    subtitle: {
      maxWidth: (215 * size.screenWidth) / size.designWidth,
    },
    paragraphWrap: {
      width: size.screenWidth - 2 * theme.paddingSize.l,
    },
    paragraph: {
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderWidth: 1,
      borderColor: theme.basicColor.white,
    },
    paragraphText: {
      lineHeight: 20,
    },
    paragraphMargin: {
      marginTop: 30,
    },
    tableTitleWrap: {
      backgroundColor: '#FFD6D2',
      width: 259,
      height: 52,
    },
    tableTitleText: {
      maxWidth: 211,
    },
    tableHead: {
      height: 40,
      backgroundColor: 'rgba(217, 0, 0, 0.08)',
      borderTopLeftRadius: theme.borderRadiusSize.xl,
      borderTopRightRadius: theme.borderRadiusSize.xl,
    },
    tableItem: {
      height: 48,
    },
    tableItemLight: {
      backgroundColor: 'rgba(217, 0, 0, 0.08)',
    },
    firstCol: {
      width: 68,
    },
    otherCol: {
      width: size.screenWidth >= size.designWidth ? 58 : 48,
    },
    teamMemberCol: {
      width: 54,
    },
    teamRechargeCol: {
      width: size.screenWidth >= size.designWidth ? 76 : 70,
    },
    teamBettingCol: {
      width: size.screenWidth >= size.designWidth ? 76 : 70,
    },
    whiteArea: {
      height: 72,
    },
    button: {
      width: size.ruleButtonWidth,
      height: 48,
    },
  });

  const tierCardStyle = StyleSheet.create({
    item: {
      height: 36,
    },
    details: {
      height: 32,
    },
  });

  const searchStyle = StyleSheet.create({
    wrap: {
      height: 40,
    },
    container: {
      padding: 0,
      height: 40,
    },
    leftIcon: {
      width: theme.iconSize.s,
      height: theme.iconSize.s,
    },
    inputContainer: {
      height: 40,
    },
  });

  const searchBaseInputStyle = {
    minHeight: 40,
    maxHeight: 40,
    height: 40,
    padding: 0,
    ...theme.font.white,
    ...theme.font.m,
  } as BasicObject;

  const searchInputStyle = globalStore.isWeb
    ? {
        ...searchBaseInputStyle,
        outline: 'none',
        caretColor: theme.fontColor.main,
      }
    : searchBaseInputStyle;

  const colorStyle = StyleSheet.create({
    proxyLight: {
      color: '#FF7E2B',
    },
  });

  const tierFilterStyle = StyleSheet.create({
    container: {
      height: 48,
    },
  });

  const tierTabsStyle = StyleSheet.create({
    container: {
      height: 35,
    },
  });

  const commissionDetailStyle = StyleSheet.create({
    header: {
      paddingTop: 0,
    },
    totalCommission: {
      borderTopWidth: 1,
      borderTopColor: proxyColor.line,
      height: 64,
    },
    tab: {
      // height: 47,
    },
    userFilter: {
      height: 52,
    },
    error: {
      height: 300,
    },
  });

  const teamReportStyle = StyleSheet.create({
    filterItem: {
      width: (170 * size.screenWidth) / size.designWidth,
      height: 32,
      borderWidth: 1,
      borderColor: theme.backgroundColor.grey,
    },
    line: {
      width: 1,
      height: 12,
      backgroundColor: theme.basicColor.white,
    },
    subtitle: {
      opacity: 0.8,
    },
  });

  const subordinatesStyle = StyleSheet.create({
    slider: {
      left: 0,
      top: 0,
    },
  });

  const whiteAreaStyle = StyleSheet.create({
    bottom: {
      paddingBottom: 72,
    },
    area: {
      height: 72,
    },
  });

  return {
    size,
    rulesStyle,
    tierCardStyle,
    colorStyle,
    searchStyle,
    searchInputStyle,
    tierFilterStyle,
    commissionDetailStyle,
    teamReportStyle,
    subordinatesStyle,
    bannerStyle,
    userInfoStyle,
    whiteAreaStyle,
    userCommissionCardStyle,
    tierTabsStyle,
    filterStyle,
    homeEarningStyle,
    homeInvitationStyle,
  };
}
