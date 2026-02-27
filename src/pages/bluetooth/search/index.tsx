import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Text, TouchableOpacity, View, Platform } from 'react-native';
import dayjs from 'dayjs';
import PageContainer from '@/components/PageContainer';
import Flex from '@/components/Flex';
import GradientButton from '@/components/GradientButton';
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
} from '@/utils';
import { openBluetoothProximity } from '@/services';
import IconFont from '@/iconfont';
import {
  LOCK_BTN_COLORS,
  LOCK_STATUS,
  // SEARCH_BLUETOOTH_STATUS,
  SEARCH_BLUETOOTH_STATUS_IMAGE,
  SEARCH_BLUETOOTH_STATUS_NAME,
} from '@/constants';
import PowerIndicatorPop from '@/components/powerIndicatorPop';
import { stringify } from '@/utils/stringify';
import {
  getStorage as getStorageRaw,
  removeStorage,
  setStorage,
  showToast,
} from '@/utils';
import styles from './style';
import { PopCenterRef } from '@/components/PopCenter';

const SEARCH_BLUETOOTH_STATUS = {
  SEARCHING: 'searching',
  SEARCH_SUCCESS: 'searchSuccess',
  SEARCH_FAILED: 'searchFailed',
};

const getStorage = async (options: { key: string }) => {
  const data = await getStorageRaw<any>(options);
  return { data };
};

const setClipboardData = async (options: { data: string }) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const Clipboard = require('@react-native-clipboard/clipboard').default;
    if (Clipboard?.setString) {
      Clipboard.setString(String(options.data));
    }
  } catch {}
};

const tipsUserOperation = async (options: {
  title?: string;
  content?: string;
}) => {
  showToast({ title: options.content || options.title || '', icon: 'none' });
};

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
    let timer: any = null;
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

