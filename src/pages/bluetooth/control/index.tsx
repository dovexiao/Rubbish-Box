import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AppState,
  Image,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
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
  remenberPath,
} from '@/utils';
import {
  checkIfDeviceIgnoredOnIOS,
  getBluetoothState,
  sendChangePinByBluetooth,
  setNearbyPermission,
  getSystemConnectedDevices,
} from '@/utils/api';
import { getBluetoothDeviceInfo, isSameMac } from '@/utils';
import BluetoothStatus, {
  type BluetoothStatusRef,
} from '@/components/bluetoothStatus';
import SettingPin, { type SettingPinRef } from '../component/SettingPin';
import {
  getBluetoothPin,
  getBluetoothStatus,
  openBluetoothProximity,
  settingBluetoothPin,
} from '@/services';
import { styles } from './style';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import AppIcon from '@/components/AppIcon';

type RouteParams = {
  lockId?: number | string;
  lockName?: string;
  imageMap?: any;
  bleNo?: string;
  buletoothHasOpen?: boolean | string;
  deviceNo?: string;
  role?: string | number;
  mode?: string | number;
  hasMode?: boolean | string;
  bindSuccessStatus?: boolean | string;
  blePin?: string;
  bleName?: string;
  needPin?: number;
  version?: string;
  isFromGroup?: boolean; // 是否是从组合设备来的
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
  const blePin = params.blePin || '';
  const needPin = params.needPin;
  const mode = params.mode;
  const isFromGroup = params.isFromGroup ?? false;
  const bindSuccessStatus =
    String(params.bindSuccessStatus) === 'true' ||
    params.bindSuccessStatus === true;
  const version = Number(params.version);

  const [isPaired, setIsPaired] = useState(false);
  const [showPage, setShowPage] = useState(false);
  const [isIgnored, setIsIgnored] = useState(false);
  const [isBluetoothOpen, setIsBluetoothOpen] = useState(false);
  const [gifUrl, setGifUrl] = useState<string | undefined>(undefined);
  const [bluetoothPin, setBluetoothPin] = useState<string>('');
  const [proximityEnabled, setProximityEnabled] = useState(
    String(params.buletoothHasOpen) === 'true' ||
      params.buletoothHasOpen === true,
  );
  const optionTypeRef = useRef<number>(0);

  const bluetoothStatusRef = useRef<BluetoothStatusRef>(null);
  const settingPinRef = useRef<SettingPinRef>(null);

  const refreshPairStatus = useCallback(async () => {
    showLoading({ title: '蓝牙状态校验中...' });
    const saved = (await getBluetoothDeviceInfo().catch(() => ({}))) || {};
    // @ts-ignore
    const entry = saved?.[bleNo];
    const deviceId = entry?.deviceId;
    const bleName = String(entry?.bleName || '');
    const ignoredRes = await checkIfDeviceIgnoredOnIOS(
      deviceId,
      bleNo,
      bleName,
    );
    setIsIgnored(!!ignoredRes.isIgnored);
    if (['android', 'ios'].includes(Platform.OS)) {
      hideLoading();
      setIsPaired(
        !!(entry?.deviceId && entry?.isPaired && !ignoredRes.isIgnored),
      );
    } else {
      let currentIsPaired = !!(
        entry?.deviceId &&
        entry?.isPaired &&
        !ignoredRes.isIgnored
      );

      // 优化1：如果本地判断没配对，就不需要去走鸿蒙原生 API 了，省下那干等的 5 秒钟
      if (currentIsPaired) {
        try {
          const info = await getSystemConnectedDevices();
          const sysPaired =
            info.data?.some(
              (item: any) =>
                isSameMac(item.deviceId, bleNo) ||
                (deviceId && isSameMac(item.deviceId, deviceId)),
            ) || false;
          currentIsPaired = currentIsPaired && sysPaired;
        } catch (error) {
          console.error('获取系统配对设备失败', error);
        }
      }
      hideLoading();
      setIsPaired(currentIsPaired);
      setShowPage(true);
    }

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

  const getPin = async () => {
    const res = await getBluetoothPin({ id: lockId });
    if (res.code === 200) {
      setBluetoothPin(res.data);
    }
  };

  /**
   * 按模式修改 PIN：
   * - mode 2：先 BLE 告知硬件，再 settingBluetoothPin 通知后端
   * - mode 1：先 settingBluetoothPin，再轮询 getBluetoothPin 确认
   */
  const handlePinChangeByMode = async (options: {
    mode?: string | number;
    lockId: string | number | undefined;
    value: string;
    bleNo: string | number | undefined;
    setBluetoothPin: (pin: string) => void;
    closePopup: () => void;
  }) => {
    const { lockId, value, bleNo, setBluetoothPin, closePopup } = options;
    // 续航模式：BLE -> 后端

    try {
      showLoading({ title: '修改中...' });

      const saved = (await getBluetoothDeviceInfo().catch(() => null)) || {};
      const deviceId = saved?.[bleNo as string].deviceId;
      const bleNos = saved?.[bleNo as string]?.bleNo;

      if (!deviceId) {
        hideLoading();
        showToast({ title: '未找到蓝牙设备信息，请重新配对', icon: 'info' });
        return;
      }

      const cmdRes = await sendChangePinByBluetooth({
        deviceId,
        deviceNo,
        pin: value,
      });
      if (!cmdRes.success) {
        hideLoading();
        showToast({ title: cmdRes.msg || '设备修改 PIN 失败', icon: 'info' });
        return;
      }

      const apiRes: any = await settingBluetoothPin({
        id: lockId,
        pin: value,
        bleNo: cmdRes.newMac,
      });
      if (apiRes.code === 200) {
        setBluetoothPin(value);
        // 修改 PIN 码后，将设备配对状态设为 false
        await updateDevicePairedStatus(bleNos);
        hideLoading();
        showToast({ title: '修改 PIN 成功', icon: 'success' });
        closePopup();
        setTimeout(() => {
          navigation.navigate('UnBindSuccess', {
            changePin: '修改PIN码成功',
            deviceId: deviceId,
            isFromGroup,
            bleName: bleName,
            bleNo: bleNo,
          });
        }, 500);
      } else {
        hideLoading();
        showToast({
          title: apiRes.message || '修改失败，稍后重试',
          icon: 'info',
        });
      }
    } catch (error) {
      hideLoading();
      console.error('修改 PIN 异常', error);
      showToast({ title: '修改 PIN 失败，请稍后重试', icon: 'info' });
    }
  };

  const updateDevicePairedStatus = async (bleNo: string) => {
    try {
      // 更新全局 store
      // await openBluetoothProximity({id: lockId as string | number, bluetoothStatus: 0}, 'info')
      const deviceMap =
        (await getBluetoothDeviceInfo().catch(() => null)) || {};
      if (deviceMap[bleNo]) {
        const { [bleNo]: _, ...rest } = deviceMap;
        await setStorage({ key: 'bluetoothDeviceInfoList', data: rest });
      }

      // 更新本地存储
      removeStorage({ key: 'bluetoothDeviceInfo' });
    } catch (error) {
      console.error('更新设备配对状态失败:', error);
    }
  };

  // 首次进入时检查一次
  useEffect(() => {
    void refreshPairStatus();
    void checkBluetoothOpen();
    void getPin();
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
      const needPinNum = Number(needPin ?? 0);
      const targetServerStatus = proximityEnabled ? 0 : 1;

      // needPin != 1：不需要 BLE 交互，直接调用后端并轮询确认
      if (needPinNum !== 1) {
        const apiRes: any = await openBluetoothProximity({
          id: lockId,
          bluetoothStatus: targetServerStatus,
        });

        if (
          !(apiRes?.code === 200 || apiRes?.code === '200' || apiRes?.success)
        ) {
          hideLoading();
          showToast({
            title: apiRes?.message || '同步失败，稍后重试',
            icon: 'info',
          });
          return;
        }

        const pollOk = async (): Promise<boolean> => {
          const start = Date.now();
          const timeoutMs = 10000;
          const intervalMs = 1000;

          while (Date.now() - start < timeoutMs) {
            try {
              const res: any = await getBluetoothStatus({
                id: lockId,
                bluetoothStatus: targetServerStatus,
              });
              if (res?.data) return true;
            } catch {
              // 轮询继续
            }

            await new Promise((resolve: any) =>
              setTimeout(resolve, intervalMs),
            );
          }

          return false;
        };

        const ok = await pollOk();
        if (!ok) {
          showToast({
            title: `${
              proximityEnabled ? '关闭' : '开启'
            }近身功能失败，请稍后重试`,
            icon: 'info',
          });
          return;
        }

        setProximityEnabled(v => !v);
        showToast({ title: '操作成功', icon: 'success' });
        return;
      }

      const saved = (await getBluetoothDeviceInfo().catch(() => ({}))) || {};
      // @ts-ignore
      const deviceId = saved?.[bleNo]?.deviceId;
      if (!deviceId) {
        showToast({ title: '未找到蓝牙设备信息，请重新配对', icon: 'info' });
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
          icon: 'info',
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
        showToast({
          title: apiRes?.message || '同步失败，稍后重试',
          icon: 'info',
        });
        return;
      }

      setProximityEnabled(v => !v);
      showToast({ title: '操作成功', icon: 'success' });
    } catch (error) {
      hideLoading();
      console.error('handleToggleProximity error', error);
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
        isFromGroup,
        imageMap,
        bleName,
        needPin,
        pin: bluetoothPin || blePin || '',
        version,
        pageName: 'BluetoothControl',
      });
    } else {
      await remenberPath({
        path: route?.name,
        params: { ...route?.params },
      });
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
      footer={
        role === 1 && !!needPin ? (
          <Flex style={styles.footerContainer}>
            <Flex style={styles.footerTextWrapper}>
              <Text style={styles.footerText}>管理蓝牙配对PIN码：</Text>
              <TouchableOpacity
                style={styles.footerRightContent}
                onPress={() => {
                  bluetoothStatusRef.current?.open();
                  optionTypeRef.current = 1;
                }}
              >
                <Text style={styles.footerText}>
                  {bluetoothPin || blePin || '暂无'}
                </Text>
                <AppIcon name="a-headfor-121" size={20} color="#ff873d" />
              </TouchableOpacity>
            </Flex>
          </Flex>
        ) : undefined
      }
    >
      <View style={styles.container}>
        {hasPaired ||
        (!showPage && Platform.OS !== 'ios' && Platform.OS !== 'android') ? (
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
            <Flex
              direction={'column'}
              style={[styles.card, styles.connectedCard]}
            >
              <Flex
                justify={'between'}
                align={'center'}
                style={{ width: '100%' }}
              >
                <Flex direction={'column'}>
                  <Flex style={styles.rowMargin} align={'start'}>
                    <View style={styles.dotWrapper}>
                      <View style={styles.dot}></View>
                    </View>
                    <Text style={styles.cardItemTexts}>
                      手机App靠近，自动降下地锁
                    </Text>
                  </Flex>
                  <Flex style={styles.rowMargin} align={'start'}>
                    <View style={styles.dotWrapper}>
                      <View style={styles.dot}></View>
                    </View>
                    <Text style={styles.cardItemTexts}>
                      用户离开后，地锁自动升起
                    </Text>
                  </Flex>
                </Flex>
                {role === 1 && version > 12 ? (
                  <TouchableOpacity
                    onPress={() => {
                      bluetoothStatusRef.current?.open();
                      optionTypeRef.current = 2;
                    }}
                  >
                    <Image
                      source={{
                        uri: `https://g.18qjz.cn/img/boklock/switch_${
                          proximityEnabled ? 'checked' : 'default'
                        }.png`,
                      }}
                      style={{ width: 32, height: 20 }}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                ) : undefined}
              </Flex>
            </Flex>

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
                    reLaunch(isFromGroup ? 'Multiple' : 'Index');
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

      <BluetoothStatus
        ref={bluetoothStatusRef}
        details={{
          ...params,
          pin: bluetoothPin || '',
          id: lockId || '',
        }}
        type="pass"
        onSuccess={async () => {
          if (optionTypeRef?.current === 1) {
            settingPinRef.current?.open?.();
          } else if (optionTypeRef?.current === 2) {
            await handleToggleProximity();
          }
        }}
      />

      <SettingPin
        ref={settingPinRef}
        pin={bluetoothPin ?? ''}
        onConfirm={async (value: string) => {
          await handlePinChangeByMode({
            mode,
            lockId: lockId as string | number,
            value,
            bleNo,
            setBluetoothPin: (pin: string) => setBluetoothPin(pin),
            closePopup: () => {
              settingPinRef.current?.close();
            },
          });
        }}
        onCancel={() => {
          settingPinRef.current?.close();
        }}
      />
    </PageContainer>
  );
}
