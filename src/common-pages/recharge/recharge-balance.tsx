import React from 'react';
import {View, ImageBackground, Image, StyleSheet} from 'react-native';
import Text from '@/components/basic/text';
import theme from '@/style';
import {toPriceStr} from '@/components/utils';
import globalStore from '@/services/global.state';
import LazyImage from '@/components/basic/image';
import {useInnerStyle} from './recharge.hooks';
import {useScreenSize} from '../hooks/size.hooks';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {useTranslation} from 'react-i18next';
export interface RechargeBalanceProps {
  balance?: number;
  payMethod?: string;
  tip?: string;
  onRefresh?: () => void;
  onGotoRecords?: () => void;
}

const RechargeBalance: React.FC<RechargeBalanceProps> = props => {
  const {i18n} = useTranslation();
  const {
    balance = 0,
    payMethod = '',
    onRefresh = () => {},
    onGotoRecords,
    tip = i18n.t('recharge-page.tip.payMethodTip'),
  } = props;
  const {screenWidth, designWidth} = useScreenSize();
  const {
    size: {},
    balanceStyles: styles,
  } = useInnerStyle();
  const refreshIconSize = (24 * screenWidth) / designWidth;

  return (
    <ImageBackground
      resizeMode={'cover'}
      source={require('@assets/imgs/recharge-card-background-image.webp')}
      style={[theme.margin.lrxxl, theme.margin.topxxl, styles.container]}>
      <View style={[theme.flex.between, theme.flex.flex1]}>
        <View style={styleSheet.rechargeTop}>
          <View style={[theme.flex.flex1]}>
            <View style={styleSheet.wallet}>
              <Image
                source={require('@/assets/icons/wallet/wallet-icon.webp')}
                style={styleSheet.walletImg}
              />
              <Text color={theme.fontColor.white} style={styleSheet.walletText}>
                {i18n.t('me.money.totalWallet')}
              </Text>
            </View>
            <View
              style={[
                theme.flex.row,
                theme.flex.alignEnd,
                theme.margin.topm,
                {alignItems: 'center', width: '100%'},
              ]}>
              <View style={{maxWidth: '85%'}}>
                <Text
                  style={styleSheet.balance}
                  numberOfLines={1}
                  ellipsizeMode={'tail'}>
                  {toPriceStr(balance, {
                    thousands: true,
                    spacing: true,
                    currency: globalStore.currency,
                  })}
                </Text>
              </View>
              <NativeTouchableOpacity
                activeOpacity={0.8}
                onPress={onRefresh}
                style={[theme.margin.leftm]}>
                <LazyImage
                  occupancy={'transparent'}
                  imageUrl={require('@assets/icons/wallet/recharge-refresh.webp')}
                  width={refreshIconSize}
                  height={refreshIconSize}
                />
              </NativeTouchableOpacity>
            </View>
          </View>
          <View style={{position: 'absolute', right: 16, top: 11}}>
            <NativeTouchableOpacity
              activeOpacity={0.8}
              style={[theme.flex.row, theme.flex.centerByCol]}
              onPress={onGotoRecords}>
              <View style={styleSheet.recordButton}>
                <Text style={styleSheet.recordButtonText}>
                  {i18n.t('recharge-page.rechargeRecords')}
                </Text>
              </View>
            </NativeTouchableOpacity>
          </View>
        </View>
        <View
          style={[
            // theme.padding.lrl,
            // theme.padding.tbs,
            {position: 'absolute', bottom: 7, left: 12},
          ]}>
          <Text
            style={styleSheet.tips}
            fontSize={globalStore.isAndroid ? 10 : 12}>
            {i18n.t('recharge-page.currentMethod')} :
            <Text style={styleSheet.tips}>{payMethod}</Text>
          </Text>
          <Text
            style={styleSheet.tips}
            numberOfLines={1}
            fontSize={globalStore.isAndroid ? 10 : 12}>
            {tip}
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
};

const styleSheet = StyleSheet.create({
  rechargeTop: {
    padding: 14,
    display: 'flex',
    flexDirection: 'row',
  },
  wallet: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletImg: {
    width: 11,
    height: 9,
  },
  walletText: {
    fontSize: 13,
    fontFamily: 'Arial, Arial-Regular',
    marginLeft: 6,
  },
  balance: {
    fontSize: 30,
    fontWeight: '700',
    color: '#ffffff',
    fontFamily: 'Helvetica, Helvetica-Bold',
  },
  recordButton: {
    width: 121,
    height: 25,
    backgroundColor: theme.basicColor.newButtonYellow,
    borderRadius: 16,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordButtonText: {
    fontSize: 12,
    color: theme.basicColor.newFontWhite,
    fontFamily: 'Arial, Arial-Bold',
    fontWeight: '700',
  },
  tips: {
    fontFamily: 'Arial, Arial-Regular',
    color: '#ffffff',
  },
});

export default RechargeBalance;
