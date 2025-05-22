import React from 'react';
import {
  StyleProp,
  TouchableOpacityProps as RNTouchableOpacityProps,
  ViewStyle,
  Insets,
} from 'react-native';
import {TouchableOpacity as RNGHTouchableOpacity} from 'react-native-gesture-handler';

export type TouchableOpacityProps = RNTouchableOpacityProps & {
  // 这些属性都是RNGHTouchableOpacity的Props中没导出的属性,具体查阅rne文档或源码
  onPress?: () => void;
  onPressIn?: () => void;
  onPressOut?: () => void;
  onLongPress?: () => void;
  nativeID?: string;
  shouldActivateOnStart?: boolean;
  disallowInterruption?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  useNativeAnimations?: boolean;
  hitSlop?: Insets | number;
};

/**
 * 此组件基于react-native-gesture-handler的TouchableOpacity封装
 * 当渲染在web端时,会有异常触发的行为
 * 谨慎使用
 * 优先使用隔壁的NativeTouchableOpacity
 * @deprecated
 */
const TouchableOpacity = (props: TouchableOpacityProps) => {
  const {activeOpacity, ...otherProps} = props;
  return (
    <RNGHTouchableOpacity
      activeOpacity={activeOpacity || 0.8}
      {...otherProps}
    />
  );
};

export default TouchableOpacity;
