import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { PageContainer } from '@/components';
import AppIcon from '@/components/AppIcon';
import { changePwdVerify, changePwd, getPrivateSendSms } from '@/services/user';
import { hideLoading, mobileExp, showLoading } from '@/utils';
import { PURPOSE, POST_SOURCE } from '@/constants';
import styles from './styles';
import { showToast } from '@/utils';
import { px } from '@/utils/ui';

type Step = 1 | 2;

export default function PasswordSet() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const mobileFromRoute = route.params?.mobile ?? '';
  const type = route.params?.type ?? 'edit'; // 'add' 设置密码 | 'edit' 修改密码

  const [step, setStep] = useState<Step>(type === 'add' ? 2 : 1);
  const [tempToken, setTempToken] = useState<string | null>(
    type === 'add' ? null : null,
  );

  // Step 1
  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');
  const [smsError, setSmsError] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [smsRequested, setSmsRequested] = useState(false);
  const [verifySubmitting, setVerifySubmitting] = useState(false);

  // Step 2
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordCanSee, setPasswordCanSee] = useState(false);
  const [confirmPasswordCanSee, setConfirmPasswordCanSee] = useState(false);
  const [showError, setShowError] = useState(false);
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  const navTitle = type === 'add' ? '设置登录密码' : '修改登录密码';

  const canSubmitStep1 = useMemo(
    () => !!mobile && code.trim().length > 0,
    [mobile, code],
  );
  const canSubmitStep2 = useMemo(
    () =>
      password.length >= 8 &&
      password.length <= 16 &&
      password === confirmPassword,
    [password, confirmPassword],
  );

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown(c => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const handleGetCode = async () => {
    const value = mobile.trim();
    if (!value) {
      showToast({ title: '请输入手机号', icon: 'info' });
      return;
    }
    if (!mobileExp(value)) {
      showToast({ title: '请输入正确的手机号', icon: 'info' });
      return;
    }
    if (sending) return;
    setSending(true);
    setSmsError(false);
    try {
      const params = {
        mobile: value,
        purpose: PURPOSE.MODIFY_PASSWORD,
        source: POST_SOURCE.APP,
      };
      const res = await getPrivateSendSms(params);
      if (res.code === 200) {
        setSmsRequested(true);
        setCountdown(60);
        showToast({ title: '验证码已发送', icon: 'info' });
      } else {
        showToast({
          title: (res as any).msg || (res as any).message || '发送失败',
          icon: 'info',
        });
      }
    } finally {
      setSending(false);
    }
  };

  const handleVerifySubmit = async () => {
    const value = mobile.trim();
    if (!value || !mobileExp(value)) {
      showToast({ title: '请输入正确的手机号', icon: 'info' });
      return;
    }
    if (!code.trim()) {
      showToast({ title: '请输入验证码', icon: 'info' });
      return;
    }
    if (verifySubmitting) return;
    setVerifySubmitting(true);
    setSmsError(false);
    try {
      const res = await changePwdVerify({ mobile: value, code: code.trim() });
      if (res.code === 200) {
        setTempToken((res as any).data ?? res?.data);
        setStep(2);
      } else if (res.code === 515) {
        setSmsError(true);
        showToast({ title: '验证码错误', icon: 'info' });
      } else {
        showToast({
          title: (res as any).msg || (res as any).message || '验证失败',
          icon: 'info',
        });
      }
    } finally {
      setVerifySubmitting(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (password.length < 8 || password.length > 16) {
      setShowError(true);
      return;
    }
    if (password !== confirmPassword) {
      setShowError(true);
      return;
    }
    setShowError(false);
    if (pwdSubmitting) return;
    setPwdSubmitting(true);
    showLoading({ title: '提交中...' });
    try {
      const res = await changePwd({
        password,
        confirmPassword,
        tempToken: tempToken ?? undefined,
      });

      if (res.code === 200) {
        hideLoading();
        showToast({
          title: type === 'add' ? '密码设置成功' : '密码修改成功',
          icon: 'info',
        });
        setTimeout(() => navigation.goBack(), 1000);
      } else {
        hideLoading();
        showToast({
          title: (res as any).msg || (res as any).message || '操作失败',
          icon: 'info',
        });
      }
    } catch (e) {
      hideLoading();
      showToast({ title: '操作失败，请重试', icon: 'info' });
    } finally {
      setPwdSubmitting(false);
    }
  };

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: navTitle,
        showBack: true,
        background: '#FFFFFF',
      }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {step === 1 ? (
            <View style={styles.section}>
              <Text style={styles.title}>身份验证</Text>
              <Text style={styles.desc}>
                {mobileFromRoute
                  ? `请输入该账号绑定的原手机号 ${mobileFromRoute}，完成手机验证`
                  : '请输入该账号绑定的原手机号，完成手机验证'}
              </Text>

              <View style={[styles.inputRow, smsError && styles.errorBorder]}>
                <TextInput
                  style={styles.input}
                  placeholder="请输入手机号"
                  placeholderTextColor="#CCCCCC"
                  value={mobile}
                  onChangeText={setMobile}
                  keyboardType="number-pad"
                  maxLength={11}
                />
              </View>

              <View style={[styles.inputRow, smsError && styles.errorBorder]}>
                <TextInput
                  style={styles.input}
                  placeholder="请输入验证码"
                  placeholderTextColor="#CCCCCC"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
                <TouchableOpacity
                  style={[
                    styles.codeBtn,
                    countdown > 0 && styles.codeBtnDisabled,
                  ]}
                  onPress={handleGetCode}
                  disabled={countdown > 0 || sending}
                >
                  <Text
                    style={[
                      styles.codeBtnText,
                      (countdown > 0 || sending) && styles.codeBtnTextDisabled,
                    ]}
                  >
                    {countdown > 0
                      ? `${countdown}s`
                      : smsError || smsRequested
                      ? '再次获取'
                      : '获取验证码'}
                  </Text>
                </TouchableOpacity>
              </View>

              {smsError ? (
                <Text style={styles.errorText}>验证码错误</Text>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  !canSubmitStep1 && styles.submitBtnDisabled,
                ]}
                onPress={handleVerifySubmit}
                disabled={!canSubmitStep1 || verifySubmitting}
              >
                <Text style={styles.submitBtnText}>确定</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.section}>
              <Text style={styles.title}>
                {type === 'add' ? '设置' : '修改'}登录密码
              </Text>
              <Text style={styles.desc}>
                {type === 'add'
                  ? '请设置8-16位登录密码，支持数字及符号'
                  : '短信验证已通过，您可以设置新的密码'}
              </Text>

              <View style={[styles.inputRow, showError && styles.errorBorder]}>
                <TextInput
                  style={styles.input}
                  placeholder="请输入8-16位密码，支持数字及符号"
                  placeholderTextColor="#CCCCCC"
                  value={password}
                  onChangeText={v => {
                    setPassword(v);
                    setShowError(false);
                  }}
                  maxLength={16}
                  secureTextEntry={!passwordCanSee}
                />
                <TouchableOpacity
                  onPress={() => setPasswordCanSee(!passwordCanSee)}
                >
                  <AppIcon
                    name={passwordCanSee ? 'visible' : 'invisible'}
                    size={px(24)}
                    color="#999999"
                  />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputRow, showError && styles.errorBorder]}>
                <TextInput
                  style={styles.input}
                  placeholder="请再次输入密码"
                  placeholderTextColor="#CCCCCC"
                  value={confirmPassword}
                  onChangeText={v => {
                    setConfirmPassword(v);
                    setShowError(false);
                  }}
                  maxLength={16}
                  secureTextEntry={!confirmPasswordCanSee}
                />
                <TouchableOpacity
                  onPress={() =>
                    setConfirmPasswordCanSee(!confirmPasswordCanSee)
                  }
                >
                  <AppIcon
                    name={confirmPasswordCanSee ? 'visible' : 'invisible'}
                    size={px(24)}
                    color="#999999"
                  />
                </TouchableOpacity>
              </View>

              {showError ? (
                <Text style={styles.errorText}>密码二次确认错误</Text>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  !canSubmitStep2 && styles.submitBtnDisabled,
                ]}
                onPress={handlePasswordSubmit}
                disabled={!canSubmitStep2 || pwdSubmitting}
              >
                <Text style={styles.submitBtnText}>确定</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </TouchableWithoutFeedback>
    </PageContainer>
  );
}
