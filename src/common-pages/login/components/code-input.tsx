import React from 'react';
import {Animated, View, Image} from 'react-native';
import {Input} from '@rneui/themed';
import theme from '@style';
import Text from '@basicComponents/text';
import {sendCode} from '../login.service';
import LinearGradient from '@basicComponents/linear-gradient';
import {inputProps, styles} from '../login.style';
import {Dialog} from '@rneui/themed';
import globalStore from '@/services/global.state';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import Button from '@basicComponents/button';
import {useTranslation} from 'react-i18next';

// const closeIcon = require('@components/assets/icons/clear.webp');

const CodeInput = ({
  setValueOrCode,
  switchIndex,
  userPhone = '',
  userPhoneCode = '',
  OTPCode = '',
  userPassword = '',
}: {
  setValueOrCode: (value: string) => void;
  switchIndex: number;
  userPhone?: string;
  userPhoneCode?: string;
  OTPCode?: string;
  userPassword?: string;
}) => {
  const {i18n} = useTranslation();
  const [secureTextEntry, setSecureTextEntry] = React.useState(true);
  const [hasOTP, setHasOTP] = React.useState(false);
  const [OTPLoading, setOTPLoading] = React.useState(false);
  const [countdown, setCountdown] = React.useState(60);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (hasOTP && countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      setHasOTP(false);
      setCountdown(60);
      timerRef.current && clearTimeout(timerRef.current);
    }
    return () => {
      timerRef.current && clearTimeout(timerRef.current);
    };
  }, [countdown, hasOTP]);

  // 复用清除按钮动画
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    const hasValue = switchIndex === 0 ? !!userPassword : !!OTPCode;
    Animated.timing(fadeAnim, {
      toValue: hasValue ? 1 : 0,
      duration: 100,
      useNativeDriver: true,
    }).start();
  }, [userPassword, OTPCode, switchIndex, fadeAnim]);

  const handleGetOTP = () => {
    if (OTPLoading) {
      return;
    }
    if (!userPhone) {
      globalStore.globalWaringTotal(i18n.t('login.tip.no-phone'));
      return;
    }
    setOTPLoading(true);
    sendCode((globalStore.sendPhoneCode ? userPhoneCode : '') + userPhone)
      .then(() => {
        globalStore.globalTotal.next({
          type: 'success',
          message: i18n.t('tip.success'),
        });
        setHasOTP(true);
      })
      .finally(() => setOTPLoading(false));
  };

  return (
    <View style={[theme.fill.fillW]}>
      {switchIndex === 0 ? (
        // Password Input
        <View style={[styles.inputBox, theme.position.rel]}>
          <Image
            style={{width: 18, height: 18}}
            source={require('@assets/icons/login/lock.webp')}
          />
          <View style={theme.flex.flex1}>
            <Input
              {...inputProps}
              value={userPassword}
              onChangeText={value => {
                const valid = /^[A-Za-z0-9~!@#$%^&*()_+\[\]{};:,.<>?]*$/.test(
                  value,
                );
                setValueOrCode(valid ? value : userPassword);
              }}
              secureTextEntry={secureTextEntry}
              maxLength={18}
              placeholder={i18n.t('login.tip.password')}
            />
          </View>
          <Animated.View style={{opacity: fadeAnim}}>
            <NativeTouchableOpacity
              disabled={!userPassword}
              onPress={() => setValueOrCode('')}>
              {/*<Image*/}
              {/*  style={[*/}
              {/*    {height: theme.iconSize.xl / 2, width: theme.iconSize.xl / 2},*/}
              {/*  ]}*/}
              {/*  source={closeIcon}*/}
              {/*/>*/}
            </NativeTouchableOpacity>
          </Animated.View>
          <NativeTouchableOpacity
            onPress={() => setSecureTextEntry(!secureTextEntry)}>
            <Image
              style={theme.icon.s}
              source={
                secureTextEntry
                  ? require('@assets/icons/login/eye-close.webp')
                  : require('@assets/icons/login/eye-open.webp')
              }
            />
          </NativeTouchableOpacity>
        </View>
      ) : (
        // OTP Input
        <View style={[styles.inputBox, theme.position.rel]}>
          <Image
            style={{width: 18, height: 18}}
            source={require('@components/assets/pofile/idImg.webp')}
          />
          <View style={theme.flex.flex1}>
            <Input
              {...inputProps}
              value={OTPCode}
              keyboardType="numeric"
              onChangeText={value => {
                const valid = /^[0-9]*$/.test(value);
                setValueOrCode(valid ? value : OTPCode);
              }}
              maxLength={6}
              placeholder={i18n.t('login.tip.otp')}
            />
          </View>
          <Animated.View style={{opacity: fadeAnim}}>
            <NativeTouchableOpacity
              disabled={!OTPCode}
              onPress={() => setValueOrCode('')}>
              {/*<Image*/}
              {/*  style={[*/}
              {/*    {height: theme.iconSize.xl / 2, width: theme.iconSize.xl / 2},*/}
              {/*  ]}*/}
              {/*  source={closeIcon}*/}
              {/*/>*/}
            </NativeTouchableOpacity>
          </Animated.View>
          {hasOTP ? (
            <View
              style={[
                theme.padding.lrl,
                theme.padding.tbm,
                theme.borderRadius.xs,
                theme.background.primary,
              ]}>
              <Text white blod>
                {countdown}s
              </Text>
            </View>
          ) : (
            <Button
              radius={0}
              buttonStyle={{
                paddingHorizontal: theme.paddingSize.zorro,
                paddingVertical: theme.paddingSize.zorro,
                ...styles.getOTP,
              }}
              containerStyle={{
                borderRadius: theme.borderRadiusSize.xs,
              }}
              onPress={handleGetOTP}>
              <LinearGradient
                style={[theme.padding.lrl, theme.padding.tbs]}
                colors={theme.linearGradientColor.linearGradientBtnColor}
                start={{x: 0, y: 0}}
                end={{x: 0, y: 1}}>
                {OTPLoading ? (
                  <Dialog.Loading
                    loadingProps={{size: 'small'}}
                    loadingStyle={[
                      theme.icon.xs,
                      {
                        marginVertical: theme.paddingSize.xxs / 2,
                        marginHorizontal: theme.paddingSize.xs,
                      },
                    ]}
                  />
                ) : (
                  <Text white>{i18n.t('login.label.get-otp')}</Text>
                )}
              </LinearGradient>
            </Button>
          )}
        </View>
      )}
    </View>
  );
};

export default CodeInput;
