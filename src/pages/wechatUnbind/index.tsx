import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { PageContainer } from '@/components';
import { wechatUnBind, getPrivateSendSms } from '@/services/user';
import { mobileExp, showToast } from '@/utils';
import { POST_SOURCE, PURPOSE } from '@/constants';
import { useCountDown } from '@/hooks/useCountDown';
import styles from './styles';

export default function WechatUnbind() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const mobileFromRoute = route.params?.mobile ?? '';

  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');
  const [smsError, setSmsError] = useState(false);
  const [sending, setSending] = useState(false);
  const { count, isCounting, start } = useCountDown(60);
  const [smsRequested, setSmsRequested] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(
    () => !!mobile && code.trim().length > 0,
    [mobile, code],
  );

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
        purpose: PURPOSE.UNBIND,
        source: POST_SOURCE.APP,
      };
      console.log('[WechatUnbind] getPrivateSendSms params:', params);
      const res = await getPrivateSendSms(params);
      if (res.code === 200) {
        setSmsRequested(true);
        start();
        showToast({ title: '验证码已发送', icon: 'info' });
      } else {
        showToast({
          title: res.msg || res.message || '发送失败',
          icon: 'info',
        });
      }
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async () => {
    const value = mobile.trim();
    if (!value) {
      showToast({ title: '请输入手机号', icon: 'info' });
      return;
    }
    if (!mobileExp(value)) {
      showToast({ title: '请输入正确的手机号', icon: 'info' });
      return;
    }
    if (!code.trim()) {
      showToast({ title: '请输入验证码', icon: 'info' });
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
        showToast({ title: '解绑成功', icon: 'info' });
        setTimeout(() => {
          navigation.goBack();
        }, 1000);
      } else if (res.code === 515) {
        setSmsError(true);
        showToast({ title: '验证码错误', icon: 'info' });
      } else {
        showToast({
          title: res.msg || res.message || '解绑失败',
          icon: 'info',
        });
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
              style={[styles.codeBtn, isCounting && styles.codeBtnDisabled]}
              onPress={handleGetCode}
              disabled={isCounting || sending}
            >
              <Text
                style={[
                  styles.codeBtnText,
                  (isCounting || sending) && styles.codeBtnTextDisabled,
                ]}
              >
                {isCounting
                  ? `${count}s`
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
