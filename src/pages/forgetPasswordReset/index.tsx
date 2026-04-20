import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  TextInput as RNTextInput,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { PageContainer, Flex, TextInput } from '@/components';
import AppIcon from '@/components/AppIcon';
import { restPassword } from '@/services/user';
import { cacheSetSync, cacheGetSync } from '@/utils/cache';
import push, { getMobPushDeviceInfo } from '@/utils/push';
import { reLaunch } from '@/utils/navigation';
import styles from './styles';
import { hideLoading, showLoading, showToast } from '@/utils';
import { px } from '@/utils/ui';

const ForgetPasswordReset = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const tempToken = route.params?.tempToken;
  const passwordInputRef = useRef<RNTextInput>(null);
  const confirmPasswordInputRef = useRef<RNTextInput>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordCanSee, setPasswordCanSee] = useState(false);
  const [confirmPasswordCanSee, setConfirmPasswordCanSee] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showLengthError, setShowLengthError] = useState(false);

  const onSubmit = async () => {
    if (!password) {
      showToast({ title: '请输入密码', icon: 'info' });
      return;
    }

    if (!confirmPassword) {
      showToast({ title: '请再次输入密码', icon: 'info' });
      return;
    }

    if (password.length < 8 || password.length > 16) {
      setShowLengthError(true);
      return;
    }

    if (password !== confirmPassword) {
      setShowError(true);
      return;
    }

    setShowError(false);
    setShowLengthError(false);
    showLoading({ title: '提交中...' });

    try {
      // 获取设备信息
      const device: any = {};
      try {
        const sysInfo = await cacheGetSync('sysInfo');
        if (sysInfo?.platform) {
          device.platform = sysInfo.platform === 'ios' ? 'ios' : 'android';
          device.brand = sysInfo.brand?.toLowerCase();
          device.deviceId =
            device.platform !== 'ios' ? await push.getDeviceToken() : '';
          const registrationId = await Promise.race([
            push.getRegistrationID(),
            new Promise(resolve => setTimeout(() => resolve(''), 2000)),
          ]);
          if (registrationId) {
            device.registrationId = registrationId;
          }
        }
      } catch (e) {
        console.error('获取设备信息失败:', e);
      }

      const res = await restPassword({
        password,
        confirmPassword,
        tempToken,
        ...device,
      });

      if (res.code === 200) {
        hideLoading();
        showToast({ title: '密码修改成功', icon: 'success' });
        await cacheSetSync('token', res.data.token);
        await cacheSetSync('guestMode', false);
        try {
          await getMobPushDeviceInfo();
        } catch (e) {
          console.error('获取设备信息失败:', e);
        }
        reLaunch('Index');
      } else if (res.code === 515) {
        hideLoading();
      } else {
        hideLoading();
        showToast({
          title: res.msg || res.message || '密码修改失败',
          icon: 'info',
        });
      }
    } catch (error) {
      hideLoading();
      showToast({ title: '密码修改失败，请重试', icon: 'info' });
      console.error('密码重置异常:', error);
    }
  };

  if (!tempToken) {
    return (
      <PageContainer
        pageNavProps={{
          text: '',
          showBack: true,
        }}
      >
        <View style={styles.loadingContainer}>
          <Text>加载中...</Text>
        </View>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      pageNavProps={{
        text: '',
        showBack: true,
        background: '#FFFFFF',
      }}
      loading={!tempToken}
      backgroundColor="#FFFFFF"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <Flex
          justify="center"
          direction="column"
          align="center"
          style={styles.container}
        >
          <Text style={styles.title}>重置登录密码</Text>
          <Flex justify="center" direction="column" align="center">
            <Flex
              style={[
                styles.content,
                showLengthError ? styles.errorBorder : {},
              ]}
              align="center"
            >
              <TextInput
                ref={passwordInputRef}
                placeholder="请输入8-16位密码，支持数字及符号"
                placeholderTextColor="#CCCCCC"
                style={styles.input}
                value={password}
                onChangeText={v => {
                  setPassword(v);
                  setShowLengthError(false);
                  setShowError(false);
                }}
                maxLength={16}
                secureTextEntry={!passwordCanSee}
                returnKeyType="next"
                onSubmitEditing={() => {
                  confirmPasswordInputRef.current?.focus();
                }}
              />
              <TouchableOpacity
                onPress={() => setPasswordCanSee(!passwordCanSee)}
              >
                <AppIcon
                  name={passwordCanSee ? 'visible' : 'invisible'}
                  size={px(20)}
                  color="#999999"
                />
              </TouchableOpacity>
            </Flex>

            <Flex
              style={[styles.content, showError ? styles.errorBorder : {}]}
              align="center"
            >
              <TextInput
                ref={confirmPasswordInputRef}
                placeholder="请再次输入密码"
                placeholderTextColor="#CCCCCC"
                style={styles.input}
                value={confirmPassword}
                onChangeText={v => {
                  setConfirmPassword(v);
                  setShowError(false);
                  setShowLengthError(false);
                }}
                maxLength={16}
                secureTextEntry={!confirmPasswordCanSee}
                returnKeyType="done"
                onSubmitEditing={onSubmit}
              />
              <TouchableOpacity
                onPress={() => setConfirmPasswordCanSee(!confirmPasswordCanSee)}
              >
                <AppIcon
                  name={confirmPasswordCanSee ? 'visible' : 'invisible'}
                  size={px(20)}
                  color="#999999"
                />
              </TouchableOpacity>
            </Flex>

            {showError && (
              <Text style={styles.error}>密码不一致，请检查后重新输入</Text>
            )}
            {showLengthError && (
              <Text style={styles.error}>密码长度必须在8-16位之间</Text>
            )}
          </Flex>

          <TouchableOpacity
            style={[
              styles.btn,
              password && confirmPassword ? styles.btnActive : {},
            ]}
            onPress={() => {
              Keyboard.dismiss();
              onSubmit();
            }}
            disabled={!password || !confirmPassword}
          >
            <Text style={styles.btnText}>完成并登录</Text>
          </TouchableOpacity>
        </Flex>
      </TouchableWithoutFeedback>
    </PageContainer>
  );
};

export default ForgetPasswordReset;
