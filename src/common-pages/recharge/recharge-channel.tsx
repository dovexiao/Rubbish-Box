/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import Text from '@basicComponents/text';
import {View, Image} from 'react-native';
import theme from '@style';
import {PayMethod} from './recharge.service';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {useTranslation} from 'react-i18next';

export interface RechargeChannelProps {
  payMethodList: PayMethod[];
  payMethodId?: number;
  onPayMethodChange: (id: number) => void;
  balance?: string;
}

const RechargeChannel: React.FC<RechargeChannelProps> = ({
  payMethodList,
  payMethodId,
  onPayMethodChange,
  balance,
}) => {
  const {i18n} = useTranslation();

  return (
    <View
      style={[
        theme.flex.col,
        theme.background.transparentMedium1,
        theme.margin.topl,
        theme.borderRadius.s,
        {paddingHorizontal: 16, paddingVertical: 12},
      ]}>
      <Text fontSize={theme.fontSize.m} white style={{marginBottom: 18}}>
        {i18n.t('recharge-page.label.channel')}
      </Text>

      {payMethodList.map(payMethod => {
        const isDisabled =
          !balance ||
          +balance < payMethod.minAmount ||
          +balance > payMethod.maxAmount;

        const isSelected = payMethod.id === payMethodId;

        return (
          <NativeTouchableOpacity
            key={payMethod.id}
            disabled={isDisabled}
            onPress={() => onPayMethodChange(payMethod.id)}
            style={[
              theme.flex.row,
              theme.flex.center,
              theme.borderRadius.s,
              isSelected ? theme.border.primary : theme.border.primary50,
              {marginBottom: 12, padding: 12},
              isDisabled && {opacity: 0.4},
            ]}>
            {/* 左侧图片 */}
            <Image
              source={{uri: payMethod.payIcon}}
              style={{
                width: 60,
                height: 60,
                borderRadius: 8,
                marginRight: 16,
                backgroundColor: '#FFFFFF',
              }}
              resizeMode="contain"
            />

            {/* 中间文字 */}
            <View style={{flex: 1, justifyContent: 'center'}}>
              <Text
                fontSize={theme.fontSize.l1}
                white
                numberOfLines={1}
                ellipsizeMode="tail">
                {payMethod.payName}
              </Text>
              <Text
                fontSize={theme.fontSize.m}
                white
                style={{opacity: 0.6, marginTop: 4}}>
                {`Limit: ${payMethod.minAmount} - ${payMethod.maxAmount}`}
              </Text>
            </View>

            {/* 右侧选中图标 */}
            {isSelected && (
              <Image
                style={[
                  theme.position.abs,
                  theme.icon.s,

                  {bottom: 0, right: 0},
                ]}
                source={require('@/assets/icons/btn-checked.webp')}
              />
            )}
          </NativeTouchableOpacity>
        );
      })}
    </View>
  );
};

export default RechargeChannel;
