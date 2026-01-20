import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { eventCenter, getCurrentPages, getStorage, mobileExp, navigateBack, reLaunch } from '@/utils';
import { cacheSetSync } from '@/utils/cache';
import { getMobPushDeviceInfo } from '@/utils/push';
import { Flex, TextInput } from '@/components';
import IconFont from '@/iconfont';
import { login } from '@/services/common';
import Toast from '@ant-design/react-native/lib/toast';
import passwordStyles from './styles';
import { useNavigation } from '@react-navigation/native';

interface PasswordProps {
  agree: boolean;
  onChange: (mobile: string) => void;
  popRef?: React.RefObject<any>;
  mobile?: string;
}

const Password: React.FC<PasswordProps> = ({ agree, onChange, popRef, mobile: initialMobile = '' }) => {
  const navigation = useNavigation<any>();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('手机号码或密码错误');
  const [mobile, setMobile] = useState(initialMobile);
  const [password, setPassword] = useState('');

  const onSubmit = async () => {
    if (!mobile || !mobileExp(mobile) || !password) {
      setShowError(true);
      setErrorMessage('手机号码或密码错误');
      return;
    }

    if (!agree) {
      popRef?.current?.open();
      return;
    }

    setShowError(false);
    const loadingToast = Toast.loading('登录中', 0);
    let deviceInfoRes: any = {};
    try {
      deviceInfoRes = await getStorage({ key: 'deviceInfo' })
    } catch { }
    const device = deviceInfoRes?.data || {}
    const res = await login({
      mobile,
      password,
      ...device,
    });
    if (res.code === 200) {
      await cacheSetSync('token', res.data.token)
      await cacheSetSync('guestMode', false)
      await getMobPushDeviceInfo()
      Toast.remove(loadingToast)
      console.log('res', res)
      // 延迟执行导航，确保状态已更新和导航引用已准备好
      setTimeout(() => {
        const pages = getCurrentPages()
        if (pages.length > 1) {
          navigateBack()
        } else {
          reLaunch({
            url: '/pages/index/index',
          });
        }
      }, 300)
    } else if (res.code === 520 || res.code === 522) {
      Toast.remove(loadingToast)
      setShowError(true);
      setErrorMessage(res.msg || '手机号码或密码错误');
    } else {
      Toast.remove(loadingToast)
      Toast.fail(res.msg || '登录失败');
    }
  };

  useEffect(() => {
    eventCenter.on('onNext', () => {
      onSubmit()
    })
    if (initialMobile) {
      setMobile(initialMobile);
    }
  }, [initialMobile]);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Flex direction="column" align="center" style={passwordStyles.container}>
        <Flex
          style={[
            passwordStyles.content,
            showError ? passwordStyles.errorBorder : {},
          ]}
          align="center">
          <TextInput
            placeholder="请输入手机号"
            style={passwordStyles.input}
            placeholderTextColor="#CCCCCC"
            value={mobile}
            onChangeText={(v) => {
              setMobile(v);
              onChange(v); // 同步更新父组件的 mobile 状态
              if (v && v.length === 11 && mobileExp(v)) {
                setShowError(false);
              }
            }}
            maxLength={11}
            keyboardType="numeric"
            returnKeyType="next"
          />
        </Flex>

        <Flex
          style={[
            passwordStyles.content,
            showError ? passwordStyles.errorBorder : {},
          ]}
          align="center">
          <TextInput
            placeholder="请输入密码"
            style={passwordStyles.input}
            placeholderTextColor="#CCCCCC"
            value={password}
            onChangeText={(v) => {
              setPassword(v);
              if (v) {
                setShowError(false);
              }
            }}
            secureTextEntry={true}
            returnKeyType="done"
            onSubmitEditing={onSubmit}
          />
        </Flex>

        <Flex
          justify="end"
          align="center"
          style={passwordStyles.errorBox}
          isTouchView
          onPress={() => {
            navigation.navigate('ForgetPassword');
          }}>
          {showError ? (
            <Text style={passwordStyles.error}>{errorMessage}</Text>
          ) : null}
          <Text style={passwordStyles.forget}>忘记密码？</Text>
        </Flex>

        <TouchableOpacity
          style={[
            passwordStyles.btn,
            mobile && password && !showError && agree && passwordStyles.btnActive,
          ]}
          onPress={() => {
            Keyboard.dismiss();
            onSubmit();
          }}
          disabled={!mobile || !password || showError || !agree}>
          <Text style={passwordStyles.btnText}>登录</Text>
        </TouchableOpacity>
      </Flex>
    </TouchableWithoutFeedback>
  );
};

export default Password;
