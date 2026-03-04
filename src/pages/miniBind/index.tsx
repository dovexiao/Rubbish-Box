import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { PageContainer, Flex, InputCode } from '@/components';
import type { InputCodeRef } from '@/components/InputCode';
import { useCountDown } from '@/hooks/useCountDown';
import { getSmsCode, login } from '@/services/common';
import { SMS_PURPOSE } from '@/constants';
import { cacheSetSync } from '@/utils/cache';
import { getMobPushDeviceInfo } from '@/utils/push';
import { getCurrentPages, navigateBack, reLaunch } from '@/utils/navigation';
import { hideLoading, showLoading, showToast } from '@/utils';
import styles from './styles';

const MiniBind = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const inputCodeRef = useRef<InputCodeRef | null>(null);
  const { count, isCounting, start, stop } = useCountDown(60);

  const [showError, setShowError] = useState(false);
  const [code, setCode] = useState('');

  const mobile = route.params?.mobile || '';
  const type = route.params?.type || SMS_PURPOSE.LOGIN;

  // 页面加载时开始倒计时
  useEffect(() => {
    start();
    return () => {
      stop();
    };
  }, []);

  // 提交验证码
  const onSubmit = async () => {
    if (!code || code.length !== 6) {
      showToast('请输入验证码');
      return;
    }

    showLoading({ title: '加载中...' });

    try {
      const res = await login({
        code,
        mobile,
      });

      // 仅在校验成功时停止倒计时
      stop();
      Keyboard.dismiss();

      if (res.code === 200) {
        await cacheSetSync('token', res.data.token);
        await cacheSetSync('guestMode', false);
        try {
          await getMobPushDeviceInfo();
        } catch {}
        hideLoading();

        // 延迟执行导航，确保状态已更新
        setTimeout(() => {
          const pages = getCurrentPages();
          if (pages.length > 1) {
            navigateBack();
          } else {
            reLaunch('Index');
          }
        }, 300);
      } else if (res.code === 515) {
        hideLoading();
        setShowError(true);
      } else {
        hideLoading();
        showToast(res.msg || res.message || '登录失败');
        setCode('');
        setShowError(false);
        inputCodeRef.current?.clearCode();
      }
    } catch (error) {
      hideLoading();
      showToast('登录失败，请重试');
      console.error('登录异常:', error);
    }
  };

  // 重新获取验证码
  const getCode = async () => {
    // 倒计时进行中不可重新获取验证码
    if (isCounting) return;

    showLoading({ title: '获取中...' });
    try {
      await getSmsCode({
        mobile,
        purpose: type,
      });
      hideLoading();
      // 获取新验证码时清空旧验证码与错误状态
      setCode('');
      setShowError(false);
      inputCodeRef.current?.clearCode();
      start();
    } catch (error) {
      hideLoading();
      showToast('获取验证码失败');
    }
  };

  return (
    <PageContainer
      pageNavProps={{
        text: '',
        showBack: true,
      }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.passwordTitle}>当前微信绑定至</Text>
          <Text style={styles.passwordTitle}>{mobile}账号下</Text>

          <Flex justify="between" align="center" style={styles.codeBox}>
            <Text style={styles.codeTitle}>请获取验证码进行登录</Text>
            <TouchableOpacity
              activeOpacity={isCounting ? 1 : 0.7}
              style={styles.getAgain}
              onPress={getCode}
              disabled={isCounting}
            >
              <Text
                style={[
                  styles.getAgainText,
                  !isCounting && styles.getAgainTextActive,
                ]}
              >
                获取验证码
              </Text>
              {isCounting && count ? (
                <Text style={styles.getAgainText}>({count}s)</Text>
              ) : null}
            </TouchableOpacity>
          </Flex>

          <InputCode
            ref={inputCodeRef}
            showError={showError}
            code={code}
            errorMessage="验证码错误"
            onUpdate={value => {
              setCode(value);
              setShowError(false);
            }}
          />

          <View style={styles.btnBox}>
            <TouchableOpacity
              style={[styles.submitBtn, code.length === 6 && styles.btnActive]}
              onPress={onSubmit}
              disabled={code.length !== 6}
            >
              <Text style={styles.submitBtnText}>登录</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </PageContainer>
  );
};

export default MiniBind;
