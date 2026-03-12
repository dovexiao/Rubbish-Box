import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Image, StyleSheet, Text, TextInput, View } from 'react-native';
import Flex from '@/components/Flex';
import GradientButton from '@/components/GradientButton';
import PopConfirm, { type PopConfirmRef } from '@/components/popConfirm';
import AnimationPop, { type AnimationPopRef } from '@/components/AnimationPop';
import { operateBuzzing } from '@/services';
import { showToast } from '@/utils';

export type BeeBuzzingCollisionPopRef = {
  open: () => void;
  close: () => void;
};

export interface BeeBuzzingCollisionPopProps {
  deviceId?: number;
  isOpen: boolean;
  time: number;
  onConfirm: (params: {
    buzzerTime: number;
    buzzerStatus: number;
  }) => Promise<any> | any;
}

export const BeeBuzzingCollisionPop = forwardRef<
  BeeBuzzingCollisionPopRef,
  BeeBuzzingCollisionPopProps
>(function BeeBuzzingCollisionPopInner(
  { deviceId, isOpen, time, onConfirm },
  ref,
) {
  const shouldResetStateRef = useRef(true);
  const popupRef = useRef<AnimationPopRef>(null);
  const testConfirmRef = useRef<PopConfirmRef>(null);
  const [beeBuzzingCollision, setBeeBuzzingCollision] = useState(false);
  const [buzzerTime, setBuzzerTime] = useState('');

  const refreshState = useCallback(() => {
    setBeeBuzzingCollision(isOpen);
    setBuzzerTime(String(time ?? ''));
  }, [isOpen, time]);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        popupRef.current?.open();
      },
      close: () => {
        popupRef.current?.close();
      },
    }),
    [],
  );

  return (
    <>
      <AnimationPop
        ref={popupRef}
        direction="bottom"
        onClose={() => {
          const shouldRefresh = shouldResetStateRef.current;
          shouldResetStateRef.current = true;
          if (shouldRefresh) refreshState();
        }}
        style={styles.popupRoot}
      >
        <View style={styles.popupContainer}>
          <Text style={styles.title}>碰撞蜂鸣</Text>

          <View style={styles.beeBuzzingCollision}>
            <View
              style={[
                styles.row,
                styles.rowBorder,
                beeBuzzingCollision ? styles.rowBorderOn : null,
              ]}
            >
              <Flex justify="between" align="center" style={styles.rowInner}>
                <Text style={styles.rowText}>
                  碰撞蜂鸣{beeBuzzingCollision ? '已开' : '已关'}
                </Text>
                <Flex
                  isTouchView
                  onPress={() => setBeeBuzzingCollision(v => !v)}
                >
                  <Image
                    source={{
                      uri: `https://g.18qjz.cn/img/boklock/switch_${
                        beeBuzzingCollision ? 'checked' : 'default'
                      }.png`,
                    }}
                    style={styles.switchImg}
                  />
                </Flex>
              </Flex>
            </View>

            {beeBuzzingCollision ? (
              <>
                <View style={[styles.row, styles.rowBorder]}>
                  <Flex
                    justify="between"
                    align="center"
                    style={styles.rowInner}
                  >
                    <Text style={styles.rowText}>蜂鸣测试</Text>
                    <GradientButton
                      colors={['#333333', '#333333']}
                      width={64}
                      height={24}
                      round={false}
                      btnBorderRadius={6}
                      onPress={() => {
                        testConfirmRef.current?.open();
                      }}
                      text="测试"
                      textStyle={styles.testBtnText}
                    />
                  </Flex>
                </View>

                <View style={styles.row}>
                  <Flex align="center" style={styles.rowInner}>
                    <Text style={styles.rowText}>触发碰撞蜂鸣后</Text>
                    <TextInput
                      value={buzzerTime}
                      keyboardType="number-pad"
                      maxLength={2}
                      style={styles.timeInput}
                      onChangeText={setBuzzerTime}
                    />
                    <Text style={styles.rowText}>秒后停止蜂鸣</Text>
                  </Flex>
                </View>
              </>
            ) : null}
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
                  shouldResetStateRef.current = true;
                  popupRef.current?.close();
                }}
                text="取消"
                textColor="#999999"
                textStyle={styles.font32}
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
                  const res = await onConfirm({
                    buzzerTime: Number(buzzerTime),
                    buzzerStatus: beeBuzzingCollision ? 1 : 0,
                  });
                  if (res) {
                    // 可能会操作失败,所以也需要重置
                    shouldResetStateRef.current = true;
                    popupRef.current?.close();
                  }
                }}
                text="确定"
                textStyle={[styles.font32, { color: '#FFFFFF' }]}
              />
            </View>
          </Flex>
        </View>
      </AnimationPop>

      <PopConfirm
        ref={testConfirmRef}
        title="蜂鸣测试"
        onConfirm={async () => {
          const res: any = await operateBuzzing({ id: deviceId });
          if (res?.code === 200 && res?.success) {
            showToast('蜂鸣测试成功');
            return true;
          }
          showToast(res?.message || '蜂鸣测试失败');
          return false;
        }}
      />
    </>
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
  beeBuzzingCollision: {
    backgroundColor: '#f7f7fb',
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.08)',
  },
  rowBorderOn: {
    borderBottomColor: 'rgba(0, 0, 0, 0.12)',
  },
  rowInner: {
    width: '100%',
  },
  rowText: {
    fontSize: 14,
    color: '#333333',
  },
  switchImg: {
    width: 32,
    height: 20,
  },
  timeInput: {
    width: 50,
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
    marginTop: 36,
  },
  btnFlex: {
    flex: 1,
  },
  btnGap: {
    width: 15,
  },
  font32: {
    fontSize: 16,
    fontWeight: '500',
  },
  testBtnText: {
    fontSize: 12,
    fontWeight: '400',
  },
});

export default BeeBuzzingCollisionPop;
