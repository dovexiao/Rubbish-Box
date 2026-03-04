import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, Image, Text, TouchableOpacity, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Flex, GradientButton, PageContainer } from '@/components';
import { LOCK_BTN_COLORS, LOCK_STATUS } from '@/constants';
import {
  hideLoading,
  removeStorage,
  setStorage,
  showLoading,
  showToast,
  getStorage,
  openBluetoothSettings,
  reLaunch,
} from '@/utils';
import {
  checkIfDeviceIgnoredOnIOS,
  getBluetoothState,
  sendChangePinByBluetooth,
  setNearbyPermission,
} from '@/utils/api';
import { getBluetoothDeviceInfo } from '@/utils';
import BluetoothStatus, {
  type BluetoothStatusRef,
} from '@/components/bluetoothStatus';
import SettingPin, { type SettingPinRef } from '../component/SettingPin';
import {
  getBluetoothPin,
  openBluetoothProximity,
  settingBluetoothPin,
} from '@/services';
import { styles } from './style';
import { useAppNavigation } from '@/hooks/useAppNavigation';

type RouteParams = {
  lockId?: number | string;
  lockName?: string;
  imageMap?: any;
  bleNo?: string;
  bluetoothHasOpen?: boolean | string;
  deviceNo?: string;
  role?: string | number;
  mode?: string | number;
  hasMode?: boolean | string;
  bindSuccessStatus?: boolean | string;
  blePin?: string;
  bleName?: string;
};

