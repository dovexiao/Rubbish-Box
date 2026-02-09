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

export const Svg: React.FC<SvgProps> = ({
  children,
  style,
  width,
  height,
  ...rest
}) => {
  // 从第一个 Path 子节点里取 fill 颜色，用于占位块
  let fillColor = '#333333';
  const firstChild = React.Children.toArray(children)[0] as any;
  if (firstChild && firstChild.props && firstChild.props.fill) {
    fillColor = firstChild.props.fill;
  }

  const boxSizeStyle: any = {
    width: width ?? 18,
    height: height ?? 18,
  };

  return (
    <View
      style={[
        {
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        },
        boxSizeStyle,
        style,
      ]}
      {...rest}
    >
      {/* 用纯色方块作为 icon 占位，保证 Harmony 上至少有可见图形 */}
      <View
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 3,
          backgroundColor: fillColor,
        }}
      />
    </View>
  );
};

export const Path: React.FC<PathProps> = () => {
  // 具体路径在 Harmony 上暂不绘制，避免依赖原生 RNSVG* 组件
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
