import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { TextInput } from '@/components';
import { mobileExp } from '@/utils';
import loginStyles from './styles';
import { getSmsCode } from '@/services';
import { SMS_PURPOSE } from '@/constants';
import IconFont from '@/iconfont';

interface SmsProps {
  agree: boolean;
  onChange: (mobile: string) => void;
  agreePopRef?: React.RefObject<any>;
}

const Sms: React.FC<SmsProps> = ({ agree, onChange, agreePopRef }) => {
  const [showError, setShowError] = useState(false);
  const [mobile, setMobile] = useState('');

  const onNext = async () => {
    if (!mobile || !mobileExp(mobile)) {
      setShowError(true);
      return;
    }

    if (!agree) {
      if (agreePopRef?.current) {
        agreePopRef.current.open();
      }
      return;
    }

    setShowError(false);
    // Toast.loading('发送中')
    const res = await getSmsCode({ mobile, purpose: SMS_PURPOSE.LOGIN })
    // Toast.hide()

    if (res.code === '200') {
      // navigateTo({
      //   url: `/pages/login/sms?${stringify({
      //     mobile,
      //   })}`,
      // })
    } else if (res.code === '521') {
      setShowError(true)
    } else {
      // Toast.show(res.message)
    }

  }


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={loginStyles.container}>
        <View style={[loginStyles.content, showError && loginStyles.errorBorder]}>
          <TextInput
            placeholder="请输入手机号"
            style={loginStyles.input}
            placeholderTextColor="#CCCCCC"
            value={mobile}
            onChangeText={(v) => {
              setMobile(v);
              if (v && v.length === 11 && mobileExp(v)) {
                setShowError(false);
              }
            }}
            maxLength={11}
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={Keyboard.dismiss}
          />
        </View>
        <View style={loginStyles.tip}>
          <Text style={loginStyles.tipText}>未注册手机号验证后自动创建泊刻地锁账号</Text>
        </View>
        <TouchableOpacity
          style={[loginStyles.btn, mobile && !showError && loginStyles.btnActive]}
          onPress={() => {
            Keyboard.dismiss();
            onNext();
          }}>
          {showError ? <Text style={loginStyles.error}>手机号码有误</Text> : <></>}
          <Text style={loginStyles.btnText}>获取验证码</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={loginStyles.changeType}
          onPress={() => {
            Keyboard.dismiss();
            onChange(mobile);
          }}>
          <Text style={loginStyles.changeTypeDesc}>密码登录</Text>
          <IconFont name="a-headfor-12" size={20} color="#333333" />
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Sms; 