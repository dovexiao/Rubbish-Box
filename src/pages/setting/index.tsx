import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Toast } from '@ant-design/react-native';
import DeviceInfo from 'react-native-device-info';
import { PageContainer } from '@/components';
import IconFont from '@/iconfont';
import appPush from '@/utils/push';
import { cacheGetSync } from '@/utils/cache';
import { getStorage, setStorage } from '@/utils';
import { Modal } from '@ant-design/react-native';
import styles from './styles';

export default function Setting() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isTest = route.params?.isTest ?? false;

  const [pushEnabled, setPushEnabled] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res: any = await getStorage({ key: 'pushEnabled' });
        setPushEnabled(res?.data === true);
      } catch {
        setPushEnabled(false);
      }
    })();
  }, []);

  useEffect(() => {
    try {
      const v = DeviceInfo.getVersion();
      setCurrentVersion(v);
    } catch {
      setCurrentVersion('');
    }
  }, []);

  const applyPushState = useCallback(async (enabled: boolean) => {
    try {
      const agree = await cacheGetSync('agreePrivacy');
      if (enabled && !agree) {
        Toast.info('请先同意隐私条款后再开启通知服务');
        return false;
      }
      await setStorage({ key: 'pushEnabled', data: enabled });
      setPushEnabled(enabled);

      if (agree && enabled) {
        appPush.submitPolicyGrantResult?.(true);
        appPush.restartPush?.();
        appPush.toggleNotifeeCore?.(true);
        appPush.toggleMobPushOEM?.(true);
      } else {
        appPush.submitPolicyGrantResult?.(false);
        appPush.stopPush?.();
        appPush.toggleNotifeeCore?.(false);
        appPush.toggleMobPushOEM?.(false);
      }
      return true;
    } catch {
      Toast.fail('更新通知服务状态失败');
      return false;
    }
  }, []);

  const handleTogglePush = useCallback(() => {
    const next = !pushEnabled;
    if (!next) {
      Modal.alert(
        '关闭通知服务',
        '关闭后您将无法收到设备状态提醒等推送消息。确定要关闭吗？',
        [
          { text: '再想想', style: 'cancel' },
          {
            text: '确定',
            onPress: () => {
              applyPushState(false);
            },
          },
        ],
      );
    } else {
      applyPushState(true);
    }
  }, [pushEnabled, applyPushState]);

  const handleCheckUpdate = useCallback(() => {
    Toast.info('暂不支持手动检测更新');
  }, []);

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: '设置',
        showBack: true,
        background: '#FFFFFF',
      }}
    >
      <View style={styles.container}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.itemFirst}
          onPress={() => navigation.navigate('Account')}
        >
          <Text style={styles.itemText}>账号与安全</Text>
          <IconFont name="a-headfor-20" size={20} color="#333333" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.item}
          onPress={() => Toast.info('收货地址管理暂未迁移')}
        >
          <Text style={styles.itemText}>收货地址</Text>
          <IconFont name="a-headfor-20" size={20} color="#333333" />
        </TouchableOpacity>

        <View style={styles.item}>
          <Text style={styles.itemText}>通知服务</Text>
          <TouchableOpacity activeOpacity={0.8} onPress={handleTogglePush}>
            <Image
              source={{
                uri: pushEnabled
                  ? 'https://g.18qjz.cn/img/boklock/setting/notice_switch_on.png'
                  : 'https://g.18qjz.cn/img/boklock/setting/notice_switch_off.png',
              }}
              style={{ width: 40, height: 24 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.item}>
          <Text style={styles.itemText}>当前版本</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.itemText2}>
              {currentVersion ? `V${currentVersion}` : ''}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.updateBtn}
              onPress={handleCheckUpdate}
            >
              <Text style={styles.updateBtnText}>更新检测</Text>
              <IconFont name="a-headfor-20" size={16} color="#333333" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.item}
          onPress={() => Toast.info('关于泊刻地锁暂未迁移')}
        >
          <Text style={styles.itemText}>关于泊刻地锁</Text>
          <IconFont name="a-headfor-20" size={20} color="#333333" />
        </TouchableOpacity>

        {isTest && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.item}
            onPress={() => Toast.info('工厂测试页暂未迁移')}
          >
            <Text style={styles.itemText}>泊刻地锁工厂测试</Text>
            <IconFont name="a-headfor-20" size={20} color="#333333" />
          </TouchableOpacity>
        )}
      </View>
    </PageContainer>
  );
}
