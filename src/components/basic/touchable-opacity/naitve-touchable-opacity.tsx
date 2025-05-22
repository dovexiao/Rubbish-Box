import React from 'react';
import {TouchableOpacityProps, TouchableOpacity} from 'react-native';

/** 优先使用touchable-opcaity
 * 如果在modal或dialog中,使用此组件
 */
const NativeTouchableOpacity = (props: TouchableOpacityProps) => {
  const {activeOpacity, ...otherProps} = props;
  return (
    <TouchableOpacity activeOpacity={activeOpacity || 0.8} {...otherProps} />
  );
};

export default NativeTouchableOpacity;
