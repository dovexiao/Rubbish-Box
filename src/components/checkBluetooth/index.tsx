import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { Text, View } from 'react-native';
import Flex from '@/components/Flex';
import Popup from '@/components/Popup';
import AppIcon from '@/components/AppIcon';
import { getBluetoothDeviceInfo, loopFunc, showToast } from '@/utils';
import { isDeviceConnected } from '@/utils/api';
import { styles } from './styles';
import { px } from '@/utils/ui';

export type CheckBluetoothRef = {
  open: () => void;
  close: () => void;
};

type Props = {
  /** 这里保持和老项目一致：传入作为映射 key 的 bleNo */
  deviceId: string;
};

type StepItem = { title: string; checked: boolean };

const DEFAULT_STEPS: StepItem[] = [
  { title: '手机靠近，自动降下地锁', checked: true },
  { title: '开车离开后，地锁自动升起', checked: false },
];

const CheckBluetooth = forwardRef<CheckBluetoothRef, Props>(
  function CheckBluetooth(props, ref) {
    const [visible, setVisible] = useState(false);
    const [steps, setSteps] = useState<StepItem[]>(DEFAULT_STEPS);

    const pollingRef = useRef<{ start: () => void; stop: () => void } | null>(
      null,
    );
    const isConnectedRef = useRef<boolean>(true);
    const hasDisconnectedRef = useRef<boolean>(false);

    const stopMonitoring = useCallback(() => {
      pollingRef.current?.stop?.();
      pollingRef.current = null;
    }, []);

    const checkConnection = useCallback(async (): Promise<boolean> => {
      try {
        const deviceInfo =
          (await getBluetoothDeviceInfo().catch(() => ({}))) || {};
        const bleNoKey = String(props.deviceId || '');
        // @ts-ignore
        const mappedDeviceId = deviceInfo?.[bleNoKey]?.deviceId;
        if (!bleNoKey || !mappedDeviceId) {
          return false;
        }
        const result = await isDeviceConnected(String(mappedDeviceId));
        return !!result?.success;
      } catch (error) {
        console.error('检查连接状态失败:', error);
        return false;
      }
    }, [props.deviceId]);

    const startMonitoring = useCallback(() => {
      // 先检查一次连接状态
      void checkConnection().then(connected => {
        isConnectedRef.current = connected;
      });

      const { start, stop } = loopFunc(async () => {
        const connected = await checkConnection();
        const wasConnected = isConnectedRef.current;

        if (wasConnected !== connected) {
          isConnectedRef.current = connected;

          // 断开时：提示 + 标记已断开 + 直接完成第二步
          if (wasConnected && !connected) {
            showToast({ title: '蓝牙连接已断开', icon: 'error' });
            hasDisconnectedRef.current = true;
            setSteps(prev => {
              const next = prev.map((s, i) =>
                i === 1 ? { ...s, checked: true } : s,
              );
              const allChecked = next.every(s => s.checked);
              if (allChecked) {
                stopMonitoring();
                setVisible(false);
              }
              return next;
            });
          }

          // 重新连接时：如果曾经断开过，则认为完成第二步
          if (!wasConnected && connected) {
            if (hasDisconnectedRef.current) {
              setSteps(prev => {
                const next = prev.map((s, i) =>
                  i === 1 ? { ...s, checked: true } : s,
                );
                const allChecked = next.every(s => s.checked);
                if (allChecked) {
                  stopMonitoring();
                  setVisible(false);
                }
                return next;
              });
            }
          }
        }

        return true;
      }, 2000);

      pollingRef.current = { start, stop };
      start();
    }, [checkConnection, stopMonitoring]);

    useImperativeHandle(
      ref,
      () => ({
        open: () => {
          setSteps(DEFAULT_STEPS);
          isConnectedRef.current = true;
          hasDisconnectedRef.current = false;
          setVisible(true);
          startMonitoring();
        },
        close: () => {
          stopMonitoring();
          setVisible(false);
        },
      }),
      [startMonitoring, stopMonitoring],
    );

    useEffect(() => {
      return () => {
        stopMonitoring();
      };
    }, [stopMonitoring]);

    return (
      <Popup
        visible={visible}
        onClose={() => {
          stopMonitoring();
          setVisible(false);
        }}
        title="提示"
        minHeight={318}
      >
        <Flex direction="column" style={styles.popupContainer}>
          <View>
            <Text style={styles.title}>为确保蓝牙连接稳定可用</Text>
            <Text style={styles.title}>请完成一次完整的升降测试</Text>
          </View>

          <View style={styles.steps}>
            {steps.map((item, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepItemLeft}>
                  <Text style={styles.stepText}>{`0${index + 1}`}</Text>
                  <Text style={styles.stepText} numberOfLines={1}>
                    {item.title}
                  </Text>
                </View>
                <View>
                  {item.checked ? (
                    <AppIcon name="selected" size={px(20)} color="#333333" />
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </Flex>
      </Popup>
    );
  },
);

export default CheckBluetooth;
