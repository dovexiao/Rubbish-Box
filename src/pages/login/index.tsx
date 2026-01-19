import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Image,
  Alert,
  TouchableOpacity,
  Pressable,
  AppState,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Flex, PageContainer } from '@/components';
import { getThirdState, miniLogin, thirdLogin } from '@/services';
import { tokenStorage } from '@/utils/storage';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import Sms from './com/sms';
import Password from './com/password';
import styles from './styles';
import IconFont from '@/iconfont';
import { cacheSet } from '@/utils/cache';
import { cacheSetSync, getMobPushDeviceInfo, getStorage, setStorage } from '@/utils';
import PopConfirm from '@/components/popConfirm';
import { Toast } from '@ant-design/react-native';
import { checkInstalledWeChat, wechatLogin } from '@/utils/wechat';

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

  // 使用 ref 存储临时数据和设备信息
  const tempData = useRef<{
    appStateSub: any;
  }>({
    appStateSub: undefined,
  });

  const device = useRef<any>({});

  const handleAgreementLinkPress = (
    type: 'userAgreement' | 'privacyPolicy',
  ) => {
    let url = '';
    if (type === 'userAgreement') {
      url = 'https://g.18qjz.cn/protocol/boklock/userAgreement.html';
    } else if (type === 'privacyPolicy') {
      url = 'https://g.18qjz.cn/protocol/boklock/privacyPolicy.html';
    }
    // 使用系统浏览器打开链接
    if (url) {
      navigation.navigate('WebView', {
        url,
        title: type === 'userAgreement' ? '泊刻地锁用户协议' : '泊刻地锁隐私政策',
      });
    }
  };

  // 检查是否已同意协议
  useFocusEffect(
    React.useCallback(() => {
      // 可以从 storage 读取之前是否同意过协议
      // const agreed = storageUtil.getItem('agreePrivacy');
      // setAgree(agreed === true);
    }, []),
  );

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

  // 微信登录
  const wxLogin = async () => {
    const isInstalledWeChat: any = await checkInstalledWeChat();
    if (!isInstalledWeChat.result) {
      Toast.show(isInstalledWeChat.message);
      return;
    }

    const res = wechatLogin()
    const loadingToast = Toast.loading('登录中...', 0);

    // 监听应用状态变化（用户可能从微信返回）
    const appStatePromise = new Promise<any>((resolve) => {
      tempData.current.appStateSub =
        AppState.addEventListener &&
        AppState.addEventListener('change', (s) => {
          if (s === 'active') {
            resolve({ result: false, errCode: -998, message: '用户手动返回应用，未完成登录' });
          }
        });
    });
    let r: any
    try {
      const loadingToast = Toast.loading('登录中...', 0);
      r = await Promise.race([res, appStatePromise])
      if (r.result) {
        const thirdState = await getThirdState({})
        let obj: any = { source: 1, code: r.code, state: thirdState }
        let deviceInfoStorage: any = {}
        try {
          deviceInfoStorage = await getStorage({ key: 'deviceInfo' })
        } catch (e) { }
        if (deviceInfoStorage?.data) {
          obj = { ...obj, ...deviceInfoStorage?.data }
        } else {
          obj = { ...obj, ...device.current }
        }
        const thirdLoginRes = await thirdLogin({ ...obj })
        if (thirdLoginRes.code === '200') {
          await cacheSetSync('token', thirdLoginRes.data.token)
          await cacheSetSync('guestMode', false)
          try {
            await getMobPushDeviceInfo()
          } catch { }
          if (thirdLoginRes.data.needBind) {
            // navigateTo({ url: '/pages/user/account/bindPhone' })
            // navigation.navigate('BindPhone')
          } else if (thirdLoginRes.data.needMobileVerify) {
            // navigateTo({
            //   url: `/pages/login/miniBind?${stringify({
            //     mobile: thirdLoginRes.data.mobile,
            //   })}`,
            // })
            // navigation.navigate('MiniBind', {
            //   mobile: thirdLoginRes.data.mobile,
            // })
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Index' as any }],
            });
          }
        } else {
          Toast.show(thirdLoginRes.message)
        }
      } else {
        if (r.errCode === -998) console.log('用户手动返回')
        else Toast.show(r.message)
      }
    } catch (e) {
      console.log('一键登录异常:', e)
    } finally {
      Toast.remove(loadingToast)
      tempData.current.appStateSub?.remove?.()
      tempData.current.appStateSub = undefined
    }
  };

  const handleWxLogin = async () => {
    if (!agree) {
      setLoginType('mini');
      agreePopRef.current?.open();
      return;
    }
    await wxLogin();
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
    await cacheSet({ key: 'agreePrivacy', data: !agree });
    if (!agree) {
      await setStorage({ key: 'pushEnabled', data: true });
    }
  };

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
                handleAgreementLinkPress('userAgreement')
              }}>
                <Text style={styles.agreeLink}>《泊刻地锁用户协议</Text>
              </Pressable>

              <Text style={styles.agree}>和</Text>
              <Pressable onPress={() => {
                handleAgreementLinkPress('privacyPolicy')
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
            <Flex direction="column" align="center" isTouchView onPress={handleWxLogin}>
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
