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
  Keyboard,
  Platform,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import AppIcon from '@/components/AppIcon';
import { fontSize, px } from '@/utils/ui';

export interface TextInputProps extends RNTextInputProps {
  // 是否显示一键清除按钮（×），默认不显示
  showClear?: boolean;
  // 类似 Taro 的 type，简化键盘类型配置
  type?: 'text' | 'number' | 'password' | 'phone';
  // 小数位数控制，传入后会自动截断并规范输入
  decimalScale?: number;
}

/**
 * 清除图标样式
 */
export interface ClearIconStyleProps {
  /**
   * 清除图标宽度
   * @default 20
   */
  width?: number;
  /**
   * 清除图标颜色
   * @default '#cccccc'
   */
  color?: string;
}

/**
 * 主题化的 TextInput 组件
 * 自动应用全局光标颜色和选中颜色
 */
export const TextInput = React.forwardRef<
  RNTextInput,
  TextInputProps & { clearIconStyle?: ClearIconStyleProps }
>((props, ref) => {
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
    decimalScale,
    defaultValue,
    onChangeText,
    clearIconStyle = { width: px(16), color: '#cccccc' },
    ...restProps
  } = props;

  const innerRef = useRef<RNTextInput | null>(null);
  const focusedRef = useRef(false);
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
    let nextText = String(text ?? '');

    if (typeof decimalScale === 'number') {
      const cleanText = nextText.replace(/[^\d.]/g, '');
      if (decimalScale <= 0) {
        nextText = cleanText.replace(/\./g, '');
      } else {
        const normalizedText = cleanText.startsWith('.')
          ? `0${cleanText}`
          : cleanText;
        const [intPartRaw = '', ...decimalParts] = normalizedText.split('.');
        const intPart = intPartRaw.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
        const normalizedIntPart =
          intPart || (cleanText.includes('.') ? '0' : '');
        const decimalPart = decimalParts
          .join('')
          .replace(/\./g, '')
          .slice(0, decimalScale);

        if (!normalizedIntPart && !cleanText.includes('.')) {
          nextText = '';
        } else if (cleanText.includes('.')) {
          nextText = `${normalizedIntPart || '0'}.${decimalPart}`;
        } else {
          nextText = normalizedIntPart || '';
        }
      }
    }

    setHasValue(nextText.length > 0);
    onChangeText?.(nextText);
  };

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      // Android 上点击“收起键盘”时，输入框可能仍保持 focus，导致再次点击不弹键盘
      // 在组件内部统一 blur，一次性修复所有页面
      if (focusedRef.current) {
        setTimeout(() => {
          innerRef.current?.blur();
        }, 100);
      }
    });

    return () => {
      hideSubscription.remove();
    };
  }, []);

  const handleFocus: RNTextInputProps['onFocus'] = event => {
    focusedRef.current = true;
    props.onFocus?.(event);
  };

  const handleBlur: RNTextInputProps['onBlur'] = event => {
    focusedRef.current = false;
    props.onBlur?.(event);
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
        style={[styles.defaultInput, style]}
        cursorColor={cursorColor}
        selectionColor={selectionColor}
        underlineColorAndroid={underlineColorAndroid}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
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
        style={[styles.defaultInput, styles.clearInput, style]}
        cursorColor={cursorColor}
        selectionColor={selectionColor}
        underlineColorAndroid={underlineColorAndroid}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        keyboardType={resolvedKeyboardType}
        secureTextEntry={resolvedSecureTextEntry}
      />
      {hasValue ? (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleClear}
          style={{
            width: clearIconStyle.width || px(16),
            height: clearIconStyle.width || px(16),
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: clearIconStyle.color || '#bcbcbc',
            borderRadius: (clearIconStyle.width || px(8)) / 2,
            marginLeft: px(4),
          }}
          hitSlop={{ top: px(10), bottom: px(10), left: px(10), right: px(10) }}
        >
          <AppIcon name="close" size={px(14)} color={'#fff'} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  defaultInput: {
    padding: 0,
    paddingLeft: px(8),
    fontSize: fontSize(14),
    lineHeight: px(20),
    height: px(20),
    color: '#333333',
  },
  clearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearInput: {
    flex: 1,
    paddingRight: 0,
    paddingLeft: px(8),
  },
});

export default TextInput;
