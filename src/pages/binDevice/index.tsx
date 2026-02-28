import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Toast } from '@ant-design/react-native';
import { PageContainer, Flex, PopConfirm } from '@/components';
import {
  useCameraPermission,
  useCameraDevice,
  useCodeScanner,
  Camera,
} from 'react-native-vision-camera';
import type { PopConfirmRef } from '@/components/popConfirm';
import { bindScan } from '@/services/bindDevice';
import styles from './styles';

const BinDevice: React.FC = () => {
  const navigation = useNavigation<any>();
  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');

  const [isActive, setIsActive] = useState(true);
  const hasScannedRef = useRef(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const popRef = useRef<PopConfirmRef>(null);

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

  const handleScanResult = useCallback(
    async (code: string) => {
      if (hasScannedRef.current) return;
      hasScannedRef.current = true;

      const loadingToast = Toast.loading('识别中...', 0);
      try {
        const res: any = await bindScan({
          code,
          userId: null,
        });

        Toast.remove(loadingToast);

        if (res?.code === '200') {
          Toast.success('识别成功');
          const data = res.data || {};

          navigation.navigate(
            'BluetoothBindDevice' as never,
            {
              bleNo: data.bleNo,
              blePin: data.blePin,
              imageMap: data.imageMap,
              deviceNo: data.deviceNo,
              bleName: data.bleName,
            } as never,
          );
        } else {
          setErrorMsg(res?.message || '识别失败，请重试');
          popRef.current?.open();
          hasScannedRef.current = false;
        }
      } catch (error) {
        console.error('bindScan error:', error);
        Toast.remove(loadingToast);
        setErrorMsg('识别失败，请稍后重试');
        popRef.current?.open();
        hasScannedRef.current = false;
      }
    },
    [navigation],
  );

  const codeScanner = useCodeScanner
    ? useCodeScanner({
        codeTypes: ['qr'],
        onCodeScanned: codes => {
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
          codeScanner={codeScanner as any}
        />

        <View style={styles.cameraMask}>
          <View style={styles.scanFrameWrapper}>
            <Image
              source={{
                uri: 'https://g.18qjz.cn/img/boklock/device_scan.png',
              }}
              style={styles.scanFrame}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.tipText}>请将提货码二维码对准框内</Text>
        </View>

        <PopConfirm
          ref={popRef}
          textWeight="bold"
          title={errorMsg || '识别失败，请重试'}
          cancelText="取消"
          confirmText="重试"
          onCancel={() => {
            popRef.current?.close();
            navigation.navigate('Index' as never);
          }}
          onConfirm={() => {
            popRef.current?.close();
            hasScannedRef.current = false;
            setIsActive(true);
          }}
        />
      </View>
    </PageContainer>
  );
};

export default BinDevice;
