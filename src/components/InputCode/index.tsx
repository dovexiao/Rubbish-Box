import React, { useEffect, useImperativeHandle, useRef, useState, forwardRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Keyboard } from 'react-native';
import styles from './styles';

export interface InputCodeRef {
  getParams: () => Record<number, string>;
  clearCode: () => void;
  setCode: (code: string) => void;
}

interface InputCodeProps {
  showError: boolean;
  onUpdate: (code: string) => void;
  code: string;
  errorMessage?: string;
}

const InputCode = forwardRef<InputCodeRef, InputCodeProps>(
  ({ showError, onUpdate, code: propCode, errorMessage }, ref) => {
    const [code, setCode] = useState('');
    const [params, setParams] = useState<Record<number, string>>({
      0: '',
      1: '',
      2: '',
      3: '',
      4: '',
      5: '',
    });
    const [focus, setFocus] = useState(true);
    const [selectionStart, setSelectionStart] = useState(0);
    const [inputKey, setInputKey] = useState(0);
    const inputRef = useRef<TextInput>(null);

    // 同步外部 code prop
    useEffect(() => {
      const raw = propCode || '';
      const value = String(raw).replace(/\D/g, '').slice(0, 6);
      const newParams: Record<number, string> = {
        0: '',
        1: '',
        2: '',
        3: '',
        4: '',
        5: '',
      };
      value.split('').forEach((text, index) => {
        if (index < 6) newParams[index] = text;
      });
      setCode(value);
      setParams(newParams);
    }, [propCode]);

    // 处理输入变化
    const handleCodeChange = (text: string) => {
      const value = String(text).replace(/\D/g, ''); // 只保留数字
      const pure = value.slice(0, 6);

      const newParams: Record<number, string> = {
        0: '',
        1: '',
        2: '',
        3: '',
        4: '',
        5: '',
      };
      pure.split('').forEach((text, index) => {
        newParams[index] = text;
      });

      const prevCode = code || '';
      const prevLen = prevCode.length;
      const len = pure.length;

      let nextSelection: number;
      if (len === 0) {
        nextSelection = 0;
      } else if (len < prevLen) {
        // 删除：保持当前位不变，除非删掉的是最后一位
        nextSelection = selectionStart < len ? selectionStart : len - 1;
      } else {
        // 输入：默认高亮最后一位
        nextSelection = len - 1;
      }

      setCode(pure);
      setParams(newParams);
      setSelectionStart(nextSelection);
      setFocus(pure.length < 6);

      onUpdate(pure);
    };

    // 点击整体区域，聚焦输入框
    const handleContainerPress = () => {
      setFocus(true);
      setInputKey(Date.now());
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    };

    // 点击单个格子
    const handleItemPress = (num: number) => {
      const len = (code || '').length;
      const idx = len === 0 ? 0 : Math.max(0, Math.min(num, len));
      setSelectionStart(idx);
      setFocus(true);
      setInputKey(Date.now());
      setTimeout(() => {
        inputRef.current?.focus();
        // 设置光标位置
        inputRef.current?.setNativeProps({
          selection: { start: idx, end: idx },
        });
      }, 100);
    };

    // 暴露方法给父组件
    useImperativeHandle(
      ref,
      () => ({
        getParams: () => params,
        clearCode: () => {
          setCode('');
          setParams({
            0: '',
            1: '',
            2: '',
            3: '',
            4: '',
            5: '',
          });
          setSelectionStart(0);
          setFocus(true);
          setInputKey(Date.now());
          onUpdate('');
        },
        setCode: (newCode: string) => {
          const value = String(newCode).replace(/\D/g, '').slice(0, 6);
          const newParams: Record<number, string> = {
            0: '',
            1: '',
            2: '',
            3: '',
            4: '',
            5: '',
          };
          value.split('').forEach((text, index) => {
            if (index < 6) newParams[index] = text;
          });
          setCode(value);
          setParams(newParams);
          setSelectionStart(value.length === 0 ? 0 : value.length - 1);
          setInputKey(Date.now());
          onUpdate(value);
        },
      }),
      [params, code, onUpdate],
    );

    // 当 focus 变化时，控制输入框聚焦
    useEffect(() => {
      if (focus) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    }, [focus, inputKey]);

    return (
      <>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.passwordCode}
          onPress={handleContainerPress}>
          {Array.from({ length: 6 }).map((_, num) => (
            <TouchableOpacity
              key={num}
              activeOpacity={1}
              style={[
                styles.codeItem,
                showError && styles.error,
                selectionStart === num && !showError && styles.active,
              ]}
              onPress={() => handleItemPress(num)}>
              <Text style={styles.codeItemText}>{params[num] || ''}</Text>
            </TouchableOpacity>
          ))}
        </TouchableOpacity>
        {showError && errorMessage && (
          <View style={styles.errorMessage}>
            <Text style={styles.errorMessageText}>{errorMessage}</Text>
          </View>
        )}

        {/* 隐藏的输入框，支持一次性粘贴 6 位 */}
        <TextInput
          key={inputKey}
          ref={inputRef}
          style={styles.hideInput}
          value={code}
          onChangeText={handleCodeChange}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus={false}
          onBlur={() => setFocus(false)}
          onFocus={() => {
            setFocus(true);
            // 聚焦时设置光标位置
            setTimeout(() => {
              inputRef.current?.setNativeProps({
                selection: { start: selectionStart, end: selectionStart },
              });
            }, 50);
          }}
          showSoftInputOnFocus={true}
          caretHidden={false}
        />
      </>
    );
  },
);

InputCode.displayName = 'InputCode';

export default InputCode;
