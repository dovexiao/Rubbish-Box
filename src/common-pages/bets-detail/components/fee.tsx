import theme from '@/style';
import {View} from 'react-native';
import Text from '@/components/basic/text';
import {toPriceStr} from '@/utils';
import React from 'react';
import {useTranslation} from 'react-i18next';

const FeeDetail = ({
  delivery = 0,
  fee = 0,
  time = '',
}: {
  delivery?: number;
  fee?: number;
  time: string;
}) => {
  const {i18n} = useTranslation();
  return (
    <View style={[theme.padding.lrl, theme.padding.tbs]}>
      {Boolean(delivery) && (
        <View style={[theme.flex.row, theme.flex.between, theme.margin.btml]}>
          <Text color={theme.fontColor.white} size="medium">
            {i18n.t('bets-detail.label.delivery')}
          </Text>
          <Text white size="medium">
            {toPriceStr(delivery, {
              fixed: 2,
              showCurrency: true,
              thousands: true,
            })}
          </Text>
        </View>
      )}
      {Boolean(fee) && (
        <View style={[theme.flex.row, theme.flex.between, theme.margin.btml]}>
          <Text color={theme.fontColor.white} size="medium">
            {i18n.t('bets-detail.label.fee')}
          </Text>
          <Text white size="medium">
            {toPriceStr(fee, {
              fixed: 2,
              showCurrency: true,
              thousands: true,
            })}
          </Text>
        </View>
      )}
      <View style={[theme.flex.row, theme.flex.between]}>
        <Text color={theme.fontColor.white} size="medium">
          {i18n.t('bets-page.label.bettingTime')}
        </Text>
        <Text white size="medium">
          {time}
        </Text>
      </View>
    </View>
  );
};

export default FeeDetail;
