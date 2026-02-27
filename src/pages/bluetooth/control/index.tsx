import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
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
} from '@/utils';
import {
  checkIfDeviceIgnoredOnIOS,
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

  const [bluetoothPin, setBluetoothPinState] = useState(params.blePin || '');
  const [isPaired, setIsPaired] = useState(false);
  const [isIgnored, setIsIgnored] = useState(false);
  const [gifUrl, setGifUrl] = useState<string | undefined>(undefined);
  const [proximityEnabled, setProximityEnabled] = useState(
    String(params.bluetoothHasOpen) === 'true' ||
      params.bluetoothHasOpen === true,
  );

  const optionTypeRef = useRef<'pin' | 'toggle' | null>(null);
  const settingPinRef = useRef<SettingPinRef>(null);
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

  const loadPin = useCallback(async () => {
    if (!lockId) return;
    const res: any = await getBluetoothPin({ id: lockId });
    if (res?.code === 200 || res?.code === '200' || res?.success) {
      setBluetoothPinState(res?.data || res?.pin || '');
    }
  }, [lockId]);

  useEffect(() => {
    void refreshPairStatus();
    void loadPin();
  }, [loadPin, refreshPairStatus]);

  const updateDevicePairedStatus = useCallback(async () => {
    const raw = await getStorage({ key: 'bluetoothDeviceInfoList' });
    const map = (raw as any)?.data || {};
    if (map && bleNo in map) {
      const next = { ...map };
      delete next[bleNo];
      await setStorage({
        key: 'bluetoothDeviceInfoList',
        data: { data: next },
      });
    }
    await removeStorage({ key: 'bluetoothDeviceInfo' });
  }, [bleNo]);

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

  const handleChangePin = useCallback(
    async (value: string) => {
      showLoading({ title: '修改中...' });
      try {
        const saved = (await getBluetoothDeviceInfo().catch(() => ({}))) || {};
        // @ts-ignore
        const deviceId = saved?.[bleNo]?.deviceId;
        if (!deviceId) {
          showToast({ title: '未找到蓝牙设备信息，请重新配对', icon: 'none' });
          return;
        }

        const cmdRes = await sendChangePinByBluetooth({
          deviceId,
          deviceNo,
          pin: value,
        });
        if (!cmdRes.success) {
          showToast({ title: cmdRes.msg || '设备修改 PIN 失败', icon: 'none' });
          return;
        }

        const apiRes: any = await settingBluetoothPin({
          id: lockId,
          pin: value,
          bleNo: cmdRes.newMac,
        });
        if (
          !(apiRes?.code === 200 || apiRes?.code === '200' || apiRes?.success)
        ) {
          showToast({
            title: apiRes?.message || '服务端保存 PIN 失败',
            icon: 'none',
          });
          return;
        }

        setBluetoothPinState(value);
        await updateDevicePairedStatus();
        setIsPaired(false);
        showToast({ title: '修改 PIN 成功，请重新配对', icon: 'success' });
      } finally {
        hideLoading();
      }
    },
    [bleNo, deviceNo, lockId, updateDevicePairedStatus],
  );

  const hasPaired = useMemo(() => {
    return isPaired && !isIgnored;
  }, [isIgnored, isPaired]);

  const footer =
    String(role) === '1' ? (
      <View style={styles.footer}>
        <Text style={styles.footerLabel}>管理蓝牙配对PIN码：</Text>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            optionTypeRef.current = 'pin';
            bluetoothStatusRef.current?.open();
          }}
          style={styles.footerRight}
        >
          <Text style={styles.footerValue}>
            {bluetoothPin || params.blePin || '暂无'}
          </Text>
          <Text style={styles.footerArrow}>›</Text>
        </TouchableOpacity>
      </View>
    ) : null;

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{ text: '自动升降', showBack: true, background: '#FFFFFF' }}
      footer={footer}
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
          </View>
        ) : (
          <View style={styles.unpairedBox}>
            <Text style={styles.unpairedTitle}>开启自动升降</Text>
            <Text style={styles.unpairedDesc}>
              确认手机开启蓝牙，并靠近地锁完成配对
            </Text>
            <View style={styles.actions}>
              <GradientButton
                colors={LOCK_BTN_COLORS[LOCK_STATUS.FALL_SUCCESS]}
                width={220}
                height={44}
                round={false}
                btnBorderRadius={16}
                onPress={() => {
                  navigation.navigate('BluetoothSearch' as any, {
                    lockName,
                    lockId,
                    bleNo,
                    deviceNo,
                    imageMap: params.imageMap,
                    pin: bluetoothPin,
                    role,
                    bleName,
                  });
                }}
              >
                <Text style={styles.btnText}>前往连接</Text>
              </GradientButton>
            </View>
          </View>
        )}

        <SettingPin
          ref={settingPinRef}
          pin={bluetoothPin}
          onConfirm={handleChangePin}
          onCancel={() => settingPinRef.current?.close()}
        />

        <BluetoothStatus
          ref={bluetoothStatusRef}
          type="pass"
          details={{
            ...params,
            pin: bluetoothPin,
            id: lockId || '',
          }}
          onSuccess={() => {
            if (optionTypeRef.current === 'pin') {
              settingPinRef.current?.open();
            } else if (optionTypeRef.current === 'toggle') {
              void handleToggleProximity();
            }
          }}
        />
      </View>
    </PageContainer>
  );
}
