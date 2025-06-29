import theme from '@/style';
import {View, StyleSheet} from 'react-native';
import Button from '@/components/basic/button';
import Text from '@/components/basic/text';
import React from 'react';
import {ButtonType} from '@/components/basic/button/button';
import {useTranslation} from 'react-i18next';
import {useResponsiveDimensions} from '@/utils';
import globalStore from '@/services/global.state';

export interface RechargeButtonProps {
  disabled?: boolean;
  type?: ButtonType;
  text?: string;
  onRecharge?: () => void;
}

const RechargeButton: React.FC<RechargeButtonProps> = ({
  type = 'primary',
  onRecharge,
  disabled,
  text,
}) => {
  const {i18n} = useTranslation();
  const {width} = useResponsiveDimensions();
  const designWidth = 375;
  const rechargeButtonWidth = (335 * width) / designWidth;
  const rechargeStyle = StyleSheet.create({
    button: {
      width: rechargeButtonWidth,
      height: 48,
    },
    buttonWrap: {
      paddingTop: theme.paddingSize.l,
      paddingBottom: globalStore.isAndroid ? 24 * 3 : 24,
    },
  });

  return (
    <View
      style={[
        theme.flex.center,
        theme.fill.fillW,
        rechargeStyle.buttonWrap,
        // theme.background.primary,
      ]}>
      <Button
        size="large"
        type={type}
        radius={5}
        color={theme.fontColor.primary}
        disabled={disabled}
        width={rechargeButtonWidth}
        buttonStyle={[rechargeStyle.button]}
        onPress={onRecharge}>
        <Text fontSize={theme.fontSize.m} blod color={theme.basicColor.dark}>
          {text || i18n.t('home.tab.deposit')}
        </Text>
      </Button>
    </View>
  );
};

export default RechargeButton;
