import React, {
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  forwardRef,
} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';
import styles from './styles';

const MAX_CODE_LEN = 6;

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

const buildParams = (value: string): Record<number, string> => {
  const next: Record<number, string> = {
    0: '',
    1: '',
    2: '',
    3: '',
    4: '',
    5: '',
  };
  value.split('').forEach((char, idx) => {
    if (idx < MAX_CODE_LEN) next[idx] = char;
  });
  return next;
};

const normalizeCode = (value: string) =>
  String(value || '')
    .replace(/\D/g, '')
    .slice(0, MAX_CODE_LEN);

const InputCode = forwardRef<InputCodeRef, InputCodeProps>(
  ({ showError, onUpdate, code: propCode, errorMessage }, ref) => {
    const inputRef = useRef<TextInput>(null);
    const selectionRef = useRef({ start: 0, end: 0 });
    const skipNextNativeChangeRef = useRef(false);

    const [code, setCode] = useState('');
    const [params, setParams] = useState<Record<number, string>>(
      buildParams(''),
    );
    const [selection, setSelection] = useState({ start: 0, end: 0 });

    const updateSelection = (start: number, end = start) => {
      const len = code.length;
      const safeStart = Math.max(0, Math.min(start, len));
      const safeEnd = Math.max(safeStart, Math.min(end, len));
      setSelection({ start: safeStart, end: safeEnd });
      selectionRef.current = { start: safeStart, end: safeEnd };
    };

    const focusInputWithSelection = (start: number, end = start) => {
      updateSelection(start, end);

      // Android 上键盘手动收起后可能残留焦点，先 blur 再 focus 更稳定。
      if (Platform.OS === 'android') {
        inputRef.current?.blur();
      }

      setTimeout(
        () => {
          inputRef.current?.focus();
          const current = selectionRef.current;
          inputRef.current?.setNativeProps({
            selection: { start: current.start, end: current.end },
          });
        },
        Platform.OS === 'android' ? 80 : 0,
      );
    };

    const applyNextState = (
      nextCode: string,
      nextStart: number,
      nextEnd = nextStart,
    ) => {
      const safeCode = normalizeCode(nextCode);
      setCode(safeCode);
      setParams(buildParams(safeCode));
      const safeStart = Math.max(0, Math.min(nextStart, safeCode.length));
      const safeEnd = Math.max(safeStart, Math.min(nextEnd, safeCode.length));
      setSelection({ start: safeStart, end: safeEnd });
      selectionRef.current = { start: safeStart, end: safeEnd };
      onUpdate(safeCode);

      setTimeout(() => {
        inputRef.current?.setNativeProps({
          selection: selectionRef.current,
        });
      }, 0);
    };

    useEffect(() => {
      const value = normalizeCode(propCode || '');
      if (value === code) return;

      setCode(value);
      setParams(buildParams(value));
      const currentSel = selectionRef.current;
      const nextStart = Math.max(0, Math.min(currentSel.start, value.length));
      const nextEnd = Math.max(
        nextStart,
        Math.min(currentSel.end, value.length),
      );
      setSelection({ start: nextStart, end: nextEnd });
      selectionRef.current = { start: nextStart, end: nextEnd };
    }, [propCode]);

    const handleCodeChange = (text: string) => {
      if (skipNextNativeChangeRef.current) {
        skipNextNativeChangeRef.current = false;
        return;
      }

      let nextCode = normalizeCode(text);
      const prevCode = code;
      const prevLen = prevCode.length;
      let nextLen = nextCode.length;
      const prevSel = selectionRef.current;

      let nextStart = 0;
      let nextEnd = 0;

      // 把中间输入改为覆盖模式：在已有值中输入时，覆盖当前位而不是插入。
      if (
        prevSel.start === prevSel.end &&
        prevSel.start < prevLen &&
        nextLen === prevLen + 1
      ) {
        const inserted = nextCode[prevSel.start] || '';
        nextCode = `${prevCode.slice(
          0,
          prevSel.start,
        )}${inserted}${prevCode.slice(prevSel.start + 1)}`;
        nextLen = nextCode.length;
        nextStart = Math.max(0, Math.min(prevSel.start + 1, nextLen));
        nextEnd = nextStart;
        applyNextState(nextCode, nextStart, nextEnd);
        return;
      }

      if (nextLen > prevLen) {
        const replacedCount = Math.max(0, prevSel.end - prevSel.start);
        const insertedCount = nextLen - (prevLen - replacedCount);
        nextStart = Math.min(
          nextLen,
          prevSel.start + Math.max(1, insertedCount),
        );
        nextEnd = nextStart;
      } else if (nextLen < prevLen) {
        if (prevSel.end > prevSel.start) {
          // 删除选中位：当前位仍有值则继续选中当前位；当前位无值时再前移。
          const keepAt = Math.max(0, Math.min(prevSel.start, nextLen - 1));
          if (nextLen > 0 && keepAt >= 0 && keepAt < nextLen) {
            nextStart = keepAt;
            nextEnd = Math.min(keepAt + 1, nextLen);
          } else {
            nextStart = Math.max(0, nextLen - 1);
            nextEnd = nextStart;
          }
        } else {
          // 普通退格：光标左移。
          nextStart = Math.max(0, Math.min(prevSel.start - 1, nextLen));
          nextEnd = nextStart;
        }
      } else {
        // 等长通常是替换：输入后移到下一位。
        nextStart = Math.max(0, Math.min(prevSel.start + 1, nextLen));
        nextEnd = nextStart;
      }

      applyNextState(nextCode, nextStart, nextEnd);
    };

    const handleKeyPress = (e: any) => {
      if (e?.nativeEvent?.key !== 'Backspace') return;

      if (!code) return;

      const prevSel = selectionRef.current;
      let nextCode = code;
      let nextStart = prevSel.start;
      let nextEnd = prevSel.start;

      if (prevSel.end > prevSel.start) {
        nextCode = `${code.slice(0, prevSel.start)}${code.slice(prevSel.end)}`;
        if (nextCode.length > 0 && prevSel.start < nextCode.length) {
          nextStart = prevSel.start;
          nextEnd = Math.min(prevSel.start + 1, nextCode.length);
        } else {
          nextStart = Math.max(0, nextCode.length - 1);
          nextEnd = nextStart;
        }
      } else {
        const prevIndex = prevSel.start - 1;
        if (prevIndex >= 0 && code[prevIndex]) {
          // 前一位有值：删前一位。
          nextCode = `${code.slice(0, prevIndex)}${code.slice(prevSel.start)}`;
          nextStart = prevIndex;
          nextEnd = nextStart;
        } else if (prevSel.start < code.length) {
          // 前一位无值：删当前位。
          nextCode = `${code.slice(0, prevSel.start)}${code.slice(
            prevSel.start + 1,
          )}`;
          if (nextCode.length > 0 && prevSel.start < nextCode.length) {
            nextStart = prevSel.start;
            nextEnd = Math.min(prevSel.start + 1, nextCode.length);
          } else {
            nextStart = Math.max(0, nextCode.length - 1);
            nextEnd = nextStart;
          }
        } else {
          return;
        }
      }

      skipNextNativeChangeRef.current = true;
      applyNextState(nextCode, nextStart, nextEnd);
    };

    const handleContainerPress = () => {
      focusInputWithSelection(code.length, code.length);
    };

    const handleItemPress = (index: number) => {
      const len = code.length;
      if (index < len) {
        // 点击已有值：选中该位，删除时删除这一位。
        focusInputWithSelection(index, index + 1);
        return;
      }

      // 点击空位：定位到该空位，输入后进入下一空位。
      focusInputWithSelection(len, len);
    };

    useImperativeHandle(
      ref,
      () => ({
        getParams: () => params,
        clearCode: () => {
          setCode('');
          setParams(buildParams(''));
          setSelection({ start: 0, end: 0 });
          selectionRef.current = { start: 0, end: 0 };
          onUpdate('');
        },
        setCode: (newCode: string) => {
          const value = normalizeCode(newCode);
          setCode(value);
          setParams(buildParams(value));
          // 外部设置后，高亮到下一空位。
          setSelection({ start: value.length, end: value.length });
          selectionRef.current = { start: value.length, end: value.length };
          onUpdate(value);
        },
      }),
      [onUpdate, params],
    );

    const activeIndex =
      selection.end > selection.start
        ? selection.start
        : Math.min(selection.start, MAX_CODE_LEN - 1);

    return (
      <>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.passwordCode}
          onPress={handleContainerPress}
        >
          {Array.from({ length: MAX_CODE_LEN }).map((_, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={1}
              style={[
                styles.codeItem,
                showError && styles.error,
                !showError && activeIndex === idx ? styles.active : null,
              ]}
              onPress={() => handleItemPress(idx)}
            >
              <Text style={styles.codeItemText}>{params[idx] || ''}</Text>
            </TouchableOpacity>
          ))}
        </TouchableOpacity>

        {showError && errorMessage ? (
          <View style={styles.errorMessage}>
            <Text style={styles.errorMessageText}>{errorMessage}</Text>
          </View>
        ) : null}

        <TextInput
          ref={inputRef}
          style={styles.hideInput}
          value={code}
          onChangeText={handleCodeChange}
          onKeyPress={handleKeyPress}
          selection={selection}
          keyboardType="number-pad"
          maxLength={MAX_CODE_LEN}
          autoFocus={false}
          showSoftInputOnFocus
          caretHidden={false}
        />
      </>
    );
  },
);

InputCode.displayName = 'InputCode';

export default InputCode;
