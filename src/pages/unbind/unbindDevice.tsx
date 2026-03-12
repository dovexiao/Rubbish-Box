import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Keyboard, Text, TouchableOpacity, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import PageContainer from '@/components/PageContainer';
import InputCode, { type InputCodeRef } from '@/components/InputCode';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useCountDown } from '@/hooks/useCountDown';
import {
  getBluetoothDeviceInfo,
  removeBluetoothDeviceInfo,
  hideLoading,
  showLoading,
  showToast,
} from '@/utils';
import { resetBluetoothPin, settingBluetoothPin } from '@/services';
import { unbind, unbindSms, unbindSmsCheck } from '@/services/deviceInfo';
import { sendChangePinByBluetooth } from '@/utils/api';
import { styles } from './unbindDeviceStyle';

type RouteParams = {
  phoneNumber?: string;
  bleNo?: string;
  id?: string | number;
  bleName?: string;
  needPin?: number;
};

export default function UnbindDevice() {
  const route = useRoute<any>();
  const navigation = useAppNavigation();

  const params = (route.params || {}) as RouteParams;
  const lockId = params.id;
  const bleNo = params.bleNo;
  const bleName = params.bleName;
  const needPin = params.needPin;

  const [step, setStep] = useState<0 | 1>(0);
  const [showError, setShowError] = useState(false);
  const [code, setCode] = useState('');

  const { start, stop, count, isCounting } = useCountDown(60);
  const inputCodeRef = useRef<InputCodeRef>(null);

  const maskedPhone = useMemo(() => {
    const p = String(params.phoneNumber || '');
    if (p.length < 11) return p;
    return `${p.slice(0, 3)}${'*'.repeat(4)}${p.slice(7)}`;
  }, [params.phoneNumber]);

  const requireCode = useCallback(async () => {
    if (!lockId) {
      showToast({ title: '未找到设备信息' });
      return;
    }

    if (showError) {
      setShowError(false);
      setCode('');
      inputCodeRef.current?.clearCode?.();
    }

    const res: any = await unbindSms({ id: lockId });
    if (res?.code === 200 && res?.success) {
      showToast({ title: '已发送，待查收验证码' });
      start();
      setStep(1);
      return;
    }
    showToast({ title: res?.message || res?.msg || '发送失败' });
  }, [lockId, showError, start]);

  const onSubmit = useCallback(async () => {
    Keyboard.dismiss();
    const pure = (code || '').replace(/\D/g, '').slice(0, 6);
    if (pure.length !== 6) {
      showToast({ title: '请输入验证码' });
      return;
    }
    if (!lockId || !bleNo) {
      showToast({ title: '缺少必要参数' });
      return;
    }

    showLoading({ title: '加载中...' });
    try {
      console.log('lockId', lockId, 'code', code);
      let cmdRes: any = null;
      let deviceId: string | null = null;
      const checkRes: any = await unbindSmsCheck({ id: lockId, code: pure });
      if (!(checkRes?.code === 200 && checkRes?.success && checkRes?.data)) {
        showToast({
          title: checkRes?.message || checkRes?.msg || '验证码错误',
        });
        setShowError(checkRes?.code === 515);
        stop();
        return;
      }
      const deviceInfo: Record<string, any> =
        (await getBluetoothDeviceInfo().catch(() => ({}))) || {};
      deviceId = deviceInfo[String(bleNo)]?.deviceId;
      if (!!needPin) {
        if (!deviceId) {
          hideLoading();
          showToast({ title: '未找到蓝牙设备信息，请重新配对' });
          return;
        }

        const resetRes: any = await resetBluetoothPin({ id: lockId });
        if (!(resetRes?.code === 200 && resetRes?.success)) {
          hideLoading();
          showToast({
            title: resetRes?.message || resetRes?.msg || '解绑失败',
          });
          return;
        }
        const newPin = resetRes?.data;
        if (!newPin) {
          hideLoading();
          showToast({ title: '解绑失败' });
          return;
        }

        cmdRes = await sendChangePinByBluetooth({
          deviceId,
          pin: newPin,
        });
        if (!cmdRes?.success || !cmdRes?.newMac) {
          hideLoading();
          showToast({ title: cmdRes?.msg || '解绑失败' });
          return;
        }

        const apiRes: any = await settingBluetoothPin({
          id: lockId,
          pin: newPin,
          bleNo: cmdRes.newMac,
        });
        if (!(apiRes?.code === 200 && apiRes?.success)) {
          hideLoading();
          showToast({
            title: apiRes?.message || apiRes?.msg || '解绑失败',
          });
          return;
        }
      }

      const params: any = {
        id: lockId,
        code: pure,
      };
      if (cmdRes?.newMac) {
        params.bleNo = cmdRes.newMac;
      }

      const res: any = await unbind(params);

      if (res?.code === 200 && res?.success) {
        stop();
        await removeBluetoothDeviceInfo(bleNo).catch(() => {});
        hideLoading();
        showToast({ title: '解绑成功', icon: 'success' });
        setTimeout(() => {
          navigation.navigate('UnBindSuccess', {
            bleName,
            bleNo,
            deviceId,
          });
        }, 800);
      } else {
        hideLoading();
        showToast({
          title: res?.message || res?.msg || '解绑失败',
        });
        setShowError(res?.code === 515);
        setCode('');
        inputCodeRef.current?.clearCode?.();
        stop();
      }
    } catch {
      hideLoading();
      showToast({ title: '解绑失败' });
    }
  }, [bleNo, code, lockId, navigation, stop]);

  useEffect(() => {
    if ((code || '').length === 6) {
      void onSubmit();
    }
  }, [code, onSubmit]);

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: '解除绑定',
        showBack: true,
      }}
      scrollable={false}
      padding={0}
    >
      <View style={styles.outContainer}>
        <Text style={styles.innerTitle}>您正在进行设备解绑操作</Text>
        <Text style={styles.innerToast}>
          {step === 1 ? '请输入验证码' : '即将发送验证码至您的手机'}
        </Text>

        <View
          style={[
            styles.innerPhone,
            step === 1 ? styles.whiteColor : styles.backColor,
          ]}
        >
          {step === 0 ? (
            <Text style={styles.phoneNumber}>{`+86 ${maskedPhone}`}</Text>
          ) : (
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
          )}
        </View>

        <Text style={styles.codeToast}>{showError ? '验证码错误' : ''}</Text>

        <TouchableOpacity
          activeOpacity={isCounting ? 1 : 0.85}
          disabled={isCounting}
          onPress={() => {
            void requireCode();
          }}
          style={[
            styles.btn,
            isCounting ? styles.verificationCodeBtn : styles.sendCodeBtn,
          ]}
        >
          <Text style={styles.btnText}>
            {step === 0
              ? '获取验证码'
              : isCounting
              ? `${count}s`
              : '重新获取验证码'}
          </Text>
        </TouchableOpacity>
      </View>
    </PageContainer>
  );
}
