import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { TextInput } from '@/components';
import { eventCenter, mobileExp } from '@/utils';
import { getSmsCode } from '@/services';
import { SMS_PURPOSE } from '@/constants';
import Toast from '@ant-design/react-native/lib/toast';
import { useNavigation } from '@react-navigation/native';
import loginStyles from './styles';
interface SmsProps {
  agree: boolean;
  onChange: (mobile: string) => void;
  popRef?: React.RefObject<any>;
  initialMobile?: string;
}

const Sms: React.FC<SmsProps> = ({ agree, onChange, popRef, initialMobile }) => {
  const navigation = useNavigation<any>();
  const [showError, setShowError] = useState(false);
  const [mobile, setMobile] = useState('');

  const onNext = async () => {
    if (!mobile || !mobileExp(mobile)) {
      setShowError(true);
      return;
    }

    if (!agree) {
      if (popRef?.current) {
        popRef.current.open();
      }
      return;
    }

    setShowError(false);
    const loadingToast = Toast.loading('发送中', 0);
    const res = await getSmsCode({ mobile, purpose: SMS_PURPOSE.LOGIN })
    Toast.remove(loadingToast)
    console.log('res', res)

    if (res.code === 200) {
      navigation.navigate('LoginSms', { mobile, type: SMS_PURPOSE.LOGIN })
    } else if (res.code === 521) {
      setShowError(true)
    } else {
      Toast.fail(res.msg || '发送失败');
    }

  }

  // 同步外部传入的 initialMobile
  useEffect(() => {
    if (initialMobile) {
      setMobile(initialMobile);
    }
  }, [initialMobile]);

  // 监听 onNext 事件（协议同意后触发）
  useEffect(() => {
    const handler = () => {
      onNext();
    };
    eventCenter.on('onNext', handler);
    return () => {
      eventCenter.off('onNext', handler);
    };
  }, [mobile, agree]);


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
              onChange(v); // 同步更新父组件的 mobile 状态
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
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Sms; 