import theme from '@/style';
import React from 'react';
import {View} from 'react-native';
import {BettingIcon, RechargeIcon} from '../svg.variable';
import i18n from '@/i18n';
import Text from '@/components/basic/text';
import {toPriceStr} from '@/utils';
export type CommissionType = 'recharge' | 'betting';
export interface CommissionDetailUserItemProps {
  type: CommissionType;
  time: string;
  rechargeAmount?: number;
  game?: string;
  result?: string;
  rebate: string;
  rechargeCommission: number;
}
const CommissionDetailUserItem: React.FC<CommissionDetailUserItemProps> = ({
  type,
  time,
  rechargeAmount,
  game,
  rebate,
  rechargeCommission,
}) => {
  return (
    <View
      style={[
        theme.background.mainDark,
        theme.borderRadius.m,
        theme.padding.l,
        theme.flex.col,
        theme.margin.btml,
      ]}>
      <View
        style={[
          theme.flex.row,
          theme.flex.between,
          theme.flex.centerByCol,
          theme.margin.btml,
        ]}>
        <View style={[theme.flex.row, theme.flex.centerByCol]}>
          {type === 'recharge' ? (
            <RechargeIcon width={theme.iconSize.m} height={theme.iconSize.m} />
          ) : (
            <BettingIcon width={theme.iconSize.m} height={theme.iconSize.m} />
          )}
          <Text
            style={[theme.margin.lefts]}
            white
            fontSize={theme.fontSize.m}
            blod>
            {type === 'recharge'
              ? i18n.t('proxy.user.recharge')
              : i18n.t('proxy.user.betting')}
          </Text>
        </View>
        <Text white>{time}</Text>
      </View>
      {type === 'recharge' && (
        <View
          style={[
            theme.flex.row,
            theme.flex.between,
            theme.flex.centerByCol,
            theme.margin.btms,
          ]}>
          <Text white>{i18n.t('proxy.commission-detail.user.amount')}</Text>
          <Text white blod fontFamily="fontInter">
            {toPriceStr(rechargeAmount, {fixed: 2})}
          </Text>
        </View>
      )}
      {type === 'betting' && (
        <View
          style={[
            theme.flex.row,
            theme.flex.between,
            theme.flex.centerByCol,
            theme.margin.btms,
          ]}>
          <Text white>{i18n.t('proxy.commission-detail.user.game')}</Text>
          <Text white>{game}</Text>
        </View>
      )}
      <View
        style={[
          theme.flex.row,
          theme.flex.between,
          theme.flex.centerByCol,
          theme.margin.btms,
        ]}>
        <Text white>{i18n.t('proxy.commission-detail.user.rebate')}</Text>
        <Text white>{(+rebate * 100).toFixed(2)}%</Text>
      </View>
      <View
        style={[theme.flex.row, theme.flex.between, theme.flex.centerByCol]}>
        <Text white>{i18n.t('proxy.commission-detail.user.commission')}</Text>
        <Text
          color={theme.fontColor.green}
          fontFamily="fontInter"
          blod
          fontSize={theme.fontSize.l}>
          {rechargeCommission > 0 ? '+ ' : ''}
          {toPriceStr(rechargeCommission, {spacing: true, thousands: true})}
        </Text>
      </View>
    </View>
  );
};

export default CommissionDetailUserItem;
