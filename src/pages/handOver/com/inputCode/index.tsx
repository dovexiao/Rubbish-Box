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
  const [selectionStart, setSelectionStart] = useState(0);

  useEffect(() => {
    if (typeof codeProp === 'string' && codeProp !== code) {
      setCode(codeProp);
      const nextLen = String(codeProp).replace(/\D/g, '').slice(0, 6).length;
      setSelectionStart(nextLen);
    }
  }, [code, codeProp]);

  const digits = useMemo(() => {
    const pure = (code || '').replace(/\D/g, '').slice(0, 6);
    return Array.from({ length: 6 }, (_, idx) => pure[idx] || '');
  }, [code]);

  const focusInput = (index?: number) => {
    const input = inputRef.current;
    if (!input) return;

    const cursor = Math.max(
      0,
      Math.min(
        typeof index === 'number' ? index : selectionStart,
        digits.length,
      ),
    );
    setSelectionStart(cursor);

    // Android 上键盘手动收起后，input 可能仍保持 focus；先 blur 再 focus 可稳定拉起键盘。
    input.blur();
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.setNativeProps({
        selection: { start: cursor, end: cursor },
      });
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
          style={[
            styles.codeItem,
            selectionStart === idx && !showError
              ? { borderWidth: 1, borderColor: '#2552F5' }
              : null,
            showError ? styles.codeItemError : null,
          ]}
          onPress={() => {
            const len = digits.join('').length;
            const cursor = Math.min(idx, len);
            focusInput(cursor);
          }}
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
        selection={{ start: selectionStart, end: selectionStart }}
        onSelectionChange={event => {
          const nextStart = event.nativeEvent.selection.start ?? 0;
          setSelectionStart(nextStart);
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
