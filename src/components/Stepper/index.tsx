import React, { memo, useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ViewStyle } from 'react-native';
import IconFont from '@/iconfont';
import { Toast } from '@ant-design/react-native';

export interface StepperProps {
  style?: ViewStyle;
  onChange?: (value: number) => void;
  /**
   * 业务类型：'goods' 时，数量不能小于 1，会给出提示
   */
  type?: 'goods';
  /** 初始值 */
  initValue?: number;
  /** 图标尺寸 */
  size?: number;
  /** 最小值（包含） */
  min?: number;
  /** 最大值（包含） */
  max?: number;
}

const Stepper: React.FC<StepperProps> = ({
  style,
  onChange,
  type,
  initValue = 1,
  size,
  min,
  max,
}) => {
  const [value, setValue] = useState<number>(initValue);

  useEffect(() => {
    if (typeof initValue === 'number' && initValue >= 0) {
      setValue(initValue);
    }
  }, [initValue]);

  const clamp = (v: number) => {
    let next = v;
    if (typeof min === 'number' && next < min) {
      next = min;
    }
    if (typeof max === 'number' && next > max) {
      next = max;
    }
    return next;
  };

  const update = (next: number) => {
    const finalValue = clamp(next);
    setValue(finalValue);
    onChange?.(finalValue);
  };

  const handleReduce = () => {
    if (type === 'goods' && value <= 1) {
      Toast.info('商品销售数量至少为1');
      return;
    }
    update(value - 1);
  };

  const handleAdd = () => {
    update(value + 1);
  };

  const handleInputChange = (text: string) => {
    const num = Number(text.replace(/[^\d]/g, ''));
    if (Number.isNaN(num)) {
      return;
    }
    update(num);
  };

  return (
    <View style={[styles.box, style]}>
      <TouchableOpacity activeOpacity={0.8} style={styles.calculator} onPress={handleReduce}>
        <IconFont name="minus" color="#CCCCCC" size={size || 24} />
      </TouchableOpacity>

      <TextInput
        value={String(value)}
        keyboardType="numeric"
        onChangeText={handleInputChange}
        style={styles.input}
      />

      <TouchableOpacity activeOpacity={0.8} style={styles.calculator} onPress={handleAdd}>
        <IconFont name="add" color="#333333" size={size || 12} />
      </TouchableOpacity>
    </View>
  );
};

export default memo(Stepper);

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    paddingVertical: 5,
    width: 91
  },
  input: {
    flex: 1,
    margin: 0,
    borderRadius: 0,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    height: 22,
    padding: 0,
    textAlign: 'center',
  },
  calculator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    flex: 1
  },
});