export default function BluetoothSearch(props: any) {
  const router = props?.route as {
    key: string;
    name: string;
    params: {
      bleNo: string;
      lockName: string;
      lockId: number;
      imageMap: Record<string, string>;
      pin: string;
      mode: number;
      bleName: string;
      deviceNo: string;
      role: string;
    };
  };
  console.log(router, '这是search的路由参数');
  const navigation = props?.navigation as any;

  const [state, setStateInner] = useState({
    bindSuccess: false,
    isPaired: false,
    countdownTime: dayjs().add(120, 'seconds').valueOf() as unknown as number,
    searchBluetoothStatus:
      SEARCH_BLUETOOTH_STATUS.SEARCHING as keyof typeof SEARCH_BLUETOOTH_STATUS,
    needScan: Platform.OS === 'ios' ? true : false,
  });

  const setState = useCallback((patch: Partial<typeof state>) => {
    setStateInner(prev => ({
      ...prev,
      ...patch,
    }));
  }, []);

  const init = useCallback(async () => {
    try {
      const res = (await getSavedDeviceInfo().catch(() => null)) || {};
      const info = await getSystemConnectedDevices();
      const isPaired =
        info.data?.some((item: any) => item.deviceId === res.deviceId) || false;
      setState({
        isPaired: isPaired,
      });
    } catch (error) {
      console.error('初始化蓝牙失败', error);
    }
  }, [setState]);

  const checkReturnFromSettings = useCallback(async () => {
    try {
      const rnReLaunchPathRes = await getStorage({
        key: 'rnReLaunchPath',
      }).catch(() => null);
      if (!rnReLaunchPathRes?.data) {
        return;
      }

      const data = rnReLaunchPathRes.data as {
        path?: string;
        params?: Record<string, any>;
      };

      const currentPath = String(router?.name || 'search').toLowerCase();
      if (!currentPath || !data.path || !currentPath.includes('search')) {
        return;
      }

      await setStorage({ key: 'rnReLaunchPathProcessing', data: true }).catch(
        () => {},
      );

      const savedDeviceInfo =
        (await getSavedDeviceInfo().catch(() => null)) || {};
      const bleNo = router.params?.['bleNo'] as string;
      const info = await getSystemConnectedDevices();
      const isPaired =
        info.data?.some(
          (item: any) =>
            isSameMac(item.deviceId, bleNo) ||
            isSameMac(item.deviceId, savedDeviceInfo.deviceId),
        ) || false;

      const deviceInfo = info.data?.find(
        (item: any) =>
          isSameMac(item.deviceId, bleNo) ||
          isSameMac(item.deviceId, savedDeviceInfo.deviceId),
      );

      if (isPaired && (savedDeviceInfo.deviceId || bleNo)) {
        await removeStorage({ key: 'rnReLaunchPath' }).catch(() => {});
        setState({
          isPaired: true,
        });
        await setStorage({
          key: 'bluetoothDeviceInfo',
          data: {
            bleNo: bleNo,
            deviceId: deviceInfo.deviceId,
            name: deviceInfo.name || deviceInfo.localName,
            imageMap: router.params?.['imageMap'],
            isPaired: isPaired,
          },
        });
      } else {
        await removeStorage({ key: 'rnReLaunchPath' }).catch(() => {});
      }

      await removeStorage({ key: 'rnReLaunchPathProcessing' }).catch(() => {});
    } catch (error) {
      console.error('检查系统设置返回状态失败:', error);
      await removeStorage({ key: 'rnReLaunchPathProcessing' }).catch(() => {});
    }
  }, [router?.name, router.params, setState]);

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
        console.log('匹配设备失败:', error);
      }
    },
    [setState],
  );

  const searchBluetoothDevicesEnd = useCallback(
    async (searchRef?: any) => {
      if (state.searchBluetoothStatus === SEARCH_BLUETOOTH_STATUS.SEARCHING) {
        setState({
          searchBluetoothStatus:
            SEARCH_BLUETOOTH_STATUS.SEARCH_FAILED as keyof typeof SEARCH_BLUETOOTH_STATUS,
        });
      }
      if (searchRef) {
        try {
          await stopSearchBluetoothDevices(searchRef);
        } catch (error) {
          console.log('停止扫描失败:', error);
        }
      }
    },
    [setState, state.searchBluetoothStatus],
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
    let timer: any = null;

    const runOnFocus = () => {
      if (timer) clearTimeout(timer);
      void init();
      timer = setTimeout(() => {
        void checkReturnFromSettings();
      }, 300);
    };

    runOnFocus();
    const unsubscribe = navigation.addListener('focus', runOnFocus);

    return () => {
      if (timer) clearTimeout(timer);
      unsubscribe();
    };
  }, [checkReturnFromSettings, init, navigation]);

  const {
    lockName,
    bleNo,
    lockId,
    deviceNo,
    imageMap,
    pin,
    mode,
    role,
    bleName,
  } = router.params || {};

  const powerIndicatorPopRef = useRef<PopCenterRef>(null);
  const {
    countdownTime,
    searchBluetoothStatus,
    bindSuccess,
    isPaired,
    needScan,
  } = state;

  const [startSearch, setStartSearch] = useState(false);

  const searchRef = useRef({
    found: async (res: any) => {
      if (res.devices && res.devices.length > 0) {
        const targetDevice = res.devices.find(
          (device: any) =>
            (device.deviceId && device.deviceId.includes(bleNo)) ||
            (device.manufacturerData &&
              parseMacFromBase64(
                (device.manufacturerData as string) || '',
              )?.includes(bleNo as string)) ||
            (device.advertisData &&
              parseMacFromAdvertisData(device.advertisData)?.includes(
                bleNo as string,
              )),
        );

        if (targetDevice) {
          try {
            await setStorage({
              key: 'bluetoothDeviceInfo',
              data: {
                deviceNo: deviceNo,
                bleNo: bleNo,
                deviceId: targetDevice.deviceId,
                name: targetDevice.name || targetDevice.localName,
                imageMap: imageMap,
                isPaired: false,
              },
            });
          } catch (error) {
            console.log('保存设备信息失败:', error);
          }

          try {
            await stopSearchBluetoothDevices(searchRef);
          } catch (error) {
            console.log('停止扫描失败:', error);
          }
        }
        setState({
          searchBluetoothStatus:
            SEARCH_BLUETOOTH_STATUS.SEARCH_SUCCESS as keyof typeof SEARCH_BLUETOOTH_STATUS,
          countdownTime: undefined,
          needScan: false,
        });
      } else {
        console.log('没有扫描到任何设备');
      }
    },
  });

  const handleTipsUserOperation = async (deviceName: string, pin: string) => {
    try {
      await tipsUserOperation({
        title: '温馨提示',
        content: `进入设置首页 > 找到蓝牙并进入 > 找到${deviceName}蓝牙名称，输入${pin}进行配对`,
      });
    } catch (error) {
      console.error('发送提示消息失败:', error);
    }
  };

  const handlePairing = async (): Promise<void> => {
    await remenberPath({
      path: router?.name,
      params: router?.params,
      value: {
        ...router?.params,
      },
    });
    await openBluetoothSettings();
    await handleTipsUserOperation(lockName || '', pin || '');
  };

  const handleBindSucess = async () => {
    try {
      const deviceInfo = (await getSavedDeviceInfo().catch(() => null)) || {};

      const res = await connectBluetoothDevice(deviceInfo.deviceId);
      if (!res.success) {
        showToast({
          title: res.error?.message || '连接设备失败',
          icon: 'none',
        });
        return;
      }

      const bluetoothDeviceInfoList =
        (await getBluetoothDeviceInfo().catch(() => null)) || {};
      try {
        if (bleNo) {
          const newMap = { ...(bluetoothDeviceInfoList || {}) };
          newMap[bleNo] = {
            ...deviceInfo,
            isPaired: true,
          };
          await setStorage({ key: 'bluetoothDeviceInfoList', data: newMap });
        }
      } catch (e) {
        console.error('更新 bluetoothDeviceInfoList 映射失败:', e);
      }
      if (role === '1' && !mode) {
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
      await removeStorage({ key: 'rnReLaunchPathProcessing' }).catch(() => {});

      if (mode) {
        showToast({ title: '连接成功', icon: 'success' });
        navigation.navigate('BluetoothLinkSuccess');
      } else {
        showToast({ title: '自动升降开启成功', icon: 'success' });
        navigation.navigate('BluetoothControl', {
          lockName,
          bluetoothHasOpen: true,
          role,
          bleNo,
          imageMap,
          pin,
          lockId,
          bindSuccessStatus: true,
        });
      }
    } catch (error) {
      console.error('连接失败:', error);
      await removeStorage({ key: 'rnReLaunchPathProcessing' }).catch(() => {});
    }
  };

  const [countdown] = useCountDown({
    onEnd: () => {
      void searchBluetoothDevicesEnd(searchRef);
    },
    targetDate: countdownTime,
  });

  useEffect(() => {
    const foundStatusInterval = setInterval(async () => {
      try {
        let status: any = null;
        const result = await getStorage({ key: 'searchBluetoothStatus' });
        status = result?.data || null;
        if (status) {
          setState({
            searchBluetoothStatus: status as any,
          });
        }
      } catch (error: any) {
        if (String(error?.errMsg || '').includes('data not found')) {
          return;
        }
      }
    }, 2000);
    return () => {
      clearInterval(foundStatusInterval);
      void removeStorage({ key: 'searchBluetoothStatus' });
    };
  }, [setState]);

  useEffect(() => {
    if (
      searchBluetoothStatus === SEARCH_BLUETOOTH_STATUS.SEARCH_SUCCESS ||
      searchBluetoothStatus === SEARCH_BLUETOOTH_STATUS.SEARCH_FAILED ||
      startSearch
    ) {
      setState({
        countdownTime: undefined,
      });
    }
  }, [searchBluetoothStatus, startSearch, setState]);

  useEffect(() => {
    if (
      startSearchDevice &&
      searchRef &&
      Platform.OS === 'ios' &&
      !startSearch
    ) {
      void startSearchDevice(searchRef);
    }

    return () => {
      try {
        void stopSearchBluetoothDevices(searchRef);
      } catch (error) {
        console.log('停止扫描失败:', error);
      }
    };
  }, [startSearch, startSearchDevice]);

  useEffect(() => {
    if (isPaired) {
      const timer = setTimeout(() => {
        void handleBindSucess();
      }, 300);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isPaired]);

  return (
    <PageContainer
      backgroundColor={'#ffffff'}
      statusBarStyle="dark-content"
      safeAreaEdges={['top', 'bottom']}
      padding={0}
      pageNavProps={{
        text: '连接蓝牙设备',
        showBack: true,
        background: '#ffffff',
      }}
      footer={
        needScan &&
        searchBluetoothStatus !== SEARCH_BLUETOOTH_STATUS.SEARCH_SUCCESS ? (
          <Flex style={styles.footer} justify={'center'}>
            <GradientButton
              colors={LOCK_BTN_COLORS[LOCK_STATUS.FALL_SUCCESS]}
              width={160}
              height={44}
              round={false}
              btnBorderRadius={16}
              onPress={async () => {
                resetSearch(searchRef);
              }}
            >
              <Flex style={styles.btnText} justify="center" align="center">
                <Text style={styles.btnTextInner}>重新搜索</Text>
              </Flex>
            </GradientButton>
          </Flex>
        ) : undefined
      }
      scrollable={false}
    >
      <Flex direction={'column'} align={'center'} style={styles.content}>
        {needScan ? (
          <>
            <TouchableOpacity>
              <Image
                source={{
                  uri: SEARCH_BLUETOOTH_STATUS_IMAGE[
                    searchBluetoothStatus
                  ] as string,
                }}
                style={{ width: 320, height: 320 }}
                resizeMode="contain"
              />
            </TouchableOpacity>
            <Flex style={styles.countdownContainer}>
              {searchBluetoothStatus === SEARCH_BLUETOOTH_STATUS.SEARCHING ? (
                <>
                  <Text style={styles.countdownText}>正在连接中</Text>
                  <Text style={[styles.countdownText, styles.countdownNumber]}>
                    {Math.round(countdown / 1000)}s
                  </Text>
                </>
              ) : (
                <Text style={styles.countdownText}>
                  {SEARCH_BLUETOOTH_STATUS_NAME[searchBluetoothStatus]}
                </Text>
              )}
            </Flex>

            {searchBluetoothStatus !==
              SEARCH_BLUETOOTH_STATUS.SEARCH_SUCCESS && (
              <Flex direction={'column'} style={styles.card}>
                <Flex style={styles.rowMargin} align={'center'}>
                  <View style={styles.dot}></View>
                  <Text style={styles.cardItemText}>
                    开启【{lockName || '未知名称'}】地锁电源
                  </Text>
                </Flex>
                <Flex style={styles.cardItem} align={'center'}>
                  <View style={styles.dot}></View>
                  <Text style={styles.cardItemText}>
                    确认手机开启蓝牙，并靠近【{lockName || '未知名称'}】地锁
                  </Text>
                </Flex>
                <Flex style={styles.cardItem} align={'center'}>
                  <View style={styles.dot}></View>
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
              <IconFont name="bluetooth-1" size={64} color="#333333" />
            </View>
            <View style={styles.titleWrapper}>
              <Text style={styles.title}>请确保地锁通电</Text>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.titleIcon}
                onPress={() => powerIndicatorPopRef?.current?.open()}
              >
                <IconFont name="explain" size={36} color="#333333" />
                <Text style={styles.titleIconText}>通电指南</Text>
              </TouchableOpacity>
            </View>

            <Flex style={styles.infoSection} direction={'column'}>
              <Flex style={styles.infoBox}>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>蓝牙名称</Text>
                  <Text style={styles.infoValue}>{bleName}</Text>
                </View>
              </Flex>

              <Flex style={styles.infoBox} align={'center'} justify={'between'}>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>PIN码</Text>
                  <Text style={styles.pinValue}>{pin}</Text>
                </View>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.copyButton}
                  onPress={() => {
                    void setClipboardData({
                      data: String(pin),
                    });
                    showToast({ title: '复制成功', icon: 'success' });
                  }}
                >
                  <IconFont name="copy1" size={40} color="#6b7280" />
                  <Text style={styles.copyText}>点击复制</Text>
                </TouchableOpacity>
              </Flex>
            </Flex>

            <Flex style={styles.footer} justify={'center'}>
              <GradientButton
                colors={LOCK_BTN_COLORS[LOCK_STATUS.FALL_SUCCESS]}
                width={160}
                height={44}
                round={false}
                btnBorderRadius={16}
                onPress={async () => {
                  handlePairing();
                }}
              >
                <Flex style={styles.btnText} justify="center" align="center">
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
                style={{
                  width: '65%',
                  height: 350,
                }}
                resizeMode="contain"
              />
            </View>
          </>
        )}
      </Flex>
      <PowerIndicatorPop ref={powerIndicatorPopRef} />
    </PageContainer>
  );
}
