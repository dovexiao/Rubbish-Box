import React from 'react';
import {View, StyleSheet, ImageBackground} from 'react-native';
import {useTranslation} from 'react-i18next';

import theme from '@/style';
import Text from '@/components/basic/text';
import Button from '@/components/basic/button';
import {toPriceStr} from '@/utils';
import globalStore from '@/services/global.state';
import {useScreenSize} from '@/common-pages/hooks/size.hooks';

export interface WithdrawBalanceProps {
  balance?: number;
  onRefresh?: () => void;
  onPressTransfer?: () => void;
  onGotoRecords?: () => void;
}

const WithdrawBalance: React.FC<WithdrawBalanceProps> = props => {
  const {balance = 0, onGotoRecords} = props;
  const {i18n} = useTranslation();
  const {calcActualSize} = useScreenSize();

  return (
    <View style={[theme.margin.lrl]}>
      <ImageBackground
        source={require('@/assets/imgs/withdraw/card-background.webp')}
        resizeMode="contain"
        style={[
          styles.balanceContainer,
          theme.flex.row,
          theme.flex.between,
          {
            height: calcActualSize(89),
            paddingTop: calcActualSize(20),
            paddingHorizontal: calcActualSize(17),
          }
        ]}>
        <View style={theme.flex.flex1}>
          <Text color={theme.fontColor.white} style={styles.opacity}>
            {i18n.t('withdraw-page.label.withdrawAmount')}
          </Text>
          <View style={[theme.flex.row, theme.flex.alignEnd]}>
            <Text
              fontFamily="fontInter"
              fontSize={calcActualSize(25)}
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
        <View
          style={{
            position: 'absolute',
            right: calcActualSize(10),
            top: calcActualSize(10),
          }}>
          <Button
            size="small"
            titleColor="#E02020"
            title={`${i18n.t('other.withdraw')} ${i18n.t('other.records')}`}
            type="linear-secondary-gold"
            radius={calcActualSize(20)}
            onPress={onGotoRecords}
          />
        </View>
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
    // sizes are set dynamically via calcActualSize in render
  },
  opacity: {
    opacity: 0.9,
  },
});

export default React.memo(WithdrawBalance);
