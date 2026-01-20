import React, { ReactNode } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
  TouchableOpacityProps,
  DimensionValue,
} from 'react-native';
import LinearGradient, {
  LinearGradientProps,
} from 'react-native-linear-gradient';

export interface GradientButtonProps extends Omit<TouchableOpacityProps, 'style'> {
  children?: ReactNode;
  text?: string;
  colors?: (string | number)[];
  linearGradientProps?: Partial<LinearGradientProps>;
  width?: DimensionValue;
  height?: DimensionValue;
  className?: string;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  round?: boolean;
  disabled?: boolean;
  btnBorderRadius?: number; // 按钮圆角
  hasBorder?: boolean; // 是否有边框
  textColor?: string;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  colors = ['#0077FD', '#3393FF'],
  children,
  text,
  linearGradientProps,
  className,
  onPress,
  round = true,
  btnBorderRadius = 24,
  hasBorder = false,
  style,
  contentStyle,
  textStyle,
  width,
  height,
  disabled = false,
  textColor = '#FFFFFF',
  ...props
}) => {
  const borderRadius = round
    ? (height && typeof height === 'number' ? height / 2 : btnBorderRadius)
    : btnBorderRadius;

  const gradientStyle: ViewStyle = {
    borderRadius,
    width: width || '100%',
    height,
    opacity: disabled ? 0.6 : 1,
  };

  const buttonStyle: ViewStyle = {
    width: width || '100%',
    height,
    borderWidth: hasBorder ? 2 : 0,
    borderColor: hasBorder ? 'rgba(0, 0, 0, 0.1)' : 'transparent',
    borderRadius,
  };

  return (
    <LinearGradient
      start={{ x: 1, y: 1 }}
      end={{ x: 0, y: 0 }}
      locations={[0, 1]}
      colors={colors}
      style={[styles.linearGradient, gradientStyle, style]}
      {...linearGradientProps}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={disabled}
        style={[styles.button, buttonStyle]}
        {...props}
      >
        <View style={[styles.content, contentStyle]}>
          {children ? (
            children
          ) : (
            <Text style={[styles.text, { color: textColor }, textStyle]}>
              {text || '按钮'}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  linearGradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 8,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GradientButton;
