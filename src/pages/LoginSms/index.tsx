import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Keyboard } from 'react-native';
import { PageContainer } from '@/components';
import { useRoute, useNavigation } from '@react-navigation/native';
import InputCode, { InputCodeRef } from '@/components/InputCode';
import { useCountDown } from '@/hooks/useCountDown';
import { getSmsCode, login } from '@/services/common';
import { restPasswordVerify, thirdBind } from '@/services/user';
import { SMS_PURPOSE } from '@/constants';
import { cacheSetSync, getStorage, getMobPushDeviceInfo } from '@/utils';
import { reLaunch } from '@/utils/navigation';
import { Toast } from '@ant-design/react-native';
import IconFont from '@/iconfont';
import Flex from '@/components/Flex';
import loginSmsStyles from './styles';

const LoginSms = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const inputCodeRef = useRef<InputCodeRef | null>(null);
  const [showError, setShowError] = useState(false);
  const [code, setCode] = useState('');
  const { count, isCounting, start, stop } = useCountDown(60);

  const mobile = route.params?.mobile || '';
  const type = route.params?.type || SMS_PURPOSE.LOGIN;
  const tempToken = route.params?.tempToken;

  // 页面加载时开始倒计时
  useEffect(() => {
    start();
    return () => {
      stop();
    };
  }, []);

  // 提交验证码
  const onSubmit = async () => {
    // 重置错误状态
    setShowError(false);

    if (!code || code.length !== 6) {
      Toast.info('请输入验证码');
      return;
    }

    const loadingToast = Toast.loading('加载中...', 0);

    let device: any = {};
    try {
      const deviceInfoRes: any = await getStorage({ key: 'deviceInfo' });
      device = deviceInfoRes?.data || {};
    } catch {
      device = {};
    }

    try {
      const res = await (type === SMS_PURPOSE.RESET_PASSWORD
        ? restPasswordVerify({
            code,
            mobile,
            tempToken,
            ...device,
          })
        : type === SMS_PURPOSE.BIND_PHONE
        ? thirdBind({
            code,
            mobile,
            tempToken,
            ...device,
          })
        : login({
            code,
            mobile,
            tempToken,
            ...device,
          }));

      if (res.code === 200) {
        // 仅在校验成功时停止倒计时
        stop();
        Keyboard.dismiss();

        if (type === SMS_PURPOSE.RESET_PASSWORD) {
          Toast.remove(loadingToast);
          navigation.navigate('ForgetPasswordReset', {
            tempToken: res.data,
          });
        } else {
          await cacheSetSync('token', res.data.token);
          await cacheSetSync('guestMode', false);
          try {
            await getMobPushDeviceInfo();
          } catch {}
          Toast.remove(loadingToast);
          reLaunch({
            url: '/pages/index/index',
          });
        }
      } else if (res.code === 515) {
        setShowError(true);
        Toast.remove(loadingToast);
      } else {
        Toast.fail(res.msg || res.message || '验证失败');
        setCode('');
        setShowError(false);
        inputCodeRef.current?.clearCode();
        Toast.remove(loadingToast);
      }
    } catch (error) {
      Toast.remove(loadingToast);
      Toast.fail('验证失败，请重试');
    }
  };

  // 重新获取验证码
  const getCode = async () => {
    // 倒计时进行中不可重新获取验证码
    if (isCounting) return;

    const loadingToast = Toast.loading('获取中...', 0);
    try {
      await getSmsCode({
        mobile,
        purpose: type,
        tempToken,
      });
      Toast.remove(loadingToast);
      // 获取新验证码时清空旧验证码与错误状态
      setCode('');
      setShowError(false);
      inputCodeRef.current?.clearCode();
      start();
    } catch (error) {
      Toast.remove(loadingToast);
      Toast.fail('获取验证码失败');
    }
  };

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      safeAreaEdges={['top', 'bottom']}
      style={loginSmsStyles.container}
    >
      <View style={loginSmsStyles.passwordTitle}>
        <Text style={loginSmsStyles.passwordTitleText}>请输入短信验证码</Text>
      </View>

      <InputCode
        ref={inputCodeRef}
        showError={showError}
        code={code}
        errorMessage="验证码错误"
        onUpdate={value => {
          setCode(value);
          setShowError(false);
          if (value.length === 6) {
            Keyboard.dismiss();
          }
        }}
      />

      <View style={loginSmsStyles.btnBox}>
        <TouchableOpacity
          activeOpacity={isCounting ? 1 : 0.7}
          style={loginSmsStyles.getAgain}
          onPress={async () => {
            // 倒计时进行中不可重新获取验证码
            if (isCounting) return;
            await getCode();
            inputCodeRef.current?.clearCode();
          }}
          disabled={isCounting}
        >
          <Flex align="center" justify="center">
            <Text
              style={[
                loginSmsStyles.getAgainText,
                !isCounting && loginSmsStyles.getAgainTextActive,
              ]}
            >
              重新发送
            </Text>
            {isCounting && count ? (
              <Text style={loginSmsStyles.getAgainText}>({count}s)</Text>
            ) : (
              <IconFont
                name="refresh"
                size={20}
                color={isCounting ? '#999' : '#333333'}
              />
            )}
          </Flex>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            loginSmsStyles.submitBtn,
            code.length === 6 && loginSmsStyles.btnActive,
          ]}
          onPress={onSubmit}
          disabled={code.length !== 6}
        >
          <Text
            style={[
              loginSmsStyles.submitBtnText,
              code.length === 6 && loginSmsStyles.submitBtnTextActive,
            ]}
          >
            下一步
          </Text>
        </TouchableOpacity>
      </View>
    </PageContainer>
  );
};

export default LoginSms;
