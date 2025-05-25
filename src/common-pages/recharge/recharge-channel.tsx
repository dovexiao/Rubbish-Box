/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import Text from '@basicComponents/text';
import {View, Image} from 'react-native';
import theme from '@style';
import {PayMethod} from './recharge.service';
import LazyImage from '@/components/basic/image';
import {useInnerStyle} from './recharge.hooks';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {useTranslation} from 'react-i18next';
import {useSettingWindowDimensions} from '@/store/useSettingStore';

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
  const {screenWidth} = useSettingWindowDimensions();
  const itemWidth = (screenWidth - 48 - 20) / 3;
  return (
    <View
      style={[
        theme.flex.col,
        theme.background.transparentMedium1,
        theme.margin.topl,
        theme.borderRadius.s,
      ]}>
      <Text fontSize={theme.fontSize.m} white style={[theme.margin.l]}>
        {i18n.t('recharge-page.label.channel')}
      </Text>
      <View
        style={[
          theme.flex.row,
          theme.flex.wrap,
          theme.borderRadius.m,
          {gap: 18},
        ]}>
        {payMethodList.map((payMethod, index) => {
          return (
            <NativeTouchableOpacity
              key={index}
              disabled={
                !(
                  balance &&
                  +balance >= payMethod.minAmount &&
                  +balance <= payMethod.maxAmount
                )
              }
              style={[
                {
                  opacity: !(
                    balance &&
                    +balance >= payMethod.minAmount &&
                    +balance <= payMethod.maxAmount
                  )
                    ? 0.3
                    : 1,
                },
              ]}
              onPress={() => onPayMethodChange(payMethod.id)}>
              <View
                key={index}
                style={[
                  {width: itemWidth},
                  payMethodStyles.item,
                  theme.position.rel,
                  theme.flex.center,
                  // theme.background.primary15,
                  theme.border.primary50,
                  theme.borderRadius.s,
                ]}>
                <View style={[theme.flex.center]}>
                  <LazyImage
                    occupancy="#0000"
                    imageUrl={payMethod.payIcon}
                    // width={theme.imageSize.l}
                    // height={theme.imageSize.l}
                    // width={itemWidth - 10}
                    // height={70}
                  />
                </View>
                {payMethod.id === payMethodId ? (
                  <Image
                    style={[
                      theme.position.abs,
                      theme.icon.s,
                      // eslint-disable-next-line react-native/no-inline-styles
                      {bottom: 0, right: 0},
                    ]}
                    source={require('@/assets/icons/btn-checked.webp')}
                  />
                ) : null}
              </View>
            </NativeTouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default RechargeChannel;
