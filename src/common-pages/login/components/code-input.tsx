import React from 'react';
import {View, Image} from 'react-native';
import {Input, Dialog} from '@rneui/themed';
import theme from '@style';
import Text from '@basicComponents/text';
import {sendCode} from '../login.service';
import LinearGradient from '@basicComponents/linear-gradient';
import {inputProps, styles} from '../login.style';
import globalStore from '@/services/global.state';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import Button from '@basicComponents/button';
import {Shadow} from 'react-native-shadow-2';
import {BasicObject} from '@/types';
import {useTranslation} from 'react-i18next';
import {scaleSize} from '@utils';

const closeIcon = require('@components/assets/icons/clear.webp');

const shadow = {
  startColor: '#ADB3C8',
  distance: 0,
  offset: [0, 1],
  style: [theme.borderRadius.xs, theme.overflow.hidden] as BasicObject[],
} as BasicObject;

if (globalStore.isWeb) {
  shadow.distance = 0;
  delete shadow.offset;
  shadow.style.push({
    boxShadow: '0 2px 1px 0px #F7B500',
  });
}

const CodeInput = ({
  setValueOrCode,
  switchIndex,
  userPhone,
  userPhoneCode,
  OTPCode,
  userPassword,
}: {
  setValueOrCode: (value: string) => void;
  switchIndex: number;
  userPhone?: string;
  userPhoneCode?: string;
  OTPCode?: string;
  userPassword?: string;
}) => {
  const {i18n} = useTranslation();
  const [hasOTP, setOTP] = React.useState(false);
  const [OTPLoading, setOTPLoading] = React.useState(false);
  const [secureTextEntry, setSecureTextEntry] = React.useState(true);
  const [OTPTime, setOTPTime] = React.useState(59);
  const [blured, setBlured] = React.useState(true);
  const OTPTimeRef = React.useRef(59);

  const setHasOTP = () => {
    setOTP(true);
    OTPTimeRef.current = 59;
    setOTPTime(OTPTimeRef.current);
  };

  React.useEffect(() => {
    const timer = setInterval(() => {
      if (hasOTP && OTPTimeRef.current > 1) {
        OTPTimeRef.current -= 1;
        setOTPTime(OTPTimeRef.current);
      } else {
        clearInterval(timer);
        setOTP(false);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [hasOTP]);

  return (
    <View style={[theme.position.rel, theme.fill.fillW]}>
      {switchIndex === 1 ? (
        // 验证码输入框
        <View
          style={[
            styles.loginInputBox,
            theme.position.rel,
            theme.fill.fillW,
            blured ? styles.greyBorder : styles.deepBorder,
          ]}>
          <Image
            style={{width: scaleSize(13), height: scaleSize(13)}}
            source={require('@components/assets/icons/code.webp')}
          />
          <View style={theme.flex.flex1}>
            <Input
              {...inputProps}
              onFocus={() => setBlured(false)}
              onBlur={() => setBlured(true)}
              keyboardType="numeric"
              inputMode="numeric"
              value={OTPCode}
              onChangeText={value => {
                if (/^[0-9]*$/.test(value)) {
                  setValueOrCode(value);
                }
              }}
              maxLength={6}
              placeholder={i18n.t('login.tip.otp')}
            />
          </View>
          {OTPCode?.length ? (
            <NativeTouchableOpacity onPress={() => setValueOrCode('')}>
              <Image
                style={{
                  height: theme.iconSize.xl / 2,
                  width: theme.iconSize.xl / 2,
                }}
                source={closeIcon}
              />
            </NativeTouchableOpacity>
          ) : null}
          <Shadow {...shadow}>
            <View>
              {hasOTP ? (
                <View
                  style={[
                    theme.padding.lrl,
                    theme.padding.tbm,
                    theme.borderRadius.xs,
                    {
                      width: theme.paddingSize.l * 4,
                      backgroundColor: theme.basicColor.primary,
                    },
                  ]}>
                  <Text
                    fontSize={theme.fontSize.s}
                    white
                    textAlign="center"
                    blod>
                    {OTPTime}s
                  </Text>
                </View>
              ) : (
                <Button
                  radius={0}
                  buttonStyle={{
                    paddingHorizontal: theme.paddingSize.zorro,
                    paddingVertical: theme.paddingSize.zorro,
                    backgroundColor: theme.basicColor.transparent,
                    ...styles.getOTP,
                  }}
                  containerStyle={{
                    borderRadius: theme.borderRadiusSize.xs,
                  }}
                  onPress={() => {
                    if (OTPLoading || !userPhone) {
                      return;
                    }
                    setOTPLoading(true);
                    sendCode(
                      (globalStore.sendPhoneCode ? userPhoneCode : '') +
                        userPhone,
                    )
                      .then(() => {
                        setHasOTP();
                        globalStore.globalTotal.next({
                          type: 'success',
                          message: i18n.t('tip.success'),
                        });
                      })
                      .finally(() => setOTPLoading(false));
                  }}>
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
          </Shadow>
        </View>
      ) : (
        // 密码输入框
        <View
          style={[
            styles.loginInputBox,
            theme.fill.fillW,
            blured ? styles.greyBorder : styles.deepBorder,
          ]}>
          <Image
            style={{width: scaleSize(10), height: scaleSize(14)}}
            source={require('@assets/icons/login/lock.webp')}
          />
          <View style={theme.flex.flex1}>
            <Input
              {...inputProps}
              onFocus={() => setBlured(false)}
              onBlur={() => setBlured(true)}
              value={userPassword}
              onChangeText={value => {
                if (/^[A-Za-z0-9~!@#$%^&*()_+\[\]{};:,.<>?]*$/.test(value)) {
                  setValueOrCode(value);
                }
              }}
              secureTextEntry={secureTextEntry}
              maxLength={18}
              placeholder={i18n.t('login.tip.password')}
            />
          </View>
          {userPassword?.length ? (
            <NativeTouchableOpacity onPress={() => setValueOrCode('')}>
              <Image
                style={{
                  height: theme.iconSize.xl / 2,
                  width: theme.iconSize.xl / 2,
                }}
                source={closeIcon}
              />
            </NativeTouchableOpacity>
          ) : null}
          <NativeTouchableOpacity
            onPress={() => setSecureTextEntry(!secureTextEntry)}>
            <Image
              style={[theme.icon.s, {marginLeft: 5}]}
              source={
                secureTextEntry
                  ? require('@assets/icons/login/eye-close.webp')
                  : require('@assets/icons/login/eye-open.webp')
              }
            />
          </NativeTouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default CodeInput;
