import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { PageContainer } from '@/components';
import { wechatUnBind, getPrivateSendSms } from '@/services/user';
import { mobileExp, showToast } from '@/utils';
import { POST_SOURCE, PURPOSE } from '@/constants';
import styles from './styles';

export default function WechatUnbind() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const mobileFromRoute = route.params?.mobile ?? '';

  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');
  const [smsError, setSmsError] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [smsRequested, setSmsRequested] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => !!mobile && code.trim().length > 0,
    [mobile, code],
  );

  useEffect(() => {
    if (mobileFromRoute) {
      setMobile(mobileFromRoute);
    }
  }, [mobileFromRoute]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleGetCode = async () => {
    const value = mobile.trim();
    if (!value) {
      showToast('请输入手机号');
      return;
    }
    if (!mobileExp(value)) {
      showToast('请输入正确的手机号');
      return;
    }
    if (sending) return;
    setSending(true);
    setSmsError(false);
    try {
      const params = {
        mobile: value,
        purpose: PURPOSE.UNBIND,
        source: POST_SOURCE.APP,
      };
      console.log('[WechatUnbind] getPrivateSendSms params:', params);
      const res = await getPrivateSendSms(params);
      if (res.code === 200) {
        setSmsRequested(true);
        setCountdown(60);
        showToast('验证码已发送');
      } else {
        showToast(res.msg || res.message || '发送失败');
      }
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async () => {
    const value = mobile.trim();
    if (!value) {
      showToast('请输入手机号');
      return;
    }
    if (!mobileExp(value)) {
      showToast('请输入正确的手机号');
      return;
    }
    if (!code.trim()) {
      showToast('请输入验证码');
      return;
    }
    if (submitting) return;
    setSubmitting(true);
    setSmsError(false);
    try {
      const params = {
        mobile: value,
        code: code.trim(),
        source: POST_SOURCE.APP,
      };
      console.log('[WechatUnbind] wechatUnBind params:', params);
      const res = await wechatUnBind(params);
      if (res.code === 200) {
        setSmsError(false);
        showToast('解绑成功');
        setTimeout(() => {
          navigation.goBack();
        }, 1000);
      } else if (res.code === 515) {
        setSmsError(true);
        showToast('验证码错误');
      } else {
        showToast(res.msg || res.message || '解绑失败');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: '解除微信绑定',
        showBack: true,
        background: '#FFFFFF',
      }}
    >
      <View style={styles.container}>
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
              editable={!mobileFromRoute}
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
              style={[styles.codeBtn, countdown > 0 && styles.codeBtnDisabled]}
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

          {smsError ? <Text style={styles.errorText}>验证码错误</Text> : null}

          <TouchableOpacity
            style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={!canSubmit || submitting}
          >
            <Text style={styles.submitBtnText}>确定解除</Text>
          </TouchableOpacity>
        </View>
      </View>
    </PageContainer>
  );
}
