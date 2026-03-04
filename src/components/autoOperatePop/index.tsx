import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
} from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getBluetoothDeviceInfo, removeStorage, setStorage } from '@/utils';
import { checkIfDeviceIgnoredOnIOS } from '@/utils/api';
import Flex from '@/components/Flex';
import Popup from '@/components/Popup';
import IconFont from '@/iconfont';

export type AutoOperatePopRef = {
  open: () => void;
  close: () => void;
};

type LockItem = {
  bleNo?: string;
  lockName?: string;
  [key: string]: any;
};

type Props = {
  lockList: LockItem[];
  onChoose: (detail: LockItem | undefined) => void;
};

export const AutoOperatePop = forwardRef<AutoOperatePopRef, Props>(
  function AutoOperatePopInner({ lockList, onChoose }, ref) {
    const [visible, setVisible] = useState(false);
    const [autoOpenMap, setAutoOpenMap] = useState<Record<string, boolean>>({});

    const mountedRef = useRef(true);
    useEffect(() => {
      mountedRef.current = true;
      return () => {
        mountedRef.current = false;
      };
    }, []);

    const hasBluetoothAutoOpen = useCallback(async (item: LockItem) => {
      try {
        const result = (await getBluetoothDeviceInfo().catch(() => ({}))) || {};
        const bleNo = String(item?.bleNo || '');
        // @ts-ignore
        const savedDeviceInfo = result?.[bleNo];
        const deviceId = savedDeviceInfo?.deviceId;
        const res = await checkIfDeviceIgnoredOnIOS(deviceId, bleNo);

        if (!deviceId || res.isIgnored || !savedDeviceInfo?.isPaired) {
          const deviceMap: any =
            (await getBluetoothDeviceInfo().catch(() => ({}))) || {};
          if (deviceMap[bleNo]) {
            const { [bleNo]: _, ...rest } = deviceMap;
            await setStorage({
              key: 'bluetoothDeviceInfoList',
              data: { data: rest },
            });
          }
          await removeStorage({ key: 'bluetoothDeviceInfo' });
          return false;
        }
        return true;
      } catch {
        return false;
      }
    }, []);

    useEffect(() => {
      if (!lockList || lockList.length === 0) {
        setAutoOpenMap({});
        return;
      }
      let cancelled = false;
      (async () => {
        const map: Record<string, boolean> = {};
        for (const it of lockList) {
          const bleNo = String(it?.bleNo || '');
          // eslint-disable-next-line no-await-in-loop
          map[bleNo] = await hasBluetoothAutoOpen(it);
        }
        if (!cancelled && mountedRef.current) {
          setAutoOpenMap(map);
        }
      })();
      return () => {
        cancelled = true;
      };
    }, [hasBluetoothAutoOpen, lockList]);

    useImperativeHandle(
      ref,
      () => ({
        open: () => setVisible(true),
        close: () => setVisible(false),
      }),
      [],
    );

    const popupHeight =
      lockList.length * 152 > 824 ? 500 : (176 + lockList.length * 152) / 2;

    return (
      <Popup
        visible={visible}
        onClose={() => setVisible(false)}
        title="自动升降"
        minHeight={popupHeight}
      >
        <Flex direction="column" style={styles.popupContainer}>
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            {lockList.map((lock, index) => {
              const bleNo = String(lock?.bleNo || '');
              const isAutoOpen = !!autoOpenMap[bleNo];
              const isLast = index === lockList.length - 1;
              return (
                <TouchableOpacity
                  key={bleNo || String(index)}
                  activeOpacity={0.85}
                  style={[styles.card, isLast ? styles.mb0 : null]}
                  onPress={() => {
                    setVisible(false);
                    onChoose?.(lock);
                  }}
                >
                  <Text style={styles.lockName} numberOfLines={1}>
                    {lock?.lockName ?? ''}
                  </Text>
                  <Flex direction="column" justify="between" align="center">
                    <IconFont name="bluetooth-1" size={40} color="#333333" />
                    <Text style={styles.text}>自动升降</Text>
                  </Flex>
                  {!isAutoOpen && (
                    <View style={styles.warningIcon}>
                      <Image
                        source={{
                          uri: 'https://g.18qjz.cn/img/boklock/icon/bluetooth_close.png',
                        }}
                        style={{ width: 32, height: 32 }}
                        resizeMode="contain"
                      />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Flex>
      </Popup>
    );
  },
);

const styles = {
  popupContainer: {
    paddingTop: 24,
    paddingLeft: 24,
    paddingRight: 24,
    paddingBottom: 16,
    flex: 1,
    marginBottom: 34,
  } as const,
  card: {
    width: '100%',
    backgroundColor: '#f7f7fb',
    borderRadius: 12,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 12,
    position: 'relative' as const,
  },
  mb0: {
    marginBottom: 0,
  },
  lockName: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    flexShrink: 1,
    marginRight: 12,
  },
  text: {
    fontSize: 12,
    color: '#333333',
    lineHeight: 16,
    marginTop: 4,
  },
  warningIcon: {
    position: 'absolute' as const,
    top: 6,
    right: 10,
    width: 32,
    height: 32,
  },
};

export default AutoOperatePop;
