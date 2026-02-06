import * as React from 'react';
import { Dimensions, View, ViewProps } from 'react-native';

// 与 react-native-safe-area-context 中 Edge 类型保持一致
export type Edge = 'top' | 'right' | 'bottom' | 'left';

export interface SafeAreaViewProps extends ViewProps {
  edges?: Edge[];
}

// Harmony 上无法获取系统状态栏高度，这里给一个经验值，避免内容顶到最上方
const HARMONY_STATUS_BAR_HEIGHT = 32;

// 默认安全区内边距：顶部预留一段距离，其它为 0
const defaultInsets = {
  top: HARMONY_STATUS_BAR_HEIGHT,
  right: 0,
  bottom: 0,
  left: 0,
};

const windowDims = Dimensions.get('window');
const defaultFrame = {
  x: 0,
  y: 0,
  width: windowDims.width,
  height: windowDims.height,
};

// 提供与原库类似的 Context，供 SafeAreaProviderCompat / hooks 使用
export const SafeAreaInsetsContext =
  React.createContext<typeof defaultInsets>(defaultInsets);
export const SafeAreaFrameContext =
  React.createContext<typeof defaultFrame>(defaultFrame);

// Harmony 上没有 RNCSafeAreaView，直接退化为普通 View
export const SafeAreaView: React.FC<SafeAreaViewProps> = props => {
  return <View {...props} />;
};

// Provider 在 Harmony 上不做任何原生处理，仅通过 Context 暴露默认 insets 与 frame
export const SafeAreaProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  return (
    <SafeAreaInsetsContext.Provider value={defaultInsets}>
      <SafeAreaFrameContext.Provider value={defaultFrame}>
        {children}
      </SafeAreaFrameContext.Provider>
    </SafeAreaInsetsContext.Provider>
  );
};

// 兼容 react-native-safe-area-context 导出的 SafeAreaProviderCompat
// React Navigation 的 NativeStackView 会从该模块引用它
export const SafeAreaProviderCompat: React.FC<{
  children?: React.ReactNode;
}> = ({ children }) => {
  return <SafeAreaProvider>{children}</SafeAreaProvider>;
};

// hooks 基于上面的 Context 返回默认值
export function useSafeAreaInsets() {
  return React.useContext(SafeAreaInsetsContext);
}

// 使用窗口尺寸作为 frame
export function useSafeAreaFrame() {
  return React.useContext(SafeAreaFrameContext);
}

// 默认导出一个与原库结构相近的对象，便于某些按 default 导入的用法
const defaultExport = {
  SafeAreaView,
  SafeAreaProvider,
  SafeAreaProviderCompat,
  SafeAreaInsetsContext,
  SafeAreaFrameContext,
  useSafeAreaInsets,
  useSafeAreaFrame,
};

export default defaultExport;
