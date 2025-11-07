import theme from '@/style';
import {View, StyleSheet, ImageBackground} from 'react-native';
import Button from '@/components/basic/button';
import Text from '@/components/basic/text';
import React from 'react';
import {ButtonType} from '@/components/basic/button/button';
import {useTranslation} from 'react-i18next';
import {scaleSize, useResponsiveDimensions} from '@/utils';
// import globalStore from '@/services/global.state';
import LinearGradient from '@/components/basic/linear-gradient';
import RechargeQipao from '@/common-pages/recharge/recharge-qipao';
import {
  LazyImageBackground,
  LazyImageLGBackground,
} from '@/components/basic/image';
// import { BackgroundImage } from '@rneui/base';
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
      height: scaleSize(42),
    },
    buttonWrap: {
      paddingTop: theme.paddingSize.m,
      paddingBottom: theme.paddingSize.xxl,
    },
  });
  return (
    <View
      style={[theme.flex.center, theme.fill.fillW, rechargeStyle.buttonWrap]}>
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
            fontSize={theme.fontSize.l}
            color={theme.basicColor.white}
            style={{textAlign: 'center', fontWeight: 'bold'}}>
            {i18n.t('label.recharge')} {text && `(${text})`}
          </Text>
        </Text>
      </Button>
    </View>
  );
};

export default RechargeButton;
