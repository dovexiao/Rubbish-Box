import { Flex, PageContainer } from '@/components';
import { useState } from 'react';
import { Keyboard, Text, TextInput, View } from 'react-native';
import { hideLoading, mobileExp, showLoading, showToast } from '@/utils';
import { getSmsCode } from '@/services';
import { SMS_PURPOSE } from '@/constants';
import { useNavigation } from '@react-navigation/native';
import forgetPasswordStyles from './styles';

const ForgetPassword = () => {
  const navigation = useNavigation<any>();

  const [showError, setShowError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [mobile, setMobile] = useState<string>('');

  const onNext = async () => {
    if (!mobile || !mobileExp(mobile)) {
      setShowError(true);
      setErrorMessage('手机号码有误');
      return;
    }
    setShowError(false);
    showLoading({ title: '发送中...' });
    const res = await getSmsCode({
      mobile,
      purpose: SMS_PURPOSE.RESET_PASSWORD,
    });
    hideLoading();
    if (res.code === 200) {
      navigation.navigate('LoginSms', {
        mobile,
        type: SMS_PURPOSE.RESET_PASSWORD,
      });
    } else if (res.code === 522) {
      setShowError(true);
      setErrorMessage('此手机号码未注册');
    } else {
      showToast(res.msg || '发送失败');
    }
  };

  return (
    <PageContainer
      style={forgetPasswordStyles.container}
      pageNavProps={{
        text: '忘记密码',
        showBack: true,
      }}
    >
      <View>
        <Text style={forgetPasswordStyles.passwordTitle}>忘记密码</Text>
        <Flex
          style={[
            forgetPasswordStyles.content,
            ...(showError ? [forgetPasswordStyles.error] : []),
          ]}
          align="center"
        >
          <TextInput
            placeholder="请输入手机号"
            placeholderTextColor="#CCCCCC"
            style={forgetPasswordStyles.input}
            onChangeText={v => {
              setMobile(v);
              if (v && v.length === 11 && mobileExp(v)) {
                setShowError(false);
              }
            }}
            value={mobile}
            maxLength={11}
            keyboardType="numeric"
          />

          {showError ? (
            <Text style={forgetPasswordStyles.errorMessage}>
              {errorMessage}
            </Text>
          ) : (
            <></>
          )}
        </Flex>
        <Flex
          style={[
            forgetPasswordStyles.btn,
            ...(mobile && !showError ? [forgetPasswordStyles.btnActive] : []),
          ]}
          isTouchView
          justify="center"
          align="center"
          onPress={() => {
            Keyboard.dismiss();
            onNext();
          }}
        >
          <Text style={forgetPasswordStyles.btnText}>获取验证码</Text>
        </Flex>
      </View>
    </PageContainer>
  );
};

export default ForgetPassword;
