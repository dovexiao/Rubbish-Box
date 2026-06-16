import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, ScrollView, Image, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/core';
import FastImage from 'react-native-fast-image';
import PageContainer from '@/components/PageContainer';
import Header from '@/components/Header';
import NoDevices from '@/components/NoDevices';
import Content from '@/components/Content';
import { getLockInfo } from '@/services/device';
import { unreadCount as fetchUnreadCount } from '@/services/user';
import Flex from '@/components/Flex';
import PopConfirm from '@/components/popConfirm';
import {
  cacheGetSync,
  eventCenter,
  getBluetoothDeviceInfo,
  getStorage,
  setStorage,
  removeStorage,
  loopFunc,
  initAMapSdk,
  initAMapGeolocation,
  requestBluetoothPermissions,
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
import { getSystemConnectedDevices, getBluetoothState } from '@/utils/api';
import { showMessageNoticeDialog } from '@/components/MessageNoticeDialog';

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
  const [permissionsReady, setPermissionsReady] = useState(false);
  const [error, setError] = useState<{
    code?: number | string;
    message?: string;
  } | null>(null);

  // 保存最新的站内未读消息 ID，供下次轮询接口直接传给后端
  const lastMessageIdRef = useRef<number | undefined>(undefined);
  const hasCheckedStorageRef = useRef<boolean>(false);

  useEffect(() => {
    optioningRef.current = optioning;
  }, [optioning]);

  useEffect(() => {
    // 只有在首页挂载（用户已登录且进入主界面）时，才按需初始化高德 SDK 和定位，避免违规或冗余的预加载
    initAMapSdk();
    initAMapGeolocation();
    //延时获取 避免闪退
    setTimeout(() => {
      // initBluetooth();
    }, 2000);
  }, []);

  const initBluetooth = async () => {
    const token = await cacheGetSync('token').catch(() => undefined);
    if (!token) {
      setPermissionsReady(false);
      return;
    }

    const bluetoothResult = await requestBluetoothPermissions();
    if (bluetoothResult.granted) {
      setPermissionsReady(true);
    } else {
      setPermissionsReady(false);
    }
  };

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
        const queryParams: any = { type: 1 };
        if (id) {
          queryParams.id = id;
        }
        const ttt = await getStorage({
          key: 'lastMessageId',
        }).catch(() => null);
        if (
          !hasCheckedStorageRef.current &&
          lastMessageIdRef.current === undefined
        ) {
          hasCheckedStorageRef.current = true;
          const cachedStorage = await getStorage({
            key: 'lastMessageId',
          }).catch(() => null);
          const cachedId = (cachedStorage as any)?.data ?? cachedStorage;
          if (cachedId !== undefined && cachedId !== null && cachedId !== '') {
            lastMessageIdRef.current = Number(cachedId);
          }
        }

        if (lastMessageIdRef.current !== undefined) {
          queryParams.lastMessageId = lastMessageIdRef.current;
        }

        // 获取首页锁信息
        const lockRes = await getLockInfo(queryParams);
        // 清除路由栈中的跳转参数
        (navigation as any)?.setParams?.({ lockId: undefined });
        if (lockRes.success && lockRes.code === 200 && lockRes.data) {
          setDetail(lockRes.data);
          setHasDevice(true);
          setError(null);
          // 更新记录最新的未读站内消息 ID
          const latestUnreadMessage = lockRes.data?.latestUnreadMessage;
          if (latestUnreadMessage && latestUnreadMessage.id) {
            // 确保是不一样的最新消息才触发弹窗提示
            if (lastMessageIdRef.current !== latestUnreadMessage.id) {
              lastMessageIdRef.current = latestUnreadMessage.id;
              setStorage({
                key: 'lastMessageId',
                data: latestUnreadMessage.id,
              });

              // 触发弹窗组件
              showMessageNoticeDialog({
                ...latestUnreadMessage,
                unreadCount: lockRes.data.unreadMessageCount,
              });
            }
          }

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
          // 520 或 522 视作账号下没有绑定任何地锁或者该地锁不存在
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
          // 绑定成功后恢复：优先使用存储的 res.data，加载对应设备后清除
          const bindSuccess = await getStorage({
            key: 'rnBindSuccessData',
          }).catch(() => null);
          const bindData = (bindSuccess as any)?.data ?? bindSuccess;
          if (bindData && (bindData.id != null || bindData.lockId != null)) {
            const id = Number(bindData.id ?? bindData.lockId);
            if (Number.isFinite(id)) {
              await load(id, { silent });
              await removeStorage({ key: 'rnBindSuccessData' });
              return true;
            }
          }

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

      // 为本次动画生成序列号
      animationSeq.current += 1;
      const seq = animationSeq.current;

      const minAnimTime = 2800; // 动画至少播放 2800ms
      const delayBeforeFetch = 1400; // 延迟1400ms请求，确保设备状态同步到服务器
      const startTime = Date.now();

      if (prefetchTimer.current) {
        clearTimeout(prefetchTimer.current);
        prefetchTimer.current = null;
      }

      // 等待1400ms后再去查详情
      prefetchTimer.current = setTimeout(() => {
        if (animationSeq.current !== seq) return;

        // 开始拉取最新状态记录
        const p = load(detailIdRef.current, { silent: true });

        // 等待接口返回且首尾满足最小动画时间后，再结束动图转为静态图
        p.finally(() => {
          if (animationSeq.current !== seq) return;
          const elapsed = Date.now() - startTime;
          // 如果过了1400的等待+接口返回的时间依然不到2800ms，就补充剩下的时间。超了就立刻结束。
          const remaining = Math.max(0, minAnimTime - elapsed);

          if (animationTimer.current) {
            clearTimeout(animationTimer.current);
            animationTimer.current = null;
          }

          animationTimer.current = setTimeout(() => {
            if (animationSeq.current !== seq) return;
            onAnimationEnd();
          }, remaining);
        });
      }, delayBeforeFetch);
    },
    [load],
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

  useEffect(() => {
    const imageMap = detail?.imageMap;
    if (!imageMap) return;

    const urls = Object.values(imageMap)
      .filter((uri): uri is string => typeof uri === 'string')
      .filter(uri => !!uri && uri !== 'null');
    const uniqUrls = Array.from(new Set(urls));
    if (uniqUrls.length === 0) return;

    // 统一预热首屏可能会显示的静态图与动图，避免首次蓝牙操作动图偶现空白。
    uniqUrls.forEach(uri => {
      Image.prefetch(uri).catch(() => {});
    });

    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      FastImage.preload(
        uniqUrls.map(uri => ({
          uri,
          priority: FastImage.priority.normal,
        })),
      );
    }
  }, [detail?.imageMap]);

  const hasBluetoothAutoOpen = useCallback(async () => {
    // 等到权限申请完毕，并且已经拉取到了设备，再进行蓝牙状态查询，避免启动太早冲突闪退

    if (!permissionsReady) {
      setIsAutoOpenBluetooth(false);
      return;
    }
    if (!detail?.id) {
      setIsAutoOpenBluetooth(false);
      return;
    }

    //蓝牙没开直接 设false，避免后续流程
    const state = await getBluetoothState();
    if (state !== 'PoweredOn') {
      await setIsAutoOpenBluetooth(false);
      return;
    }

    const result = await getBluetoothDeviceInfo().catch(() => ({}));
    const bleNo = String(detail?.bleNo || '');
    const bleName = String(detail?.bleName || '');
    // @ts-ignore
    const savedDeviceInfo = result?.[bleNo];
    const deviceId = savedDeviceInfo?.deviceId;
    const res = await checkIfDeviceIgnoredOnIOS(deviceId, bleNo, bleName);
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      let sysConnected = false;
      let connectedDevices: any = await getSystemConnectedDevices().catch(
        () => null,
      );

      if (connectedDevices) {
        connectedDevices = JSON.parse(JSON.stringify(connectedDevices.data));
        const connectedDevice = connectedDevices?.find((v: any) => {
          return v.deviceId == deviceId;
        });
        if (!connectedDevice) {
          // console.log(!!savedDeviceInfo, savedDeviceInfo, '===');
          if (!!savedDeviceInfo) {
            removeStorage({ key: 'bluetoothDeviceInfo' });
          }
          setIsAutoOpenBluetooth(false);
          return;
        }

        if (connectedDevice?.isConnected) {
          sysConnected = true;
        }
        setIsAutoOpenBluetooth(sysConnected);
        return;
      }
    }

    if (!deviceId || res.isIgnored || !savedDeviceInfo?.isPaired) {
      const deviceMap =
        (await getBluetoothDeviceInfo().catch(() => null)) || {};
      if (deviceMap[bleNo]) {
        const { [bleNo]: _, ...rest } = deviceMap;
        setStorage({ key: 'bluetoothDeviceInfoList', data: rest });
      }

      if (!!savedDeviceInfo) {
        removeStorage({ key: 'bluetoothDeviceInfo' });
      }
      setIsAutoOpenBluetooth(false);
    } else {
      setIsAutoOpenBluetooth(true);
    }
  }, [permissionsReady, detail]);

  // if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
  useFocusEffect(
    useCallback(() => {
      let stopLoop: (() => void) | null = null;
      const { start, stop } = loopFunc(async () => {
        await hasBluetoothAutoOpen();
        return true;
      }, 1000);
      stopLoop = stop;
      start();
      return () => {
        if (stopLoop) stopLoop();
      };
    }, [hasBluetoothAutoOpen]),
  );
  // }

  // useEffect(() => {
  //   let timer: NodeJS.Timeout | null = null;
  //   timer = setInterval(hasBluetoothAutoOpen, 1000);
  //   return () => {
  //     if (timer) {
  //       clearInterval(timer);
  //     }
  //   };
  // }, [hasBluetoothAutoOpen]);

  return (
    <PageContainer
      backgroundColor={bgImage ? 'transparent' : '#f6f7fa'}
      style={styles.pageContainer}
      // loading={loading}
      error={error}
      fullScreenError={!showGuestWelcome && !hasDevice && !loading}
      onRetry={() => {
        void load();
      }}
      backgroundImage={bgImage}
      safeAreaEdges={['top']}
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
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
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
              navigation.navigate('Login');
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
            <NoDevices unreadCount={unreadCount} />
          )}
        </ScrollView>
      )}
    </PageContainer>
  );
};

export default Index;
