import { Flex, PageContainer, Camera, type CameraRef } from '@/components';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { styles } from './style';

import { Image, StatusBarStyle, View, Text } from 'react-native';
import { Toast } from '@ant-design/react-native';
import { navigateToHome } from '@/utils/navigation';

const BindDevice: React.FC = () => {
  const scanBindQrCameraRef = useRef<CameraRef>(null);

  const [safeAreaColor, setSafeAreaColor] =
    useState<StatusBarStyle>('dark-content');

  const handleBindQrCodeScan = useCallback(async (value: string) => {
    console.log(value, '扫描结果');
  }, []);

  useEffect(() => {
    scanBindQrCameraRef.current?.open();
    return () => {
      scanBindQrCameraRef.current?.close();
    };
  }, []);

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle={safeAreaColor}
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: '添加设备',
        showBack: true,
      }}
      scrollable={false}
      padding={0}
    >
      <Camera
        ref={scanBindQrCameraRef}
        present="modal"
        mask={false}
        maskClosable={false}
        onClose={() => {
          navigateToHome();
          Toast.removeAll();
          setSafeAreaColor('dark-content');
        }}
        onScan={handleBindQrCodeScan}
        title="添加设备"
        content={
          <View style={styles.scanFrameWrapper}>
            <Image
              source={{
                uri: 'https://g.18qjz.cn/img/boklock/device_scan.png',
              }}
              style={styles.scanFrame}
              resizeMode="contain"
            />
          </View>
        }
        footer={
          <View style={styles.scanTipWrapper}>
            <View style={styles.scanTipBox}>
              <Text style={styles.scanTipTitle}>扫描二维码</Text>
              <Text style={styles.scanTipText}>
                在设备表面或说明书中查找设备绑定二维码，并将其放在上方相机取景框内
              </Text>
            </View>
            <Image
              style={styles.scanTipImg}
              source={{
                uri: 'https://g.18qjz.cn/img/boklock/qrcode_location.png',
              }}
            />
          </View>
        }
      />
    </PageContainer>
  );
};

export default BindDevice;
