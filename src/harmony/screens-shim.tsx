import * as React from 'react';
import { View, ViewProps } from 'react-native';

/**
 * Harmony 平台下的 react-native-screens 简易 shim。
 *
 * 目标：
 * - 提供 Screen / ScreenStack / ScreenStackHeaderConfig 等占位组件；
 * - 避免 requireNativeComponent('RNSScreenStackHeaderConfig' 等) 报错；
 * - 不依赖原生导航，实现退化为纯 JS 视图层，配合 React Navigation 使用。
 */

export interface ScreenProps extends ViewProps {}

export const Screen: React.FC<ScreenProps> = ({ children, ...rest }) => (
  <View {...rest}>{children}</View>
);

export const ScreenContainer: React.FC<ViewProps> = ({ children, ...rest }) => (
  <View {...rest}>{children}</View>
);

export const NativeScreen: React.FC<ScreenProps> = ({ children, ...rest }) => (
  <View {...rest}>{children}</View>
);

export const ScreenStack: React.FC<ViewProps> = ({ children, ...rest }) => (
  <View {...rest}>{children}</View>
);

export const ScreenStackHeaderConfig: React.FC<ViewProps> = ({
  children,
  ...rest
}) => <View {...rest}>{children}</View>;

export const ScreenStackHeaderSubview: React.FC<ViewProps> = ({
  children,
  ...rest
}) => <View {...rest}>{children}</View>;

export const SearchBar: React.FC<ViewProps> = ({ children, ...rest }) => (
  <View {...rest}>{children}</View>
);

export const FullWindowOverlay: React.FC<ViewProps> = ({
  children,
  ...rest
}) => <View {...rest}>{children}</View>;

export const enableScreens = (_shouldEnableScreens?: boolean) => {
  // no-op on Harmony
};

export const enableFreeze = (_shouldEnableFreeze?: boolean) => {
  // no-op on Harmony
};

export const useTransitionProgress = () => ({
  progress: { value: 1 },
  closing: { value: 0 },
});

const defaultExport = {
  Screen,
  ScreenContainer,
  NativeScreen,
  ScreenStack,
  ScreenStackHeaderConfig,
  ScreenStackHeaderSubview,
  SearchBar,
  FullWindowOverlay,
  enableScreens,
  enableFreeze,
  useTransitionProgress,
};

export default defaultExport;
