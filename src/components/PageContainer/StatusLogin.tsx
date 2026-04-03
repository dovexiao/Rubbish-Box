import React, { useRef } from 'react';
import { View, Text, Image } from 'react-native';
import { styles } from './styles';
import Flex from '@/components/Flex';
import PopConfirm from '@/components/popConfirm';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/context/ThemeContext';

const StatusLogin: React.FC = () => {
  const popupRef = useRef<any>(null);
  const navigation = useNavigation<any>();
  const { theme, themeType } = useTheme();

  return (
    <View style={styles.statusLoginContainer}>
      <Text style={[styles.statusLoginTitle, { color: '#333333' }]}>
        欢迎使用 泊刻地锁
      </Text>
      <Flex
        align="center"
        justify="center"
        style={[styles.statusLoginAddBtn, { backgroundColor: '#F5F7FA' }]}
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
      <Text style={[styles.statusLoginToast, { color: '#666666' }]}>
        来添加你的第一台地锁吧！
      </Text>
      <Flex
        isTouchView
        justify="center"
        align="center"
        style={styles.statusLoginLoginBtn}
        onPress={() => {
          navigation.navigate('Login');
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
          navigation.navigate('Login');
        }}
      />
    </View>
  );
};

export default StatusLogin;
