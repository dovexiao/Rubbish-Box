import React from 'react';
import { View, Text, StyleProp, ViewStyle, TextStyle } from 'react-native';
import styles from './styles';

export interface TagProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function Tag({ children, style, textStyle }: TagProps) {
  return (
    <View style={[styles.tag, style]}>
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text style={[styles.text, textStyle]}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

