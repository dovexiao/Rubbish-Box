import theme from '@/style';
import React from 'react';
import {View, Image} from 'react-native';

import Text from '@basicComponents/text';

import CustomTitle from './custom-title';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {useTranslation} from 'react-i18next';
import {scaleSize} from '@/utils';

export interface RechargeDepositEventProps {
  /** 是否选中 */
  checked?: boolean;
  onToggle?: (value: boolean) => void;
}

const RechargeDepositEvent = ({
  checked = false,
  onToggle,
}: RechargeDepositEventProps) => {
  const {i18n} = useTranslation();

  return (
    <View
      style={[
        theme.borderRadius.s,
        theme.margin.topxl,
        {paddingHorizontal: scaleSize(8)},
      ]}>
      <CustomTitle name={i18n.t('recharge-page.depositEvent')} />
      <NativeTouchableOpacity
        onPress={() => onToggle?.(!checked)}
        style={[theme.flex.row, theme.flex.centerByCol, {columnGap: 6}]}>
        <Image
          source={
            checked
              ? require('@/assets/icons/checked.webp')
              : require('@/assets/icons/unchecked.webp')
          }
          style={{
            width: 14,
            height: 14,
          }}
        />
        <Text white fontSize={14} style={{fontWeight: 'bold'}}>
          {i18n.t('recharge-page.requiresDepositBonus')}
        </Text>
      </NativeTouchableOpacity>

      <View style={{marginTop: 6}}>
        <Text style={{color: '#FFEB00', fontSize: 12, lineHeight: 20}}>
          {i18n.t('recharge-page.afterEventTip')}
        </Text>
      </View>
    </View>
  );
};

export default RechargeDepositEvent;
