import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  Image,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Flex from '@/components/Flex';
import GradientButton from '@/components/GradientButton';
import PopConfirm, { type PopConfirmRef } from '@/components/popConfirm';
import AnimationPop, { type AnimationPopRef } from '@/components/AnimationPop';
import { operateBuzzing } from '@/services';
import { showToast } from '@/utils';
import { Popup } from '@/components';
import { fontSize, px } from '@/utils/ui';

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
  const timeInputRef = useRef<TextInput>(null);
  const testConfirmRef = useRef<PopConfirmRef>(null);
  const [beeBuzzingCollision, setBeeBuzzingCollision] = useState(false);
  const [buzzerTime, setBuzzerTime] = useState('');
  const [visible, setVisible] = useState(false);

  const refreshState = useCallback(() => {
    setBeeBuzzingCollision(isOpen);
    setBuzzerTime(String(time ?? ''));
  }, [isOpen, time]);

  const openTestConfirm = useCallback(() => {
    testConfirmRef.current?.open?.();
  }, []);

  useEffect(() => {
    refreshState();
  }, [refreshState]);

  useImperativeHandle(
    ref,
    () => ({
      open: () => {
        setVisible(true);
      },
      close: () => {
        setVisible(false);
      },
    }),
    [],
  );

  return (
    <>
      <Popup
        visible={visible}
        showClose={false}
        onClose={() => {
          const shouldRefresh = shouldResetStateRef.current;
          shouldResetStateRef.current = true;
          if (shouldRefresh) refreshState();
        }}
        contentStyle={styles.popupRoot}
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
                      width={px(64)}
                      height={px(24)}
                      round={false}
                      btnBorderRadius={px(6)}
                      onPress={openTestConfirm}
                      text="测试"
                      textStyle={styles.testBtnText}
                    />
                  </Flex>
                </View>

                <View style={styles.row}>
                  <Flex align="center" style={styles.rowInner}>
                    <Text style={styles.rowText}>触发碰撞蜂鸣后</Text>
                    <TextInput
                      ref={timeInputRef}
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
                height={px(48)}
                round={false}
                btnBorderRadius={px(12)}
                hasBorder
                onPress={() => {
                  timeInputRef.current?.blur();
                  Keyboard.dismiss();

                  shouldResetStateRef.current = true;
                  setVisible(false);
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
                height={px(48)}
                round={false}
                btnBorderRadius={px(12)}
                onPress={async () => {
                  timeInputRef.current?.blur();
                  Keyboard.dismiss();
                  const payload = {
                    buzzerTime: Number(buzzerTime),
                    buzzerStatus: beeBuzzingCollision ? 1 : 0,
                  };

                  const res = await onConfirm(payload);
                  if (res) {
                    // 可能会操作失败,所以也需要重置
                    shouldResetStateRef.current = true;
                    setVisible(false);
                  }
                }}
                text="确定"
                textStyle={[styles.font32, { color: '#FFFFFF' }]}
              />
            </View>
          </Flex>
        </View>
      </Popup>

      <PopConfirm
        ref={testConfirmRef}
        title="蜂鸣测试"
        onConfirm={async () => {
          const res: any = await operateBuzzing({ id: deviceId });
          console.log('[BeeBuzzingCollisionPop] operateBuzzing res:', res);
          if (res?.code === 200 && res?.success) {
            showToast({ title: '蜂鸣测试成功', icon: 'success' });
            return true;
          }
          showToast({ title: res?.message || '蜂鸣测试失败', icon: 'info' });
          return false;
        }}
      />
    </>
  );
});

const styles = StyleSheet.create({
  popupRoot: {
    borderTopLeftRadius: px(12),
    borderTopRightRadius: px(12),
  },
  popupContainer: {
    paddingTop: px(12),
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
  beeBuzzingCollision: {
    backgroundColor: '#f7f7fb',
    borderRadius: px(12),
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: px(16),
    paddingVertical: px(14),
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
    fontSize: fontSize(14),
    color: '#333333',
  },
  switchImg: {
    width: px(32),
    height: px(20),
  },
  timeInput: {
    width: px(50),
    height: px(30),
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: px(6),
    paddingHorizontal: px(8),
    paddingVertical: px(4),
    marginHorizontal: px(8),
    backgroundColor: '#ffffff',
    textAlign: 'center',
    color: '#333333',
  },
  btnContainerWrapper: {
    marginTop: px(36),
  },
  btnFlex: {
    flex: 1,
  },
  btnGap: {
    width: px(15),
  },
  font32: {
    fontSize: fontSize(16),
    fontWeight: '500',
  },
  testBtnText: {
    fontSize: fontSize(12),
    fontWeight: '400',
  },
});

export default BeeBuzzingCollisionPop;
