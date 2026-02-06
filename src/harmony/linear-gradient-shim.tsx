import React from 'react';
import { View, ViewProps } from 'react-native';

/**
 * Harmony 平台下的 react-native-linear-gradient 简易 shim。
 *
 * 为了保持 API 兼容，仅实现最基础的 LinearGradient 组件，
 * 内部退化为带纯色背景的 View（使用 colors[0]），
 * 不依赖任何原生 UI 组件（如 BVLinearGradient）。
 *
 * 目标：
 * - 不影响 Android / iOS（仅在 metro.config 中针对 harmony 平台启用）
 * - 避免在鸿蒙上因 requireNativeComponent('BVLinearGradient') 报错
 */

export interface LinearGradientProps extends ViewProps {
  colors: (string | number)[];
  locations?: number[];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

const LinearGradient: React.FC<LinearGradientProps> = ({
  colors = ['#000000', '#000000'],
  style,
  children,
  ...rest
}) => {
  const backgroundColor = (colors[0] as any) || '#000000';

  return (
    <View
      // 使用首个颜色作为背景色，视觉上保留品牌色，
      // 虽然不是渐变，但能在鸿蒙上正常展示按钮。
      style={[{ backgroundColor }, style]}
      {...rest}
    >
      {children}
    </View>
  );
};

export default LinearGradient;
