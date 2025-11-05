/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import Text from '@basicComponents/text';
import {View, Image, StyleSheet} from 'react-native';
import theme from '@style';
import {PayMethod} from './recharge.service';
import {useInnerStyle} from './recharge.hooks';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {useTranslation} from 'react-i18next';
import Ok from '../svg/ok';
import CustomTitle from './custom-title';

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
  const {payMethodStyles} = useInnerStyle();

  return (
    <View
      style={[
        theme.flex.col,
        theme.margin.topxxxxl,
        theme.borderRadius.s,
        {
          paddingHorizontal: 16,
        },
      ]}>
      <CustomTitle name={i18n.t('recharge-page.label.channel')} />

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
              isSelected ? theme.border.primary : {},
              {
                marginBottom: 12,
                padding: 12,
                backgroundColor: theme.basicColor.newBgInOne,
              },
              isDisabled && {opacity: 0.6},
            ]}>
            {/* 左侧图片 */}
            <Image
              source={{uri: payMethod.payIcon}}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                marginRight: 16,
                backgroundColor: '#FFFFFF',
              }}
              resizeMode="contain"
            />

            {/* 中间文字 */}
            <View style={{flex: 1, justifyContent: 'center'}}>
              <Text
                fontSize={theme.fontSize.l}
                white
                numberOfLines={1}
                ellipsizeMode="tail">
                {payMethod.payName}(
                {`Limit: ${payMethod.minAmount} - ${payMethod.maxAmount}`})
              </Text>
              {/* <Text
                fontSize={theme.fontSize.m}
                white
                style={{opacity: 0.6, marginTop: 4}}>
                {`Limit: ${payMethod.minAmount} - ${payMethod.maxAmount}`}
              </Text> */}
            </View>

            {/* 右侧选中图标 */}
            {isSelected ? (
              <View
                style={[
                  theme.position.abs,
                  payMethodStyles.itemSelectedIcon,
                  theme.flex.center,
                  {marginRight: 12},
                ]}>
                <Ok />
              </View>
            ) : (
              // 空圆圈不要了，占位
              <View />
            )}
          </NativeTouchableOpacity>
        );
      })}
    </View>
  );
};

const styleSheet = StyleSheet.create({
  title: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  titleIcon: {
    width: 4,
    height: 15,
    backgroundColor: theme.basicColor.newButtonYellow,
    borderRadius: 2,
    marginRight: 8,
  },
  titleText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.basicColor.newFontWhite,
    fontFamily: 'Arial, Arial-Bold',
  },
});
export default RechargeChannel;
