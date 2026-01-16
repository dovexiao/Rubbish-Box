import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Flex, PageContainer } from '@/components';
import { miniLogin } from '@/services';
import { tokenStorage } from '@/utils/storage';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import Sms from './com/sms';
import Password from './com/password';
import styles from './styles';
import IconFont from '@/iconfont';
import { cacheSet } from '@/utils/cache';
import { setStorage } from '@/utils';
import PopConfirm from '@/components/popConfirm';

type LoginType = 'sms' | 'password' | 'mini';

const Login = () => {
  const navigation = useAppNavigation();
  const [agree, setAgree] = useState<boolean>(false);
  const [loginType, setLoginType] = useState<LoginType>('sms');
  const [prevLoginType, setPrevLoginType] = useState<'sms' | 'password'>('sms');
  const [mobile, setMobile] = useState('');
  const [needAuth, setNeedAuth] = useState(true);
  const [tempToken, setTempToken] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const agreePopRef = useRef<any>(null);
  const appStateSubscription = useRef<any>(null);

  // 检查是否已同意协议
  useFocusEffect(
    React.useCallback(() => {
      // 可以从 storage 读取之前是否同意过协议
      // const agreed = storageUtil.getItem('agreePrivacy');
      // setAgree(agreed === true);
    }, []),
  );

  // 微信登录
  const handleWxLogin = async () => {
    // React Native 中需要集成微信 SDK
    // 这里先留空，后续可以集成 react-native-wechat-lib 等库
    Alert.alert('提示', '微信登录功能需要集成微信 SDK');
  };

  // 自动登录（小程序场景，不需要授权）
  const handleAutoLogin = async () => {
    if (!tempToken) return;

    try {
      setLoading(true);
      tokenStorage.set(tempToken);
      // 导航到首页
      navigation.reset({
        index: 0,
        routes: [{ name: 'Index' as any }],
      });
    } catch (error) {
      console.error('自动登录失败:', error);
      Alert.alert('提示', '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 获取临时 token（小程序登录）
  const getTempToken = async () => {
    try {
      // React Native 中需要获取微信 code
      // 这里先模拟，实际需要调用微信登录 API
      const res = await miniLogin({ jsCode: 'mock_code' });
      // http 拦截器已经返回了 res.data，所以这里直接使用 res
      if (res?.token) {
        setNeedAuth(res.needAuth ?? true);
        setTempToken(res.token);
      }
    } catch (error) {
      console.error('获取临时 token 失败:', error);
    }
  };

  // 处理协议同意
  const handleAgree = async () => {
    setAgree(true);
    // 保存协议同意状态
    // storageUtil.setItem('agreePrivacy', true);
  };

  // 处理登录按钮点击
  const handleLoginButtonPress = async () => {
    if (!agree) {
      setLoginType('mini');
      agreePopRef.current?.open();
      return;
    }

    if (loginType === 'mini') {
      if (!needAuth) {
        await handleAgree();
        handleAutoLogin();
      } else {
        // 需要授权，触发微信授权
        handleWxLogin();
      }
    }
  };

  // 处理协议弹窗确认
  const handleAgreeConfirm = async () => {
    await handleAgree();
    agreePopRef.current?.close();

    if (loginType === 'mini') {
      if (!needAuth) {
        handleAutoLogin();
      } else {
        setTimeout(() => {
          handleWxLogin();
        }, 300);
      }
    } else {
      // 触发下一步（短信或密码登录）
      // 这里可以通过事件或其他方式通知子组件
    }
  };

  const radioClick = async () => {
    setAgree(!agree);
    await cacheSet({ key: 'agreePrivacy', data: !agree })
    if (!agree) {
      await setStorage({ key: 'pushEnabled', data: true })
    }
  }

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      safeAreaEdges={['top', 'bottom']}>
      <View style={styles.container}>
        <Flex style={{ flex: 1 }} direction="column" align="center" justify="center">
          <Image
            source={{ uri: 'https://g.18qjz.cn/img/boklock/logo.png' }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoTitle}>欢迎来到泊刻地锁</Text>
          {loginType === 'sms' ? (
            <Sms
              agree={agree}
              onChange={(mobile) => setMobile(mobile)}
              popRef={agreePopRef}
              initialMobile={mobile}
            />
          ) : (
            <Password
              agree={agree}
              onChange={(mobile) => setMobile(mobile)}
              popRef={agreePopRef}
              mobile={mobile}
            />
          )}
          <Flex align="center" isTouchView onPress={radioClick} style={{ marginTop: 16 }}>
            <IconFont
              size={17}
              name={agree ? 'selected' : 'unselected'}
              color={agree ? '#333333' : '#E1E1E1'}
              style={{ marginRight: 8 }}
            />
            <Flex align="center" >
              <Text style={styles.agree}>我已阅读并同意</Text>
              <Pressable onPress={() => {
                // navigateTo({
                //   url: `/pages/web/index?${stringify({
                //     url: 'https://g.18qjz.cn/protocol/boklock/userAgreement.html',
                //   })}`,
                // })
              }}>
                <Text style={styles.agreeLink}>《泊刻地锁用户协议</Text>
              </Pressable>

              <Text style={styles.agree}>和</Text>
              <Pressable onPress={() => {
                // navigateTo({
                //   url: `/pages/web/index?${stringify({
                //     url: 'https://g.18qjz.cn/protocol/boklock/privacyPolicy.html',
                //   })}`,
                // })
              }}>
                <Text style={styles.agreeLink}>《隐私政策》</Text>
              </Pressable>
            </Flex>
          </Flex>
        </Flex>
        <Flex style={{ height: 123 }} direction="column" align="center">
          <Flex align="center" style={styles.logTip}>
            <View style={styles.line} />
            <Text style={styles.fastDesc}>更多登录方式</Text>
            <View style={styles.line} />
          </Flex>
          <Flex direction="row" justify="center" align="center">
            <Flex direction="column" align="center">
              <Image source={{ uri: 'https://g.18qjz.cn/img/boklock/icon_wechat.png' }} style={styles.wxlogo} />
            </Flex>
            <Flex direction="column" justify="center" align="center" style={{ marginLeft: 65 }} isTouchView onPress={() => {
              const type =
                (loginType === 'mini' ? prevLoginType : loginType) === 'sms'
                  ? 'password'
                  : 'sms'
              setLoginType(type)
              setPrevLoginType(type)
            }}>
              <Image source={{ uri: `https://g.18qjz.cn/img/boklock/loginIcon/icon_login_${(loginType === 'mini' ? prevLoginType : loginType) === 'sms' ? 'password' : 'mobile'}.png` }} style={styles.loginIcon}
                resizeMode="contain"

              />

            </Flex>
          </Flex>
        </Flex>
      </View >
      <PopConfirm ref={agreePopRef} title="请先阅读并同意用户协议和隐私政策" />
    </PageContainer >
  );
};

export default Login;
