/**
 * 主题化组件
 * 提供基础的View和Text组件，支持主题切换
 */

import { Text as DefaultText, View as DefaultView } from 'react-native';

export type TextProps = DefaultText['props'];
export type ViewProps = DefaultView['props'];

export function Text(props: TextProps) {
  const { style, ...otherProps } = props;
  
  return <DefaultText style={[{ color: '#333' }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, ...otherProps } = props;
  
  return <DefaultView style={[{ backgroundColor: 'transparent' }, style]} {...otherProps} />;
}
