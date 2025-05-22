import theme from '@/style';
import React from 'react';
import {ImageBackground, View} from 'react-native';
import {walletBackImageIcon} from './wallet.variable';
import Text from '@basicComponents/text';
import {scaleSize, toPriceStr} from '@/utils';
import globalStore from '@/services/global.state';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
// import {useInnerStyle} from './wallet.hooks';
import {useTranslation} from 'react-i18next';

export interface WalletTotalWalletProps {
  login: boolean;
  amount: number;
  onRecharge?: () => void;
}

const WalletTotalWallet: React.FC<WalletTotalWalletProps> = ({
  login,
  amount,
  onRecharge,
}) => {
  const {i18n} = useTranslation();
  // const {totalWalletStyle} = useInnerStyle();

  return (
    <ImageBackground
      source={walletBackImageIcon}
      resizeMode="stretch"
      style={[
        theme.margin.lrl,
        theme.flex.row,
        theme.padding.leftxxl,
        theme.flex.between,
        {height: scaleSize(143)},
      ]}>
      <View style={[theme.flex.col, {marginTop: scaleSize(70)}]}>
        <Text fontSize={theme.fontSize.s} color={theme.fontColor.brown}>
          {i18n.t('wallet.total')}
        </Text>
        <View style={[theme.flex.row, theme.flex.alignEnd, theme.margin.tops]}>
          {login && (
            <Text
              fontSize={theme.fontSize.l}
              fontFamily="fontDin"
              blod
              color={theme.fontColor.brown}>
              {globalStore.currency}
            </Text>
          )}
          <Text
            fontSize={theme.fontSize.xl}
            color={theme.fontColor.brown}
            blod
            fontFamily="fontDin">
            {login
              ? toPriceStr(amount, {
                  fixed: 2,
                  showCurrency: false,
                  thousands: true,
                })
              : '******'}
          </Text>
        </View>
      </View>

      <NativeTouchableOpacity
        activeOpacity={0.8}
        style={[theme.flex.row, theme.flex.centerByCol]}
        onPress={onRecharge}>
        <View
          style={[
            theme.padding.l,
            {
              backgroundColor: '#E5D776',
              borderTopLeftRadius: 15,
              borderBottomLeftRadius: 15,
              marginTop: 30,
            },
          ]}>
          <ImageBackground
            source={require('@components/assets/icons/button-backImg-primary.webp')}
            resizeMode={'stretch'}
            style={[
              theme.fill.fill,
              theme.flex.center,
              {width: 82, height: 30},
            ]}>
            <Text
              fontSize={theme.fontSize.s}
              blod
              color={theme.fontColor.white}>
              {i18n.t('wallet.recharge')}
            </Text>
          </ImageBackground>
        </View>
      </NativeTouchableOpacity>
    </ImageBackground>
  );
};

export default WalletTotalWallet;
