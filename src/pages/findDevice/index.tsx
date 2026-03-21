/** @jsxRuntime classic */
/** @jsx React.createElement */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AppState,
  type AppStateStatus,
  Image,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from 'react-native';
import dayjs from 'dayjs';
import { showLoading, hideLoading } from '@/utils';
import { PageContainer, Flex, GradientButton } from '@/components';
import {
  searchBluetoothDevices,
  stopSearchBluetoothDevices,
  getSystemConnectedDevices,
  setNearbyPermission,
  connectBluetoothDevice,
} from '@/utils/api';
import {
  getBluetoothDeviceInfo,
  getSavedDeviceInfo,
  isSameMac,
  openBluetoothSettings,
  parseMacFromAdvertisData,
  parseMacFromBase64,
  remenberPath,
  getStorage as getStorageRaw,
  removeStorage,
  setStorage,
  showToast,
  setClipboardData,
  getStorage,
} from '@/utils';
import { bind, openBluetoothProximity, tipsUserOperation } from '@/services';
import AppIcon from '@/components/AppIcon';
import {
  LOCK_BTN_COLORS,
  LOCK_STATUS,
  SEARCH_BLUETOOTH_STATUS,
  SEARCH_BLUETOOTH_STATUS_IMAGE,
  SEARCH_BLUETOOTH_STATUS_NAME,
} from '@/constants';
import PowerIndicatorPop from '@/components/powerIndicatorPop';
import type { PopCenterRef } from '@/components/PopCenter';
import styles from './styles';

