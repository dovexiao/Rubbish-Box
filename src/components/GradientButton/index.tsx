import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

export interface GradientButtonProps {
  text?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  width?: number;
  height?: number;
  startColor?: string;
  endColor?: string;
  textColor?: string;
}

const GradientButton: React.FC<GradientButtonProps> = ({
  text = '按钮',
  children,
  onPress,
  disabled = false,
  style,
  contentStyle,
  textStyle,
  width = 143,
  height = 50,
  startColor = '#1B9666',
  endColor = '#49BD90',
  textColor = '#FFFFFF',
}) => {
  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} disabled={disabled}>
      <LinearGradient
        colors={[startColor, endColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.button,
          {
            width,
            height,
            borderRadius: height / 2,
            opacity: disabled ? 0.6 : 1,
          },
          style,
        ]}
      >
        <View style={[styles.content, contentStyle]}>
          {children ? (
            children
          ) : (
            <Text style={[styles.text, { color: textColor }, textStyle]}>
              {text}
            </Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
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
