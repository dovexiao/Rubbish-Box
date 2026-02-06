import * as React from 'react';
import {
  View as RNView,
  Text as RNText,
  ScrollView as RNScrollView,
  Image as RNImage,
  ViewProps,
  TextProps,
  ScrollViewProps,
  ImageProps,
} from 'react-native';

/**
 * Harmony 平台下的 react-native-reanimated 简易 shim。
 *
 * 目标：
 * - 提供最小可用的 API 形状（hooks、helpers、Animated 组件），避免运行时崩溃；
 * - 不依赖任何原生实现，所有动画逻辑退化为同步返回最终值；
 * - 仅在 metro.config 中针对 harmony 平台启用，不影响 Android / iOS。
 */

// 基本 hooks：全部退化为同步/无动画实现
export function useSharedValue<T>(initialValue: T): { value: T } {
  return { value: initialValue };
}

export function useAnimatedStyle<T extends object>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _updater?: () => T,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _deps?: any[],
): T {
  // 直接返回空样式，避免动画逻辑报错
  return {} as T;
}

export function useAnimatedProps<T extends object>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _updater?: () => T,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _deps?: any[],
): T {
  return {} as T;
}

// 动画 helpers：直接返回目标值，不做任何插值/过渡
export function withTiming<T>(toValue: T): T {
  return toValue;
}

export function withSpring<T>(toValue: T): T {
  return toValue;
}

export function withDelay<T>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _delayMs: number,
  toValue: T,
): T {
  return toValue;
}

export function withSequence<T>(...values: T[]): T {
  return values[values.length - 1];
}

export function withRepeat<T>(
  toValue: T,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _count?: number,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _reverse?: boolean,
): T {
  return toValue;
}

// 事件/手势相关 API：全部降级为普通回调或空实现
export function useAnimatedGestureHandler<T extends object>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _handlers: T,
): T {
  return _handlers;
}

export function useAnimatedScrollHandler<T extends object>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _handlers: T,
): T {
  return _handlers;
}

export function useDerivedValue<T>(
  cb: () => T,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _deps?: any[],
): { value: T } {
  return { value: cb() };
}

export function runOnJS<T extends (...args: any[]) => any>(fn: T): T {
  return fn;
}

export function runOnUI<T extends (...args: any[]) => any>(fn: T): T {
  return fn;
}

// Animated 组件：直接使用 RN 原生组件，实现 Animated.View / Animated.Text 等常见用法
export type AnimatedComponent<P> = React.ComponentType<P>;

export const View: AnimatedComponent<ViewProps> = RNView;
export const Text: AnimatedComponent<TextProps> = RNText;
export const ScrollView: AnimatedComponent<ScrollViewProps> = RNScrollView;
export const Image: AnimatedComponent<ImageProps> = RNImage;

// 默认导出对象，兼容 `import Animated from 'react-native-reanimated'`
const Animated = {
  // hooks
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  useAnimatedGestureHandler,
  useAnimatedScrollHandler,
  useDerivedValue,
  runOnJS,
  runOnUI,
  withTiming,
  withSpring,
  withDelay,
  withSequence,
  withRepeat,
  // components
  View,
  Text,
  ScrollView,
  Image,
};

export default Animated;
