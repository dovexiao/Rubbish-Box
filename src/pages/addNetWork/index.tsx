import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import PageContainer from '@/components/PageContainer';
import AppIcon from '@/components/AppIcon';
import styles from './styles';
import { px } from '@/utils/ui';
import {
  Camera,
  type CameraRef,
  GradientButton,
  TextInput,
} from '@/components';
import { showToast } from '@/utils';
import { checkSn, gatewayChange } from '@/services';

export default function AddNetWork() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [sn, setSn] = useState('');
  const deviceSn = route.params?.deviceSn ?? '';

  const handlePress = () => {
    //  隐藏键盘
    Keyboard.dismiss();
  };

  const scanCameraRef = useRef<CameraRef>(null);

  const handleScan = useCallback(() => {
    scanCameraRef.current?.open();
  }, []);

  const handleQrScan = useCallback(async (value: string) => {
    const snValue = value.trim();
    if (!snValue) {
      return { ok: false as const, message: '未识别到SN码' };
    }
    setSn(snValue);
    scanCameraRef.current?.close();
    return { ok: true as const };
  }, []);

  const handleCheckSn = useCallback(async () => {
    console.log('deviceSn', deviceSn, sn);
    if (deviceSn) {
      const res = await gatewayChange({ deviceSn, newDeviceSn: sn });
      if (res?.code === 200 && res?.success) {
        showToast({ title: '网关变更成功', icon: 'success' });
        navigation.goBack();
      } else {
        showToast({
          title: res?.message || res?.msg || '网关变更失败',
          icon: 'info',
        });
      }
      return;
    }
    const res = await checkSn({ deviceSn: sn });
    if (res?.code === 200 && res?.success) {
      navigation.navigate('CombineDevice', { deviceSn: sn });
    } else {
      showToast({
        title: res?.message || res?.msg || '网关变更失败',
        icon: 'info',
      });
    }
  }, [deviceSn, navigation, sn]);

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarBackgroundColor={'transparent'}
      scrollable={false}
      safeAreaEdges={['top']}
      pageNavProps={{
        text: deviceSn ? '网关变更' : '新增组合设备',
        showBack: true,
        background: '#FFFFFF',
      }}
      navBorder
    >
      <TouchableWithoutFeedback onPress={handlePress}>
        <View style={styles.contentBox}>
          <Text style={styles.contentBoxItemTitle}>
            {deviceSn ? `原SN码： ${deviceSn}` : '添加433网关'}
          </Text>
          <View style={styles.contentBoxContent}>
            <View style={styles.contentBoxContentTop}>
              <View style={styles.contentBoxContentTopLeft}>
                <Text style={styles.requiredLabel}>*</Text>
                <Text style={styles.contentBoxContentTopTitle}>SN码:</Text>
              </View>
              <TouchableOpacity onPress={handleScan}>
                <AppIcon name="camera1" size={px(20)} color="#333333" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.contentBoxContentTopInput}
              placeholder="请输入SN码"
              value={sn}
              onChangeText={setSn}
            />
          </View>
          <GradientButton
            colors={
              sn.length > 0 ? ['#4A4A4A', '#282828'] : ['#999999', '#999999']
            }
            style={styles.footerBtn}
            onPress={handleCheckSn}
          >
            <Text style={styles.footerBtnText}>确定绑定</Text>
          </GradientButton>
        </View>
      </TouchableWithoutFeedback>

      <Camera
        ref={scanCameraRef}
        present="modal"
        mask={false}
        maskClosable={false}
        title="扫描SN码"
        onScan={handleQrScan}
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
      />
    </PageContainer>
  );
}