export default function BluetoothControl() {
  const route = useRoute() as any;
  const navigation = useAppNavigation();
  const params: RouteParams = route?.params || {};

  const bleNo = String(params.bleNo || '');
  const deviceNo = String(params.deviceNo || '');
  const lockId = params.lockId;
  const lockName = params.lockName || '';
  const bleName = params.bleName || '';
  const role = params.role;
  const imageMap = params.imageMap || {};
  const hasMode = String(params.hasMode) === 'true' || params.hasMode === true;
  const bindSuccessStatus =
    String(params.bindSuccessStatus) === 'true' ||
    params.bindSuccessStatus === true;

  const [isPaired, setIsPaired] = useState(false);
  const [isIgnored, setIsIgnored] = useState(false);
  const [isBluetoothOpen, setIsBluetoothOpen] = useState(false);
  const [gifUrl, setGifUrl] = useState<string | undefined>(undefined);
  const [proximityEnabled, setProximityEnabled] = useState(
    String(params.bluetoothHasOpen) === 'true' ||
      params.bluetoothHasOpen === true,
  );

  const optionTypeRef = useRef<'pin' | 'toggle' | null>(null);
  const bluetoothStatusRef = useRef<BluetoothStatusRef>(null);

  const refreshPairStatus = useCallback(async () => {
    const saved = (await getBluetoothDeviceInfo().catch(() => ({}))) || {};
    // @ts-ignore
    const entry = saved?.[bleNo];
    const deviceId = entry?.deviceId;
    const ignoredRes = await checkIfDeviceIgnoredOnIOS(deviceId, bleNo);
    setIsIgnored(!!ignoredRes.isIgnored);
    setIsPaired(
      !!(entry?.deviceId && entry?.isPaired && !ignoredRes.isIgnored),
    );

    const img = entry?.imageMap;
    if (img) {
      try {
        const parsed = typeof img === 'string' ? JSON.parse(img) : img;
        setGifUrl(parsed?.lockBindGif);
      } catch {
        setGifUrl(undefined);
      }
    }
  }, [bleNo]);

  const checkBluetoothOpen = useCallback(async (): Promise<boolean> => {
    try {
      const state = await getBluetoothState();
      const open = state === 'PoweredOn';
      setIsBluetoothOpen(open);
      return open;
    } catch {
      setIsBluetoothOpen(false);
      return false;
    }
  }, []);

  // 首次进入时检查一次
  useEffect(() => {
    void refreshPairStatus();
    void checkBluetoothOpen();
  }, [refreshPairStatus, checkBluetoothOpen]);

  // 从导航 focus 返回时刷新（在应用内路由切换时生效）
  useEffect(() => {
    const unsubscribe =
      navigation && typeof (navigation as any).addListener === 'function'
        ? (navigation as any).addListener('focus', () => {
            void refreshPairStatus();
            void checkBluetoothOpen();
          })
        : undefined;
    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, [navigation, refreshPairStatus, checkBluetoothOpen]);

  // 从系统设置或后台返回到前台时，刷新蓝牙状态和配对状态
  useEffect(() => {
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') {
        void refreshPairStatus();
        void checkBluetoothOpen();
      }
    });
    return () => {
      sub.remove();
    };
  }, [refreshPairStatus, checkBluetoothOpen]);

  const handleToggleProximity = useCallback(async () => {
    showLoading({ title: `${proximityEnabled ? '关闭' : '开启'}中...` });
    try {
      const saved = (await getBluetoothDeviceInfo().catch(() => ({}))) || {};
      // @ts-ignore
      const deviceId = saved?.[bleNo]?.deviceId;
      if (!deviceId) {
        showToast({ title: '未找到蓝牙设备信息，请重新配对', icon: 'none' });
        return;
      }
      const cmdRes = await setNearbyPermission({
        deviceId,
        deviceNo,
        status: proximityEnabled ? 2 : 1,
      });
      if (!cmdRes.success) {
        showToast({
          title:
            cmdRes.msg || `${proximityEnabled ? '关闭' : '开启'}近身功能失败`,
          icon: 'none',
        });
        return;
      }

      const apiRes: any = await openBluetoothProximity({
        id: lockId,
        bluetoothStatus: proximityEnabled ? 0 : 1,
      });
      if (
        !(apiRes?.code === 200 || apiRes?.code === '200' || apiRes?.success)
      ) {
        showToast({ title: apiRes?.message || '服务端同步失败', icon: 'none' });
        return;
      }

      setProximityEnabled(v => !v);
      showToast({ title: '操作成功', icon: 'success' });
    } finally {
      hideLoading();
    }
  }, [bleNo, deviceNo, lockId, proximityEnabled]);

  const handleOpenBluetooth = async () => {
    if (isBluetoothOpen) {
      navigation.navigate('FindDevice' as any, {
        lockName,
        lockId,
        bleNo,
        deviceNo,
        role,
        hasMode,
        bindSuccessStatus,
        imageMap,
        bleName,
      });
    } else {
      await openBluetoothSettings();
    }
  };

  const hasPaired = useMemo(() => {
    return isPaired && !isIgnored;
  }, [isIgnored, isPaired]);

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: hasMode ? '配对成功' : '自动升降',
        showBack: true,
        background: '#FFFFFF',
      }}
      padding={0}
    >
      <View style={styles.container}>
        {hasPaired ? (
          <View style={styles.pairedBox}>
            {gifUrl ? (
              <Image
                source={{ uri: gifUrl }}
                style={styles.gif}
                resizeMode="contain"
              />
            ) : null}
            <Text style={styles.statusText}>{`自动升降已${
              proximityEnabled ? '开启' : '关闭'
            }`}</Text>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>功能说明</Text>
              <Text style={styles.cardText}>- 手机 App 靠近，自动降下地锁</Text>
              <Text style={styles.cardText}>- 用户离开后，地锁自动升起</Text>
              {String(role) === '1' ? (
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.toggleBtn}
                  onPress={() => {
                    optionTypeRef.current = 'toggle';
                    bluetoothStatusRef.current?.open();
                  }}
                >
                  <Text style={styles.toggleBtnText}>
                    {proximityEnabled ? '关闭自动升降' : '开启自动升降'}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {bindSuccessStatus ? (
              <View
                style={{ width: '100%', marginTop: 24, alignItems: 'center' }}
              >
                <GradientButton
                  colors={LOCK_BTN_COLORS[LOCK_STATUS.FALL_SUCCESS]}
                  width={220}
                  height={44}
                  round={false}
                  btnBorderRadius={16}
                  onPress={() => {
                    reLaunch('Index');
                  }}
                >
                  <Text style={styles.btnText}>完成</Text>
                </GradientButton>
              </View>
            ) : null}
          </View>
        ) : (
          <Flex
            direction={'column'}
            style={{
              marginTop: 160,
              paddingHorizontal: 12,
            }}
          >
            <Flex direction={'column'} style={styles.card}>
              <Flex style={styles.rowMargin32} align={'center'}>
                <Text style={styles.cardItemText}>开启自动升降</Text>
              </Flex>
              <Flex style={styles.rowMargin} align={'start'}>
                <View style={styles.dotWrapper}>
                  <View style={styles.dot}></View>
                </View>
                <Text style={styles.cardItemText}>
                  确认手机开启蓝牙，并靠近地锁
                </Text>
              </Flex>
              <Flex style={styles.rowMargin} align={'start'}>
                <View style={styles.dotWrapper}>
                  <View style={styles.dot}></View>
                </View>
                <Text style={styles.cardItemText}>
                  开启后，手机App靠近，自动降下地锁；离开后自动升起
                </Text>
              </Flex>
            </Flex>

            <Flex
              direction={'column'}
              justify={'center'}
              align={'center'}
              style={{
                width: '100%',
                marginTop: 44,
              }}
            >
              {!isBluetoothOpen && (
                <Text style={styles.buttonTipsText}>
                  开启蓝牙，以便查找附近的设备
                </Text>
              )}

              {/* 蓝牙未开启时显示开启蓝牙按钮 */}
              {!isBluetoothOpen && (
                <GradientButton
                  colors={LOCK_BTN_COLORS[LOCK_STATUS.FALL_SUCCESS]}
                  width={160}
                  onPress={() => handleOpenBluetooth()}
                  style={styles.btn}
                >
                  <Text style={styles.btnText}>开启蓝牙</Text>
                </GradientButton>
              )}

              {/* 蓝牙已开启但未配对时显示前往按钮 */}
              {isBluetoothOpen && !isPaired && (
                <GradientButton
                  colors={LOCK_BTN_COLORS[LOCK_STATUS.FALL_SUCCESS]}
                  width={160}
                  onPress={() => handleOpenBluetooth()}
                  style={styles.btn}
                >
                  <Text style={styles.btnText}>前往开启</Text>
                </GradientButton>
              )}
            </Flex>
          </Flex>
        )}
      </View>
    </PageContainer>
  );
}
