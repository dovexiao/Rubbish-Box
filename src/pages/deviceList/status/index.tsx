import React, { memo } from 'react';
import { Text, View } from 'react-native';
import Flex from '@/components/Flex';
import IconFont from '@/iconfont';
import { LOCK_STATUS, LOCK_STATUS_NAME } from '@/constants';
import { styles } from './style';

const statusColor: Record<number, string> = {
  [LOCK_STATUS.FALL_SUCCESS]: '#FF873D',
  [LOCK_STATUS.RISE]: '#1FC871',
  [LOCK_STATUS.OFF_LINE]: '#FF2B24',
  [LOCK_STATUS.FAULT]: '#FF2B24',
};

const statusBgColor: Record<number, string> = {
  [LOCK_STATUS.FALL_SUCCESS]: '#FEF3EC',
  [LOCK_STATUS.RISE]: '#E8F9F0',
  [LOCK_STATUS.OFF_LINE]: '#EEEEEE',
  [LOCK_STATUS.FAULT]: '#EEEEEE',
};

function Status(props: { deviceStatus: number; overlay?: boolean }) {
  const { deviceStatus, overlay } = props;
  const color = statusColor[deviceStatus] ?? '';
  const bg = statusBgColor[deviceStatus] ?? '';

  return (
    <Flex
      align="center"
      justify="center"
      style={[styles.container, { backgroundColor: bg }]}
    >
      <Text style={[styles.text, { color }]}>
        {LOCK_STATUS_NAME[deviceStatus]}
      </Text>
      {overlay ? (
        <View style={styles.ml10}>
          <IconFont name="pull-down" size={20} color={color} />
        </View>
      ) : null}
    </Flex>
  );
}

export default memo(Status);
