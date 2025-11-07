import theme from '@/style';
import {View, StyleSheet, ImageBackground} from 'react-native';
import Button from '@/components/basic/button';
import Text from '@/components/basic/text';
import React from 'react';
import {ButtonType} from '@/components/basic/button/button';
import {useTranslation} from 'react-i18next';
import {useResponsiveDimensions} from '@/utils';

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
      height: 60,
    },
    buttonWrap: {
      paddingTop: theme.paddingSize.m,
      paddingBottom: theme.paddingSize.xxl,
    },
  });
  return (
    <View
      style={[theme.flex.center, theme.fill.fillW, rechargeStyle.buttonWrap]}>
      <ImageBackground
        source={require('@/assets/icons/recharge/button-background.webp')}
        resizeMode="contain">
        <Button
          size="large"
          type={type}
          radius={30}
          color="transparent"
          disabled={disabled}
          width={rechargeButtonWidth}
          buttonStyle={[{backgroundColor: 'transparent'}, rechargeStyle.button]}
          onPress={onRecharge}>
          <Text
            fontSize={theme.fontSize.m}
            color={theme.basicColor.white}
            style={{textAlign: 'center'}}>
            <Text
              fontSize={theme.fontSize.xl}
              color={theme.basicColor.white}
              style={{textAlign: 'center', fontWeight: 'bold'}}>
              {i18n.t('label.recharge')} {text && `(${text})`}
            </Text>
          </Text>
        </Button>
      </ImageBackground>
    </View>
  );
};

export default RechargeButton;
