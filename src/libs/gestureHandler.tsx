import * as React from 'react';
import { Platform, View, ViewProps } from 'react-native';

// Harmony 等非原生移动平台下，退化为普通 View；
// Android / iOS 使用真正的 react-native-gesture-handler。

type HandlerProps = ViewProps & {
  onGestureEvent?: (...args: any[]) => void;
  onHandlerStateChange?: (...args: any[]) => void;
};

let RealGestureHandler: any = null;
const isNativeMobile = Platform.OS === 'android' || Platform.OS === 'ios';

if (isNativeMobile) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    RealGestureHandler = require('react-native-gesture-handler');
  } catch (e) {
    console.warn('react-native-gesture-handler is not available:', e);
  }
}

const ViewLike: React.FC<HandlerProps> = ({ children, ...rest }) => (
  <View {...rest}>{children}</View>
);

export const GestureHandlerRootView: React.FC<ViewProps> =
  RealGestureHandler?.GestureHandlerRootView || (ViewLike as any);

export const PanGestureHandler: React.FC<HandlerProps> =
  RealGestureHandler?.PanGestureHandler || (ViewLike as any);

export const TapGestureHandler: React.FC<HandlerProps> =
  RealGestureHandler?.TapGestureHandler || (ViewLike as any);

export const LongPressGestureHandler: React.FC<HandlerProps> =
  RealGestureHandler?.LongPressGestureHandler || (ViewLike as any);

export const FlingGestureHandler: React.FC<HandlerProps> =
  RealGestureHandler?.FlingGestureHandler || (ViewLike as any);

export const NativeViewGestureHandler: React.FC<HandlerProps> =
  RealGestureHandler?.NativeViewGestureHandler || (ViewLike as any);

export const State: Record<string, number> = RealGestureHandler?.State || {};
export const Directions: Record<string, number> =
  RealGestureHandler?.Directions || {};

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
