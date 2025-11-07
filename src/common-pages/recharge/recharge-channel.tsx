import React from 'react';
import Text from '@basicComponents/text';
import {View} from 'react-native';
import theme from '@style';
import {PayMethod} from './recharge.service';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {useTranslation} from 'react-i18next';
import LinearGradient from '@/components/basic/linear-gradient';
import {scaleSize} from '@/utils';
import CustomTitle from '@/components/business/custom-title';

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

  const renderItem = (item: PayMethod) => {
    const isDisabled =
      !balance || +balance < item.minAmount || +balance > item.maxAmount;

    const isSelected = item.id === payMethodId;
    const colors = isSelected ? ['#AF5704', '#713702'] : ['#5A0000', '#5A0000'];
    const borderColor = isSelected ? '#FFBD37' : 'transparent';

    return (
      <NativeTouchableOpacity
        key={item.id}
        disabled={isDisabled}
        onPress={() => onPayMethodChange(item.id)}
        style={[
          {
            width: '47%',
          },
          isDisabled && {opacity: 0.6},
        ]}>
        <LinearGradient
          start={{x: 0, y: isSelected ? 0.5 : 0}}
          end={{x: 1, y: isSelected ? 0.5 : 1}}
          colors={colors}
          style={[
            theme.flex.center,
            theme.borderRadius.l,
            {
              paddingVertical: scaleSize(16),
              borderWidth: 2,
              borderColor,
            },
          ]}>
          <Text
            fontSize={theme.fontSize.l}
            white
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{fontWeight: 'bold'}}>
            {item.payName}
          </Text>
          <Text
            white
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{paddingTop: scaleSize(8)}}>
            {`Balance: ${item.minAmount} - ${item.maxAmount}`}
          </Text>
        </LinearGradient>
      </NativeTouchableOpacity>
    );
  };

  return (
    <View
      style={[
        theme.flex.col,
        theme.margin.topxxxxl,
        {
          paddingHorizontal: 16,
        },
      ]}>
      <CustomTitle name={i18n.t('recharge-page.label.channel')} />

      <View
        style={[
          theme.flex.row,
          theme.flex.wrap,
          {columnGap: scaleSize(13), rowGap: scaleSize(14)},
        ]}>
        {payMethodList.map(renderItem)}
      </View>
    </View>
  );
};

export default RechargeChannel;
