import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Toast } from '@ant-design/react-native';
import { PageContainer } from '@/components';
import {
  changeMobileVerify,
  getChangeMobileCode,
  changeNewVerify,
  getChangeNewCode,
  getCodeResent,
} from '@/services/user';
import { mobileExp } from '@/utils';
import styles from './styles';

type Step = 1 | 2;

export default function ChangeMobile() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();

  // 当前步骤 & 流程 id
  const [step, setStep] = useState<Step>(1);
  const [flowId, setFlowId] = useState<string | null>(null);

  // 原手机号（只展示，不可编辑）
  const [oldMobile, setOldMobile] = useState('');
  const [oldCode, setOldCode] = useState('');
  const [oldError, setOldError] = useState<string | null>(null);
  const [oldSending, setOldSending] = useState(false);
  const [oldCountdown, setOldCountdown] = useState(0);
  const [oldSmsRequested, setOldSmsRequested] = useState(false);

  // 新手机号
  const [newMobile, setNewMobile] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newError, setNewError] = useState<string | null>(null);
  const [newSending, setNewSending] = useState(false);
  const [newCountdown, setNewCountdown] = useState(0);
  const [newSmsRequested, setNewSmsRequested] = useState(false);

  const canNextOld = useMemo(
    () => !!oldMobile && oldCode.trim().length > 0,
    [oldMobile, oldCode],
  );

  const canSubmitNew = useMemo(
    () => mobileExp(newMobile) && newCode.trim().length > 0,
    [newMobile, newCode],
  );

  // 原手机倒计时
  useEffect(() => {
    if (oldCountdown <= 0) return;
    const timer = setInterval(() => {
      setOldCountdown(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [oldCountdown]);

  // 新手机倒计时
  useEffect(() => {
    if (newCountdown <= 0) return;
    const timer = setInterval(() => {
      setNewCountdown(prev => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [newCountdown]);

  // 发送原手机验证码（支持再次获取）
  const handleSendOldCode = async () => {
    if (!oldMobile) {
      Toast.fail('缺少原手机号信息');
      return;
    }
    if (!mobileExp(oldMobile)) {
      Toast.fail('原手机号格式不正确');
      return;
    }
    if (oldSending) return;
    setOldSending(true);
    try {
      const isResend = !!(oldError || oldSmsRequested);
      const api = isResend ? getCodeResent : getChangeMobileCode;
      const params: any = isResend
        ? { mobile: oldMobile, flowId }
        : { mobile: oldMobile };

      console.log('[ChangeMobile] send old code params:', params);

      const res = await api(params);
      if (res.code == 200) {
        setFlowId(res.data);
        setOldSmsRequested(true);
        setOldError(null);
        setOldCountdown(60);
        Toast.success('验证码已发送');
      } else {
        Toast.fail(res.msg || '发送失败');
      }
    } catch (e) {
      Toast.fail('发送验证码失败，请稍后重试');
    } finally {
      setOldSending(false);
    }
  };

  // 验证原手机
  const handleVerifyOld = async () => {
    if (!oldMobile) {
      Toast.fail('缺少原手机号信息');
      return;
    }
    if (!mobileExp(oldMobile)) {
      Toast.fail('原手机号格式不正确');
      return;
    }
    if (!oldCode.trim()) {
      Toast.fail('请输入验证码');
      return;
    }
    try {
      Toast.loading('提交中...', 0);
      const params = {
        mobile: oldMobile,
        code: oldCode.trim(),
        flowId,
      };
      console.log('[ChangeMobile] verify old mobile params:', params);
      const res = await changeMobileVerify(params);
      Toast.removeAll();
      const code = (res as any)?.code ?? (res as any)?.status;
      if (String(code) === '200') {
        setOldError(null);
        setStep(2);
      } else if (String(code) === '515') {
        setOldError('验证码错误，请重新输入');
      } else {
        Toast.fail((res as any)?.message || '验证失败');
      }
    } catch (e) {
      Toast.removeAll();
      Toast.fail('验证失败，请稍后重试');
    }
  };

  // 发送新手机验证码（支持再次获取）
  const handleSendNewCode = async () => {
    if (!newMobile.trim()) {
      Toast.fail('请输入新手机号');
      return;
    }
    if (!mobileExp(newMobile)) {
      Toast.fail('请输入正确的手机号');
      return;
    }
    if (!flowId) {
      Toast.fail('缺少验证流程信息，请先完成原手机号验证');
      return;
    }
    if (newSending) return;
    setNewSending(true);
    try {
      const isResend = !!(newError || newSmsRequested);
      const api = isResend ? getCodeResent : getChangeNewCode;
      const params: any = {
        mobile: newMobile.trim(),
        flowId,
        old: false,
      };

      console.log('[ChangeMobile] send new code params:', params);

      const res = await api(params);
      if (res.code == 200) {
        setFlowId(res.data);
        setNewSmsRequested(true);
        setNewError(null);
        setNewCountdown(60);
        Toast.success('验证码已发送');
      } else {
        Toast.fail(res.msg || '发送验证码失败');
      }
    } catch (e) {
      Toast.fail('发送验证码失败，请稍后重试');
    } finally {
      setNewSending(false);
    }
  };

  // 验证新手机
  const handleVerifyNew = async () => {
    if (!newMobile.trim()) {
      Toast.fail('请输入新手机号');
      return;
    }
    if (!mobileExp(newMobile)) {
      Toast.fail('请输入正确的手机号');
      return;
    }
    if (!newCode.trim()) {
      Toast.fail('请输入验证码');
      return;
    }
    if (!flowId) {
      Toast.fail('缺少验证流程信息，请重新获取验证码');
      return;
    }
    if (!canSubmitNew) return;
    try {
      Toast.loading('提交中...', 0);
      const params = {
        mobile: newMobile.trim(),
        code: newCode.trim(),
        flowId,
      };
      console.log('[ChangeMobile] verify new mobile params:', params);
      const res = await changeNewVerify(params);
      Toast.removeAll();
      const code = (res as any)?.code ?? (res as any)?.status;
      if (String(code) === '200') {
        setNewError(null);
        Toast.success('手机号码更换成功');
        navigation.goBack();
      } else if (String(code) === '515') {
        setNewError('验证码错误，请重新输入');
      } else {
        Toast.show((res as any)?.message || '提交失败');
      }
    } catch (e) {
      Toast.removeAll();
      Toast.fail('提交失败，请稍后重试');
    }
  };

  const oldIsCounting = oldCountdown > 0;
  const newIsCounting = newCountdown > 0;

  const oldCodeButtonText = oldIsCounting
    ? `${oldCountdown}s`
    : oldError || oldSmsRequested
    ? '再次获取'
    : '获取验证码';

  const newCodeButtonText = newIsCounting
    ? `${newCountdown}s`
    : newError || newSmsRequested
    ? '再次获取'
    : '获取验证码';

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: '更换手机号',
        showBack: true,
        background: '#FFFFFF',
      }}
    >
      <View style={styles.container}>
        {step === 1 ? (
          <View style={styles.section}>
            <Text style={styles.title}>原手机号码验证</Text>
            <Text style={styles.desc}>
              {`请输入账号绑定的手机号 ${
                route.params?.mobile || ''
              }，完成手机验证`}
            </Text>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={oldMobile}
                onChangeText={setOldMobile}
                placeholder="原手机号"
                placeholderTextColor="#CCCCCC"
                keyboardType="number-pad"
                maxLength={11}
              />
            </View>

            <View style={[styles.inputRow, oldError && styles.errorBorder]}>
              <TextInput
                style={styles.input}
                value={oldCode}
                onChangeText={setOldCode}
                placeholder="请输入验证码"
                placeholderTextColor="#CCCCCC"
                keyboardType="number-pad"
                maxLength={6}
              />
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.codeBtn,
                  (oldSending || oldIsCounting) && styles.codeBtnDisabled,
                ]}
                onPress={handleSendOldCode}
                disabled={oldSending || oldIsCounting}
              >
                <Text
                  style={[
                    styles.codeBtnText,
                    (oldSending || oldIsCounting) && styles.codeBtnTextDisabled,
                  ]}
                >
                  {oldSending ? '发送中...' : oldCodeButtonText}
                </Text>
              </TouchableOpacity>
            </View>
            {oldError ? <Text style={styles.errorText}>{oldError}</Text> : null}

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.nextBtn, !canNextOld && styles.nextBtnDisabled]}
              onPress={handleVerifyOld}
              disabled={!canNextOld}
            >
              <Text style={styles.nextBtnText}>确定</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.title}>新手机号码绑定</Text>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={newMobile}
                onChangeText={setNewMobile}
                placeholder="请输入新手机号"
                placeholderTextColor="#CCCCCC"
                keyboardType="number-pad"
                maxLength={11}
              />
            </View>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={newCode}
                onChangeText={setNewCode}
                placeholder="请输入验证码"
                placeholderTextColor="#CCCCCC"
                keyboardType="number-pad"
                maxLength={6}
              />
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.codeBtn,
                  (newSending || newIsCounting) && styles.codeBtnDisabled,
                ]}
                onPress={handleSendNewCode}
                disabled={newSending || newIsCounting}
              >
                <Text
                  style={[
                    styles.codeBtnText,
                    (newSending || newIsCounting) && styles.codeBtnTextDisabled,
                  ]}
                >
                  {newSending ? '发送中...' : newCodeButtonText}
                </Text>
              </TouchableOpacity>
            </View>
            {newError ? <Text style={styles.errorText}>{newError}</Text> : null}

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.nextBtn, !canSubmitNew && styles.nextBtnDisabled]}
              onPress={handleVerifyNew}
              disabled={!canSubmitNew}
            >
              <Text style={styles.nextBtnText}>提交</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </PageContainer>
  );
}
