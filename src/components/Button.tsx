import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  ViewStyle,
  TextStyle
} from 'react-native';

/**
 * 按钮组件
 * 通用按钮组件，支持多种样式和状态
 */
interface ButtonProps {
  title: string;
  onPress: () => void;
  type?: 'primary' | 'secondary' | 'outline';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  title,
  onPress,
  type = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  // 根据类型和尺寸确定样式
  const buttonStyle = [
    styles.button,
    styles[`${type}Button`],
    styles[`${size}Button`],
    disabled && styles.disabledButton,
    style,
  ];
  
  const textStyleArray = [
    styles.text,
    styles[`${type}Text`],
    styles[`${size}Text`],
    disabled && styles.disabledText,
    textStyle,
  ];
  
  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          color={type === 'outline' ? '#4891FF' : '#ffffff'} 
          size="small" 
        />
      ) : (
        <Text style={textStyleArray}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // 按钮类型样式
  primaryButton: {
    backgroundColor: '#4891FF',
  },
  secondaryButton: {
    backgroundColor: '#666',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4891FF',
  },
  
  // 按钮尺寸样式
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  mediumButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  largeButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  
  // 禁用状态样式
  disabledButton: {
    backgroundColor: '#ccc',
    borderColor: '#ccc',
  },
  
  // 文字样式
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  primaryText: {
    color: '#ffffff',
  },
  secondaryText: {
    color: '#ffffff',
  },
  outlineText: {
    color: '#4891FF',
  },
  
  // 文字尺寸样式
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
  
  // 禁用文字样式
  disabledText: {
    color: '#999',
  },
});
