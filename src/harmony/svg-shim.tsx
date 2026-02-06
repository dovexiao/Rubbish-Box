import * as React from 'react';
import { View, ViewProps } from 'react-native';

/**
 * Harmony 平台下的 react-native-svg 简易 shim。
 *
 * 目标：
 * - 提供 Svg / Path / G 等常用组件的占位实现；
 * - 避免 requireNativeComponent('RNSVGPath' | 'RNSVGSvgView' ...) 报错；
 * - 不依赖任何原生实现，仅用于保证 UI 不崩溃。
 *
 * 图标等会退化为简单的方块或空视图，视觉上会有损失，
 * 但在 Harmony 上可以先保证功能正常运行。
 */

export type GProps = any;

export interface SvgProps extends ViewProps {
  width?: number | string;
  height?: number | string;
  viewBox?: string;
  fill?: string;
}

export interface PathProps extends ViewProps {
  d?: string;
  fill?: string;
}

export const Svg: React.FC<SvgProps> = ({ children, style, ...rest }) => {
  return (
    <View
      // 给一个最小尺寸，避免某些地方 size=0 完全不可见
      style={[{ alignItems: 'center', justifyContent: 'center' }, style]}
      {...rest}
    >
      {children}
    </View>
  );
};

export const Path: React.FC<PathProps> = () => {
  // 不绘制真实路径，仅作为占位，避免崩溃
  return null;
};

export const G: React.FC<ViewProps> = ({ children, ...rest }) => (
  <View {...rest}>{children}</View>
);

export const Defs: React.FC<ViewProps> = ({ children }) => <>{children}</>;
export const LinearGradient: React.FC<ViewProps> = ({ children }) => (
  <>{children}</>
);
export const Stop: React.FC<ViewProps> = () => null;
export const ClipPath: React.FC<ViewProps> = ({ children }) => <>{children}</>;

const defaultExport = {
  Svg,
  Path,
  G,
  Defs,
  LinearGradient,
  Stop,
  ClipPath,
};

export default defaultExport;
