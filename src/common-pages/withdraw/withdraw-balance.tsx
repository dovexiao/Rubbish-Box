import React from 'react';
import {View, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';

import theme from '@/style';
import Text from '@/components/basic/text';
import Button from '@/components/basic/button';
import {toPriceStr} from '@/utils';
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
    <View
      style={[
        theme.margin.lrl,
        styles.container,
        theme.border.main,
        theme.borderRadius.m,
      ]}>
      <View
        style={[styles.balanceContainer, theme.flex.row, theme.flex.between]}>
        <View style={theme.flex.flex1}>
          <Text color={theme.fontColor.primaryMain} style={styles.opacity}>
            {i18n.t('withdraw-page.label.withdrawAmount')}
          </Text>
          <View style={[theme.flex.row, theme.flex.alignEnd]}>
            <Text
              fontFamily="fontInter"
              blod
              fontSize={20}
              allowFontScaling={false}
              style={theme.font.white}>
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
          title={`${i18n.t('other.withdraw')} ${i18n.t('other.records')}`}
          type="linear-primary"
          onPress={onGotoRecords}
        />
      </View>
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
    paddingTop: 20,
  },
  opacity: {
    opacity: 0.7,
  },
  button: {
    marginLeft: 12,
  },
});

export default React.memo(WithdrawBalance);
