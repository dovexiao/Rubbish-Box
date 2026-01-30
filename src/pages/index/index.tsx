import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import PageContainer from '@/components/PageContainer';
import Header from '@/components/Header';
import NoDevices from '@/components/NoDevices';
import Content from '@/components/Content';
import { getLockInfo } from '@/services/device';
import { unreadCount as fetchUnreadCount } from '@/services/user';
import Flex from '@/components/Flex';
import PopConfirm from '@/components/popConfirm';
import { reLaunch, cacheGetSync, eventCenter } from '@/utils';
import LockVisual, {
  DeviceStatusFlags,
  LockVisualStatus,
} from '@/components/LockVisual';
import { LockInfoDTO } from './typing';
import { FALL_STATUS } from '@/constants';

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
  const [error, setError] = useState<{
    code?: number | string;
    message?: string;
  } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // 获取首页锁信息
      const lockRes = await getLockInfo({ type: 1 } as any);
      if (lockRes.success && lockRes.code === 200 && lockRes.data) {
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
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 初始进入首页时，根据 token / guestMode 判断是否拉取数据
    (async () => {
      try {
        const [token, guest] = await Promise.all([
          cacheGetSync('token'),
          cacheGetSync('guestMode'),
        ]);
        const hasTokenFlag = !!token;
        const guestFlag = guest === true;
        setHasToken(hasTokenFlag);
        setGuestMode(guestFlag);

        if (hasTokenFlag) {
          await load();
        } else {
          // 未登录（含访客模式）不主动请求接口，直接展示引导/无设备提示
          setLoading(false);
          setHasDevice(false);
          setDetail(undefined);
          setError(null);
        }
      } catch {
        setHasToken(false);
        setGuestMode(false);
        setLoading(false);
        setHasDevice(false);
        setDetail(undefined);
        setError({ message: '初始化失败，请稍后重试' });
      }
    })();
  }, [load]);

  const showGuestWelcome = !hasToken && guestMode;

  const guestPopupRef = useRef<any>(null);
  const animationTimer = useRef<any>(null);

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
    };
  }, [onOptioned, onAnimation]);

  const bgImage =
    detail && detail.imageMap?.bgPng
      ? { uri: detail.imageMap.bgPng }
      : undefined;

  return (
    <PageContainer
      backgroundColor={bgImage ? 'transparent' : '#f7f8fa'}
      statusBarStyle={bgImage ? 'light-content' : 'dark-content'}
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
              reLaunch({ url: '/pages/login/index' });
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
              reLaunch({ url: '/pages/login/index' });
            }}
          />
        </View>
      ) : (
        <>
          {/* 主体内容 */}
          <ScrollView contentContainerStyle={styles.content}>
            <Header
              unreadCount={unreadCount}
              lockInfo={detail}
              title="首页"
              reload={() => {
                void load();
              }}
            />
            {hasDevice && detail?.id ? (
              <Content
                detail={detail}
                backgroundType={undefined}
                reload={() => {
                  void load();
                }}
                isMultiple={!!detail?.isGroup}
                optioning={false}
              >
                <LockVisual
                  detail={detail}
                  currentDeviceStatus={currentDeviceStatus}
                  deviceStatus={deviceStatus}
                  inconsistentStatus={false}
                />
              </Content>
            ) : (
              <NoDevices unreadCount={unreadCount} hasDevice={hasDevice} />
            )}
          </ScrollView>
        </>
      )}
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  pageContainer: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  deviceStatusBlock: {
    height: 180,
    backgroundColor: '#e6f7ff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  deviceStatusText: {
    color: '#1890ff',
    fontSize: 16,
  },
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  guestTitle: {
    fontSize: 20,
    color: '#333',
    marginBottom: 32,
  },
  guestAddBtn: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#F5F7FA',
    marginBottom: 16,
  },
  guestAddImage: {
    width: 96,
    height: 96,
  },
  guestToast: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  guestLoginBtn: {
    width: 240,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2878FF',
  },
  guestLoginText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  deviceInfoBlock: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  deviceInfoText: {
    color: '#333',
    fontSize: 15,
  },
  noDeviceBlock: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  noDeviceText: {
    color: '#999',
    fontSize: 16,
  },
});

export default Index;
