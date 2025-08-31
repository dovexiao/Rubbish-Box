import theme from '@/style';
import {View, StyleSheet} from 'react-native';
import Button from '@/components/basic/button';
import Text from '@/components/basic/text';
import React from 'react';
import {ButtonType} from '@/components/basic/button/button';
import {useTranslation} from 'react-i18next';
import {useResponsiveDimensions} from '@/utils';
// import globalStore from '@/services/global.state';
import LinearGradient from '@/components/basic/linear-gradient';
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
      // backgroundColor: theme.basicColor.newBgInTwo,
      paddingTop: theme.paddingSize.m,
      paddingBottom: theme.paddingSize.m,
      // paddingBottom: globalStore.isAndroid
      //   ? (56 * width) / designWidth + 10
      //   : 66,
      // backgroundColor: `linear-gradient(180deg, ${theme.basicColor.newButtonBgOne})`,
    },
  });
  return (
    // <LazyImageLGBackground style={[theme.fill.fill, theme.flex.col]}></LazyImageLGBackground>
    <View
      style={[theme.flex.center, theme.fill.fillW, rechargeStyle.buttonWrap]}>
      <LinearGradient
        start={{x: 0, y: 1}}
        end={{x: 0, y: 1}}
        colors={theme.basicColor.newButtonBgOne}
        style={[rechargeStyle.button, {borderRadius: 45}]}>
        <Button
          size="large"
          type={type}
          radius={5}
          color="transparent"
          disabled={disabled}
          width={rechargeButtonWidth}
          buttonStyle={[{backgroundColor: 'transparent'}, rechargeStyle.button]}
          onPress={onRecharge}>
          <Text fontSize={theme.fontSize.m} blod color={theme.basicColor.white}>
            {text || i18n.t('home.tab.deposit')}
          </Text>
        </Button>
      </LinearGradient>
    </View>
  );
};

export default RechargeButton;
