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
import AppIcon from '@/components/AppIcon';
import { fontSize, px } from '@/utils/ui';

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
        const bleName = String(item?.bleName || '');
        // @ts-ignore
        const savedDeviceInfo = result?.[bleNo];
        const deviceId = savedDeviceInfo?.deviceId;
        const res = await checkIfDeviceIgnoredOnIOS(deviceId, bleNo, bleName);

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
          // 只有当 bluetoothDeviceInfoList 中存在该 bleNo 映射时，
          // 才删除 bluetoothDeviceInfo，避免在“配对流程中临时写入 bluetoothDeviceInfo”
          // 时被误删。
          if (!!savedDeviceInfo) {
            await removeStorage({ key: 'bluetoothDeviceInfo' });
          }
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
      lockList.length * px(152) > px(824)
        ? px(500)
        : (px(176) + lockList.length * px(152)) / 2;

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
                    <AppIcon name="bluetooth-1" size={px(20)} color="#333333" />
                    <Text style={styles.text}>自动升降</Text>
                  </Flex>
                  {!isAutoOpen && (
                    <View style={styles.warningIcon}>
                      <Image
                        source={{
                          uri: 'https://g.18qjz.cn/img/boklock/icon/bluetooth_close.png',
                        }}
                        style={{
                          width: px(16),
                          height: px(16),
                          aspectRatio: 1,
                        }}
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
    paddingTop: px(24),
    paddingLeft: px(24),
    paddingRight: px(24),
    paddingBottom: px(16),
    flex: 1,
    marginBottom: px(34),
  } as const,
  card: {
    width: '100%',
    backgroundColor: '#f7f7fb',
    borderRadius: px(12),
    paddingLeft: px(16),
    paddingRight: px(16),
    paddingTop: px(12),
    paddingBottom: px(12),
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: px(12),
    position: 'relative' as const,
  },
  mb0: {
    marginBottom: 0,
  },
  lockName: {
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    flexShrink: 1,
    marginRight: px(12),
  },
  text: {
    fontSize: fontSize(12),
    color: '#333333',
    lineHeight: px(16),
    marginTop: px(4),
  },
  warningIcon: {
    position: 'absolute' as const,
    top: px(6),
    right: px(10),
    width: px(32),
    height: px(32),
  },
};

export default AutoOperatePop;