function useCountDown(options: { targetDate?: number; onEnd?: () => void }) {
  const { targetDate, onEnd } = options;
  const onEndRef = useRef(onEnd);
  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  const [left, setLeft] = useState(() => {
    if (!targetDate) return 0;
    return Math.max(0, targetDate - Date.now());
  });

  useEffect(() => {
    if (!targetDate) {
      setLeft(0);
      return;
    }
    let timer: ReturnType<typeof setInterval> | null = null;
    const tick = () => {
      const next = Math.max(0, targetDate - Date.now());
      setLeft(next);
      if (next <= 0) {
        if (timer) clearInterval(timer);
        timer = null;
        onEndRef.current?.();
      }
    };
    tick();
    timer = setInterval(tick, 1000);
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [targetDate]);

  return [left] as const;
}

type RouteParams = {
  bleNo: string;
  lockName?: string;
  lockId?: number;
  imageMap?: Record<string, string>;
  pin?: string;
  mode?: number;
  bleName?: string;
  deviceNo?: string;
  role?: number;
  needPin?: number;
  pageName?: string;
};

export default function FindDevice(props: any) {
  const navigation = props?.navigation;
  const route = props?.route;
  const params: RouteParams = route?.params || {};
  const {
    bleNo,
    lockName,
    lockId,
    deviceNo,
    imageMap,
    pin,
    mode,
    role,
    bleName,
    needPin,
    pageName,
  } = params;

  const isHarmonyOs = Platform.OS !== 'ios' && Platform.OS !== 'android';
  const [state, setStateInner] = useState({
    bindSuccess: false,
    isPaired: false,
    countdownTime: dayjs().add(120, 'seconds').valueOf() as unknown as number,
    searchBluetoothStatus:
      SEARCH_BLUETOOTH_STATUS?.SEARCHING as keyof typeof SEARCH_BLUETOOTH_STATUS,
    needScan: Platform.OS === 'ios' || isHarmonyOs,
  });

  const setState = useCallback((patch: Partial<typeof state>) => {
    setStateInner(prev => ({ ...prev, ...patch }));
  }, []);

  const init = useCallback(async () => {
    try {
      const res = (await getSavedDeviceInfo().catch(() => null)) || {};
      const info = await getSystemConnectedDevices();
      const isValidSavedDevice = res.bleNo === bleNo && !!res.deviceId;
      let isPaired = false;

      if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
        isPaired =
          info.data?.some(
            (item: any) =>
              isSameMac(item.deviceId, bleNo) ||
              (isValidSavedDevice && isSameMac(item.deviceId, res.deviceId)),
          ) || false;
      } else {
        isPaired =
          isValidSavedDevice &&
          (info.data?.some((item: any) => item.deviceId === res.deviceId) ||
            false);
      }
      setState({ isPaired });
    } catch (error) {
      console.error('初始化蓝牙失败', error);
    }
  }, [setState, bleNo]);

  const checkReturnFromSettings = useCallback(async () => {
    try {
      const rnReLaunchPathRes = await getStorage({
        key: 'rnReLaunchPath',
      }).catch(() => null);
      if (!rnReLaunchPathRes?.data) return;

      const data = rnReLaunchPathRes.data as {
        path?: string;
        params?: Record<string, any>;
      };
      const currentName = String(route?.name || 'FindDevice').toLowerCase();
      if (!data.path || !currentName.includes('find')) return;
      await setStorage({
        key: 'rnReLaunchPathProcessing',
        data: true,
      }).catch(() => {});

      const savedDeviceInfo =
        (await getSavedDeviceInfo().catch(() => null)) || {};
      const info = await getSystemConnectedDevices();
      console.log(info, '===info');

      const isValidSavedDevice =
        savedDeviceInfo.bleNo === bleNo && !!savedDeviceInfo.deviceId;

      let isPaired = false;
      let deviceInfo = null;

      isPaired =
        info.data?.some(
          (item: any) =>
            isSameMac(item.deviceId, bleNo) ||
            (isValidSavedDevice &&
              isSameMac(item.deviceId, savedDeviceInfo.deviceId)),
        ) || false;

      deviceInfo = info.data?.find(
        (item: any) =>
          isSameMac(item.deviceId, bleNo) ||
          (isValidSavedDevice &&
            isSameMac(item.deviceId, savedDeviceInfo.deviceId)),
      );

      // 兜底补全信息（因为原生层给鸿蒙只返回了纯物理MAC，我们把原有的本地信息填回去）
      if (isPaired) {
        deviceInfo = deviceInfo ? { ...savedDeviceInfo, ...deviceInfo } : null;
        setState({ isPaired: true });
        await setStorage({
          key: 'bluetoothDeviceInfo',
          data: {
            bleNo,
            deviceId: deviceInfo.deviceId,
            name: deviceInfo.name || deviceInfo.localName,
            imageMap: params?.imageMap,
            isPaired,
          },
        });
        console.log(pageName, '===pageName');
      } else {
        await removeStorage({ key: 'rnReLaunchPath' }).catch(() => {});
      }

      await removeStorage({ key: 'rnReLaunchPathProcessing' }).catch(() => {});
    } catch (error) {
      console.error('检查系统设置返回状态失败:', error);
      await removeStorage({ key: 'rnReLaunchPathProcessing' }).catch(() => {});
    }
  }, [route?.name, params, bleNo, setState]);

  const startSearchDevice = useCallback(
    async (searchRef?: any) => {
      try {
        setState({
          searchBluetoothStatus:
            SEARCH_BLUETOOTH_STATUS.SEARCHING as keyof typeof SEARCH_BLUETOOTH_STATUS,
          countdownTime: dayjs()
            .add(120, 'seconds')
            .valueOf() as unknown as number,
        });
        if (searchRef) {
          await searchBluetoothDevices(searchRef);
        }
      } catch (error) {
        setState({
          searchBluetoothStatus:
            SEARCH_BLUETOOTH_STATUS.SEARCH_FAILED as keyof typeof SEARCH_BLUETOOTH_STATUS,
        });
      }
    },
    [setState],
  );

  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const searchBluetoothDevicesEnd = useCallback(
    async (searchRef?: any) => {
      if (
        stateRef.current.searchBluetoothStatus ===
        SEARCH_BLUETOOTH_STATUS.SEARCHING
      ) {
        setState({
          searchBluetoothStatus:
            SEARCH_BLUETOOTH_STATUS.SEARCH_FAILED as keyof typeof SEARCH_BLUETOOTH_STATUS,
        });
      }
      if (searchRef) {
        try {
          await stopSearchBluetoothDevices(searchRef);
        } catch {}
      }
    },
    [setState],
  );

  const resetSearch = useCallback(
    (searchRef?: any) => {
      setState({
        countdownTime: dayjs()
          .add(120, 'seconds')
          .valueOf() as unknown as number,
        searchBluetoothStatus:
          SEARCH_BLUETOOTH_STATUS.SEARCHING as keyof typeof SEARCH_BLUETOOTH_STATUS,
      });
      startSearchDevice(searchRef);
    },
    [setState, startSearchDevice],
  );

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let lastRunAt = 0;
    const runOnFocus = () => {
      if (timer) clearTimeout(timer);
      const now = Date.now();
      // 从系统设置返回时，AppState 与 navigation focus 可能都会触发，这里做个简单去抖
      if (now - lastRunAt < 250) return;
      lastRunAt = now;
      void init();
      timer = setTimeout(() => {
        void checkReturnFromSettings();
      }, 300);
    };
    runOnFocus();
    const unsubscribe =
      navigation && typeof navigation.addListener === 'function'
        ? navigation.addListener('focus', runOnFocus)
        : undefined;

    const appStateSub = AppState.addEventListener(
      'change',
      (nextState: AppStateStatus) => {
        if (nextState === 'active') {
          runOnFocus();
        }
      },
    );
    return () => {
      if (timer) clearTimeout(timer);
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
      appStateSub?.remove?.();
    };
  }, [checkReturnFromSettings, init, navigation]);

  const powerIndicatorPopRef = useRef<PopCenterRef>(null);
  const { countdownTime, searchBluetoothStatus, isPaired, needScan } = state;

  const [startSearch] = useState(false);

  const searchRef = useRef({
    found: async (res: any) => {
      if (!res?.devices?.length) return;

      const targetDevice = res.devices.find(
        (device: any) =>
          (device.deviceId && device.deviceId.includes(bleNo)) ||
          (device.deviceId && isSameMac(device.deviceId, bleNo)) ||
          (device.manufacturerData &&
            parseMacFromBase64(
              (device.manufacturerData as string) || '',
            )?.includes(bleNo)) ||
          (device.advertisData &&
            parseMacFromAdvertisData(device.advertisData)?.includes(bleNo)),
      );

      if (targetDevice && Object.keys(targetDevice).length > 0) {
        try {
          await setStorage({
            key: 'bluetoothDeviceInfo',
            data: {
              deviceNo,
              bleNo,
              deviceId: targetDevice.deviceId,
              name: targetDevice.name || targetDevice.localName,
              imageMap,
              isPaired: false,
            },
          });
        } catch {}
        try {
          await stopSearchBluetoothDevices(searchRef);
        } catch {}
        await setState({
          searchBluetoothStatus:
            SEARCH_BLUETOOTH_STATUS.SEARCH_SUCCESS as keyof typeof SEARCH_BLUETOOTH_STATUS,
          countdownTime: undefined,
          needScan: false,
        });
      }
    },
  });

  const handleTipsUserOperation = useCallback(
    async (deviceName: string, pinCode: string) => {
      await tipsUserOperation({
        title: '温馨提示',
        content: `进入设置首页 > 找到蓝牙并进入 > 找到${deviceName}蓝牙名称，输入${pinCode}进行配对`,
      });
    },
    [],
  );

  const handlePairing = useCallback(async () => {
    await remenberPath({
      path: route?.name || 'FindDevice',
      params: route?.params ?? params,
      value: { ...params },
    });
    await handleTipsUserOperation(lockName || '', pin || '');
    setTimeout(async () => {
      await openBluetoothSettings();
    }, 1000);
  }, [
    lockName,
    pin,
    params,
    route?.name,
    route?.params,
    handleTipsUserOperation,
  ]);

  const handleBindSuccess = useCallback(async () => {
    const clearProcessingFlag = async () => {
      await removeStorage({ key: 'rnReLaunchPathProcessing' }).catch(() => {});
    };
    try {
      const deviceInfo = (await getSavedDeviceInfo().catch(() => null)) || {};
      const bluetoothDeviceInfoList =
        (await getBluetoothDeviceInfo().catch(() => null)) || {};
      const { bleNo } = deviceInfo || {};
      // 绑定设备
      console.log(pageName, '===pageName');
      if (pageName?.includes('BindDevice')) {
        console.log('触发绑定');
        showLoading({ title: '绑定中...' });
        try {
          const res = await bind({
            deviceNo,
            userId: null,
          });

          const ok = String(res?.code) === '200';
          if (!ok) {
            showToast({
              title: res?.message || '绑定失败',
              icon: 'none',
            });
            hideLoading();
            return;
          }

          const connectRes = await connectBluetoothDevice(deviceInfo.deviceId);
          if (!connectRes.success) {
            showToast({
              title: connectRes.error?.message || '连接设备失败',
              icon: 'none',
            });
            hideLoading();
            return;
          }

          if (bleNo) {
            const nextMap = { ...(bluetoothDeviceInfoList || {}) };
            nextMap[bleNo] = { ...deviceInfo, isPaired: true };
            await setStorage({ key: 'bluetoothDeviceInfoList', data: nextMap });
          }

          await clearProcessingFlag();
          hideLoading();
          showToast({
            title: '绑定成功',
            icon: 'success',
          });
          setTimeout(() => {
            navigation?.navigate?.('BluetoothLinkSuccess', {
              pages: 'bindDevice',
              id: res.data,
            } as never);
          }, 1000);
        } catch {
          hideLoading();
          showToast({
            title: '绑定失败',
            icon: 'none',
          });
          return;
        }
      } else {
        console.log(role, mode, '===role, mode');
        if (bleNo) {
          const newMap = { ...(bluetoothDeviceInfoList || {}) };
          newMap[bleNo] = { ...deviceInfo, isPaired: true };
          await setStorage({ key: 'bluetoothDeviceInfoList', data: newMap });
        }
        console.log(role, mode, '===role, mode');
        if (Number(role) === 1 && !mode) {
          const cmdRes = await setNearbyPermission({
            deviceId: deviceInfo.deviceId,
            deviceNo,
            status: 1,
          });
          if (!cmdRes.success) {
            showToast({
              title: cmdRes.msg || '开启近身功能失败',
              icon: 'none',
            });
            return;
          }
          const apiRes: any = await openBluetoothProximity({
            id: lockId,
            bluetoothStatus: 1,
          });
          if (!apiRes || apiRes.code !== '200') {
            showToast({
              title: apiRes?.message || '开启近身功能失败',
              icon: 'none',
            });
            return;
          }
        }

        await clearProcessingFlag();

        if (mode) {
          showToast({ title: '连接成功', icon: 'success' });
          navigation?.navigate?.('BluetoothLinkSuccess');
        } else {
          showToast({ title: '自动升降开启成功', icon: 'success' });
          navigation?.navigate?.('BluetoothControl', {
            lockName,
            bluetoothHasOpen: true,
            role,
            bleNo,
            imageMap,
            pin,
            lockId,
            bindSuccessStatus: true,
            needPin,
          });
        }
      }
    } catch (error) {
      console.error('连接失败:', error);
      await clearProcessingFlag();
    }
  }, [
    bleNo,
    deviceNo,
    imageMap,
    lockId,
    lockName,
    mode,
    navigation,
    pin,
    role,
  ]);

  const [countdown] = useCountDown({
    onEnd: () => {
      void searchBluetoothDevicesEnd(searchRef);
    },
    targetDate: countdownTime,
  });

  useEffect(() => {
    const t = setInterval(async () => {
      try {
        const result = await getStorage({ key: 'searchBluetoothStatus' });
        const status = result?.data ?? null;
        if (status) setState({ searchBluetoothStatus: status as any });
      } catch {}
    }, 2000);
    return () => {
      clearInterval(t);
      void removeStorage({ key: 'searchBluetoothStatus' });
    };
  }, [setState]);

  useEffect(() => {
    if (
      searchBluetoothStatus === SEARCH_BLUETOOTH_STATUS.SEARCH_SUCCESS ||
      searchBluetoothStatus === SEARCH_BLUETOOTH_STATUS.SEARCH_FAILED ||
      startSearch
    ) {
      setState({ countdownTime: undefined });
    }
  }, [searchBluetoothStatus, startSearch, setState]);

  useEffect(() => {
    // 【关键修复】：这里原来只允许 iOS 触发自动搜索
    // 现在需要放开，让鸿蒙系统进来也自动执行 `startSearchDevice`，否则就不会发起搜索
    if (
      startSearchDevice &&
      searchRef &&
      (Platform.OS === 'ios' || isHarmonyOs) &&
      !startSearch
    ) {
      void startSearchDevice(searchRef);
    }
    return () => {
      void stopSearchBluetoothDevices(searchRef);
    };
  }, [startSearch, startSearchDevice, isHarmonyOs]);

  useEffect(() => {
    if (!isPaired) return;
    const timer = setTimeout(() => {
      void handleBindSuccess();
    }, 300);
    return () => clearTimeout(timer);
  }, [isPaired, handleBindSuccess]);

  return (
    <PageContainer
      backgroundColor="#ffffff"
      statusBarStyle="dark-content"
      safeAreaEdges={['top', 'bottom']}
      padding={0}
      pageNavProps={{
        text: '进入蓝牙配对',
        showBack: true,
        background: '#ffffff',
      }}
      footer={
        // iOS / 鸿蒙：先搜索，失败显示“重新搜索”，成功且无需 PIN 时显示“跳转设置”
        needScan ? (
          searchBluetoothStatus === SEARCH_BLUETOOTH_STATUS.SEARCH_FAILED ? (
            <Flex style={styles.footer} justify="center">
              <GradientButton
                colors={LOCK_BTN_COLORS[LOCK_STATUS.FALL_SUCCESS]}
                width={160}
                height={44}
                round={false}
                btnBorderRadius={16}
                onPress={() => resetSearch(searchRef)}
              >
                <Flex style={styles.btnText} justify="center" align="center">
                  <Text style={styles.btnTextInner}>重新搜索</Text>
                </Flex>
              </GradientButton>
            </Flex>
          ) : !!!needPin ? (
            <Flex direction="column" align="center" justify="center">
              <Text style={styles.footetText}>
                因机型不同，蓝牙搜索需要几分钟，请耐心等待
              </Text>
              <GradientButton
                colors={LOCK_BTN_COLORS[LOCK_STATUS.FALL_SUCCESS]}
                width={160}
                height={44}
                round={false}
                btnBorderRadius={16}
                onPress={() => handlePairing()}
              >
                <Flex style={styles.btnText} justify="center" align="center">
                  <Text style={styles.btnTextInner}>跳转设置</Text>
                </Flex>
              </GradientButton>
            </Flex>
          ) : undefined
        ) : undefined
      }
      scrollable={false}
    >
      <Flex direction="column" align="center" style={styles.content}>
        {!!!needPin ? (
          <>
            <View style={styles.iconWrapper2}>
              <AppIcon name="bluetooth-1" size={35} color="#333333" />
            </View>
            <Text style={styles.tipsLabel}>请确保地锁通电</Text>
            <View style={styles.btnPositionImageContent}>
              <Image
                source={{
                  uri: 'https://g.18qjz.cn/img/boklock/btn_position.png',
                }}
                style={styles.btnPositionImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.tipsLabel}>请连接以下蓝牙</Text>

            <Flex style={styles.infoSection} direction="column">
              <Flex style={styles.infoBox}>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>蓝牙名称</Text>
                  <Text style={styles.infoValue}>{bleName}</Text>
                </View>
              </Flex>
            </Flex>
          </>
        ) : (
          <>
            {needScan ? (
              <>
                <Image
                  source={{
                    uri: SEARCH_BLUETOOTH_STATUS_IMAGE[
                      searchBluetoothStatus
                    ] as string,
                  }}
                  style={{ width: 160, height: 160 }}
                  resizeMode="contain"
                />
                <Flex style={styles.countdownContainer}>
                  {searchBluetoothStatus ===
                  SEARCH_BLUETOOTH_STATUS.SEARCHING ? (
                    <>
                      <Text style={styles.countdownText}>正在连接中</Text>
                      <Text
                        style={[styles.countdownText, styles.countdownNumber]}
                      >
                        {Math.round(countdown / 1000)}s
                      </Text>
                    </>
                  ) : (
                    <Text style={styles.countdownText}>
                      {SEARCH_BLUETOOTH_STATUS_NAME[searchBluetoothStatus] ??
                        (searchBluetoothStatus ===
                        SEARCH_BLUETOOTH_STATUS.SEARCH_SUCCESS
                          ? '已找到设备'
                          : '搜索失败')}
                    </Text>
                  )}
                </Flex>

                {searchBluetoothStatus !==
                  SEARCH_BLUETOOTH_STATUS.SEARCH_SUCCESS && (
                  <Flex direction="column" style={styles.card}>
                    <Flex style={styles.rowMargin} align="center">
                      <View style={styles.dot} />
                      <Text style={styles.cardItemText}>
                        开启【{lockName || '未知名称'}】地锁电源
                      </Text>
                    </Flex>
                    <Flex style={styles.cardItem} align="center">
                      <View style={styles.dot} />
                      <Text style={styles.cardItemText}>
                        确认手机开启蓝牙，并靠近【{lockName || '未知名称'}】地锁
                      </Text>
                    </Flex>
                    <Flex style={styles.cardItem} align="center">
                      <View style={styles.dot} />
                      <Text style={styles.cardItemText}>
                        如果长时间未连接成功，请去系统设置蓝牙列表中忽略
                        <Text style={styles.deviceName}>"{bleName}"</Text>
                        ,并且重新搜索
                      </Text>
                    </Flex>
                  </Flex>
                )}
              </>
            ) : (
              <>
                <View style={styles.iconWrapper}>
                  <AppIcon name="bluetooth-1" size={32} color="#333333" />
                </View>
                <View style={styles.titleWrapper}>
                  <Text style={styles.title}>请确保地锁通电</Text>
                  <TouchableOpacity
                    style={styles.titleIcon}
                    onPress={() => powerIndicatorPopRef?.current?.open()}
                  >
                    <AppIcon name="explain" size={18} color="#333333" />
                    <Text style={styles.titleIconText}>通电指南</Text>
                  </TouchableOpacity>
                </View>

                <Flex style={styles.infoSection} direction="column">
                  <Flex style={styles.infoBox}>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>蓝牙名称</Text>
                      <Text style={styles.infoValue}>{bleName}</Text>
                    </View>
                  </Flex>
                </Flex>

                <Flex style={styles.infoSection} direction="column">
                  <Flex style={styles.infoBox}>
                    <View style={styles.infoContent}>
                      <Text style={styles.infoLabel}>PIN码</Text>
                      <Text style={styles.pinValue}>{pin}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={async () => {
                        await setClipboardData({ data: String(pin) });
                        await showToast({ title: '复制成功', icon: 'success' });
                      }}
                    >
                      <AppIcon name="copy1" size={20} color="#6b7280" />
                      <Text style={{ fontSize: 12, color: '#6b7280' }}>
                        点击复制
                      </Text>
                    </TouchableOpacity>
                  </Flex>
                </Flex>

                <Flex
                  style={(styles.footer, { marginTop: 8 })}
                  justify="center"
                >
                  <GradientButton
                    colors={LOCK_BTN_COLORS[LOCK_STATUS.FALL_SUCCESS]}
                    width={160}
                    height={44}
                    round={false}
                    btnBorderRadius={16}
                    onPress={() => handlePairing()}
                  >
                    <Flex
                      style={styles.btnText}
                      justify="center"
                      align="center"
                    >
                      <Text style={styles.btnTextInner}>跳转设置</Text>
                    </Flex>
                  </GradientButton>
                </Flex>

                <View style={styles.tips}>
                  <Text style={styles.tipsText}>
                    因机型不同，蓝牙搜索需要几分钟，请耐心等待
                  </Text>
                </View>

                <View style={styles.footerWrapper}>
                  <Image
                    source={{
                      uri: 'https://g.18qjz.cn/img/boklock/bluetooth_link.gif',
                    }}
                    style={{ width: '65%', height: 350 }}
                    resizeMode="contain"
                  />
                </View>
              </>
            )}
          </>
        )}
      </Flex>
      <PowerIndicatorPop ref={powerIndicatorPopRef} />
    </PageContainer>
  );
}
