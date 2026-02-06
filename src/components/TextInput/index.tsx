/**
 * 主题化的 TextInput 组件
 * 自动应用全局光标颜色和选中颜色
 */

import React from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export interface TextInputProps extends RNTextInputProps {
  // 可以扩展自定义属性
}

/**
 * 主题化的 TextInput 组件
 * 自动应用全局光标颜色和选中颜色
 */
export const TextInput = React.forwardRef<RNTextInput, TextInputProps>(
  (props, ref) => {
    const { theme } = useTheme();
    const {
      cursorColor = theme.colors.text.primary,
      selectionColor = theme.colors.text.primary,
      underlineColorAndroid = 'transparent',
      ...restProps
    } = props;

    return (
      <RNTextInput
        {...restProps}
        ref={ref}
        cursorColor={cursorColor}
        selectionColor={selectionColor}
        underlineColorAndroid={underlineColorAndroid}
      />
    );
  },
);

export default TextInput;
