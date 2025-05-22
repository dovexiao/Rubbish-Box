import theme from '@/style';
import {View, StyleSheet} from 'react-native';
import LazyImage from '@/components/basic/image';
import Text from '@/components/basic/text';
import React from 'react';
import globalStore from '@/services/global.state';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {useTranslation} from 'react-i18next';
import {toPriceStr} from '@/utils';

const successIcon = require('@/assets/icons/withdraw/success.png');

export interface WithdrawSuccessType {
  amount?: number;
  onFinish?: () => void;
}

const WithdrawSuccess = (props: WithdrawSuccessType) => {
  const {amount, onFinish = () => {}} = props;
  const {i18n} = useTranslation();
  return (
    <View
      style={[
        theme.background.white,
        theme.borderRadius.m,
        theme.flex.center,
        theme.margin.l,
        styles.container,
      ]}>
      <LazyImage
        occupancy={'transparent'}
        imageUrl={successIcon}
        width={80}
        height={80}
      />
      <Text
        style={styles.title}
        textAlign="center"
        fontSize={20}
        fontFamily="fontInterBold">
        {i18n.t('withdraw-page.label.success')}
      </Text>
      <Text size="medium" textAlign="center" style={[theme.margin.topl]}>
        {i18n.t('withdraw-page.tip.withdrawSubmitted')}
      </Text>
      <Text style={styles.title}>
        {i18n.t('withdraw-page.label.withdrawAmountLower')}
      </Text>
      <Text
        fontSize={16}
        fontFamily="fontInterBold"
        color={theme.basicColor.primary}>
        {toPriceStr(amount, {
          thousands: true,
          spacing: true,
          fixed: 2,
          currency: globalStore.currency,
        })}
      </Text>
      <NativeTouchableOpacity onPress={onFinish} style={styles.button}>
        <Text
          fontFamily="fontInterBold"
          color={theme.basicColor.primary}
          fontSize={16}>
          {i18n.t('label.finish')}
        </Text>
      </NativeTouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    marginTop: 24,
  },
  button: {
    marginTop: 24,
    height: 40,
    width: 120,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.basicColor.primary,
  },
});

export default WithdrawSuccess;
