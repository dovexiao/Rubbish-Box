import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Flex, PageContainer, Popup } from '@/components';
import AppIcon from '@/components/AppIcon';
import { logout, getPrivateSendSms } from '@/services/user';
import { hideLoading, mobileExp, showLoading, showToast } from '@/utils';
import { PURPOSE, POST_SOURCE } from '@/constants';
import { reLaunch } from '@/utils/navigation';
import { cacheRemove, cacheSetSync } from '@/utils/cache';
import { tokenStorage } from '@/utils/storage';
import styles from './styles';
import { px } from '@/utils/ui';

const LOGOFF_PROTOCOL_URL = 'https://g.18qjz.cn/protocol/boklock/logOff.html';
const WARN_IMAGE_URI = 'https://g.18qjz.cn/img/boklock/logoff_waring.png';

type Step = 1 | 2;

export default function Logoff() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const mobileFromRoute = route.params?.mobile ?? '';

  const [step, setStep] = useState<Step>(1);
  const [agree, setAgree] = useState(false);

  const [mobile, setMobile] = useState('');
  const [code, setCode] = useState('');
  const [smsError, setSmsError] = useState(false);
  const [sending, setSending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [smsRequested, setSmsRequested] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [popVisibale, setPopVisible] = useState(false);

  const canSubmitStep2 = useMemo(
    () => !!mobile && code.trim().length > 0,
    [mobile, code],
  );

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown(c => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const handleConfirmStep1 = () => {
    if (!agree) {
      showToast({ title: '请先勾选同意', icon: 'info' });
      return;
    }
    setStep(2);
  };

  const openLogoffProtocol = () => {
    navigation.navigate('WebView', {
      url: LOGOFF_PROTOCOL_URL,
      title: '注销协议',
    });
  };

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
        purpose: PURPOSE.LOGOFF,
        source: POST_SOURCE.APP,
      };
      const res = await getPrivateSendSms(params);
      if (Number((res as any).code) === 200) {
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

  const handleLogoffSubmit = async () => {
    const value = mobile.trim();
    if (!value || !mobileExp(value)) {
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
    showLoading({ title: '提交中...' });
    try {
      const res = await logout({ mobile: value, code: code.trim() });

      if (Number((res as any).code) === 200) {
        hideLoading();
        showToast({ title: '已注销', icon: 'info' });
        try {
          await cacheRemove({ key: 'token' });
        } catch {}
        try {
          await tokenStorage.remove();
        } catch {}
        try {
          await cacheSetSync('guestMode', true);
        } catch {}
        reLaunch('Login');
      } else if (Number((res as any).code) === 515) {
        hideLoading();
        setSmsError(true);
        showToast({ title: '验证码错误', icon: 'info' });
      } else {
        const msg = (res as any).msg || (res as any).message || '注销失败';
        hideLoading();
        showToast({ title: msg, icon: 'info' });
        if (msg.includes('订单') || msg.includes('无法注销')) {
          setPopVisible(true);
        }
      }
    } catch (e) {
      hideLoading();
      showToast({ title: '注销失败，请重试', icon: 'info' });
    } finally {
      setSubmitting(false);
    }
  };

  // Popup "我已知晓" 按钮的处理函数
  const handlePopupConfirm = () => {
    setPopVisible(false);
  };

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: '注销账号',
        showBack: true,
        background: '#FFFFFF',
      }}
    >
      <View style={styles.container}>
        {step === 1 ? (
          <View style={[styles.box, styles.flex1]}>
            <View style={styles.flex1}>
              <Image
                source={{ uri: WARN_IMAGE_URI }}
                style={styles.warnImage}
                resizeMode="contain"
              />
              <Text style={styles.confirmTitle}>
                注销账号将永久失效且不可恢复，并将放弃以下权益资产与服务
              </Text>
              <View style={styles.content}>
                <Text style={styles.item}>1、账号将无法登录；</Text>
                <Text style={styles.item}>
                  2、请确保账号无未完成的订单、售后申请或未结算的余额；
                </Text>
                <Text style={styles.item}>
                  3、将无法通过APP远程控制已绑定的地锁，请提前解绑；
                </Text>
                <Text style={styles.item}>
                  4、个人信息、订单记录等数据将在注销后按法律法规要求清空。
                </Text>
              </View>
            </View>
            <View style={styles.footer}>
              <View style={styles.agreeRow}>
                <TouchableOpacity
                  onPress={() => setAgree(!agree)}
                  activeOpacity={0.8}
                  hitSlop={{ top: px(8), bottom: px(8), left: 0, right: px(8) }}
                >
                  <AppIcon
                    name={agree ? 'selected' : 'unselected'}
                    size={px(17)}
                    color={agree ? '#333333' : '#999999'}
                  />
                </TouchableOpacity>
                <Text style={styles.agree}>
                  我确认已阅读并确认
                  <Text style={styles.agreeLink} onPress={openLogoffProtocol}>
                    《注销协议》
                  </Text>
                  ，且自愿放弃账号内全部数据、权益资产与服务
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.btn, agree && styles.btnActive]}
                onPress={handleConfirmStep1}
                disabled={!agree}
              >
                <Text style={styles.btnText}>确认注销</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.title}>请先身份验证</Text>
            <Text style={styles.desc}>
              请输入该账号绑定手机号收到的验证码进行验证
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

            {smsError ? <Text style={styles.errorText}>验证码错误</Text> : null}

            <TouchableOpacity
              style={[
                styles.submitBtn,
                !canSubmitStep2 && styles.submitBtnDisabled,
              ]}
              onPress={handleLogoffSubmit}
              disabled={!canSubmitStep2 || submitting}
            >
              <Text style={styles.submitBtnText}>下一步</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      {/* 注销失败 */}
      <Popup
        title="注销失败"
        visible={popVisibale}
        onClose={() => setPopVisible(false)}
      >
        <Text style={styles.popTip}>您当前的账号存在以下情况暂无法注销</Text>
        <View style={styles.tipsBox}>
          <Flex align="center">
            <View style={styles.dot} />
            <Text style={styles.tips}>账号存在未完成的订单</Text>
          </Flex>
          <Flex align="center">
            <View style={styles.dot} />
            <Text style={styles.tips}>
              账号存在未完成的售后申请或未结算的余额
            </Text>
          </Flex>
        </View>
        <TouchableOpacity
          style={[styles.btn, styles.popBtn]}
          onPress={handlePopupConfirm}
          activeOpacity={0.8}
        >
          <Text style={styles.btnText}>我已知晓</Text>
        </TouchableOpacity>
      </Popup>
    </PageContainer>
  );
}
