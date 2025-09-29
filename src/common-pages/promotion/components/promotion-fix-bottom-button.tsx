import theme from '@/style';
import {View, StyleSheet} from 'react-native';
import Button from '@/components/basic/button';
import Text from '@/components/basic/text';
import React from 'react';
import {ButtonType} from '@/components/basic/button/button';
import {useResponsiveDimensions} from '@/utils';
import globalStore from '@/services/global.state';

export interface PromotionButtonProps {
  disabled?: boolean;
  type?: ButtonType;
  text?: string;
  onPress?: () => void;
}

const PromotionFixedBottomButton: React.FC<PromotionButtonProps> = ({
  type = 'linear-primary',
  onPress,
  disabled,
  text,
}) => {
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
      paddingBottom: globalStore.isAndroid
        ? theme.paddingSize.l * 3
        : theme.paddingSize.l,
    },
  });

  return (
    <View
      style={[
        theme.flex.center,
        theme.fill.fillW,
        rechargeStyle.buttonWrap,
        // theme.background.lightGrey,
      ]}>
      <Button
        size="large"
        type={type}
        radius={5}
        disabled={disabled}
        width={rechargeButtonWidth}
        buttonStyle={[rechargeStyle.button]}
        onPress={onPress}>
        <Text fontSize={theme.fontSize.m} blod color={theme.basicColor.white}>
          {text}
        </Text>
      </Button>
    </View>
  );
};

export default PromotionFixedBottomButton;
