import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PageContainer, Flex, PopConfirm } from '@/components';
import { IS_HARMONY } from '@/constants';
import {
  useCameraPermission,
  useCameraDevice,
  useCodeScanner,
  Camera,
} from '@/harmony/vision-camera-shim';
import { startHarmonyScan } from '@/harmony/harmony-scan';
import type { PopConfirmRef } from '@/components/popConfirm';
import { bindScan } from '@/services/bindDevice';
import styles from './styles';
import { hideLoading, reLaunch, showLoading, showToast } from '@/utils';

const BinDevice: React.FC = () => {
  const navigation = useNavigation<any>();
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');

  const [isActive, setIsActive] = useState(true);
  const [harmonyScanFallback, setHarmonyScanFallback] = useState(false);
  const hasScannedRef = useRef(false);
  const popVisibleRef = useRef(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const popRef = useRef<PopConfirmRef>(null);
  const fallbackRunningRef = useRef(false);

  // 请求相机权限
  useEffect(() => {
    const init = async () => {
      await requestPermission();
    };
    void init();
  }, [requestPermission]);

  // 页面挂载/卸载时控制相机激活状态
  useEffect(() => {
    setIsActive(true);
    hasScannedRef.current = false;
    return () => {
      setIsActive(false);
    };
  }, []);

  // 从 FindDevice 等子页面返回时，重置识别状态，允许再次扫码
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      hasScannedRef.current = false;
      popVisibleRef.current = false;
      setIsActive(true);
    });
    return unsubscribe;
  }, [navigation]);

  const handleScanResult = useCallback(
    async (code: string) => {
      if (hasScannedRef.current || popVisibleRef.current) return;
      hasScannedRef.current = true;

      showLoading({ title: '识别中...' });
      try {
        const res: any = await bindScan({
          code,
          userId: null,
        });

        hideLoading();

        if (res?.code === 200) {
          showToast('识别成功');
          const data = res.data || {};

          navigation.navigate(
            'FindDevice' as never,
            {
              bleNo: data.bleNo,
              pin: data.blePin,
              imageMap: data.imageMap,
              deviceNo: data.deviceNo,
              bleName: data.bleName,
              pageName: 'BindDevice',
              needPin: data.needPin,
            } as never,
          );
        } else {
          setErrorMsg(res?.message || '识别失败，请重试');
          setIsActive(false);
          setTimeout(() => {
            popVisibleRef.current = true;
            popRef.current?.open();
          }, 600);
          hasScannedRef.current = false;
        }
      } catch (error) {
        console.error('bindScan error:', error);
        hideLoading();
        setErrorMsg('识别失败，请稍后重试');
        popVisibleRef.current = true;
        setIsActive(false);
        popRef.current?.open();
        hasScannedRef.current = false;
      }
    },
    [navigation],
  );

  const codeScanner = useCodeScanner
    ? useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned: (codes: any) => {
          if (
            codes &&
            Array.isArray(codes) &&
            codes.length > 0 &&
            codes[0]?.value
          ) {
            void handleScanResult(codes[0].value as string);
          }
        },
      })
    : null;

  useEffect(() => {
    if (!IS_HARMONY || !harmonyScanFallback || !isActive) return;
    if (fallbackRunningRef.current) return;
    fallbackRunningRef.current = true;
    startHarmonyScan()
      .then(code => {
        if (code) {
          void handleScanResult(code);
        }
      })
      .catch(err => {
        console.warn('Harmony ScanKit fallback failed:', err);
      })
      .finally(() => {
        fallbackRunningRef.current = false;
      });
  }, [harmonyScanFallback, isActive, handleScanResult]);

  if (!hasPermission) {
    return (
      <PageContainer
        backgroundColor="#000000"
        statusBarStyle="light-content"
        statusBarBackgroundColor="#000000"
        safeAreaEdges={['top', 'bottom']}
        scrollable={false}
        pageNavProps={{
          text: '绑定设备',
          showBack: true,
          background: 'transparent',
          titleColor: '#FFFFFF',
          onBackPress: () => navigation.goBack(),
        }}
      >
        <View style={styles.container}>
          <Flex
            direction="column"
            align="center"
            justify="center"
            style={{ flex: 1 }}
          >
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.tipText}>正在请求相机权限...</Text>
          </Flex>
        </View>
      </PageContainer>
    );
  }

  if (!device || !Camera || !codeScanner) {
    return (
      <PageContainer
        backgroundColor="#000000"
        statusBarStyle="light-content"
        statusBarBackgroundColor="#000000"
        safeAreaEdges={['top', 'bottom']}
        scrollable={false}
        pageNavProps={{
          text: '绑定设备',
          showBack: true,
          background: 'transparent',
          titleColor: '#FFFFFF',
          onBackPress: () => navigation.goBack(),
        }}
      >
        <View style={styles.container}>
          <Flex
            direction="column"
            align="center"
            justify="center"
            style={{ flex: 1 }}
          >
            <Text style={styles.tipText}>无法访问相机设备</Text>
          </Flex>
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      backgroundColor="#000000"
      statusBarStyle="light-content"
      statusBarBackgroundColor="#000000"
      safeAreaEdges={['top', 'bottom']}
      scrollable={false}
      pageNavProps={{
        text: '绑定设备',
        showBack: true,
        background: 'transparent',
        titleColor: '#FFFFFF',
        onBackPress: () => navigation.goBack(),
      }}
    >
      <View style={styles.container}>
        <Camera
          style={styles.camera}
          device={device}
          isActive={isActive}
          codeScanner={
            IS_HARMONY && harmonyScanFallback ? undefined : (codeScanner as any)
          }
          onError={(err: any) => {
            const msg =
              typeof err?.error === 'string'
                ? err.error
                : typeof err?.message === 'string'
                ? err.message
                : '';
            if (
              IS_HARMONY &&
              /output\/stream configurations are invalid/i.test(msg)
            ) {
              setHarmonyScanFallback(true);
            }
          }}
        />

        <View style={styles.cameraMask}>
          <Image
            source={{
              uri: 'https://g.18qjz.cn/img/boklock/device_scan.png',
            }}
            style={styles.scanFrame}
            resizeMode="contain"
          />
        </View>
        <View style={[styles.maskBottom, { bottom: 50 }]}>
          <View style={styles.toastContainer}>
            <Text style={styles.toastTitle}>扫描二维码</Text>
            <Text style={styles.toastContent}>
              在设备表面查找设备绑定二维码，并将其放在上方相机取景框内
            </Text>
          </View>
          <Image
            source={{
              uri: 'https://g.18qjz.cn/img/boklock/qrcode_location.png',
            }}
            style={styles.toastImage}
          />
        </View>

        <PopConfirm
          ref={popRef}
          textWeight="bold"
          title={
            <Flex
              direction="column"
              justify="center"
              align="center"
              style={{ width: '100%' }}
            >
              <Text style={styles.viewTitle}>识别失败</Text>
              <Text style={styles.viewContent}>{errorMsg}</Text>
            </Flex>
          }
          cancelText="取消"
          confirmText="重试"
          onCancel={() => {
            popVisibleRef.current = false;
            popRef.current?.close();
            reLaunch('Index');
          }}
          onConfirm={() => {
            popVisibleRef.current = false;
            popRef.current?.close();
            setTimeout(() => {
              hasScannedRef.current = false;
              setIsActive(true);
            }, 200);
          }}
        />
      </View>
    </PageContainer>
  );
};

export default BinDevice;
