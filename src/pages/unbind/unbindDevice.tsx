import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Keyboard, Text, TouchableOpacity, View, Platform } from 'react-native';
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
  setStorage,
  reLaunch,
  loopFunc,
} from '@/utils';
import { resetBluetoothPin, settingBluetoothPin } from '@/services';
import {
  unbind,
  unbindKey,
  unbindKeyResult,
  unbindKeySms,
  unbindSms,
  unbindSmsCheck,
} from '@/services/deviceInfo';
import { sendChangePinByBluetooth } from '@/utils/api';
import { styles } from './unbindDeviceStyle';

type RouteParams = {
  phoneNumber?: string;
  bleNo?: string;
  id?: string | number;
  bleName?: string;
  needPin?: number;
  powerType?: number;
  type?: string;
  key?: string;
  deviceNo?: string;
};

export default function UnbindDevice() {
  const route = useRoute<any>();
  const navigation = useAppNavigation();

  const params = (route.params || {}) as RouteParams;
  const lockId = params.id;
  const bleNo = params.bleNo;
  const bleName = params.bleName;
  const needPin = params.needPin;
  const powerType = params.powerType;
  const type = params.type;
  const deviceNo = params.deviceNo;
  const key = params.key;

  const [step, setStep] = useState<0 | 1>(0);
  const [showError, setShowError] = useState(false);
  const [code, setCode] = useState('');

  const { start, stop, count, isCounting } = useCountDown(60);
  const inputCodeRef = useRef<InputCodeRef>(null);
  const pollStopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      pollStopRef.current?.();
      pollStopRef.current = null;
    };
  }, []);

  const maskedPhone = useMemo(() => {
    const p = String(params.phoneNumber || '');
    if (p.length < 11) return p;
    return `${p.slice(0, 3)}${'*'.repeat(4)}${p.slice(7)}`;
  }, [params.phoneNumber]);

  const requireCode = useCallback(async () => {
    if (type === 'remoteKey') {
      if (!deviceNo) {
        showToast({ title: '未找到设备信息', icon: 'info' });
        return;
      }
    } else if (!lockId) {
      showToast({ title: '未找到设备信息', icon: 'info' });
      return;
    }

    if (showError) {
      setShowError(false);
      setCode('');
      inputCodeRef.current?.clearCode?.();
    }

    const res: any =
      type === 'remoteKey'
        ? await unbindKeySms({ deviceNo })
        : await unbindSms({ id: lockId });
    if (res?.code === 200 && res?.success) {
      showToast({ title: '已发送，待查收验证码', icon: 'info' });
      start();
      setStep(1);
      return;
    }
    showToast({ title: res?.message || res?.msg || '发送失败', icon: 'info' });
  }, [deviceNo, lockId, showError, start, type]);

  const onSubmit = useCallback(async () => {
    Keyboard.dismiss();
    const pure = (code || '').replace(/\D/g, '').slice(0, 6);
    if (pure.length !== 6) {
      showToast({ title: '请输入验证码', icon: 'info' });
      return;
    }
    if (type === 'remoteKey') {
      if (!deviceNo || !key) {
        showToast({ title: '缺少必要参数', icon: 'info' });
        return;
      }
    } else if (!lockId || !bleNo) {
      showToast({ title: '缺少必要参数', icon: 'info' });
      return;
    }

    showLoading({ title: '加载中...' });
    try {
      if (type === 'remoteKey') {
        const res: any = await unbindKey({
          deviceNo,
          keyNo: key,
          code: pure,
        });
        if (!(res?.code === 200 && res?.success)) {
          hideLoading();
          showToast({
            title: res?.message || res?.msg || '解绑失败',
            icon: 'info',
          });
          setShowError(res?.code === 515);
          if (res?.code === 515) {
            setCode('');
            inputCodeRef.current?.clearCode?.();
          }
          stop();
          return;
        }

        const pollSuccess = await new Promise<boolean>(resolve => {
          let timeoutTimer: ReturnType<typeof setTimeout> | null = null;
          const { start: startPoll, stop: stopPoll } = loopFunc(async () => {
            const result: any = await unbindKeyResult({
              deviceNo,
              keyNo: key,
              code: pure,
            });
            if (result?.data) {
              stopPoll();
              if (timeoutTimer) {
                clearTimeout(timeoutTimer);
                timeoutTimer = null;
              }
              pollStopRef.current = null;
              resolve(true);
              return false;
            }
            return true;
          }, 1000);

          pollStopRef.current = stopPoll;
          timeoutTimer = setTimeout(() => {
            stopPoll();
            pollStopRef.current = null;
            resolve(false);
          }, 10000);
          startPoll();
        });

        hideLoading();
        if (pollSuccess) {
          stop();
          showToast({ title: '解绑成功', icon: 'success' });
          setTimeout(() => navigation.pop(2), 800);
        } else {
          showToast({ title: '解绑失败', icon: 'info' });
        }
        return;
      }

      let cmdRes: any = null;
      let deviceId: string | null = null;
      const checkRes: any = await unbindSmsCheck({ id: lockId, code: pure });
      if (!(checkRes?.code === 200 && checkRes?.success && checkRes?.data)) {
        showToast({
          title: checkRes?.message || checkRes?.msg || '验证码错误',
          icon: 'info',
        });
        setShowError(checkRes?.code === 515);
        stop();
        return;
      }
      const deviceInfo: Record<string, any> =
        (await getBluetoothDeviceInfo().catch(() => ({}))) || {};
      deviceId = deviceInfo[String(bleNo)]?.deviceId;
      if (powerType !== 1) {
        if (!deviceId) {
          hideLoading();
          showToast({ title: '未找到蓝牙设备信息，请重新配对', icon: 'info' });
          return;
        }

        const resetRes: any = await resetBluetoothPin({ id: lockId });
        if (!(resetRes?.code === 200 && resetRes?.success)) {
          hideLoading();
          showToast({
            title: resetRes?.message || resetRes?.msg || '解绑失败',
            icon: 'info',
          });
          return;
        }
        const newPin = resetRes?.data;
        if (!newPin) {
          hideLoading();
          showToast({ title: '解绑失败', icon: 'info' });
          return;
        }

        cmdRes = await sendChangePinByBluetooth({
          deviceId,
          pin: newPin,
        });
        if (!cmdRes?.success || !cmdRes?.newMac) {
          hideLoading();
          showToast({ title: cmdRes?.msg || '解绑失败', icon: 'info' });
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
            icon: 'info',
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
        if (powerType !== 1) {
          const targetRemoveId =
            Platform.OS === 'ios' || Platform.OS === 'android'
              ? String(bleNo)
              : deviceId || String(bleNo);
          await removeBluetoothDeviceInfo(targetRemoveId).catch(() => {});
          if (
            Platform.OS !== 'ios' &&
            Platform.OS !== 'android' &&
            targetRemoveId
          ) {
            try {
              const { disconnectBluetoothDevice } = require('@/utils/api');
              await disconnectBluetoothDevice(targetRemoveId);
            } catch (e) {}
          }
        }
        hideLoading();
        showToast({ title: '解绑成功', icon: 'success' });
        if (powerType === 1) {
          await setStorage({ key: 'type', data: 'reload' }).catch(() => {});
          reLaunch('Index');
          return;
        }
        setTimeout(() => {
          navigation.navigate('UnBindSuccess', {
            bleName,
            bleNo,
            deviceId,
            powerType,
          });
        }, 800);
      } else {
        hideLoading();
        showToast({
          title: res?.message || res?.msg || '解绑失败',
          icon: 'info',
        });
        setShowError(res?.code === 515);
        setCode('');
        inputCodeRef.current?.clearCode?.();
        stop();
      }
    } catch {
      hideLoading();
      showToast({ title: '解绑失败', icon: 'info' });
    }
  }, [bleNo, code, deviceNo, key, lockId, navigation, powerType, stop, type]);

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
        <Text style={styles.innerTitle}>
          {params.type === 'remoteKey'
            ? '您正在进行解除绑定遥控钥匙操作'
            : '您正在进行设备解绑操作'}
        </Text>
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
