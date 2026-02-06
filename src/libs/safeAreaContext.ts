import * as React from 'react';
import { Platform } from 'react-native';

// 统一封装 safe-area，上层代码只从这里导出
// Android / iOS 使用 react-native-safe-area-context
// Harmony 等其它平台使用 JS shim，避免依赖 RNCSafeAreaView 原生组件

// 为了避免在不支持的平台上初始化 native 组件，这里通过 Platform 条件 require

type SafeAreaProviderProps = {
  children?: React.ReactNode;
};

export type SafeAreaInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type SafeAreaFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
};

let SafeAreaProviderImpl: React.ComponentType<SafeAreaProviderProps>;
let SafeAreaViewImpl: React.ComponentType<any>;
let useSafeAreaInsetsImpl: () => SafeAreaInsets;
let useSafeAreaFrameImpl: () => SafeAreaFrame;

if (Platform.OS === 'ios' || Platform.OS === 'android') {
  // 在原生平台上按需加载真实实现
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const real = require('react-native-safe-area-context');
  SafeAreaProviderImpl = real.SafeAreaProvider;
  SafeAreaViewImpl = real.SafeAreaView;
  useSafeAreaInsetsImpl = real.useSafeAreaInsets;
  useSafeAreaFrameImpl = real.useSafeAreaFrame;
} else {
  // 在 Harmony 等平台上使用纯 JS shim
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const shim = require('../harmony/safe-area-context-shim');
  SafeAreaProviderImpl = shim.SafeAreaProvider;
  SafeAreaViewImpl = shim.SafeAreaView;
  useSafeAreaInsetsImpl = shim.useSafeAreaInsets;
  useSafeAreaFrameImpl = shim.useSafeAreaFrame;
}

export const SafeAreaProvider: React.ComponentType<SafeAreaProviderProps> =
  SafeAreaProviderImpl;
export const SafeAreaView: React.ComponentType<any> = SafeAreaViewImpl;
export const useSafeAreaInsets: () => SafeAreaInsets = useSafeAreaInsetsImpl;
export const useSafeAreaFrame: () => SafeAreaFrame = useSafeAreaFrameImpl;
