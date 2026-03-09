import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
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
  getBluetoothDeviceInfo,
  setStorage,
  removeStorage,
  loopFunc,
} from '@/utils';
import LockVisual, {
  DeviceStatusFlags,
  LockVisualStatus,
} from '@/components/LockVisual';
import { LockInfoDTO } from './typing';
import { FALL_STATUS } from '@/constants';
import { styles } from './style';
import { checkIfDeviceIgnoredOnIOS } from '@/utils/api';
import { useRoute } from '@react-navigation/native';
import { useAppNavigation } from '@/hooks/useAppNavigation';

/**
 * 首页（单个设备）：
 * - 周期性拉取锁详情（getLockInfo），并计算当前静态展示状态 currentDeviceStatus
 * - 订阅 eventCenter 的 onAnimation/onOptioned 事件，驱动 LockVisual 播放动图与按钮禁用
 * - 动画期间预取一次详情，尽量在动画结束时刻切到最新静态图
 */
const Index = () => {
  const route = useRoute<any>();
  const navigation = useAppNavigation();
  const lockId = (() => {
    const raw = route?.params?.lockId;
    const parsed = typeof raw === 'string' ? Number(raw) : raw;
    return Number.isFinite(parsed) ? (parsed as number) : undefined;
  })();

  const [loading, setLoading] = useState(false);
  const [hasDevice, setHasDevice] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [detail, setDetail] = useState<LockInfoDTO | undefined>(undefined);
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [guestMode, setGuestMode] = useState(false);
  const [isAutoOpenBluetooth, setIsAutoOpenBluetooth] = useState<boolean>(true);
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
  const [error, setError] = useState<{
    code?: number | string;
    message?: string;
  } | null>(null);

  useEffect(() => {
    optioningRef.current = optioning;
  }, [optioning]);

  /**
   * 拉取首页需要的后端数据：
   * - 锁详情：getLockInfo(type=1)，并写入 detail
   * - 未读数：fetchUnreadCount
   *
   * 静态图展示依赖 currentDeviceStatus，由详情中的 powerType/coverStatus/fallStatus 推导。
   */
  const load = useCallback(
    async (id?: number, options?: { silent?: boolean }) => {
      if (!options?.silent) {
        setLoading(true);
      }
      try {
        // 获取首页锁信息
        const lockRes = id
          ? await getLockInfo({ type: 1, id } as any)
          : await getLockInfo({ type: 1 } as any);
        // 清除路由栈中的跳转参数
        (navigation as any)?.setParams?.({ lockId: undefined });
        if (lockRes.success && lockRes.code === 200 && lockRes.data) {
          if (lockRes.data?.isGroup) {
            reLaunch('Multiple', { lockId: lockRes.data.id });
            return;
          }
          setDetail(lockRes.data);
          setHasDevice(true);
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

  /**
   * 页面聚焦后，每 10s 轮询一次：
   * - 读取 token/guestMode 决定是否展示游客引导
   * - 登录态下 silent=true（除首次）刷新锁详情，保证首页数据是最新的
   */
  useFocusEffect(
    useCallback(() => {
      console.log('轮询');
      let stopped = false;
      let first = true;

      const poller = loopFunc(async () => {
        // loopFunc 约定：return true 表示继续下一轮；return false 表示停止轮询
        if (stopped) return false;

        // 操作中暂停 10s 轮询请求（但不停止定时器），避免操作过程被后台刷新打断
        if (optioningRef.current) return true;

        // 首次进入页面：silent=false（允许出现 loading）；后续轮询：silent=true（静默刷新，避免 UI 抖动）
        const silent = !first;
        first = false;
        try {
          // 同时读取登录态与游客模式开关，用于决定首页应展示的 UI
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
            // 已登录：刷新首页锁详情（含 currentDeviceStatus 推导）与未读数
            await load(lockId, { silent });
            return true;
          }

          if (!silent) {
            // 未登录且首次进入：清空设备态，交给下方 UI 渲染游客引导/空态
            setLoading(false);
            setHasDevice(false);
            setDetail(undefined);
            setError(null);
          }
          // 未登录时停止轮询，避免无 token 场景持续请求接口
          return false;
        } catch {
          if (stopped) return false;
          if (!silent) {
            // 首次进入且初始化失败：展示错误态；后续 silent 轮询失败不打断当前页面展示
            setHasToken(false);
            setGuestMode(false);
            setLoading(false);
            setHasDevice(false);
            setDetail(undefined);
            setError({ message: '初始化失败，请稍后重试' });
          }
          // 异常场景继续轮询，让网络恢复后能自动拉起首页数据
          return true;
        }
      }, 10000);

      poller.start();

      return () => {
        // 卸载/失焦时停止轮询，防止 setState 发生在卸载后
        stopped = true;
        poller.stop();
      };
    }, [load, lockId]),
  );

  const showGuestWelcome = !hasToken && guestMode;

  /**
   * onAnimation/onAnimationEnd：控制 LockVisual 动图播放与结束时刻
   * - deviceStatus：决定展示哪一种动图（rising/falling/openCovering...）
   * - gifNonce：作为 url nonce，确保同一 gif 能重复播放（绕开缓存）
   * - optioning：操作中禁用按钮（由 Content 触发 eventCenter.onOptioned）
   * - 预取：动画进行到 1400ms 左右时提前拉一次详情，尽量让静态图在动画结束瞬间就能切到最新状态
   */
  const guestPopupRef = useRef<any>(null);
  const animationTimer = useRef<any>(null);
  const prefetchTimer = useRef<any>(null);
  const prefetchPromise = useRef<Promise<any> | null>(null);
  const animationSeq = useRef(0);
  const detailIdRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    detailIdRef.current = detail?.id;
  }, [detail?.id]);

  const onAnimationEnd = async () => {
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
    // 如果动画期间已经触发过预取 load()，这里不强制重复请求；
    // load() 内部会自行更新 detail/currentDeviceStatus。
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
      // 开始动画前先清空其它动图开关，保证同一时刻只有一种动图显示
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

      // 为本次动画生成序列号，用于丢弃过期的预取定时器
      animationSeq.current += 1;
      const seq = animationSeq.current;
      if (prefetchTimer.current) {
        clearTimeout(prefetchTimer.current);
        prefetchTimer.current = null;
      }
      prefetchPromise.current = null;

      // 动画接近尾声时预取一次详情：让静态图更可能在动图结束瞬间就展示到最终状态
      prefetchTimer.current = setTimeout(() => {
        if (animationSeq.current !== seq) return;
        const p = load(detailIdRef.current, { silent: true });
        prefetchPromise.current = p;
        p.catch(() => {});
      }, 1400);

      // 动画结束时刻：重置动图标记 + 触发最终详情刷新/消费预取
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

  /**
   * Content 与页面解耦：
   * - Content 在用户点击“升/降锁”等操作时触发 eventCenter.trigger('onOptioned'/'onAnimation')
   * - 页面负责把这些事件映射为 state（deviceStatus/optioning/gifNonce）
   * - LockVisual 只根据 props（currentDeviceStatus/deviceStatus/gifNonce）渲染静图/动图
   */
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
    const result = await getBluetoothDeviceInfo().catch(() => ({}));
    const bleNo = String(detail?.bleNo || '');
    // @ts-ignore
    const savedDeviceInfo = result?.[bleNo];
    const deviceId = savedDeviceInfo?.deviceId;
    const res = await checkIfDeviceIgnoredOnIOS(deviceId, bleNo);

    if (!deviceId || res.isIgnored || !savedDeviceInfo?.isPaired) {
      const deviceMap =
        (await getBluetoothDeviceInfo().catch(() => null)) || {};
      if (deviceMap[bleNo]) {
        const { [bleNo]: _, ...rest } = deviceMap;
        setStorage({ key: 'bluetoothDeviceInfoList', data: rest });
      }
      removeStorage({ key: 'bluetoothDeviceInfo' });
      setIsAutoOpenBluetooth(false);
    } else {
      setIsAutoOpenBluetooth(true);
    }
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
      fullScreenError={!showGuestWelcome && !hasDevice && !loading}
      onRetry={() => {
        void load();
      }}
      backgroundImage={bgImage}
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
        //  主体内容
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content]}
        >
          <Header
            unreadCount={unreadCount}
            lockInfo={detail}
            noDevices={hasDevice && detail?.id ? false : true}
          />
          {hasDevice && detail?.id ? (
            <Content
              key={'single'}
              detail={detail}
              reload={async (id?: number) => {
                await load(id);
              }}
              optioning={optioning}
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
            <NoDevices unreadCount={unreadCount} hasDevice={hasDevice} />
          )}
        </ScrollView>
      )}
    </PageContainer>
  );
};

export default Index;
