import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { PageContainer } from '@/components';
import { useRoute } from '@react-navigation/native';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useCountDown } from '@/hooks/useCountDown';
import { handOverSendSms, handOverVerify } from '@/services';
import InputCode, { type InputCodeRef } from '../com/inputCode';
import { styles } from './style';
import { hideLoading, showLoading, showToast } from '@/utils';

export default function HandOverVerify() {
  const route = useRoute<any>();
  const navigation = useAppNavigation();

  const adminMobile = route.params?.adminMobile as string | undefined;
  const deviceId = route.params?.id as string | undefined;
  const bleNo = route.params?.bleNo as string | undefined;
  const bleName = route.params?.bleName as string | undefined;
  const needPin = route.params?.needPin as number | undefined;

  const [step, setStep] = useState(0);
  const [code, setCode] = useState('');
  const [showError, setShowError] = useState(false);

  const inputCodeRef = useRef<InputCodeRef>(null);
  const { start, stop, count, isCounting } = useCountDown(60);

  const maskedMobile = useMemo(() => {
    if (!adminMobile) return '';
    const s = String(adminMobile);
    if (s.length < 11) return s;
    return `${s.slice(0, 3)}${'*'.repeat(4)}${s.slice(7)}`;
  }, [adminMobile]);

  const requireCode = useCallback(async () => {
    if (!deviceId) return;

    if (showError) {
      setShowError(false);
      setCode('');
      inputCodeRef.current?.clearCode?.();
    }

    const res: any = await handOverSendSms({
      lockIds: String(deviceId).split(','),
    });
    if (res?.code === 200 && res?.success) {
      showToast('已发送，待查收验证码');
      start();
      setStep(1);
      return;
    }
    showToast(res?.message || res?.msg || '发送失败');
  }, [deviceId, showError, start]);

  const onSubmit = useCallback(async () => {
    if (!deviceId) return;
    if (!code || code.length !== 6) {
      showToast('请输入验证码');
      return;
    }

    showLoading({ title: '加载中...' });
    try {
      const res: any = await handOverVerify({
        lockIds: String(deviceId).split(','),
        currentAdminCode: code,
      });
      hideLoading();
      stop();

      if (res?.code === 200 && res?.success) {
        showToast('验证成功');
        navigation.navigate('HandOverVerifyNew' as any, {
          lockIds: String(deviceId),
          currentAdminCode: code,
          bleNo,
          bleName,
          needPin,
        });
      } else {
        showToast(res?.message || res?.msg || '验证失败');
        setShowError(true);
      }
    } catch {
      hideLoading();
      stop();
      showToast('移交失败');
    }
  }, [bleName, bleNo, code, deviceId, navigation, stop]);

  useEffect(() => {
    if (step !== 1) return;
    if (code.length === 6) void onSubmit();
  }, [code, onSubmit, step]);

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: '移交管理员',
        showBack: true,
        background: '#FFFFFF',
      }}
      navBorder
      scrollable={false}
    >
      <View style={styles.container}>
        <View style={styles.outContainer}>
          <Text style={[styles.innerTitle, styles.mt200]}>
            您正在进行设备移交操作，
          </Text>
          <Text style={styles.innerTitle}>验证当前管理员身份。</Text>
          <Text style={styles.innerToast}>
            {step ? '请输入验证码' : '即将发送验证码至您的手机'}
          </Text>

          <View
            style={[
              styles.innerPhone,
              step ? styles.whiteColor : styles.backColor,
            ]}
          >
            {!step ? (
              <Text style={styles.adminMobile}>{`+86 ${maskedMobile}`}</Text>
            ) : (
              <InputCode
                ref={inputCodeRef}
                showError={showError}
                code={code}
                onUpdate={setCode}
              />
            )}
          </View>

          <Text style={styles.codeToast}>{showError ? '验证码错误' : ''}</Text>

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isCounting}
            style={[
              styles.btn,
              isCounting ? styles.verificationCodeBtn : styles.sendCodeBtn,
            ]}
            onPress={requireCode}
          >
            <Text style={styles.btnText}>
              {!step
                ? '发送验证码'
                : isCounting
                ? `${count}s`
                : '重新获取验证码'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </PageContainer>
  );
}
