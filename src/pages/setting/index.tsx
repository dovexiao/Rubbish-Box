import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  NativeModules,
  Platform,
  TurboModuleRegistry,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import Config from 'react-native-config';
import appPackage from '../../../package.json';
import { PageContainer, showAppUpdateDialog } from '@/components';
import AppIcon from '@/components/AppIcon';
import appPush from '@/utils/push';
import { cacheGetSync } from '@/utils/cache';
import {
  getMobPushDeviceInfo,
  getStorage,
  initAppPush,
  setStorage,
  showToast,
} from '@/utils';
import appManager from '@/utils/env/rn/appManager';
import styles from './styles';
import { px } from '@/utils/ui';

export default function Setting() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isTest = route.params?.isTest ?? false;

  const [pushEnabled, setPushEnabled] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('');

  const normalizeVersion = (value: unknown): string => {
    const normalized = String(value || '').trim();
    if (!normalized || normalized.toLowerCase() === 'unknown') {
      return '';
    }
    return normalized;
  };

  const getTurboModuleSafely = (name: string): any => {
    try {
      return TurboModuleRegistry.get(name);
    } catch (error) {
      return null;
    }
  };

  const resolveVersion = useCallback(async (): Promise<string> => {
    // 兜底版本：Harmony 当前实例未暴露可用 NativeModules 时，至少展示配置版本。
    const configFallbackVersion = normalizeVersion(
      (Config as unknown as Record<string, unknown>)?.DEPLOY_VERSION,
    );
    const packageFallbackVersion = normalizeVersion(
      (appPackage as { version?: string })?.version,
    );

    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      const appModule: any = NativeModules?.AppModule;
      if (appModule) {
        const appModuleVersionName = normalizeVersion(
          await Promise.resolve(appModule?.getVersionName?.()),
        );
        if (appModuleVersionName) {
          return appModuleVersionName;
        }

        const appModuleVersion = normalizeVersion(
          await Promise.resolve(appModule?.getVersion?.()),
        );
        if (appModuleVersion) {
          return appModuleVersion;
        }

        const appModuleConstVersion = normalizeVersion(
          appModule?.versionName || appModule?.appVersion || appModule?.version,
        );
        if (appModuleConstVersion) {
          return appModuleConstVersion;
        }
      }

      const harmonyAppInfo: any =
        NativeModules?.HarmonyAppInfo || getTurboModuleSafely('HarmonyAppInfo');
      if (harmonyAppInfo) {
        const nativeVersion = normalizeVersion(
          await Promise.resolve(harmonyAppInfo?.getVersionName?.()),
        );
        if (nativeVersion) {
          return nativeVersion;
        }
      }
    }

    const byDeviceInfo = (DeviceInfo.getVersion?.() || '').trim();
    if (byDeviceInfo && byDeviceInfo.toLowerCase() !== 'unknown') {
      return byDeviceInfo;
    }

    // Harmony 下 react-native-device-info 可能返回 unknown，兜底读取原生 RNDeviceInfo。
    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      const rnDeviceInfo: any =
        NativeModules?.RNDeviceInfo || getTurboModuleSafely('RNDeviceInfo');
      if (rnDeviceInfo) {
        const byMethod =
          typeof rnDeviceInfo?.getVersion === 'function'
            ? normalizeVersion(await Promise.resolve(rnDeviceInfo.getVersion()))
            : '';
        if (byMethod) {
          return byMethod;
        }

        const byConst = normalizeVersion(rnDeviceInfo?.appVersion);
        if (byConst) {
          return byConst;
        }
      }
    }

    return configFallbackVersion || packageFallbackVersion || '';
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res: any = await getStorage({ key: 'pushEnabled' });
        const agree = await cacheGetSync('agreePrivacy');
        const raw = typeof res === 'boolean' ? res : res?.data;

        // 未初始化时默认开启（与登录页行为保持一致）
        if (raw === undefined || raw === null) {
          await setStorage({ key: 'pushEnabled', data: true });
          setPushEnabled(agree ? true : false);
          return;
        }

        setPushEnabled(raw === true);
      } catch {
        setPushEnabled(false);
      }
    })();
  }, []);

  useEffect(() => {
    let mounted = true;
    resolveVersion()
      .then(v => {
        if (mounted) {
          setCurrentVersion(v);
        }
      })
      .catch(() => {
        if (mounted) {
          setCurrentVersion('');
        }
      });

    return () => {
      mounted = false;
    };
  }, [resolveVersion]);

  const applyPushState = useCallback(async (enabled: boolean) => {
    try {
      const agree = await cacheGetSync('agreePrivacy');
      if (enabled && !agree) {
        showToast({ title: '请先同意隐私条款后再开启通知服务', icon: 'info' });
        return false;
      }
      await setStorage({ key: 'pushEnabled', data: enabled });
      setPushEnabled(enabled);

      if (agree && enabled) {
        await initAppPush();
        appPush.toggleNotifeeCore?.(true);
        appPush.toggleMobPushOEM?.(true);
        await getMobPushDeviceInfo().catch(() => undefined);
      } else {
        appPush.submitPolicyGrantResult?.(false);
        appPush.stopPush?.();
        appPush.toggleNotifeeCore?.(false);
        appPush.toggleMobPushOEM?.(false);
      }
      return true;
    } catch {
      showToast({ title: '更新通知服务状态失败', icon: 'info' });
      return false;
    }
  }, []);

  const handleTogglePush = useCallback(() => {
    const next = !pushEnabled;
    if (!next) {
      Alert.alert(
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

  const handleCheckUpdate = useCallback(async () => {
    try {
      const manager = appManager();
      const info = await manager.checkAppVersion({ checkStorage: false });

      if (!info) {
        showToast({ title: '当前已是最新版本', icon: 'info' });
        return;
      }

      // 使用全局更新弹窗组件展示，具体更新逻辑交给 onConfirm
      showAppUpdateDialog({
        id: info.id,
        version: info.version,
        content: info.content,
        packageUrl: info.packageUrl,
        forceUpdate: info.forceUpdate,
        isLast: info.isLast,
        onConfirm: () => manager.applyAppVerUpdate(info),
      });
    } catch (e) {
      showToast({ title: '检查更新失败，请稍后重试', icon: 'info' });
    }
  }, []);
  console.log(currentVersion);

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
          <AppIcon name="a-headfor-20" size={px(20)} color="#333333" />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.item}
          onPress={() => navigation.navigate('Address' as never)}
        >
          <Text style={styles.itemText}>收货地址</Text>
          <AppIcon name="a-headfor-20" size={px(20)} color="#333333" />
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
              style={{ width: px(40), height: px(24) }}
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
              <AppIcon name="a-headfor-20" size={px(16)} color="#333333" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.item}
          onPress={() => navigation.navigate('About' as never)}
        >
          <Text style={styles.itemText}>关于泊刻地锁</Text>
          <AppIcon name="a-headfor-20" size={px(20)} color="#333333" />
        </TouchableOpacity>

        {isTest && (
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.item}
            onPress={() => navigation.navigate('TestDevice' as never)}
          >
            <Text style={styles.itemText}>泊刻地锁工厂测试</Text>
            <AppIcon name="a-headfor-20" size={px(20)} color="#333333" />
          </TouchableOpacity>
        )}
      </View>
    </PageContainer>
  );
}
