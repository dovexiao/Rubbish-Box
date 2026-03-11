import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Flex from '@/components/Flex';
import PopCenter, { type PopCenterRef } from '@/components/PopCenter';
import { styles } from './style';

export type SettingPinRef = {
  open: () => void;
  close: () => void;
};

type Props = {
  pin?: string;
  onCancel?: () => void;
  onConfirm: (value: string) => void | Promise<void>;
};

const MAX_LEN = 6;

const SettingPin = forwardRef<SettingPinRef, Props>(function SettingPin(
  props,
  ref,
) {
  const popRef = useRef<PopCenterRef>(null);
  const inputRef = useRef<TextInput>(null);
  const [value, setValue] = useState('');

  const close = useCallback(() => {
    popRef.current?.close();
    setValue('');
    Keyboard.dismiss();
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        popRef.current?.open();
        setTimeout(() => inputRef.current?.focus(), 50);
      },
      close,
    }),
    [close],
  );

  const digits = useMemo(() => {
    const text = (value || '').replace(/\D/g, '').slice(0, MAX_LEN);
    return Array.from({ length: MAX_LEN }).map((_, i) => text[i] || '');
  }, [value]);

  return (
    <PopCenter
      ref={popRef}
      width={311}
      // height={268}
      showHeader={false}
      showCancel={false}
      maskClosable={false}
      footer={false}
    >
      <View style={styles.box}>
        <Text style={styles.title}>修改蓝牙连接PIN码</Text>
        <Text style={styles.subTitle}>当前PIN码：{props.pin || '暂无'}</Text>

        <Flex direction="column" align="center" style={styles.inputWrap}>
          <Text style={styles.inputTitle}>请输入新的PIN码</Text>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.digitsRow}
            onPress={() => inputRef.current?.focus()}
          >
            {digits.map((d, idx) => (
              <View key={idx} style={styles.digitBox}>
                <Text style={styles.digitText}>{d}</Text>
              </View>
            ))}
          </TouchableOpacity>
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={setValue}
            keyboardType="number-pad"
            maxLength={MAX_LEN}
            style={styles.hiddenInput}
          />
        </Flex>

        <Flex direction="row" justify="between" style={styles.btnRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.btn, styles.cancelBtn]}
            onPress={() => {
              props.onCancel?.();
              close();
            }}
          >
            <Text style={styles.cancelText}>取消</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.btn, styles.confirmBtn]}
            onPress={() => {
              const finalVal = (value || '')
                .replace(/\D/g, '')
                .slice(0, MAX_LEN);
              props.onConfirm(finalVal);
              close();
            }}
          >
            <Text style={styles.confirmText}>确定修改</Text>
          </TouchableOpacity>
        </Flex>
      </View>
    </PopCenter>
  );
});

export default SettingPin;
