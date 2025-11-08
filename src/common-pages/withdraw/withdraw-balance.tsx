import React from 'react';
import {View, StyleSheet, ImageBackground} from 'react-native';
import {useTranslation} from 'react-i18next';

import theme from '@/style';
import Text from '@/components/basic/text';
import Button from '@/components/basic/button';
import {scaleSize, toPriceStr} from '@/utils';
import globalStore from '@/services/global.state';

export interface WithdrawBalanceProps {
  balance?: number;
  onRefresh?: () => void;
  onPressTransfer?: () => void;
  onGotoRecords?: () => void;
}

const WithdrawBalance: React.FC<WithdrawBalanceProps> = props => {
  const {balance = 0, onGotoRecords} = props;
  const {i18n} = useTranslation();

  return (
    <View style={[theme.margin.lrl]}>
      <ImageBackground
        source={require('@/assets/imgs/withdraw/card-background.webp')}
        resizeMode="contain"
        style={[styles.balanceContainer, theme.flex.row, theme.flex.between]}>
        <View style={theme.flex.flex1}>
          <Text color={theme.fontColor.white} style={styles.opacity}>
            {i18n.t('withdraw-page.label.withdrawAmount')}
          </Text>
          <View style={[theme.flex.row, theme.flex.alignEnd]}>
            <Text
              fontFamily="fontInter"
              fontSize={scaleSize(25)}
              allowFontScaling={false}
              style={{fontWeight: 'bold'}}
              white>
              {toPriceStr(balance, {
                thousands: true,
                spacing: true,
                currency: globalStore.currency,
              })}
            </Text>
          </View>
        </View>
        <Button
          size="small"
          style={styles.button}
          titleColor="#E02020"
          title={`${i18n.t('other.withdraw')} ${i18n.t('other.records')}`}
          type="linear-secondary-gold"
          radius={scaleSize(20)}
          onPress={onGotoRecords}
        />
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    padding: 16,
  },
  balanceContainer: {
    height: scaleSize(89),
    paddingTop: scaleSize(20),
    paddingHorizontal: scaleSize(17),
  },
  opacity: {
    opacity: 0.9,
  },
  button: {
    marginLeft: scaleSize(12),
  },
});

export default React.memo(WithdrawBalance);
