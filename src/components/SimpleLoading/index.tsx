import React from 'react';
import { ActivityIndicator, View, StyleSheet, ViewStyle } from 'react-native';

type SimpleLoadingProps = {
  style?: ViewStyle;
  size?: 'small' | 'large';
  color?: string;
};

export default function SimpleLoading({
  style,
  size = 'large',
  color = '#333333',
}: SimpleLoadingProps) {
  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
