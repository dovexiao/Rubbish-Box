import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import { PageContainer, Flex } from '@/components';
import { useCountDown } from '@/hooks/useCountDown';
import {
  checkAdmin,
  handOverAdmin,
  handOverSendSmsNew,
  resetBluetoothPin,
  settingBluetoothPin,
} from '@/services';
import {
  getBluetoothDeviceInfo,
  hideLoading,
  showLoading,
  showToast,
} from '@/utils';
import { sendChangePinByBluetooth } from '@/utils/api';
import { useRoute } from '@react-navigation/native';
import Success from '../com/success';
import { styles } from './style';
import { useAppNavigation } from '@/hooks/useAppNavigation';

const SMS_TEXT_TOAST: Record<number, string> = {
  0: '请输入验证码',
  1: '即将发送验证码至您的手机',
};

/**
 * Page state interface
 * @interface Props
 * @property {string | undefined} detail - Page detail data
 */

function isCnMobile(mobile?: string): boolean {
  const s = String(mobile ?? '').trim();
  return /^1\d{10}$/.test(s);
}

export default function HandOverVerifyNew() {
  const route = useRoute<any>();
  const navigation = useAppNavigation();
  const lockIds = route.params?.lockIds as string | undefined;
  const currentAdminCode = route.params?.currentAdminCode as string | undefined;
  const bleNo = route.params?.bleNo as string | undefined;
  const bleName = route.params?.bleName as string | undefined;
  const needPin = route.params?.needPin as number | undefined;

  const [step, setStep] = useState(0);
  const [smsError, setSmsError] = useState(false);
  const [isFirst, setIsFirst] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [params, setParams] = useState<{ mobile: string; code: string }>({
    mobile: '',
    code: '',
  });

  const { start, stop, count, isCounting } = useCountDown(60);

  const disabled = useMemo(() => {
    return !(
      params.code.trim().length > 0 && params.mobile.trim().length === 11
    );
  }, [params.code, params.mobile]);

  const getHandOverSendSmsNew = useCallback(async () => {
    if (!lockIds || !currentAdminCode) return;
    if (!isCnMobile(params.mobile)) {
      showToast('请输入正确的手机号');
      return;
    }
    const res: any = await handOverSendSmsNew({
      lockIds: String(lockIds).split(','),
      currentAdminCode,
      newAdminMobile: params.mobile,
    });
    if (res?.code === 200 && res?.success) {
      if (isFirst) setIsFirst(false);
      setSmsError(false);
      setStep(1);
      start();
      showToast('验证码已发送');
      return;
    }
    showToast(res?.message || res?.msg || '发送失败');
  }, [currentAdminCode, isFirst, lockIds, params.mobile, start]);

  const onHandOverAdmin = useCallback(async () => {
    if (!lockIds || !currentAdminCode) return;

    if (!isCnMobile(params.mobile)) {
      showToast('请输入手机号');
      return;
    }
    if (!params.code) {
      showToast('请输入验证码');
      return;
    }

    const deviceInfo: Record<string, any> =
      (await getBluetoothDeviceInfo().catch(
        () => ({} as Record<string, any>),
      )) || {};
    const deviceId = deviceInfo[String(bleNo ?? '')]?.deviceId;

    if (!deviceId && !!needPin) {
      showToast('未找到蓝牙设备信息，请重新配对');
      return;
    }

    showLoading({ title: '移交中...' });
    try {
      const checkAdminRes: any = await checkAdmin({
        lockIds: String(lockIds).split(','),
        currentAdminCode,
        newAdminMobile: params.mobile,
        newAdminCode: params.code,
      });

      if (!(checkAdminRes?.code === 200 && checkAdminRes?.success)) {
        hideLoading();
        showToast(checkAdminRes?.message || checkAdminRes?.msg || '校验失败');
        setSmsError(checkAdminRes?.code === 515);
        setStep(0);
        return;
      }

      if (!!needPin) {
        const resetRes: any = await resetBluetoothPin({ id: lockIds });
        if (!(resetRes?.code === 200 && resetRes?.success)) {
          hideLoading();
          showToast(resetRes?.message || resetRes?.msg || '移交失败');
          return;
        }

        const newPin = resetRes?.data;
        if (!newPin) {
          hideLoading();
          showToast('移交失败');
          return;
        }

        const cmdRes = await sendChangePinByBluetooth({
          deviceId,
          pin: newPin,
        });

        if (!cmdRes?.success) {
          hideLoading();
          showToast('移交失败');
          return;
        }

        const apiRes: any = await settingBluetoothPin({
          id: lockIds,
          pin: newPin,
          bleNo: cmdRes.newMac,
        });

        if (!(apiRes?.code === 200 && apiRes?.success)) {
          hideLoading();
          showToast(apiRes?.message || apiRes?.msg || '移交失败');
          return;
        }
      }

      const res: any = await handOverAdmin({
        lockIds: String(lockIds).split(','),
        currentAdminCode,
        newAdminMobile: params.mobile,
        newAdminCode: params.code,
      });

      hideLoading();
      if (res?.code === 200 && res?.success) {
        stop();
        hideLoading();
        showToast({ title: '移交成功' });
        setTimeout(() => {
          navigation.navigate('UnBindSuccess', {
            pages: 'handOverSuccess',
            bleName,
            bleNo,
            deviceId,
          });
        }, 800);
      } else {
        hideLoading();
        showToast(res?.message || res?.msg || '移交失败');
        setSmsError(res?.code === 515);
        setStep(0);
      }
    } catch {
      hideLoading();
      showToast('移交失败');
    }
  }, [bleNo, currentAdminCode, lockIds, params.code, params.mobile, stop]);

  if (isSuccess) return <Success />;

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
          <Text style={styles.innerTitle}>需验证新管理员身份。</Text>
          <Text style={styles.innerToast}>{SMS_TEXT_TOAST[step]}</Text>

          <View>
            <Flex justify="center" direction="column" align="center">
              <View style={styles.content}>
                <TextInput
                  placeholder="请输入手机号"
                  placeholderTextColor="#CCCCCC"
                  style={styles.input}
                  value={params.mobile}
                  maxLength={11}
                  keyboardType="number-pad"
                  onChangeText={text =>
                    setParams(p => ({ ...p, mobile: text }))
                  }
                />
              </View>

              <View
                style={[styles.content, smsError ? styles.errorBorder : null]}
              >
                <TextInput
                  placeholder="请输入验证码"
                  placeholderTextColor="#CCCCCC"
                  style={styles.input}
                  value={params.code}
                  keyboardType="number-pad"
                  onChangeText={text => setParams(p => ({ ...p, code: text }))}
                />
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => {
                    if (isCounting) return;
                    void getHandOverSendSmsNew();
                  }}
                >
                  <Text
                    style={
                      isCnMobile(params.mobile)
                        ? styles.smsCode
                        : styles.noMobileSmsCode
                    }
                  >
                    {isFirst
                      ? '获取验证码'
                      : isCounting
                      ? `${count}s`
                      : '再次获取'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Flex>
          </View>

          <Text style={styles.codeToast}>{smsError ? '验证码错误' : ''}</Text>

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={disabled}
            style={[
              styles.btn,
              disabled ? styles.verificationCodeBtn : styles.sendCodeBtn,
            ]}
            onPress={() => void onHandOverAdmin()}
          >
            <Text style={styles.btnText}>确定</Text>
          </TouchableOpacity>
        </View>
      </View>
    </PageContainer>
  );
}
