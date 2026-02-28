import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Toast } from '@ant-design/react-native';
import Flex from '@/components/Flex';
import GradientButton from '@/components/GradientButton';
import AnimationPop, { type AnimationPopRef } from '@/components/AnimationPop';

export type LeaveRiseLockPopRef = {
  open: () => void;
  close: () => void;
};

export interface LeaveRiseLockPopProps {
  time: number;
  onConfirm: (leaveUpTime: number) => Promise<any> | any;
}

export const LeaveRiseLockPop = forwardRef<
  LeaveRiseLockPopRef,
  LeaveRiseLockPopProps
>(function LeaveRiseLockPopInner({ time, onConfirm }, ref) {
  const resetStateRef = useRef(true);
  const popupRef = useRef<AnimationPopRef>(null);
  const [leaveUpTime, setLeaveUpTime] = useState('');

  const resetState = useCallback(() => {
    setLeaveUpTime(String(time ?? ''));
  }, [time]);

  useEffect(() => {
    resetState();
  }, [resetState]);

  useImperativeHandle(
    ref,
    () => ({
      open: () => popupRef.current?.open(),
      close: () => popupRef.current?.close(),
    }),
    [],
  );

  return (
    <AnimationPop
      ref={popupRef}
      direction="bottom"
      onClose={() => {
        const shouldReset = resetStateRef.current;
        resetStateRef.current = true;
        if (shouldReset) resetState();
      }}
      style={styles.popupRoot}
    >
      <View style={styles.popupContainer}>
        <Text style={styles.title}>离车升锁时间</Text>

        <View style={styles.contentCard}>
          <Flex align="center" style={styles.rowInner}>
            <Text style={styles.rowText}>车辆离开</Text>
            <TextInput
              value={leaveUpTime}
              keyboardType="number-pad"
              maxLength={2}
              style={styles.timeInput}
              onChangeText={setLeaveUpTime}
            />
            <Text style={styles.rowText}>秒后升起</Text>
          </Flex>
        </View>

        <Flex style={styles.btnContainerWrapper} justify="between">
          <View style={styles.btnFlex}>
            <GradientButton
              colors={['transparent', 'transparent']}
              height={48}
              round={false}
              btnBorderRadius={12}
              hasBorder
              onPress={() => {
                resetStateRef.current = true;
                popupRef.current?.close();
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
              height={48}
              round={false}
              btnBorderRadius={12}
              onPress={async () => {
                const n = Number(leaveUpTime);
                if (Number.isNaN(n) || n < 3 || n > 60) {
                  Toast.info('请输入3-60s的时间');
                  return;
                }
                const res = await onConfirm(n);
                if (res) {
                  resetStateRef.current = false;
                  popupRef.current?.close();
                }
              }}
              text="确定"
              textStyle={[styles.btnText, { color: '#FFFFFF' }]}
            />
          </View>
        </Flex>
      </View>
    </AnimationPop>
  );
});

const styles = StyleSheet.create({
  popupRoot: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  popupContainer: {
    paddingTop: 24,
    paddingLeft: 24,
    paddingRight: 24,
    paddingBottom: 16,
  },
  title: {
    paddingTop: 16,
    color: '#333333',
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 16,
  },
  contentCard: {
    backgroundColor: '#f7f7fb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowInner: {
    width: '100%',
  },
  rowText: {
    fontSize: 14,
    color: '#333333',
  },
  timeInput: {
    width: 60,
    height: 30,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginHorizontal: 8,
    backgroundColor: '#ffffff',
    textAlign: 'center',
    color: '#333333',
  },
  btnContainerWrapper: {
    marginTop: 28,
  },
  btnFlex: {
    flex: 1,
  },
  btnGap: {
    width: 15,
  },
  btnText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

export default LeaveRiseLockPop;
