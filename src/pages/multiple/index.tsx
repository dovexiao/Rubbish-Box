import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, Image, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/core';
import PageContainer from '@/components/PageContainer';
import Header from '@/components/Header';
import NoDevices from '@/components/NoDevices';
import Content from '@/components/Content';
import { getLockInfo } from '@/services/device';
import { unreadCount as fetchUnreadCount } from '@/services/user';
import Flex from '@/components/Flex';
import PopConfirm from '@/components/popConfirm';
import {
  reLaunch,
  cacheGetSync,
  eventCenter,
  loopFunc,
  getBluetoothDeviceInfo,
  setStorage,
  removeStorage,
} from '@/utils';
import LockVisual, {
  DeviceStatusFlags,
  LockVisualStatus,
} from '@/components/LockVisual';
import { LockInfoDTO } from '@/pages/index/typing';
import { FALL_STATUS } from '@/constants';
import { styles } from '@/pages/index/style';
import { checkIfDeviceIgnoredOnIOS } from '@/utils/api';

const Index = () => {
  const [loading, setLoading] = useState(false);
  const [hasDevice, setHasDevice] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [detail, setDetail] = useState<LockInfoDTO | undefined>(undefined);
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [guestMode, setGuestMode] = useState(false);
  const [currentDeviceStatus, setCurrentDeviceStatus] =
    useState<LockVisualStatus>('rise');
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatusFlags>({
    rising30: false,
    falling30: false,
    rising120: false,
    falling120: false,
    rising: false,
    falling: false,
    openCovering: false,
    closeCovering: false,
  });
  const [gifNonce, setGifNonce] = useState<number>(0);
  const [optioning, setOptioning] = useState<boolean>(false);
  const optioningRef = useRef<boolean>(false);
  const [isAutoOpenBluetooth, setIsAutoOpenBluetooth] =
    useState<boolean>(false);
  const [error, setError] = useState<{
    code?: number | string;
    message?: string;
  } | null>(null);

  useEffect(() => {
    optioningRef.current = optioning;
  }, [optioning]);

  const load = useCallback(
    async (id?: number, options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setLoading(true);
      }
      try {
        // 获取首页锁信息
        const params: any = { type: 2 };
        if (id !== undefined) {
          params.id = id;
        }
        const lockRes = await getLockInfo(params as any);
        if (lockRes.success && lockRes.code === 200 && lockRes.data) {
          setDetail(lockRes.data);
          setHasDevice(lockRes.data?.hasDevice);
          setError(null);
          setCurrentDeviceStatus(() => {
            const powerType = lockRes.data?.powerType;
            const coverStatus = lockRes.data?.coverStatus;
            const fallStatus = lockRes.data?.fallStatus;
            // 非市电版本：只展示静态升起图
            if (powerType !== 1) {
              return 'rise';
            }
            // 市电版本 & 盖子已打开
            if (coverStatus === 1 && powerType === 1) {
              return 'openCover';
            }
            // 根据 fallStatus 判定
            switch (fallStatus) {
              case FALL_STATUS.RISE:
                return 'rise';
              case FALL_STATUS.FALL_SUCCESS:
                return 'fall';
              case FALL_STATUS.RISE_30:
                return 'rise30';
              case FALL_STATUS.RISE_120:
                return 'rise120';
              default:
                return 'rise';
            }
          });
        } else if (lockRes.code === 520 || lockRes.code === 522) {
          setDetail(undefined);
          setHasDevice(false);
          setError(null);
        } else {
          setDetail(undefined);
          setHasDevice(false);
          setError({
            code: lockRes.code,
            message: lockRes.message || lockRes.msg || '加载设备信息失败',
          });
        }

        // 获取未读消息数
        const unreadRes = await fetchUnreadCount({} as any);
        if (unreadRes.success && unreadRes.code === 200) {
          setUnreadCount(Number(unreadRes.data || 0));
        } else {
          setUnreadCount(0);
        }
      } catch (e) {
        setHasDevice(false);
        setDetail(undefined);
        setError({ message: '网络异常，请稍后重试' });
        console.error(e);
      } finally {
        if (!options?.silent) {
          setLoading(false);
        }
      }
    },
    [],
  );

  useFocusEffect(
    useCallback(() => {
      let stopped = false;
      let first = true;

      const poller = loopFunc(async () => {
        if (stopped) return false;

        // 操作中暂停 10s 轮询请求（但不停止定时器），避免操作过程被后台刷新打断
        if (optioningRef.current) return true;

        const silent = !first;
        first = false;
        try {
          const [token, guest] = await Promise.all([
            cacheGetSync('token'),
            cacheGetSync('guestMode'),
          ]);
          if (stopped) return false;

          const hasTokenFlag = !!token;
          const guestFlag = guest === true;
          setHasToken(hasTokenFlag);
          setGuestMode(guestFlag);

          if (hasTokenFlag) {
            await load(undefined, { silent });
            return true;
          }

          if (!silent) {
            setLoading(false);
            setHasDevice(false);
            setDetail(undefined);
            setError(null);
          }
          return false;
        } catch {
          if (stopped) return false;
          if (!silent) {
            setHasToken(false);
            setGuestMode(false);
            setLoading(false);
            setHasDevice(false);
            setDetail(undefined);
            setError({ message: '初始化失败，请稍后重试' });
          }
          return true;
        }
      }, 10000);

      poller.start();

      return () => {
        stopped = true;
        poller.stop();
      };
    }, [load]),
  );

  const showGuestWelcome = !hasToken && guestMode;

  const guestPopupRef = useRef<any>(null);
  const animationTimer = useRef<any>(null);
  const prefetchTimer = useRef<any>(null);
  const prefetchPromise = useRef<Promise<any> | null>(null);
  const animationSeq = useRef(0);
  const detailIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    detailIdRef.current = detail?.id;
  }, [detail?.id]);

  const onAnimationEnd = () => {
    setDeviceStatus(prev => ({
      ...prev,
      rising: false,
      falling: false,
      openCovering: false,
      closeCovering: false,
      rising30: false,
      falling30: false,
      rising120: false,
      falling120: false,
    }));
    setOptioning(false);
    if (prefetchTimer.current) {
      clearTimeout(prefetchTimer.current);
      prefetchTimer.current = null;
    }
    const p = prefetchPromise.current;
    prefetchPromise.current = null;
    if (p) {
      p.catch(() => {});
    } else {
      load(detailIdRef.current, { silent: true }).catch(() => {});
    }
  };
  const onAnimation = useCallback(
    ({
      type,
      value,
    }: {
      type:
        | 'rising'
        | 'falling'
        | 'openCovering'
        | 'closeCovering'
        | 'rising30'
        | 'falling30'
        | 'rising120'
        | 'falling120';
      value: boolean;
    }) => {
      setDeviceStatus(prev => ({
        ...prev,
        rising: false,
        falling: false,
        openCovering: false,
        closeCovering: false,
        rising30: false,
        rising120: false,
        falling30: false,
        falling120: false,
        [type]: value,
      }));
      setGifNonce(prev => prev + 1);
      animationSeq.current += 1;
      const seq = animationSeq.current;
      if (prefetchTimer.current) {
        clearTimeout(prefetchTimer.current);
        prefetchTimer.current = null;
      }
      prefetchPromise.current = null;
      prefetchTimer.current = setTimeout(() => {
        if (animationSeq.current !== seq) return;
        const p = load(detailIdRef.current, { silent: true });
        prefetchPromise.current = p;
        p.catch(() => {});
      }, 1400);
      if (animationTimer.current) {
        clearTimeout(animationTimer.current);
        animationTimer.current = null;
      }
      animationTimer.current = setTimeout(() => {
        onAnimationEnd();
      }, 1830);
    },
    [],
  );

  const onOptioned = useCallback(
    (option: boolean) => {
      setOptioning(option);
    },
    [setOptioning],
  );

  useEffect(() => {
    eventCenter.on('onAnimation', onAnimation);
    eventCenter.on('onOptioned', onOptioned);

    return () => {
      eventCenter.off('onAnimation', onAnimation);
      eventCenter.off('onOptioned', onOptioned);
      if (animationTimer.current) {
        clearTimeout(animationTimer.current);
        animationTimer.current = null;
      }
      if (prefetchTimer.current) {
        clearTimeout(prefetchTimer.current);
        prefetchTimer.current = null;
      }
      prefetchPromise.current = null;
    };
  }, [onOptioned, onAnimation]);

  const bgImageUri = detail?.imageMap?.bgPng;
  const bgImage =
    bgImageUri && bgImageUri !== 'null' ? { uri: bgImageUri } : undefined;

  const hasBluetoothAutoOpen = async () => {
    const deviceMap = (await getBluetoothDeviceInfo().catch(() => ({}))) || {};
    const rawList = (detail as any)?.bleNoList;
    const bleNoList = Array.isArray(rawList)
      ? rawList
          .map((item: any) => String(item || '').trim())
          .filter((item: string) => !!item)
      : [];
    const fallbackBleNo = String((detail as any)?.bleNo || '').trim();
    const targets = Array.from(
      new Set(
        bleNoList.length > 0 ? bleNoList : fallbackBleNo ? [fallbackBleNo] : [],
      ),
    );

    if (targets.length === 0) {
      setIsAutoOpenBluetooth(false);
      return;
    }

    let hasInvalid = false;
    let nextDeviceMap: Record<string, any> = { ...(deviceMap as any) };

    for (const bleNo of targets) {
      const savedDeviceInfo = (deviceMap as any)?.[bleNo];
      const deviceId = savedDeviceInfo?.deviceId;
      const bleName = String(
        savedDeviceInfo?.name || savedDeviceInfo?.localName || '',
      );

      const res = await checkIfDeviceIgnoredOnIOS(
        deviceId,
        bleNo,
        bleName,
      ).catch(() => ({ isIgnored: true }));
      const invalid =
        !deviceId || !!res?.isIgnored || !savedDeviceInfo?.isPaired;

      if (invalid) {
        hasInvalid = true;
        if (nextDeviceMap[bleNo]) {
          const { [bleNo]: _, ...rest } = nextDeviceMap;
          nextDeviceMap = rest;
        }
      }
    }

    if (hasInvalid) {
      await setStorage({ key: 'bluetoothDeviceInfoList', data: nextDeviceMap });
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        await removeStorage({ key: 'bluetoothDeviceInfo' });
      }
      setIsAutoOpenBluetooth(false);
      return;
    }

    setIsAutoOpenBluetooth(true);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    timer = setInterval(hasBluetoothAutoOpen, 1000);
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [hasBluetoothAutoOpen]);

  return (
    <PageContainer
      backgroundColor={bgImage ? 'transparent' : '#f6f7fa'}
      style={styles.pageContainer}
      loading={loading}
      error={error}
      safeAreaEdges={['top']}
      fullScreenError={!showGuestWelcome && !hasDevice && !loading}
      onRetry={() => {
        void load();
      }}
      backgroundImage={detail?.id ? bgImage : undefined}
      statusBarStyle={!detail?.id ? 'dark-content' : undefined}
    >
      {showGuestWelcome ? (
        <View style={styles.guestContainer}>
          <Text style={styles.guestTitle}>欢迎使用 泊刻地锁</Text>
          <Flex
            align="center"
            justify="center"
            style={styles.guestAddBtn}
            isTouchView
            onPress={() => {
              guestPopupRef.current?.open?.();
            }}
          >
            <Image
              source={{ uri: 'https://g.18qjz.cn/img/boklock/device_add.png' }}
              style={styles.guestAddImage}
              resizeMode="contain"
            />
          </Flex>
          <Text style={styles.guestToast}>来添加你的第一台地锁吧！</Text>
          <Flex
            isTouchView
            justify="center"
            align="center"
            style={styles.guestLoginBtn}
            onPress={() => {
              reLaunch('Login');
            }}
          >
            <Text style={styles.guestLoginText}>登录</Text>
          </Flex>
          <PopConfirm
            ref={guestPopupRef}
            title="请登录后扫码添加地锁"
            cancelText="暂不登录"
            confirmText="登录"
            onConfirm={() => {
              guestPopupRef.current?.close?.();
              reLaunch('Login');
            }}
          />
        </View>
      ) : (
        <>
          {/* 主体内容 */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <Header
              unreadCount={unreadCount}
              lockInfo={detail}
              noDevices={detail && detail?.id ? false : true}
            />
            {detail && detail?.id ? (
              <Content
                key={'multiple'}
                detail={detail}
                reload={id => {
                  void load(id);
                }}
                optioning={optioning}
                isMultiple={true}
                isAutoOpenBluetooth={isAutoOpenBluetooth}
                currentDeviceStatus={currentDeviceStatus}
              >
                <LockVisual
                  detail={detail}
                  currentDeviceStatus={currentDeviceStatus}
                  deviceStatus={deviceStatus}
                  inconsistentStatus={false}
                  gifNonce={gifNonce}
                />
              </Content>
            ) : (
              <NoDevices unreadCount={unreadCount} hasDevice />
            )}
          </ScrollView>
        </>
      )}
    </PageContainer>
  );
};

export default Index;
