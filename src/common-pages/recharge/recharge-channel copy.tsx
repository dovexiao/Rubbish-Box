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

  const renderItem = (item: PayMethod) => {
    const isDisabled =
      !balance || +balance < item.minAmount || +balance > item.maxAmount;

    const isSelected = item.id === payMethodId;

    return (
      <NativeTouchableOpacity
        key={item.id}
        disabled={isDisabled}
        onPress={() => onPayMethodChange(item.id)}
        style={[
          theme.flex.row,
          theme.flex.center,
          theme.borderRadius.s,
          isSelected ? theme.border.primary : {},
          {
            width: '46%',
            padding: 12,
            backgroundColor: theme.basicColor.newBgInOne,
          },
          isDisabled && {opacity: 0.6},
        ]}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <Text
            fontSize={theme.fontSize.l}
            white
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{fontWeight: 'bold'}}>
            {item.payName}
          </Text>
          <Text white numberOfLines={1} ellipsizeMode="tail">
            {`Balance: ${item.minAmount} - ${item.maxAmount}`}
          </Text>
        </View>
      </NativeTouchableOpacity>
    );
  };

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

      <View
        style={[
          theme.flex.row,
          theme.borderRadius.s,
          theme.flex.wrap,
          {columnGap: 16, rowGap: 18},
        ]}>
        {payMethodList.map(renderItem)}
        {/* {payMethodList.map(payMethod => {
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
                  width: '46%',
                  padding: 12,
                  backgroundColor: theme.basicColor.newBgInOne,
                },
                isDisabled && {opacity: 0.6},
              ]}>
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text
                  fontSize={theme.fontSize.l}
                  white
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  style={{fontWeight: 'bold'}}>
                  {payMethod.payName}
                </Text>
                <Text white numberOfLines={1} ellipsizeMode="tail">
                  {`Balance: ${payMethod.minAmount} - ${payMethod.maxAmount}`}
                </Text>
              </View>
            </NativeTouchableOpacity>
          );
        })} */}
      </View>
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
