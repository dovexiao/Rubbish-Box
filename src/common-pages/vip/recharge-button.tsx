import theme from '@/style';
import {View} from 'react-native';
import {useInnerStyle} from './vip.hooks';
import Button from '@/components/basic/button';
import Text from '@/components/basic/text';
import React from 'react';
import {useTranslation} from 'react-i18next';

export interface RechargeButtonProps {
  onRecharge?: () => void;
}

const RechargeButton: React.FC<RechargeButtonProps> = ({onRecharge}) => {
  const {
    rechargeStyle,
    size: {rechargeButtonWidth},
  } = useInnerStyle();
  const {i18n} = useTranslation();
  return (
    <View
      style={[
        theme.flex.center,
        theme.fill.fillW,
        theme.padding.l,
        theme.background.white,
      ]}>
      <Button
        size="large"
        width={rechargeButtonWidth}
        buttonStyle={[rechargeStyle.button]}
        onPress={onRecharge}>
        <Text fontSize={theme.fontSize.s} blod color={theme.basicColor.white}>
          {i18n.t('me.vip.recharge')}
        </Text>
      </Button>
    </View>
  );
};

export default RechargeButton;
