import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Image, Text, View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PageContainer, Flex } from '@/components';
import { setStorage, showToast } from '@/utils';
import {
  useCameraPermission,
  useCameraDevice,
  useCodeScanner,
  Camera,
} from '@/harmony/vision-camera-shim';

import styles from './styles';

export default function ScanPickupCode() {
  const navigation = useNavigation<any>();
  const { hasPermission, requestPermission } = useCameraPermission();
  const [isActive, setIsActive] = useState(true);
  const hasScannedRef = useRef(false);

  const device = useCameraDevice('back');

  // 检查相机权限
  useEffect(() => {
    const init = async () => {
      await requestPermission();
    };
    void init();
  }, [navigation]);

  // 页面聚焦时激活相机，失焦时停用
  useEffect(() => {
    setIsActive(true);
    hasScannedRef.current = false;
    return () => {
      setIsActive(false);
    };
  }, []);

  // 处理扫码结果
  const handleScanResult = useCallback(
    async (code: string) => {
      console.log('code', code);
      if (hasScannedRef.current) return;
      hasScannedRef.current = true;

      // 解析提货码：匹配 https://m-boke(-dev)?.18qjz.cn/?pk=19位码
      const match = code.match(
        /^https:\/\/m-boke(?:-dev)?\.18qjz\.cn\/?\?pk=([0-9A-Za-z-]{19})$/,
      );

      if (match && match[1]) {
        const pk = match[1];
        try {
          await setStorage({ key: 'PICKUP_CODE_FROM_SCAN', data: pk });
          showToast('识别成功');
          setTimeout(() => {
            navigation.goBack();
          }, 500);
        } catch (error) {
          showToast('保存提货码失败');
          hasScannedRef.current = false;
        }
      } else {
        // 如果不是正确的提货码链接，显示错误并重置
        showToast('请扫描正确的提货码');
        setTimeout(() => {
          hasScannedRef.current = false;
        }, 2000);
      }
    },
    [navigation],
  );

  // 配置扫码器
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
            void handleScanResult(codes[0].value);
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
          text: '扫描',
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
            style={styles.cameraArea}
          >
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.tipText}>正在请求相机权限...</Text>
          </Flex>
        </View>
      </PageContainer>
    );
  }

  if (!device) {
    return (
      <PageContainer
        backgroundColor="#000000"
        statusBarStyle="light-content"
        statusBarBackgroundColor="#000000"
        safeAreaEdges={['top', 'bottom']}
        scrollable={false}
        pageNavProps={{
          text: '扫描',
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
            style={styles.cameraArea}
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
        text: '扫描',
        showBack: true,
        background: 'transparent',
        titleColor: '#FFFFFF',
        onBackPress: () => navigation.goBack(),
      }}
    >
      <View style={styles.container}>
        {/* 相机预览 */}
        {Camera && device && codeScanner && (
          <Camera
            style={styles.camera}
            device={device}
            isActive={isActive}
            codeScanner={codeScanner}
          />
        )}

        {/* 扫描框遮罩层 */}
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
      </View>
    </PageContainer>
  );
}
