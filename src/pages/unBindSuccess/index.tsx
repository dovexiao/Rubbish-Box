import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState, Image, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GradientButton, PageContainer } from '@/components';
import {
  getStorage,
  openBluetoothSettings,
  removeStorage,
  setStorage,
  showToast,
} from '@/utils';
import { checkIfDeviceIgnoredOnIOS } from '@/utils/api';
import styles from '@/pages/unBindSuccess/styles';

type RouteParams = {
  pages?: string; // handOver 场景
  bleName?: string;
  bleNo?: string;
  deviceId?: string;
};

const UNBIND_GIF = 'https://g.18qjz.cn/img/boklock/unbind.gif';

export default function UnBindSuccess() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const params = (route.params || {}) as RouteParams;

  const bleName = params.bleName || '';
  const bleNo = params.bleNo || '';
  const deviceId = params.deviceId || '';
  const pages = params.pages || '';

  const [linkCheckDone, setLinkCheckDone] = useState(false);
  const [hasLink, setHasLink] = useState(false);
  const justReturnedFromSettingsRef = useRef(false);

  const navTitle = useMemo(
    () => (pages ? '移交成功' : '解除绑定成功'),
    [pages],
  );

  const checkLink = useCallback(async () => {
    try {
      if (!deviceId) {
        setHasLink(false);
        setLinkCheckDone(true);
        return;
      }
      const res = await checkIfDeviceIgnoredOnIOS(deviceId, bleNo);
      setHasLink(!!res?.isIgnored);
      setLinkCheckDone(true);
    } catch {
      setHasLink(false);
      setLinkCheckDone(true);
    }
  }, [bleNo, deviceId]);

  const handleSuccessBack = useCallback(async () => {
    if (pages) {
      showToast({ title: '移交成功', icon: 'success' });
      await setStorage({ key: 'pageType', data: 'reload' }).catch(() => {});
      navigation.reset({
        index: 0,
        routes: [{ name: 'Index', params: { pages: 'handOverSuccess' } }],
      });
    } else {
      showToast({ title: '解除绑定成功', icon: 'success' });
      await setStorage({ key: 'type', data: 'reload' }).catch(() => {});
      navigation.reset({
        index: 0,
        routes: [{ name: 'Index' }],
      });
    }
  }, [navigation, pages]);

  const checkReturnFromSettings = useCallback(async () => {
    try {
      const rnReLaunchPathRes = await getStorage({
        key: 'rnReLaunchPath',
      }).catch(() => null);
      const data = (rnReLaunchPathRes as any)?.data ?? rnReLaunchPathRes;
      const currentName = String((route as any)?.name || '').toLowerCase();
      const targetName = String(data?.path || '').toLowerCase();
      if (!data?.path || !currentName || !targetName) return;
      if (!currentName.includes('unbindsuccess')) return;
      if (!targetName.includes('unbindsuccess')) return;

      // 标记为“从设置返回”，并清理记录，避免重复执行
      justReturnedFromSettingsRef.current = true;
      await removeStorage({ key: 'rnReLaunchPath' }).catch(() => {});
    } catch {}
  }, [route]);

  useEffect(() => {
    const runCheck = () => {
      void checkReturnFromSettings();
      void checkLink();
    };

    const unsubscribeFocus = navigation.addListener('focus', runCheck);
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') runCheck();
    });

    runCheck();

    return () => {
      unsubscribeFocus?.();
      sub?.remove?.();
    };
  }, [navigation, checkLink, checkReturnFromSettings]);

  useEffect(() => {
    if (!linkCheckDone) return;
    if (hasLink) {
      void handleSuccessBack();
      return;
    }
    if (justReturnedFromSettingsRef.current) {
      // 仅当点击「前往设置」并返回后提示
      showToast({ title: '蓝牙未忽略', icon: 'error' });
      justReturnedFromSettingsRef.current = false;
    }
  }, [hasLink, linkCheckDone, handleSuccessBack]);

  const handleGoSettings = useCallback(async () => {
    if (!bleNo || !deviceId) {
      showToast({ title: '缺少必要参数' });
      return;
    }
    // 记录本次跳转意图：用于 App 被系统杀掉后恢复，以及用于本页区分“首次进入/从设置返回”
    justReturnedFromSettingsRef.current = true;
    await openBluetoothSettings({
      bindSuccessStatus: true,
      pages,
      bleNo,
      deviceId,
    }).catch(() => {});
  }, [bleNo, deviceId, pages]);

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: navTitle,
        showBack: true,
        background: '#FFFFFF',
      }}
    >
      <View style={styles.container}>
        <View style={styles.gifWrap}>
          <Image source={{ uri: UNBIND_GIF }} style={styles.gif} />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.card}>
            <Text style={styles.textTitle}>
              为了确保下次连接顺利，请前往手机系统设置进行如下操作：
            </Text>
            <Text style={styles.text}>1. 打开手机系统设置</Text>
            <Text style={styles.text}>2. 进入蓝牙列表</Text>
            <Text style={styles.text}>3. 找到【{bleName || '设备'}】</Text>
            <Text style={styles.text}>
              4. 点击右方按钮，选择【忽略此设备】/【取消配对】
            </Text>
          </View>
        </View>
        <GradientButton
          colors={['#4A4A4A', '#282828']}
          style={styles.btn}
          width={160}
          height={44}
          onPress={() => void handleGoSettings()}
        >
          <Text style={styles.btnText}>前往设置</Text>
        </GradientButton>
      </View>
    </PageContainer>
  );
}
