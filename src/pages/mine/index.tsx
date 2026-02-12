import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Image, TouchableOpacity, View, Text, Linking } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Toast } from '@ant-design/react-native';
import PageContainer from '@/components/PageContainer';
import PopConfirm from '@/components/popConfirm';
import IconFont from '@/iconfont';
import { baseInfo, getStaffList, logout } from '@/services/user';
import { cacheGetSync, cacheRemove, cacheSetSync } from '@/utils/cache';
import { tokenStorage } from '@/utils/storage';
import styles from './styles';
import { useTheme } from '@/context/ThemeContext';

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
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const logoutRef = useRef<any>(null);

  const backgroundImage = useMemo(() => {
    const url = info?.bgUrl;
    if (url && typeof url === 'string' && url.startsWith('http')) {
      return { uri: url };
    }
    return undefined;
  }, [info?.bgUrl]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token = await cacheGetSync('token');
      const gm = await cacheGetSync('guestMode');
      const has = !!token;
      setHasToken(has);

      if (!has) {
        setInfo(undefined);
        setTotal(0);
        return;
      }

      // 仅在存在有效 token 时必定拉取数据；若此前为访客模式则自愈为 false
      if (gm === true) {
        await cacheSetSync('guestMode', false);
      }

      const [staffRes, infoRes] = await Promise.all([
        getStaffList({ offset: 0, pageSize: 20 }),
        baseInfo({}),
      ]);

      if (staffRes.code === 200 && staffRes.success) {
        setTotal(Number((staffRes.data as any)?.total || 0));
      } else {
        setTotal(0);
      }

      if (infoRes.code === 200 && infoRes.success) {
        setInfo((infoRes.data || {}) as MineInfo);
      } else {
        Toast.fail(infoRes.msg || infoRes.message || '获取用户信息失败');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
      return;
    }, [load]),
  );

  const requireLogin = useCallback(() => {
    Toast.info('请先登录');
    navigation.navigate('Login');
  }, [navigation]);

  const onLogout = useCallback(async () => {
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
        icon: 'a-addequipments' as const,
        label: '添加设备',
        onPress: () => navigation.navigate('AddDevice'),
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
        onPress: () => navigation.navigate('Setting'),
      },
    ],
    [navigation],
  );

  return (
    <PageContainer
      backgroundColor="#FCFBFE"
      backgroundImage={backgroundImage}
      statusBarBackgroundColor={backgroundImage ? 'transparent' : '#FFFFFF'}
      scrollable
      loading={loading && hasToken && !info}
      safeAreaEdges={['top', 'bottom']}
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
            <View style={styles.avatar} />
          )}
        </TouchableOpacity>

        <Text
          style={[
            styles.name,
            themeType === 'dark' ? styles.darkName : styles.lightName,
          ]}
        >
          {hasToken ? info?.nickName ?? '' : '未登录'}
        </Text>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.card}
          onPress={() => {
            if (!hasToken) return requireLogin();
            navigation.navigate('MemberList');
          }}
        >
          <View style={styles.memberRow}>
            <IconFont name="member-20" size={20} color="#333333" />
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
                  <IconFont name={it.icon} size={22} color="#333333" />
                  <Text style={styles.listLabel}>{it.label}</Text>
                  <IconFont name="a-headfor-20" size={16} color="#333333" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>

        <View style={styles.logoutBox}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.listItem}
            onPress={() => {
              if (!hasToken) return requireLogin();
              logoutRef.current?.open();
            }}
          >
            <IconFont name="exit" size={22} color="#333333" />
            <Text style={styles.listLabel}>退出登录</Text>
            <IconFont name="a-headfor-20" size={16} color="#333333" />
          </TouchableOpacity>
        </View>

        {/* 退出登录弹窗 */}
        <PopConfirm
          ref={logoutRef}
          textWeight="bold"
          title="确定要退出登录"
          cancelText="暂不退出"
          confirmText="确定退出"
          onConfirm={onLogout}
        />
      </View>
    </PageContainer>
  );
}
