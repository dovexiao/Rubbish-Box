import React from 'react';
import {StyleSheet, View, Image} from 'react-native';

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
    const colors = isSelected ? ['#AF5704', '#713702'] : ['#5A0000', '#5A0000'];
    const borderColor = isSelected ? '#FFBD37' : 'transparent';

    return (
      <NativeTouchableOpacity
        key={item.id}
        style={[selectStyles.item, theme.flex.col, {width: '30%'}]}
        onPress={() => onChange?.(String(item.id))}>
        <LinearGradient
          start={{x: 0, y: isSelected ? 0.5 : 0}}
          end={{x: 1, y: isSelected ? 0.5 : 1}}
          colors={colors}
          style={[
            theme.flex.row,
            theme.flex.center,
            selectStyles.item,
            theme.borderRadius.l,
            {
              columnGap: 6,
              borderWidth: 2,
              borderColor,
            },
          ]}>
          <Image
            source={{uri: item.payIcon}}
            style={{
              width: 24,
              height: 24,
              borderRadius: 20,
              backgroundColor: '#FFFFFF',
            }}
            resizeMode="contain"
          />
          <Text
            fontSize={14}
            color={theme.basicColor.white}
            style={{fontWeight: '900'}}
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
      <CustomTitle name={i18n.t('recharge-page.paymentType')} />
      <View
        style={[theme.flex.row, theme.flex.wrap, {columnGap: 16, rowGap: 14}]}>
        {typeList.map(renderItem)}
      </View>
    </View>
  );
};

export default RechargeType;
