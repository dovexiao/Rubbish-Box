import {useCardModal} from '@businessComponents/modal';

import {
  LayoutChangeEvent,
  View,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import theme from '@style';
import LazyImage from '@basicComponents/image';
import React from 'react';
import Text from '@basicComponents/text';
import {goTo, goToWithLogin, toPriceStr} from '@utils';
import globalStore from '@/services/global.state';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import {useTranslation} from 'react-i18next';
import {
  // rechargeIcon,
  withdrawIcon,
} from '@/common-pages/wallet/wallet.variable';
import LinearGradient from '@/components/basic/linear-gradient';
import {useToken, useUserInfo} from '@/store/useUserStore';
import Button from '@/components/basic/button';
import {toLogin} from './me.variable';

const refreshIcon = require('@assets/icons/refresh.webp');

export interface MeAmountProps {
  containerStyle?: StyleProp<ViewStyle>;
  onLayout?: (e: LayoutChangeEvent) => void;
  onRefresh?: () => void;
  type?: number;
}

const MeAmount: React.FC<MeAmountProps> = ({
  containerStyle,
  onLayout,
  onRefresh,
  type,
}) => {
  const {i18n} = useTranslation();
  const {renderModal, show} = useCardModal();

  const {isLogin: login} = useToken();
  const user = useUserInfo();

  // const onRecharge = () => {
  //   goToWithLogin('Recharge');
  // };

  const onWithdraw = () => {
    goToWithLogin('Withdraw');
  };

  const onTransferRecord = () => {
    if (!login) {
      toLogin();
      return;
    }
    if (type === 1) {
      goTo('Recharge');
    } else {
      goTo('Transactions');
    }

    // goToWithLogin('TransferRecords');
  };

  // const showRechargeModal = () => {
  //   show({
  //     icon: rechargeIcon,
  //     title: i18n.t('me.tip.cashTitle'),
  //     content: i18n.t('me.tip.cashContent'),
  //   });
  // };

  const showDrawModal = () => {
    show({
      icon: withdrawIcon,
      title: i18n.t('me.tip.withdrawTitle'),
      content: i18n.t('me.tip.withdrawContent'),
    });
  };

  return (
    <LinearGradient
      start={{x: 0, y: 0}}
      end={{x: 1, y: 0}}
      colors={['#04CC9B54', '#04CC9B0f']}
      style={[
        theme.flex.around,
        theme.margin.topl,
        theme.padding.tbs,
        theme.border.main,
        theme.borderRadius.s,
        theme.padding.xxxl,
        // eslint-disable-next-line react-native/no-inline-styles
        {height: 141},
        containerStyle,
      ]}
      onLayout={onLayout}>
      <View
        style={[
          styles.wallet,
          theme.flex.row,
          theme.flex.between,
          theme.flex.centerByCol,
        ]}>
        <NativeTouchableOpacity onPress={() => goTo('Wallet')}>
          <View style={[theme.flex.col]}>
            <View style={[theme.flex.row, theme.flex.centerByCol]}>
              <Text style={[theme.font.s, theme.font.primaryMain]}>
                {i18n.t('me.money.totalWallet')}
                {'  ▸'}
              </Text>
            </View>
            <View style={[theme.flex.row, theme.flex.centerByCol]}>
              <Text
                fontFamily="fontDin"
                blod
                style={[theme.font.xl, theme.font.white, theme.margin.topxxs]}>
                {login
                  ? toPriceStr(user?.userBalance || 0, {
                      thousands: true,
                      spacing: true,
                      currency: globalStore.currency,
                    })
                  : '********'}
              </Text>
              <NativeTouchableOpacity
                onPress={() => {
                  onRefresh && onRefresh();
                }}>
                <LazyImage
                  occupancy={'transparent'}
                  imageUrl={refreshIcon}
                  width={theme.iconSize.xxl}
                  height={theme.iconSize.xxl}
                />
              </NativeTouchableOpacity>
            </View>
          </View>
        </NativeTouchableOpacity>
        <Button
          size={'small'}
          title={
            type === 1
              ? `${i18n.t('me.bottom.deposit')}`
              : `${i18n.t('me.bottom.transfer')} ${i18n.t('me.bottom.records')}`
          }
          type={'linear-primary'}
          radius={4}
          onPress={onTransferRecord}
        />
      </View>
      <View
        style={[{width: '100%', height: 1}, theme.background.mainShallow]}
      />
      <View style={[theme.flex.row, theme.flex.between]}>
        {/* <NativeTouchableOpacity
          style={[theme.flex.flex1]}
          activeOpacity={1}
          onPress={onRecharge}>
          <View style={[theme.flex.row, theme.flex.centerByCol]}>
            <Text style={[theme.font.primaryMain]} fontSize={theme.fontSize.s}>
              {i18n.t('me.money.cashBalance')}
            </Text>
            <NativeTouchableOpacity
              activeOpacity={1}
              style={[theme.margin.lefts, theme.flex.center]}
              onPress={showRechargeModal}>
              <LazyImage
                occupancy={'transparent'}
                imageUrl={require('@assets/icons/about.webp')}
                width={theme.iconSize.s}
                height={theme.iconSize.s}
              />
            </NativeTouchableOpacity>
          </View>
          <Text
            fontFamily="fontDin"
            blod
            style={[theme.font.xl, theme.font.white, theme.margin.topxxs]}>
            {login
              ? toPriceStr(user?.rechargeAmount || 0, {
                  thousands: true,
                  spacing: true,
                })
              : '******'}
          </Text>
        </NativeTouchableOpacity> */}
        <NativeTouchableOpacity
          style={[theme.flex.flex1]}
          activeOpacity={1}
          onPress={onWithdraw}>
          <View style={[theme.flex.row, theme.flex.centerByCol]}>
            <Text style={[theme.font.primaryMain]} fontSize={theme.fontSize.s}>
              {i18n.t('me.money.withdrawAmount')}
            </Text>
            <NativeTouchableOpacity
              activeOpacity={1}
              style={[theme.margin.lefts, theme.flex.center]}
              onPress={showDrawModal}>
              <LazyImage
                occupancy={'transparent'}
                imageUrl={require('@assets/icons/about.webp')}
                width={theme.iconSize.s}
                height={theme.iconSize.s}
              />
            </NativeTouchableOpacity>
          </View>
          <Text
            fontFamily="fontDin"
            blod
            style={[theme.font.xl, theme.font.white, theme.margin.topxxs]}>
            {login
              ? toPriceStr(user?.canWithdrawAmount || 0, {
                  thousands: true,
                  spacing: true,
                })
              : '******'}
          </Text>
        </NativeTouchableOpacity>
      </View>
      {renderModal}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  wallet: {},
});

export default MeAmount;
