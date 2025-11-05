import React from 'react';
import {View} from 'react-native';

import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import LinearGradient from '@/components/basic/linear-gradient';
import Text from '@basicComponents/text';
import theme from '@/style';

import {RechargeTypeListItem} from './recharge.service';
import {useInnerStyle} from './recharge.hooks';
import CustomTitle from './custom-title';
import {useTranslation} from 'react-i18next';

export interface RechargeTypeProps {
  typeList: RechargeTypeListItem[];
  value: string;
  onChange?: (type: string) => void;
}

const RechargeType = ({typeList = [], value, onChange}: RechargeTypeProps) => {
  const {i18n} = useTranslation();
  const {selectStyles} = useInnerStyle();

  const renderItem = (item: RechargeTypeListItem) => {
    const isSelected = item.id + '' === value;

    const colors = isSelected
      ? theme.basicColor.newButtonLinear
      : ['#5B0101', '#5B0101'];

    return (
      <NativeTouchableOpacity
        key={item.id}
        style={[selectStyles.item, theme.flex.col, {width: '30%'}]}
        onPress={() => onChange?.(String(item.id))}>
        <LinearGradient
          start={{x: 0.5, y: isSelected ? 1 : 0}}
          end={{x: 0.5, y: isSelected ? 0 : 1}}
          colors={colors}
          style={[theme.flex.center, selectStyles.item, theme.borderRadius.s]}>
          <Text
            fontSize={17}
            color={theme.basicColor.white}
            style={{fontWeight: '900', paddingHorizontal: 4}}
            numberOfLines={2}>
            {item.payName}
          </Text>
        </LinearGradient>
      </NativeTouchableOpacity>
    );
  };

  return (
    <View
      style={[
        theme.flex.col,
        theme.borderRadius.s,
        theme.margin.topxxxxl,
        {paddingHorizontal: 16},
      ]}>
      <CustomTitle name={i18n.t('recharge-page.rechargeType')} />
      <View
        style={[
          theme.flex.row,
          theme.borderRadius.s,
          theme.flex.wrap,
          {columnGap: 16, rowGap: 18},
        ]}>
        {typeList.map(renderItem)}
      </View>
    </View>
  );
};

export default RechargeType;
