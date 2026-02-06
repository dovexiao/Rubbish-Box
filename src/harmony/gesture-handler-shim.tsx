import * as React from 'react';
import { View, ViewProps } from 'react-native';

/**
 * Harmony 平台下的 react-native-gesture-handler 简易 shim。
 *
 * 只实现最基础的 GestureHandlerRootView 和若干手势组件，
 * 内部直接退化为普通 View，避免依赖原生手势模块。
 *
 * 目标：
 * - 不影响 Android / iOS（仅在 metro.config 中针对 harmony 平台启用）
 * - 避免在鸿蒙上因 NativeModule 为空导致的崩溃
 */

type HandlerProps = ViewProps & {
  onGestureEvent?: (...args: any[]) => void;
  onHandlerStateChange?: (...args: any[]) => void;
};

export const GestureHandlerRootView: React.FC<ViewProps> = ({
  children,
  ...rest
}) => {
  return <View {...rest}>{children}</View>;
};

// 常用手势 Handler 简单退化为包裹 View
export const PanGestureHandler: React.FC<HandlerProps> = ({
  children,
  ...rest
}) => {
  return <View {...rest}>{children}</View>;
};

export const TapGestureHandler: React.FC<HandlerProps> = ({
  children,
  ...rest
}) => {
  return <View {...rest}>{children}</View>;
};

export const LongPressGestureHandler: React.FC<HandlerProps> = ({
  children,
  ...rest
}) => {
  return <View {...rest}>{children}</View>;
};

export const FlingGestureHandler: React.FC<HandlerProps> = ({
  children,
  ...rest
}) => {
  return <View {...rest}>{children}</View>;
};

export const NativeViewGestureHandler: React.FC<HandlerProps> = ({
  children,
  ...rest
}) => {
  return <View {...rest}>{children}</View>;
};

// 一些库可能会用到的常量占位符，保持 API 兼容但不提供真实手势能力
export const State: Record<string, number> = {};
export const Directions: Record<string, number> = {};

// 默认导出一个包含常用导出的对象，兼容 "import * as GestureHandler" 的写法
export default {
  GestureHandlerRootView,
  PanGestureHandler,
  TapGestureHandler,
  LongPressGestureHandler,
  FlingGestureHandler,
  NativeViewGestureHandler,
  State,
  Directions,
};
