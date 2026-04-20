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
import { baseInfo, logout } from '@/services/user';
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
};

export default function Mine() {
  const navigation = useNavigation<any>();
  const { theme, themeType } = useTheme();

  const [hasToken, setHasToken] = useState(false);
  const [info, setInfo] = useState<MineInfo | undefined>(undefined);
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

      const [infoRes] = await Promise.all([baseInfo({})]);

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
        icon: 'time' as const,
        label: '地锁申请使用记录',
        onPress: () => navigation.navigate('ApplyRecordList'),
      },
      {
        icon: 'a-addequipments' as const,
        label: '添加设备',
        onPress: () => navigation.navigate('MyDevice'),
      },
      {
        icon: 'shopping' as const,
        label: '商城',
        onPress: () => navigation.navigate('Shopping'),
      },
      {
        icon: 'order' as const,
        label: '我的订单',
        onPress: () => navigation.navigate('Order'),
      },
      {
        icon: 'maintain' as const,
        label: '在线报修',
        onPress: () => navigation.navigate('OnlineRepair'),
      },
      {
        icon: 'a-advertisingdisplay' as const,
        label: '广告位展示',
        onPress: () => navigation.navigate('AdvertisingDisplay'),
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
        onPress: () => navigation.navigate('Setting', { isTest: info?.isTest }),
      },
    ],
    [navigation, info],
  );

  return (
    <PageContainer
      backgroundColor="#FCFBFE"
      backgroundImage={{ uri: info?.bgUrl }}
      statusBarBackgroundColor={info?.bgUrl ? 'transparent' : 'transparent'}
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
        >
          {info?.avatar &&
          typeof info.avatar === 'string' &&
          info.avatar.startsWith('http') ? (
            <Image source={{ uri: info.avatar }} style={styles.avatar} />
          ) : (
            <Image
              source={{
                uri: 'https://g.18qjz.cn/img/boklock/logo.png',
              }}
              resizeMode="contain"
              style={styles.avatar}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            if (!hasToken) return requireLogin();
          }}
        >
          <Text style={[styles.name, styles.lightName]}>
            {hasToken ? info?.nickName ?? '' : '去登录'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
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
        </TouchableOpacity>

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
          <View style={styles.logoutBox}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.listItem}
              onPress={() => {
                if (!hasToken) return requireLogin();
                logoutRef.current?.open();
              }}
            >
              <AppIcon name="exit" size={px(22)} color="#333333" />
              <Text style={styles.listLabel}>退出登录</Text>
              <AppIcon name="a-headfor-20" size={px(16)} color="#333333" />
            </TouchableOpacity>
          </View>
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
