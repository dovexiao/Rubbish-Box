import React, { useEffect, useState } from 'react';
import {
  Text,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  eventCenter,
  getMobPushDeviceInfo,
  getCurrentPages,
  getStorage,
  hideLoading,
  mobileExp,
  navigateBack,
  reLaunch,
  showLoading,
  showToast,
} from '@/utils';
import { cacheSetSync } from '@/utils/cache';
import { Flex, TextInput } from '@/components';
import AppIcon from '@/components/AppIcon';
import { login } from '@/services/common';
import passwordStyles from './styles';
import { useNavigation } from '@react-navigation/native';

interface PasswordProps {
  agree: boolean;
  onChange: (mobile: string) => void;
  popRef?: React.RefObject<any>;
  mobile?: string;
}

const Password: React.FC<PasswordProps> = ({
  agree,
  onChange,
  popRef,
  mobile: initialMobile = '',
}) => {
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
    showLoading({ title: '登录中...' });

    try {
      let deviceInfoRes: any = {};
      try {
        deviceInfoRes = await getStorage({ key: 'deviceInfo' });
      } catch {}
      const device = deviceInfoRes?.data || {};
      const res = await login({
        mobile,
        password,
        ...device,
      });
      if (res.code === 200) {
        await cacheSetSync('token', res.data.token);
        await cacheSetSync('guestMode', false);
        // 登录流程不再阻塞等待 registrationId，改为首页后后台静默执行
        void getMobPushDeviceInfo().catch(e => {
          console.error('获取推送设备信息失败:', e);
        });
        hideLoading();
        showToast({ title: '登录成功', icon: 'success' });
        // 延迟执行导航，确保状态已更新和导航引用已准备好
        setTimeout(() => {
          const pages = getCurrentPages();
          if (pages.length > 1) {
            navigateBack();
          } else {
            reLaunch('Index');
          }
        }, 300);
      } else if (res.code === 520 || res.code === 522 || res.code === 525) {
        hideLoading();
        setShowError(true);
        setErrorMessage(res.msg || '手机号码或密码错误');
      } else {
        hideLoading();
        showToast({ title: res.msg || '登录失败', icon: 'info' });
      }
    } catch (error) {
      showToast({ title: '登录失败，请稍后重试', icon: 'info' });
    }
  };

  useEffect(() => {
    eventCenter.on('onNext', () => {
      onSubmit();
    });
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
          align="center"
        >
          <TextInput
            placeholder="请输入手机号"
            style={passwordStyles.input}
            placeholderTextColor="#CCCCCC"
            defaultValue={mobile}
            onChangeText={v => {
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
          align="center"
        >
          <TextInput
            placeholder="请输入密码"
            style={passwordStyles.input}
            placeholderTextColor="#CCCCCC"
            defaultValue={password}
            onChangeText={v => {
              setPassword(v);
              if (v) {
                setShowError(false);
              }
            }}
            secureTextEntry={true}
            returnKeyType="done"
          />
        </Flex>

        <Flex
          justify="end"
          align="center"
          style={passwordStyles.errorBox}
          isTouchView
          onPress={() => {
            navigation.navigate('ForgetPassword');
          }}
        >
          {showError ? (
            <Text style={passwordStyles.error}>{errorMessage}</Text>
          ) : null}
          <Text style={passwordStyles.forget}>忘记密码？</Text>
        </Flex>

        <TouchableOpacity
          style={[
            passwordStyles.btn,
            mobile && password && !showError && agree
              ? passwordStyles.btnActive
              : {},
          ]}
          onPress={() => {
            Keyboard.dismiss();
            onSubmit();
          }}
        >
          <Text style={passwordStyles.btnText}>登录</Text>
        </TouchableOpacity>
      </Flex>
    </TouchableWithoutFeedback>
  );
};

export default Password;
