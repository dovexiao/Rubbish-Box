import React, {ReactNode, useState} from 'react';
import {FontFamily, SafeAny} from '@types';
import theme from '@style';
import {
  Button as RNEButton,
  ButtonProps,
  ThemeProvider,
  createTheme,
} from '@rneui/themed';
import Text from '@basicComponents/text';
import LinearGradient from '../linear-gradient';
import {
  GestureResponderEvent,
  StyleProp,
  View,
  ViewStyle,
  StyleSheet,
  LayoutChangeEvent,
  TextStyle,
} from 'react-native';

type SizeStyles = Record<Size, StyleProp<ViewStyle>>;
type SizeFontSizes = Record<Size, number>;

export type Size = 'xsmall' | 'small' | 'middle' | 'large';

export interface LinearButtonProps
  extends Omit<ButtonProps, 'type' | 'title' | 'size'> {
  title?: string;
  titleFontFamily?: FontFamily;
  titleColor?: TextStyle['color'];
  size?: Size;

  type?: ButtonType;
  titleBold?: boolean;
  width?: number;

  disabled?: boolean;

  children?: ReactNode;

  onPress?: (event?: GestureResponderEvent) => void;
  onPressIn?: (event?: GestureResponderEvent) => void;
  onPressOut?: (event?: GestureResponderEvent) => void;
}

export type ButtonType =
  | 'border'
  | 'primary'
  | 'linear-primary'
  | 'linear-primary-gold';

const buttonPropsMap: Record<ButtonType, Partial<ButtonProps>> = {
  border: {
    type: 'outline',
  },
  primary: {
    color: theme.backgroundColor.main,
  },
  'linear-primary': {
    ViewComponent: LinearGradient as SafeAny,
    linearGradientProps: {
      start: {x: 0, y: 0},
      end: {x: 1, y: 0},
      colors: theme.linearGradientColor.linearGradientBtnColor,
    },
  },
  'linear-primary-gold': {
    ViewComponent: LinearGradient as SafeAny,
    linearGradientProps: {
      start: {x: 0.5, y: 0},
      end: {x: 0.5, y: 1},
      colors: ['#FEEB68', '#E19E00'],
    },
  },
};

const pressedScale = 0.95;

const Button: React.FC<LinearButtonProps> = props => {
  const {
    title,
    titleBold = false,
    titleFontFamily = 'fontInter',
    titleColor = theme.fontColor.login,
    type = 'primary',
    size = 'middle',
    width,
    radius = 6,
    children,
    disabled,
    onPress,
    onPressIn,
    onPressOut,
    ...otherProps
  } = props;

  const [pressed, setPressed] = useState<boolean>(false);
  const [actualButtonSize, setActualButtonSize] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });
  const handlePressIn = (e: GestureResponderEvent) => {
    setPressed(true);
    onPressIn && onPressIn(e);
  };
  const handlePressOut = (e: GestureResponderEvent) => {
    setPressed(false);
    onPressOut && onPressOut(e);
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    const {width: _width, height: _height} = e.nativeEvent.layout;
    setActualButtonSize({
      width: _width,
      height: _height,
    });
  };

  const rneTheme = createTheme({
    lightColors: {
      primary: theme.borderColor.primary,
    },
    darkColors: {
      primary: theme.borderColor.primary,
    },
  });

  return (
    <ThemeProvider theme={rneTheme}>
      <View onLayout={handleLayout}>
        <RNEButton
          {...buttonPropsMap[type]}
          style={[
            {width},
            pressed ? {transform: [{scale: pressedScale}]} : {},

            {
              // opacity: disabled ? 0.8 : 1,
            },
          ]}
          disabled={disabled}
          disabledStyle={[theme.background.newStatusGrey]}
          // eslint-disable-next-line react-native/no-inline-styles
          disabledTitleStyle={{color: '#ffffff4d'}}
          buttonStyle={[
            sizeStyles[size],
            theme.position.rel,
            otherProps?.buttonStyle,
          ]}
          activeOpacity={1}
          radius={radius}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          {...otherProps}>
          {title && (
            <Text
              fontFamily={titleFontFamily}
              fontSize={sizeFontSizes[size]}
              blod={titleBold}
              letterSpacing={0}
              color={titleColor}>
              {title}
            </Text>
          )}

          {children}

          {pressed && (
            <View
              style={[
                [styles.mask],
                {
                  width: actualButtonSize.width,
                  height: actualButtonSize.height,
                  borderRadius: (radius || 0) as number,
                },
              ]}
            />
          )}
        </RNEButton>
      </View>
    </ThemeProvider>
  );
};

const sizeStyles: SizeStyles = {
  small: [theme.padding.tbs, {paddingHorizontal: theme.paddingSize.s * 2}],
  middle: [theme.padding.tbm, {paddingHorizontal: theme.paddingSize.m * 2}],
  large: [theme.padding.tbl, {paddingHorizontal: theme.paddingSize.l * 2 - 2}],
  xsmall: [theme.padding.tbxs, {paddingHorizontal: theme.paddingSize.l}],
};

const sizeFontSizes: SizeFontSizes = {
  xsmall: theme.fontSize.xs,
  small: theme.fontSize.s,
  middle: theme.fontSize.m,
  large: theme.fontSize.l,
};

const styles = StyleSheet.create({
  content: {
    borderStyle: 'solid',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  mask: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
    backgroundColor: theme.basicColor.dark,
    opacity: 0.2,
  },
});

export default Button;
