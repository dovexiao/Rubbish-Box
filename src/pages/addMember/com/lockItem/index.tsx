import React, { useCallback, useMemo, useState } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import dayjs from 'dayjs';
import { DatePicker } from '@ant-design/react-native';
import IconFont from '@/iconfont';
import styles from './styles';

export type LockListItem = {
  id: number | null;
  lockName: string;
  lockType: number | null;
  lockTypeName: string;
  groupCount: number | null;
  isBind: boolean;
  isForever: boolean;
  endTime: number | null;
  imageUrl: string;
};

type Props = {
  data: LockListItem;
  onChange: (data: LockListItem) => void;
};

export default function LockItem({ data, onChange }: Props) {
  const [pickerVisible, setPickerVisible] = useState(false);

  const lockTypeText = useMemo(() => {
    if (data.lockType === 1) return '单个设备';
    if (data.lockType === 2) return '组合设备';
    return data.lockTypeName || '';
  }, [data.lockType, data.lockTypeName]);

  const onToggleBind = useCallback(() => {
    const next: LockListItem = {
      ...data,
      isBind: !data.isBind,
      ...(data.isForever === null || data.isForever === (undefined as any)
        ? { isForever: true }
        : {}),
    };
    onChange(next);
  }, [data, onChange]);

  const onSelectForever = useCallback(() => {
    onChange({
      ...data,
      isBind: true,
      isForever: true,
      endTime: null,
    });
  }, [data, onChange]);

  const onSelectCustom = useCallback(() => {
    onChange({
      ...data,
      isBind: true,
      isForever: false,
      endTime: data.endTime ?? dayjs().add(30, 'day').valueOf(),
    });
  }, [data, onChange]);

  const endDate = useMemo(() => {
    const v = data.endTime ?? dayjs().add(30, 'day').valueOf();
    return new Date(v);
  }, [data.endTime]);

  const endDateText = useMemo(() => {
    if (!data.endTime) return dayjs().add(30, 'day').format('YYYY-MM-DD');
    return dayjs(data.endTime).format('YYYY-MM-DD');
  }, [data.endTime]);

  return (
    <>
      <TouchableOpacity activeOpacity={0.9} style={styles.card} onPress={onToggleBind}>
        <View style={[styles.checkBox, data.isBind && styles.checked]}>
          <IconFont name="tick-white" color="#FFFFFF" size={20} />
        </View>

        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.lockName} numberOfLines={1}>
              {data.lockName}
            </Text>
            <View>
              <Text style={styles.lockType}>{lockTypeText}</Text>
              <View style={styles.iconRow}>
                {data.imageUrl ? (
                  <Image
                    source={{ uri: data.imageUrl }}
                    style={styles.lockImage}
                    resizeMode="cover"
                  />
                ) : null}
                {data.lockType === 2 ? (
                  <View style={styles.multiBox}>
                    <IconFont size={6} color="#333333" name="multiplication" />
                    <Text style={styles.count}>{data.groupCount ?? ''}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {data.isBind ? (
            <>
              <View style={styles.line} />
              <View style={styles.validityRow}>
                <Text style={styles.label}>有效期</Text>
                <View style={styles.rightArea}>
                  <View style={styles.optionRow}>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.option}
                      onPress={onSelectForever}
                    >
                      <IconFont
                        name={data.isForever ? 'selected' : 'unselected'}
                        size={20}
                        color={data.isForever ? '#333333' : '#E1E1E1'}
                      />
                      <Text style={styles.optionText}>永久</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[styles.option, styles.optionGap]}
                      onPress={onSelectCustom}
                    >
                      <IconFont
                        name={!data.isForever ? 'selected' : 'unselected'}
                        size={18}
                        color={!data.isForever ? '#333333' : '#E1E1E1'}
                      />
                      <Text style={styles.optionText}>自定义</Text>
                    </TouchableOpacity>
                  </View>

                  {!data.isForever ? (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={styles.endtimeBox}
                      onPress={() => setPickerVisible(true)}
                    >
                      <Text style={styles.optionText}>截止至</Text>
                      <View style={styles.endTime}>
                        <Text style={styles.endTimeText}>{endDateText}</Text>
                        <View style={styles.arrow}>
                          <IconFont name="a-headfor-20" size={16} color="#333333" />
                        </View>
                      </View>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            </>
          ) : null}
        </View>
      </TouchableOpacity>

      <DatePicker
        visible={pickerVisible}
        title="选择截止日期"
        value={endDate}
        mode="date"
        minDate={new Date()}
        onVisibleChange={v => setPickerVisible(v)}
        onOk={d => {
          onChange({
            ...data,
            isBind: true,
            isForever: false,
            endTime: dayjs(d).valueOf(),
          });
          setPickerVisible(false);
        }}
      />
    </>
  );
}

