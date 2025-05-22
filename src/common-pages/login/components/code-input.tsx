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
// import {Shadow} from 'react-native-shadow-2';
import {BasicObject} from '@/types';
import {useTranslation} from 'react-i18next';
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
    boxShadow: '0 2px 1px 0px #ADB3C8',
  });
}

const CodeInput = (props: {
  setValueOrCode: (value: string) => void;
  /** 1 otp 0 pwd */
  switchIndex: number;
  userPhone?: string;
  userPhoneCode?: string;
  OTPCode?: string;
  userPassword?: string;
}) => {
  const {
    setValueOrCode,
    switchIndex,
    userPhone,
    userPhoneCode,
    OTPCode,
    userPassword,
  } = props;
  const {i18n} = useTranslation();
  const [hasOTP, setOTP] = React.useState(false);
  const [OTPLoading, setOTPLoading] = React.useState(false);
  const [secureTextEntry, setSecureTextEntry] = React.useState(true);
  const [OTPTime, setOTPTime] = React.useState(59);
  const OTPTimeRef = React.useRef(59);
  const [blured, setBlured] = React.useState(true);
  const setHasOTP = () => {
    setOTP(true);
    OTPTimeRef.current = 59;
    setOTPTime(OTPTimeRef.current);
  };
  React.useEffect(() => {
    const timer = setInterval(function () {
      if (hasOTP && OTPTimeRef.current > 1) {
        setTimeout(() => {
          OTPTimeRef.current = OTPTimeRef.current - 1;
          setOTPTime(OTPTimeRef.current);
        }, 1000);
      } else {
        clearInterval(timer);
        setOTP(false);
      }
    }, 1000);
    return () => {
      timer && clearInterval(timer);
    };
  }, [hasOTP]);
  const opacityPWD = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(opacityPWD, {
      toValue: switchIndex === 1 ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [switchIndex]);

  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    if (
      ((!switchIndex && userPassword) || (switchIndex && OTPCode)) &&
      !blured
    ) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }).start();
    }
  }, [fadeAnim, switchIndex, userPassword, OTPCode, blured]);

  return (
    <View style={[theme.position.rel, theme.fill.fillW]}>
      {userPhone !== undefined && (
        <View
          style={[
            styles.inputBox,
            theme.position.rel,
            theme.fill.fillW,
            blured ? styles.greyBorder : styles.deepBorder,
            // eslint-disable-next-line react-native/no-inline-styles
            {
              // opacity: opacityPWD,
              pointerEvents: switchIndex === 0 ? 'none' : 'auto',
              zIndex: switchIndex === 0 ? -1 : 1,
            },
          ]}>
          <Image
            style={{
              width: 18,
              height: 18,
            }}
            source={require('@components/assets/pofile/idImg.webp')}
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
                if (value) {
                  if (/^[0-9]+$/.test(value)) {
                    setValueOrCode(value);
                  } else {
                    setValueOrCode(OTPCode || '');
                  }
                } else {
                  setValueOrCode('');
                }
              }}
              maxLength={6}
              placeholder={i18n.t('login.tip.otp')}
            />
          </View>
          <Animated.View
            style={[
              theme.margin.rightl,
              {
                opacity: fadeAnim,
              },
            ]}>
            <NativeTouchableOpacity
              disabled={!OTPCode}
              onPress={() => setValueOrCode('')}>
              <Image
                style={[
                  {
                    height: theme.iconSize.xl / 2,
                    width: theme.iconSize.xl / 2,
                    backgroundColor: theme.basicColor.transparent,
                  },
                ]}
                source={closeIcon}
              />
            </NativeTouchableOpacity>
          </Animated.View>
          {/* <Shadow {...shadow}> */}
          <View style={[theme.background.mainDark]}>
            {hasOTP ? (
              <View
                style={[
                  theme.padding.lrl,
                  theme.padding.tbm,
                  theme.borderRadius.xs,
                  theme.background.primary,

                  {
                    width: theme.paddingSize.l * 4,
                  },
                ]}>
                <Text
                  fontSize={theme.fontSize.s}
                  white
                  style={{
                    lineHeight: theme.fontSize.s,
                  }}
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
                  ...styles.getOTP,
                }}
                containerStyle={{
                  borderRadius: theme.borderRadiusSize.xs,
                }}
                onPress={() => {
                  if (OTPLoading) {
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
                }}
                style={[theme.position.rel]}>
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
          {/* </Shadow> */}
        </View>
      )}
      <Animated.View
        style={[
          userPhone !== undefined ? theme.position.abs : null,
          theme.fill.fill,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            left: 0,
            top: 0,
            opacity: opacityPWD,
            pointerEvents: switchIndex === 1 ? 'none' : 'auto',
            zIndex: switchIndex === 1 ? -1 : 1,
          },
        ]}>
        <View
          style={[
            styles.inputBox,
            blured ? styles.greyBorder : styles.deepBorder,
          ]}>
          <Image
            // eslint-disable-next-line react-native/no-inline-styles
            style={{width: 18, height: 18}}
            source={require('@assets/icons/login/lock.webp')}
          />
          <View style={theme.flex.flex1}>
            <Input
              {...inputProps}
              onFocus={() => setBlured(false)}
              onBlur={() => setBlured(true)}
              value={userPassword}
              onChangeText={value => {
                if (value) {
                  if (/^[A-Za-z0-9~!@#$%^&*()_+[\]{};:,.<>?]*$/.test(value)) {
                    setValueOrCode(value);
                  } else {
                    setValueOrCode(userPassword || '');
                  }
                } else {
                  setValueOrCode('');
                }
              }}
              secureTextEntry={secureTextEntry}
              maxLength={18}
              placeholder={i18n.t('login.tip.password')}
            />
          </View>
          <Animated.View
            style={[
              theme.margin.rightl,
              {
                opacity: fadeAnim,
              },
            ]}>
            <NativeTouchableOpacity
              disabled={!userPassword}
              onPress={() => setValueOrCode('')}>
              <Image
                style={[
                  {
                    height: theme.iconSize.xl / 2,
                    width: theme.iconSize.xl / 2,
                    backgroundColor: theme.basicColor.transparent,
                  },
                ]}
                source={closeIcon}
              />
            </NativeTouchableOpacity>
          </Animated.View>
          <NativeTouchableOpacity
            onPress={() => setSecureTextEntry(!secureTextEntry)}>
            {secureTextEntry ? (
              <Image
                style={theme.icon.s}
                source={require('@assets/icons/login/eye-close.webp')}
              />
            ) : (
              <Image
                style={theme.icon.s}
                source={require('@assets/icons/login/eye-open.webp')}
              />
            )}
          </NativeTouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default CodeInput;
