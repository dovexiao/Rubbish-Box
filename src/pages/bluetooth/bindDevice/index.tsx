import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Image, Platform, Text, TouchableOpacity, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { GradientButton, PageContainer } from '@/components';
import {
  LOCK_BTN_COLORS,
  LOCK_STATUS,
  SEARCH_BLUETOOTH_STATUS,
  SEARCH_BLUETOOTH_STATUS_IMAGE,
  SEARCH_BLUETOOTH_STATUS_NAME,
} from '@/constants';
import {
  hideLoading,
  setStorage,
  showLoading,
  showToast,
  getStorage,
} from '@/utils';
import {
  connectBluetoothDevice,
  openBluetoothSettings,
  searchBluetoothDevices,
  stopSearchBluetoothDevices,
} from '@/utils/api';
import { parseMacFromBase64, getBluetoothDeviceInfo } from '@/utils';
import { bind as bindDevice } from '@/services';
import { styles } from './style';
import { useAppNavigation } from '@/hooks/useAppNavigation';

type RouteParams = {
  blePin?: string;
  bleName?: string;
  deviceNo?: string;
  bleNo?: string;
  imageMap?: any;
};

export default function BluetoothBindDevice() {
  const route = useRoute() as any;
  const navigation = useAppNavigation();
  const params: RouteParams = route?.params || {};

  const bleNo = params.bleNo || '';
  const deviceNo = params.deviceNo || '';
  const bleName = params.bleName || '';
  const blePin = params.blePin || '';
  const isHarmonyOS = Platform.OS !== 'ios' && Platform.OS !== 'android';
  const needScan = Platform.OS === 'ios' || isHarmonyOS;
  const [searchStatus, setSearchStatus] = useState(
    SEARCH_BLUETOOTH_STATUS.SEARCHING as keyof typeof SEARCH_BLUETOOTH_STATUS,
  );
  const [countdownSec, setCountdownSec] = useState(120);
  const searchStatusRef = useRef(searchStatus);

  useEffect(() => {
    searchStatusRef.current = searchStatus;
  }, [searchStatus]);

  const searchRef = useRef<any>({
    found: async (res: any) => {
      const devices = res?.devices || [];
      if (!Array.isArray(devices) || devices.length === 0) return;
      const target = devices.find((d: any) => {
        const idMatch =
          d?.deviceId && bleNo
            ? String(d.deviceId).includes(String(bleNo))
            : false;
        const macMatch =
          d?.manufacturerData && bleNo
            ? (parseMacFromBase64(String(d.manufacturerData)) || '').includes(
                String(bleNo),
              )
            : false;
        return idMatch || macMatch;
      });
      if (!target) return;

      const payload = {
        deviceNo,
        bleNo,
        deviceId: target.deviceId,
        name: target.name || target.localName,
        imageMap: params.imageMap,
        isPaired: false,
      };

      await setStorage({ key: 'bluetoothDeviceInfo', data: { data: payload } });
      const existingRaw = await getStorage({ key: 'bluetoothDeviceInfoList' });
      const existingMap = (existingRaw as any)?.data || {};
      await setStorage({
        key: 'bluetoothDeviceInfoList',
        data: { data: { ...existingMap, [bleNo]: payload } },
      });

      await stopSearchBluetoothDevices(searchRef);
      setSearchStatus(
        SEARCH_BLUETOOTH_STATUS.SEARCH_SUCCESS as keyof typeof SEARCH_BLUETOOTH_STATUS,
      );
    },
  });

  const startScan = useCallback(async () => {
    setSearchStatus(
      SEARCH_BLUETOOTH_STATUS.SEARCHING as keyof typeof SEARCH_BLUETOOTH_STATUS,
    );
    setCountdownSec(120);
    await stopSearchBluetoothDevices(searchRef);
    await searchBluetoothDevices(searchRef);
  }, []);

  useEffect(() => {
    if (!needScan) return;
    void startScan();
    return () => {
      void stopSearchBluetoothDevices(searchRef);
    };
  }, [needScan, startScan]);

  useEffect(() => {
    if (!needScan) return;
    if (searchStatus !== SEARCH_BLUETOOTH_STATUS.SEARCHING) return;

    const timer = setInterval(() => {
      setCountdownSec(prev => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(timer);
          if (searchStatusRef.current === SEARCH_BLUETOOTH_STATUS.SEARCHING) {
            setSearchStatus(
              SEARCH_BLUETOOTH_STATUS.SEARCH_FAILED as keyof typeof SEARCH_BLUETOOTH_STATUS,
            );
            void stopSearchBluetoothDevices(searchRef);
          }
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [needScan, searchStatus]);

  const handleOpenSettings = useCallback(async () => {
    showToast({
      title: `进入设置首页 > 蓝牙 > 找到 ${bleName}，输入 ${blePin} 配对`,
      icon: 'info',
    });
    await openBluetoothSettings();
  }, [bleName, blePin]);

  const handleBind = useCallback(async () => {
    showLoading({ title: '绑定中...' });
    try {
      const saved = await getStorage({ key: 'bluetoothDeviceInfo' });
      const deviceInfo = (saved as any)?.data || {};
      const deviceId = deviceInfo.deviceId;
      if (!deviceId) {
        showToast({ title: '未找到设备信息，请先扫描', icon: 'info' });
        return;
      }

      const apiRes: any = await bindDevice({ deviceNo, userId: null });
      if (
        !(apiRes?.code === 200 || apiRes?.code === '200' || apiRes?.success)
      ) {
        showToast({ title: apiRes?.message || '绑定失败', icon: 'info' });
        return;
      }

      const bleRes = await connectBluetoothDevice(deviceId);
      if (!bleRes.success) {
        showToast({ title: '连接设备失败', icon: 'info' });
        return;
      }

      const existing = (await getBluetoothDeviceInfo().catch(() => ({}))) || {};
      const next = { ...existing, [bleNo]: { ...deviceInfo, isPaired: true } };
      await setStorage({
        key: 'bluetoothDeviceInfoList',
        data: { data: next },
      });

      showToast({ title: '绑定成功', icon: 'success' });
      navigation.goBack();
    } finally {
      hideLoading();
    }
  }, [bleNo, deviceNo, navigation]);

  const statusText = useMemo(() => {
    if (searchStatus === SEARCH_BLUETOOTH_STATUS.SEARCHING) {
      return `正在搜索 ${countdownSec}s`;
    }
    return (
      SEARCH_BLUETOOTH_STATUS_NAME[searchStatus] ||
      (searchStatus === SEARCH_BLUETOOTH_STATUS.SEARCH_SUCCESS
        ? '已找到设备'
        : '搜索失败')
    );
  }, [countdownSec, searchStatus]);

  const footer =
    needScan && searchStatus !== SEARCH_BLUETOOTH_STATUS.SEARCH_SUCCESS ? (
      <View style={styles.footer}>
        <GradientButton
          colors={LOCK_BTN_COLORS[LOCK_STATUS.FALL_SUCCESS]}
          width={180}
          height={44}
          round={false}
          btnBorderRadius={16}
          onPress={() => void startScan()}
        >
          <Text style={styles.btnText}>重新搜索</Text>
        </GradientButton>
      </View>
    ) : null;

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{ text: '绑定设备', showBack: true, background: '#FFFFFF' }}
      footer={footer}
      padding={0}
    >
      <View style={styles.container}>
        {needScan ? (
          <View style={styles.scanBox}>
            <Image
              source={{
                uri: SEARCH_BLUETOOTH_STATUS_IMAGE[searchStatus] as string,
              }}
              style={styles.scanImage}
              resizeMode="contain"
            />
            <Text style={styles.countdownText}>{statusText}</Text>
            {searchStatus !== SEARCH_BLUETOOTH_STATUS.SEARCH_SUCCESS ? (
              <View style={styles.card}>
                <Text style={styles.cardItemText}>- 开启地锁电源</Text>
                <Text style={styles.cardItemText}>
                  - 确认手机开启蓝牙，并靠近地锁
                </Text>
              </View>
            ) : (
              <View style={styles.afterFound}>
                <GradientButton
                  colors={LOCK_BTN_COLORS[LOCK_STATUS.FALL_SUCCESS]}
                  width={220}
                  height={44}
                  round={false}
                  btnBorderRadius={16}
                  onPress={() => void handleOpenSettings()}
                >
                  <Text style={styles.btnText}>跳转设置配对</Text>
                </GradientButton>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.secondaryBtn}
                  onPress={() => void handleBind()}
                >
                  <Text style={styles.secondaryBtnText}>已配对，开始绑定</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.infoBox}>
            <Text style={styles.title}>请确保地锁通电</Text>
            <View style={styles.kvRow}>
              <Text style={styles.kvLabel}>蓝牙名称</Text>
              <Text style={styles.kvValue}>{bleName || '-'}</Text>
            </View>
            <View style={styles.kvRow}>
              <Text style={styles.kvLabel}>PIN码</Text>
              <Text style={styles.kvValue}>{blePin || '-'}</Text>
            </View>
            <View style={styles.afterFound}>
              <GradientButton
                colors={LOCK_BTN_COLORS[LOCK_STATUS.FALL_SUCCESS]}
                width={220}
                height={44}
                round={false}
                btnBorderRadius={16}
                onPress={() => void handleOpenSettings()}
              >
                <Text style={styles.btnText}>跳转设置</Text>
              </GradientButton>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.secondaryBtn}
                onPress={() => void handleBind()}
              >
                <Text style={styles.secondaryBtnText}>已配对，开始绑定</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </PageContainer>
  );
}
