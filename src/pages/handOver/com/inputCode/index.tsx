import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { styles } from './style';

export interface InputCodeRef {
  getParams: () => Record<number, string>;
  clearCode: () => void;
}

interface InputCodeProps {
  showError: boolean;
  code?: string;
  onUpdate: (code: string) => void;
}

const InputCode = forwardRef<InputCodeRef, InputCodeProps>(function InputCode(
  { showError, code: codeProp, onUpdate },
  ref,
) {
  const inputRef = useRef<TextInput>(null);
  const [code, setCode] = useState(codeProp ?? '');

  useEffect(() => {
    if (typeof codeProp === 'string' && codeProp !== code) {
      setCode(codeProp);
    }
  }, [code, codeProp]);

  const digits = useMemo(() => {
    const pure = (code || '').replace(/\D/g, '').slice(0, 6);
    return Array.from({ length: 6 }, (_, idx) => pure[idx] || '');
  }, [code]);

  const focusInput = () => {
    const input = inputRef.current;
    if (!input) return;

    // Android 上键盘手动收起后，input 可能仍保持 focus；先 blur 再 focus 可稳定拉起键盘。
    input.blur();
    setTimeout(() => {
      input.focus();
    }, 0);
  };

  useImperativeHandle(
    ref,
    () => ({
      getParams: () => {
        const next: Record<number, string> = {};
        digits.forEach((d, idx) => {
          next[idx] = d;
        });
        return next;
      },
      clearCode: () => {
        setCode('');
        onUpdate('');
      },
    }),
    [digits, onUpdate],
  );

  return (
    <View style={styles.passwordCode}>
      {digits.map((d, idx) => (
        <TouchableOpacity
          key={String(idx)}
          activeOpacity={0.85}
          style={[styles.codeItem, showError ? styles.codeItemError : null]}
          onPress={focusInput}
        >
          <Text style={styles.codeNumText}>{d}</Text>
        </TouchableOpacity>
      ))}

      <TextInput
        ref={inputRef}
        value={code}
        onChangeText={text => {
          const next = (text || '').replace(/\D/g, '').slice(0, 6);
          setCode(next);
          onUpdate(next);
        }}
        keyboardType="number-pad"
        maxLength={6}
        style={styles.hiddenInput}
        onFocus={() => {
          // no-op: 保留焦点事件，便于后续扩展与调试。
        }}
      />
    </View>
  );
});

export default InputCode;
