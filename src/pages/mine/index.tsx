import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Image, TouchableOpacity, View, Text, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/core';
import PageContainer from '@/components/PageContainer';
import PopConfirm from '@/components/popConfirm';
import AppIcon from '@/components/AppIcon';
import { baseInfo, logout, getOrderStat } from '@/services/user';
import { updateRegId } from '@/services/common';
import { getStorage, setStorage } from '@/utils';
import { cacheGetSync, cacheRemove, cacheSetSync } from '@/utils/cache';
import { tokenStorage } from '@/utils/storage';
import styles from './styles';
import { useTheme } from '@/context/ThemeContext';
import { reLaunch, showToast } from '@/utils';
import { px } from '@/utils/ui';

type MineInfo = {
  id?: string | number;
  nickName?: string;
  avatar?: string;
  bgUrl?: string;
  isTest?: boolean;
  inPushFlag?: number; //站内推送开关：0-关闭 1-开启
  mobPushFlag?: number; //设备端推送开关：0-关闭 1-开启，无设备注册时为null
  isStoreTest?: boolean;
};

type OrderStat = {
  todayOrderCount: number;
  balance: number;
  isOpen: boolean;
  totalAmount: number;
};

export default function Mine() {
  const navigation = useNavigation<any>();
  const { theme, themeType } = useTheme();

  const [hasToken, setHasToken] = useState(false);
  const [info, setInfo] = useState<MineInfo | undefined>(undefined);
  const [orderStat, setOrderStat] = useState<OrderStat | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  const logoutRef = useRef<any>(null);
  const logintRef = useRef<any>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await cacheGetSync('token');
      const gm = await cacheGetSync('guestMode');
      setHasToken(!!token);

      if (!token) {
        setInfo(undefined);
        // requireLogin();
        return;
      }

      // 仅在存在有效 token 时必定拉取数据；若此前为访客模式则自愈为 false
      if (gm === true) {
        await cacheSetSync('guestMode', false);
      }

      const [infoRes, orderStatRes] = await Promise.all([
        baseInfo({}),
        getOrderStat({}),
      ]);
      if (orderStatRes.code === 200 && orderStatRes.success) {
        console.log('orderStatRes.data', orderStatRes.data);
        setOrderStat((orderStatRes.data || {}) as OrderStat);
      } else {
        showToast({
          title:
            orderStatRes.msg || orderStatRes.message || '获取经营中心数据失败',
          icon: 'info',
        });
      }

      if (infoRes.code === 200 && infoRes.success) {
        setInfo((infoRes.data || {}) as MineInfo);
      } else {
        showToast({
          title: infoRes.msg || infoRes.message || '获取用户信息失败',
          icon: 'info',
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const requireLogin = useCallback(() => {
    logintRef.current?.open();
  }, [navigation]);

  const onLogout = useCallback(async () => {
    let currentDeviceInfo: any = {};
    try {
      const deviceInfoRes: any = await getStorage({ key: 'deviceInfo' });
      currentDeviceInfo = deviceInfoRes?.data || {};
    } catch {
      currentDeviceInfo = {};
    }

    try {
      if (currentDeviceInfo?.registrationId) {
        await updateRegId({ ...currentDeviceInfo, registrationId: '' });
      }
    } catch {}

    try {
      await setStorage({
        key: 'deviceInfo',
        data: { ...currentDeviceInfo, registrationId: '' },
      });
    } catch {}

    try {
      // 服务端退出（失败也不影响本地清理）
      await logout({});
    } catch {}
    try {
      await cacheRemove({ key: 'token' });
    } catch {}
    try {
      await tokenStorage.remove();
    } catch {}
    try {
      await cacheSetSync('guestMode', true);
    } catch {}

    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  }, [navigation]);

  const listItems = useMemo(
    () => [
      {
        icon: 'maintain' as const,
        label: '在线报修',
        onPress: () => navigation.navigate('OnlineRepair'),
      },
      {
        icon: 'feedback' as const,
        label: '意见反馈',
        onPress: () => navigation.navigate('Feedback'),
      },
      {
        icon: 'a-skinpeeler' as const,
        label: '换肤',
        onPress: () => navigation.navigate('SkinPeeler'),
      },
      {
        icon: 'a-customerservice' as const,
        label: '联系客服',
        onPress: () => Linking.openURL('tel:400-097-8660'),
      },
      {
        icon: 'setting' as const,
        label: '设置',
        onPress: () =>
          navigation.navigate('Setting', {
            isTest: info?.isTest,
            inPushFlag: info?.inPushFlag, //站内推送开关：0-关闭 1-开启
            mobPushFlag: info?.mobPushFlag, //设备端推送开关：0-关闭 1-开启，无设备注册时为null
            isStoreTest: info?.isStoreTest,
          }),
      },
    ],
    [navigation, info],
  );

  // 设备管理
  const deviceManageList = [
    {
      title: '商城',
      icon: 'https://g.18qjz.cn/img/boklock/mine/shop.png',
      onPress: () => navigation.navigate('Shopping'),
    },
    {
      title: '添加设备',
      icon: 'https://g.18qjz.cn/img/boklock/mine/adddevice.png',
      onPress: () =>
        navigation.navigate('MyDevice', {
          isOpen: orderStat?.isOpen,
        }),
    },
    {
      title: '成员',
      icon: 'https://g.18qjz.cn/img/boklock/mine/member.png',
      onPress: () => navigation.navigate('MemberList'),
    },
    {
      title: '使用申请记录',
      icon: 'https://g.18qjz.cn/img/boklock/mine/applyrecord.png',
      onPress: () => navigation.navigate('ApplyRecordList'),
    },
  ];

  // 经营中心
  const businessCenterList = [
    {
      title: '收款设置',
      icon: 'https://g.18qjz.cn/img/boklock/mine/paymentsetting.png',
      onPress: () => {
        if (orderStat?.isOpen) {
          navigation.navigate('RcvPayment');
        } else {
          showToast({
            title: '收款功能未开通,请联系客服人员',
            icon: 'info',
          });
        }
      },
    },
    {
      title: '我的订单',
      icon: 'https://g.18qjz.cn/img/boklock/mine/myorder.png',
      onPress: () => {
        navigation.navigate('MyOrder');
      },
    },
    {
      title: '余额钱包',
      icon: 'https://g.18qjz.cn/img/boklock/mine/wallet.png',
      onPress: () => {
        if (orderStat?.isOpen) {
          navigation.navigate('BalanceWallet');
        } else {
          showToast({
            title: '收款功能未开通,请联系客服人员',
            icon: 'info',
          });
        }
      },
    },
    {
      title: '广告展示',
      icon: 'https://g.18qjz.cn/img/boklock/mine/ad.png',
      onPress: () => navigation.navigate('AdvertisingDisplay'),
    },
  ];

  return (
    <PageContainer
      backgroundColor="#FCFBFE"
      backgroundImage={{ uri: 'https://g.18qjz.cn/img/boklock/img_minebg.png' }}
      backgroundImageHeight={px(380)}
      statusBarBackgroundColor={'transparent'}
      scrollable
      loading={loading && hasToken && !info}
      // iOS TabBar 已处理底部安全区，Mine 再叠加会导致底部内容离 TabBar 留白
      safeAreaEdges={['top']}
    >
      <View style={styles.contentBox}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (!hasToken) return requireLogin();
            navigation.navigate('UserInfo');
          }}
          style={styles.avatarTouchable}
        >
          <View style={styles.avatarLeft}>
            {info?.avatar &&
            typeof info.avatar === 'string' &&
            info.avatar.startsWith('http') ? (
              <Image source={{ uri: info.avatar }} style={styles.avatar} />
            ) : (
              <Image
                source={{
                  uri: 'https://g.18qjz.cn/img/boklock/avatar_empty.png',
                }}
                resizeMode="contain"
                style={styles.avatar}
              />
            )}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={e => {
                e.stopPropagation();
                if (!hasToken) return requireLogin();
              }}
            >
              <Text style={[styles.name, styles.lightName]}>
                {hasToken ? info?.nickName ?? '' : '去登录'}
              </Text>
            </TouchableOpacity>
          </View>
          <View>
            <AppIcon name="a-headfor-20" size={px(20)} color="#CCCCCC" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={1} style={styles.deviceManageCard}>
          <View style={styles.deviceManageCardTitle}>
            <Text style={styles.deviceManageCardTitleText}>设备管理</Text>
          </View>
          <View style={styles.deviceManageList}>
            {deviceManageList.map((item, idx) => {
              const isLast = idx === deviceManageList.length - 1;
              return (
                <TouchableOpacity
                  activeOpacity={1}
                  style={[
                    styles.deviceManageListItem,
                    isLast ? { width: px(74) } : { flex: 1 },
                  ]}
                  key={idx}
                  onPress={() => item.onPress()}
                >
                  <Image
                    source={{ uri: item.icon }}
                    style={styles.deviceManageListItemIcon}
                  />
                  <Text style={styles.deviceManageListItemText}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={1} style={styles.businessCenterCard}>
          <View style={styles.businessCenterCardTitle}>
            <Text style={styles.businessCenterCardTitleText}>经营中心</Text>
          </View>
          <View style={styles.businessCenterBody}>
            <TouchableOpacity
              activeOpacity={1}
              onPress={() => {
                if (orderStat?.isOpen) {
                  navigation.navigate('BalanceWallet');
                } else {
                  showToast({
                    title: '收款功能未开通,请联系客服人员',
                    icon: 'info',
                  });
                }
              }}
              style={styles.businessCenterBodyItem}
            >
              <Text style={styles.businessCenterBodyItemText}>
                {orderStat?.totalAmount ?? 0}
              </Text>
              <Text style={styles.businessCenterBodyItemValue}>余额(元)</Text>
            </TouchableOpacity>

            <View style={styles.businessCenterBodyItemLine} />
            <TouchableOpacity
              activeOpacity={1}
              style={styles.businessCenterBodyItem}
              onPress={() => {
                navigation.navigate('MyOrder');
              }}
            >
              <Text
                style={[
                  styles.businessCenterBodyItemText,
                  // [null, undefined, 0].includes(
                  //   orderStat?.todayOrderCount as any,
                  // ) && styles.businessCenterBodyItemTextBold,
                ]}
              >
                {orderStat?.todayOrderCount ?? 0}
                {/* {[null, undefined, 0].includes(
                  orderStat?.todayOrderCount as any,
                )
                  ? '暂无订单'
                  : orderStat?.todayOrderCount} */}
              </Text>
              <Text style={styles.businessCenterBodyItemValue}>今日订单量</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.businessCenterList}>
            {businessCenterList.map((item, idx) => {
              return (
                <TouchableOpacity
                  activeOpacity={1}
                  style={[styles.deviceManageListItem]}
                  key={idx}
                  onPress={() => item.onPress()}
                >
                  <Image
                    source={{ uri: item.icon }}
                    style={styles.deviceManageListItemIcon}
                  />
                  <Text style={styles.deviceManageListItemText}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>

        {/* <TouchableOpacity
          activeOpacity={0.8}
          style={styles.card}
          onPress={() => {
            if (!hasToken) return requireLogin();
            navigation.navigate('MemberList');
          }}
        >
          <View style={styles.memberRow}>
            <AppIcon name="member-20" size={px(20)} color="#333333" />
            <View style={styles.memberTextBox}>
              <Text style={styles.memberTitle}>成员</Text>
              <Text style={styles.memberDesc}>添加成员，授权使用地锁</Text>
            </View>
          </View>
        </TouchableOpacity> */}

        <View style={styles.listBox}>
          {listItems.map(it => {
            return (
              <View key={it.label}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.listItem}
                  onPress={() => {
                    if (!hasToken) return requireLogin();
                    it.onPress();
                  }}
                >
                  <AppIcon name={it.icon} size={px(22)} color="#333333" />
                  <Text style={styles.listLabel}>{it.label}</Text>
                  <AppIcon name="a-headfor-20" size={px(16)} color="#333333" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        {hasToken && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.logoutBox}
            onPress={() => {
              if (!hasToken) return requireLogin();
              logoutRef.current?.open();
            }}
          >
            <AppIcon name="exit" size={px(20)} color="#CCCCCC" />
            <Text style={styles.logoutText}>退出登录</Text>
          </TouchableOpacity>
        )}

        {/* 退出登录弹窗 */}
        <PopConfirm
          ref={logoutRef}
          textWeight="bold"
          title="确定要退出登录"
          cancelText="暂不退出"
          confirmText="确定退出"
          onConfirm={onLogout}
        />

        <PopConfirm
          ref={logintRef}
          textWeight="bold"
          title="请先登录"
          cancelText="取消"
          confirmText="去登录"
          onConfirm={() => reLaunch('Login')}
        />
      </View>
    </PageContainer>
  );
}
