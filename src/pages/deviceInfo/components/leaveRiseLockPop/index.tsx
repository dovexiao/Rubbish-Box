import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import Flex from '@/components/Flex';
import GradientButton from '@/components/GradientButton';
import AnimationPop, { type AnimationPopRef } from '@/components/AnimationPop';
import { showToast } from '@/utils';
import { Popup } from '@/components';
import { fontSize, px } from '@/utils/ui';

export type LeaveRiseLockPopRef = {
  open: () => void;
  close: () => void;
};

export interface LeaveRiseLockPopProps {
  time: number;
  onConfirm: (leaveUpTime: number) => Promise<any> | any;
  lecaveType: string;
}

export const LeaveRiseLockPop = forwardRef<
  LeaveRiseLockPopRef,
  LeaveRiseLockPopProps
>(function LeaveRiseLockPopInner({ time, onConfirm, lecaveType }, ref) {
  const resetStateRef = useRef(true);
  const [leaveUpTime, setLeaveUpTime] = useState('');
  const [visible, setVisible] = useState(false);

  const resetState = useCallback(() => {
    setLeaveUpTime(String(time ?? ''));
  }, [time]);

  useEffect(() => {
    resetState();
  }, [resetState]);

  useImperativeHandle(
    ref,
    () => ({
      open: () => setVisible(true),
      close: () => setVisible(false),
    }),
    [],
  );

  return (
    <Popup
      visible={visible}
      showClose={false}
      contentStyle={styles.popupRoot}
      onClose={() => {
        const shouldReset = resetStateRef.current;
        resetStateRef.current = true;
        if (shouldReset) resetState();
      }}
    >
      <View style={styles.popupContainer}>
        <Text style={styles.title}>
          {lecaveType === '1' ? '离车升锁时间' : '复位升锁时间'}
        </Text>

        <View style={styles.contentCard}>
          <Flex align="center" style={styles.rowInner}>
            <Text style={styles.rowText}>
              {lecaveType === '1' ? '车辆离开' : '地锁降下'}
            </Text>
            <TextInput
              value={leaveUpTime}
              keyboardType="number-pad"
              maxLength={3}
              style={styles.timeInput}
              onChangeText={setLeaveUpTime}
            />
            <Text style={styles.rowText}>
              {lecaveType === '1' ? '秒后升起' : '秒后，无车自动复位升起'}
            </Text>
          </Flex>
        </View>

        <Flex style={styles.btnContainerWrapper} justify="between">
          <View style={styles.btnFlex}>
            <GradientButton
              colors={['transparent', 'transparent']}
              height={px(48)}
              round={false}
              btnBorderRadius={px(12)}
              hasBorder
              onPress={() => {
                resetStateRef.current = true;
                setVisible(false);
              }}
              text="取消"
              textColor="#999999"
              textStyle={styles.btnText}
            />
          </View>

          <View style={styles.btnGap} />

          <View style={styles.btnFlex}>
            <GradientButton
              colors={['#333333', '#333333']}
              height={px(48)}
              round={false}
              btnBorderRadius={px(12)}
              onPress={async () => {
                const n = Number(leaveUpTime);
                if (Number.isNaN(n) || n < 90 || n > 120) {
                  showToast({ title: '请输入90-120s的时间', icon: 'info' });
                  return;
                }
                const res = await onConfirm(n);
                if (res) {
                  resetStateRef.current = false;
                  setVisible(false);
                }
              }}
              text="确定"
              textStyle={[styles.btnText, { color: '#FFFFFF' }]}
            />
          </View>
        </Flex>
      </View>
    </Popup>
  );
});

const styles = StyleSheet.create({
  popupRoot: {
    borderTopLeftRadius: px(12),
    borderTopRightRadius: px(12),
  },
  popupContainer: {
    paddingTop: px(24),
    paddingLeft: px(24),
    paddingRight: px(24),
    paddingBottom: px(16),
  },
  title: {
    paddingTop: px(16),
    color: '#333333',
    fontWeight: '700',
    fontSize: fontSize(16),
    marginBottom: px(16),
  },
  contentCard: {
    backgroundColor: '#f7f7fb',
    borderRadius: px(12),
    paddingHorizontal: px(16),
    paddingVertical: px(14),
  },
  rowInner: {
    width: '100%',
  },
  rowText: {
    fontSize: fontSize(14),
    color: '#333333',
  },
  timeInput: {
    width: px(60),
    height: px(30),
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: px(6),
    paddingHorizontal: px(16),
    paddingVertical: px(4),
    marginHorizontal: px(8),
    backgroundColor: '#ffffff',
    textAlign: 'center',
    color: '#333333',
  },
  btnContainerWrapper: {
    marginTop: px(28),
  },
  btnFlex: {
    flex: 1,
  },
  btnGap: {
    width: px(15),
  },
  btnText: {
    fontSize: fontSize(16),
    fontWeight: '700',
  },
});

export default LeaveRiseLockPop;
