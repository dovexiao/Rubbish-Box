/**
 * 主题化的 TextInput 组件
 * 自动应用全局光标颜色和选中颜色
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  View,
  TouchableOpacity,
  StyleSheet,
  KeyboardTypeOptions,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import IconFont from '@/iconfont';

export interface TextInputProps extends RNTextInputProps {
  // 是否显示一键清除按钮（×），默认不显示
  showClear?: boolean;
  // 类似 Taro 的 type，简化键盘类型配置
  type?: 'text' | 'number' | 'password' | 'phone';
}

/**
 * 主题化的 TextInput 组件
 * 自动应用全局光标颜色和选中颜色
 */
export const TextInput = React.forwardRef<RNTextInput, TextInputProps>(
  (props, ref) => {
    const { theme } = useTheme();
    const defaultCursorColor =
      // 优先使用统一的深色文案色，保证在浅色背景上可见
      (theme.colors.text as any).color333 || theme.colors.text.primary;
    const {
      showClear = false,
      cursorColor = defaultCursorColor,
      selectionColor = defaultCursorColor,
      underlineColorAndroid = 'transparent',
      style,
      value,
      type,
      defaultValue,
      onChangeText,
      ...restProps
    } = props;

    const innerRef = useRef<RNTextInput | null>(null);
    const getCurrentText = (): string => {
      if (typeof value === 'string') return value;
      if (typeof defaultValue === 'string') return defaultValue;
      return '';
    };

    const [hasValue, setHasValue] = useState(getCurrentText().length > 0);

    // 当外部 value 或 defaultValue 变化时，同步 hasValue 状态
    useEffect(() => {
      setHasValue(getCurrentText().length > 0);
    }, [value, defaultValue]);

    const setRefs = (node: RNTextInput | null) => {
      innerRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        // eslint-disable-next-line no-param-reassign
        (ref as React.MutableRefObject<RNTextInput | null>).current = node;
      }
    };

    const handleChangeText = (text: string) => {
      setHasValue(text.length > 0);
      onChangeText?.(text);
    };

    const handleClear = () => {
      // 优先通过回调让外部把 value 置空（受控场景）
      onChangeText?.('');
      setHasValue(false);
      // 同时清理原生内容，避免短暂闪烁
      innerRef.current?.clear();
    };

    // 根据 type 推导 keyboardType / secureTextEntry，允许外部显式覆盖
    const resolveKeyboardType = (): KeyboardTypeOptions | undefined => {
      if (restProps.keyboardType) return restProps.keyboardType;
      switch (type) {
        case 'number':
          return 'numeric';
        case 'phone':
          return 'phone-pad';
        default:
          return undefined;
      }
    };

    const resolvedKeyboardType = resolveKeyboardType();
    const resolvedSecureTextEntry =
      restProps.secureTextEntry !== undefined
        ? restProps.secureTextEntry
        : type === 'password';

    // 不需要清除按钮时，保持原有行为，但仍通过 handleChangeText 透传 onChangeText
    if (!showClear) {
      return (
        <RNTextInput
          {...restProps}
          ref={setRefs}
          value={value}
          defaultValue={defaultValue}
          style={style}
          cursorColor={cursorColor}
          selectionColor={selectionColor}
          underlineColorAndroid={underlineColorAndroid}
          onChangeText={handleChangeText}
          keyboardType={resolvedKeyboardType}
          secureTextEntry={resolvedSecureTextEntry}
        />
      );
    }

    return (
      <View style={[styles.clearContainer, style]}>
        <RNTextInput
          {...restProps}
          ref={setRefs}
          value={value}
          defaultValue={defaultValue}
          style={[styles.clearInput, style]}
          cursorColor={cursorColor}
          selectionColor={selectionColor}
          underlineColorAndroid={underlineColorAndroid}
          onChangeText={handleChangeText}
          keyboardType={resolvedKeyboardType}
          secureTextEntry={resolvedSecureTextEntry}
        />
        {hasValue ? (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleClear}
            style={{
              width: 16,
              height: 16,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#bcbcbc',
              borderRadius: 8,
              marginLeft: 4,
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconFont name="close" size={14} color={'#fff'} />
          </TouchableOpacity>
        ) : null}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  clearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearInput: {
    flex: 1,
    paddingRight: 0,
  },
});

export default TextInput;
