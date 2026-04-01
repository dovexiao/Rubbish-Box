import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PageContainer, Flex, TextInput } from '@/components';
import {
  mobileExp,
  cacheGet,
  showLoading,
  hideLoading,
  showToast,
} from '@/utils';
import { getSmsCode } from '@/services/common';
import { SMS_PURPOSE } from '@/constants';
import styles from './styles';

const BindPhone = () => {
  const navigation = useNavigation<any>();
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mobile, setMobile] = useState('');

  const onNext = async () => {
    if (!mobileExp(mobile)) {
      setShowError(true);
      setErrorMessage('手机号码有误');
      return;
    }

    setShowError(false);
    showLoading({ title: '发送中' });

    try {
      const tokenRes = await cacheGet({ key: 'token' });
      const token = tokenRes || '';
      const res = await getSmsCode({
        mobile,
        purpose: SMS_PURPOSE.BIND_PHONE,
        tempToken: token,
      });

      if (res.code === 200) {
        hideLoading();
        navigation.navigate('LoginSms', {
          mobile,
          type: SMS_PURPOSE.BIND_PHONE,
          tempToken: token,
        });
      } else if (res.code === 522) {
        hideLoading();
        setShowError(true);
        setErrorMessage(
          res.data == '临时token已失效'
            ? '微信授权失效，请返回重新授权'
            : '此手机号码未注册',
        );
      } else {
        hideLoading();
        showToast({
          title: res.msg || res.message || '发送失败',
          icon: 'info',
        });
      }
    } catch (error) {
      hideLoading();
      showToast({ title: '发送失败，请重试', icon: 'info' });
      console.error('获取验证码异常:', error);
    }
  };

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      pageNavProps={{
        text: '',
        showBack: true,
      }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <Text style={styles.passwordTitle}>绑定手机号</Text>
          <Flex
            style={[styles.content, showError ? styles.error : {}]}
            align="center"
          >
            <TextInput
              placeholder="请输入手机号"
              placeholderTextColor="#CCCCCC"
              style={styles.input}
              value={mobile}
              onChangeText={v => {
                setMobile(v);
                if (v && v.length === 11 && mobileExp(v)) {
                  setShowError(false);
                }
              }}
              maxLength={11}
              showClear
              keyboardType="numeric"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
            />

            {showError ? (
              <Text style={styles.errorMessage}>{errorMessage}</Text>
            ) : null}
          </Flex>
          <TouchableOpacity
            style={[styles.btn, mobile && !showError ? styles.btnActive : {}]}
            onPress={() => {
              Keyboard.dismiss();
              onNext();
            }}
            disabled={!mobile || showError}
          >
            <Text style={styles.btnText}>获取验证码</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </PageContainer>
  );
};

export default BindPhone;
