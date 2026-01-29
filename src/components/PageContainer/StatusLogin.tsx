import React, { useRef } from 'react';
import { View, Text, Image } from 'react-native';
import { styles } from './styles';
import Flex from '@/components/Flex';
import PopConfirm from '@/components/popConfirm';
import { reLaunch } from '@/utils';

const StatusLogin: React.FC = () => {
  const popupRef = useRef<any>(null);

  return (
    <View style={styles.statusLoginContainer}>
      <Text style={styles.statusLoginTitle}>欢迎使用 泊刻地锁</Text>
      <Flex
        align="center"
        justify="center"
        style={styles.statusLoginAddBtn}
        isTouchView
        onPress={() => {
          popupRef.current?.open?.();
        }}
      >
        <Image
          source={{ uri: 'https://g.18qjz.cn/img/boklock/device_add.png' }}
          style={styles.statusLoginAddImage}
          resizeMode="contain"
        />
      </Flex>
      <Text style={styles.statusLoginToast}>来添加你的第一台地锁吧！</Text>
      <Flex
        isTouchView
        justify="center"
        align="center"
        style={styles.statusLoginLoginBtn}
        onPress={() => {
          reLaunch({ url: '/pages/login/index' });
        }}
      >
        <Text style={styles.statusLoginLoginText}>登录</Text>
      </Flex>
      <PopConfirm
        ref={popupRef}
        title="请登录后扫码添加地锁"
        cancelText="暂不登录"
        confirmText="登录"
        onConfirm={() => {
          popupRef.current?.close?.();
          reLaunch({ url: '/pages/login/index' });
        }}
      />
    </View>
  );
};

export default StatusLogin;
