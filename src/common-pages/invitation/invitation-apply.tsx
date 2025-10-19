/* eslint-disable */
/* prettier-ignore */
import React, {useEffect, useRef, useState} from 'react';
import {TextInput, View, Image, Platform} from 'react-native';
import {
  CardOuterBg,
  invitationApplyColor,
} from './invitation.variables';
import Text from '@basicComponents/text';
import LinearGradient from '@basicComponents/linear-gradient';
import {BasicObject, SafeAny} from '@/types';

import InvitationApplyModal from './invitation-apply-modal';
import {
  basicColor,
  borderRadius,
  flex,
  fontSize,
  margin,
  padding,
  position,
} from '@/components/style';
import LazyImage from '@/components/basic/image';
import {PhoneIcon, SaveIcon} from './svg.variables';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {sendCode, userLogin} from '../login/login.service';
import globalStore from '@/services/global.state';
import i18n from '@/i18n';
import baseVariable from '@/style/base.variable';
import {goTo, useResponsiveDimensions} from '@/utils';
import theme from '@/style';
import envConfig from '@/utils/env.config';
const outline: SafeAny = {
  outline: 0,
};
const InvitationApply = (props: SafeAny) => {
  const [userPhone, setUserPhone] = useState('');
  const [OTPCode, setOTPCode] = useState('');
  const OTPTimeRef = useRef(59);
  const InvitationApplyModalRef: SafeAny = useRef(null);
  const [OTPTime, setOTPTime] = useState(59);
  const [hasOTP, setOTP] = useState(false);
  const [OTPLoading, setOTPLoading] = React.useState(false);
  const {route} = props;
  const [invitaCode] = React.useState((route.params as BasicObject)?.code);
  const {width: screenWidth, height: screenHeight} = useResponsiveDimensions();
  const setHasOTP = () => {
    setOTP(true);
    OTPTimeRef.current = 59;
    setOTPTime(OTPTimeRef.current);
  };
  useEffect(() => {
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
  const fromBgSize = React.useMemo(() => {
    const calc = screenWidth / 350;

    return {
      formBox: {
        width: screenWidth - theme.paddingSize.l * 2,
        // 351 / 372
        height: ((screenWidth - theme.paddingSize.l * 2) / 351) * 372,
      },
      formTitleBg: {
        // 335 / 67
        height:
          ((screenWidth - (theme.paddingSize.l + theme.paddingSize.s) * 2) /
            335) *
          67,
        paddingLeft: calc * 25,
      },
      titlsSize: {
        width: calc * 200,
      },
      button: {
        height: calc * 48,
      },
    };
  }, [screenWidth]);

  return (
    <LinearGradient
      colors={theme.basicColor.newBgOne}
      start={{x: 0.2, y: 0}}
      end={{x: 1, y: 0.92}}
      style={[theme.position.rel, {height: screenHeight}]}>
      <Image
        style={[
          {
            width: screenWidth / 1.11,
            height: screenWidth / 4.12,
            position: 'absolute',
            top: 40,
            right: '50%',
            transform: [{translateX: screenWidth / 1.11 / 2}],
            zIndex: 2,
          },
        ]}
        source={{
          uri: envConfig.getInvitationApply,
        }}></Image>
      <Image
        style={[
          {
            width: screenWidth,
            height: screenWidth / 1.94,
            marginLeft: 'auto',
            marginRight: 'auto',
            position: 'absolute',
            marginTop: 40,
          },
        ]}
        source={require('@assets/imgs/invitation/invitation-2.png')}></Image>
      <View
        style={[
          {
            marginTop: screenWidth / 1.5,
          },
          theme.fill.fillW,
          padding.lrl,
        ]}>
        <LazyImage
          imageUrl={CardOuterBg}
          occupancy="#0000"
          width={'100%'}
          height={fromBgSize.formBox.height}
        />
        <View style={[position.abs, fromBgSize.formBox]}>
          <View style={[theme.fill.fill, theme.padding.tbs]}>
            <View style={[fromBgSize.formTitleBg, theme.flex.centerByRow]}>
              <Text
                fontSize={20}
                calc
                color={basicColor.newFontWhite}
                style={[
                  {
                    width: fromBgSize.titlsSize.width,
                  },
                ]}
                fontFamily="fontInterBold">
                {i18n.t('referral.label.title')}
              </Text>
            </View>
            <View
              style={[
                padding.lrl,
                padding.btml,
                margin.lrs,
                theme.flex.flex1,
                {
                  borderEndEndRadius: theme.borderRadiusSize.xl,
                  borderEndStartRadius: theme.borderRadiusSize.xl,
                  backgroundColor: theme.basicColor.newBgInOne,
                },
              ]}>
              <View style={[theme.flex.flex1, theme.flex.center]}>
                <View
                  style={[
                    // eslint-disable-next-line react-native/no-inline-styles
                    {
                      height: fromBgSize.button.height,
                      borderWidth: 1,
                      borderColor: invitationApplyColor.borderColor,
                      backgroundColor: invitationApplyColor.backgroundColor,
                    },
                    padding.lrl,
                    theme.fill.fillW,
                    borderRadius.m,
                    flex.row,
                    flex.centerByCol,
                  ]}>
                  <PhoneIcon width={24} height={24} />
                  <TextInput
                    placeholder="Phone number"
                    style={[
                      // eslint-disable-next-line react-native/no-inline-styles
                      {
                        height: fromBgSize.button.height,
                        marginLeft: 16,
                        borderWidth: 0,
                        borderColor: 'none',
                      },
                      flex.flex1,
                      outline,
                    ]}
                    value={userPhone}
                    maxLength={10}
                    placeholderTextColor={baseVariable.fontColor.secAccent}
                    onChange={(e: SafeAny) => setUserPhone(e.target.value)}
                  />
                </View>
                <View
                  style={[
                    // eslint-disable-next-line react-native/no-inline-styles
                    {
                      height: fromBgSize.button.height,
                      borderWidth: 1,
                      borderColor: invitationApplyColor.borderColor,
                      backgroundColor: invitationApplyColor.backgroundColor,
                    },
                    padding.lrl,
                    theme.fill.fillW,
                    borderRadius.m,
                    flex.row,
                    flex.centerByCol,
                    margin.topl,
                  ]}>
                  <SaveIcon width={24} height={24} />
                  <TextInput
                    placeholder="OTP"
                    underlineColorAndroid={'transparent'}
                    style={[
                      // eslint-disable-next-line react-native/no-inline-styles
                      {
                        height: fromBgSize.button.height / 2,
                        marginLeft: 16,
                        borderWidth: 0,
                        borderColor: 'none',
                        fontSize: 15,
                      },
                      flex.flex1,
                      outline,
                    ]}
                    value={OTPCode}
                    maxLength={6}
                    placeholderTextColor={baseVariable.fontColor.secAccent}
                    onChangeText={value => {
                      if (value) {
                        if (/^[0-9]+$/.test(value)) {
                          setOTPCode(value);
                        } else {
                          setOTPCode(OTPCode || '');
                        }
                      } else {
                        setOTPCode('');
                      }
                    }}
                  />
                  {hasOTP ? (
                    <Text
                      fontSize={fontSize.s}
                      accent
                      style={{
                        lineHeight: fontSize.s,
                      }}
                      textAlign="center"
                      blod>
                      {OTPTime}s
                    </Text>
                  ) : (
                    <NativeTouchableOpacity
                      onPress={() => {
                        if (!userPhone) {
                          return;
                        }
                        if (OTPLoading) {
                          return;
                        }
                        setOTPLoading(true);
                        sendCode(userPhone)
                          .then(() => {
                            setHasOTP();
                            globalStore.globalTotal.next({
                              type: 'success',
                              message: i18n.t('tip.success'),
                            });
                          })
                          .finally(() => setOTPLoading(false));
                      }}>
                      <Text
                        color={basicColor.newFontRed}
                        fontSize={15}
                        fontWeight="bold">
                        Send
                      </Text>
                    </NativeTouchableOpacity>
                  )}
                </View>
              </View>
              <NativeTouchableOpacity
                onPress={() => {
                  if (OTPLoading) {
                    return;
                  }
                  if (!userPhone || !OTPCode) {
                    return;
                  }
                  globalStore.globalLoading.next(true);
                  let deviceCode = '';
                  if (Platform.OS !== 'android') {
                    deviceCode = localStorage.getItem('gps_adid') || '';
                  }
                  userLogin(
                    userPhone,
                    OTPCode,
                    deviceCode,
                    '',
                    '',
                    '',
                    invitaCode,
                  )
                    .then((res: SafeAny) => {
                      globalStore.globalTotal.next({
                        type: 'success',
                        message: i18n.t('tip.success'),
                      });
                      globalStore.token = res.token;
                      globalStore.isNewUser = String(res.isNewUser);
                      goTo(globalStore.homePage);
                    })
                    .finally(() => globalStore.globalLoading.next(false));
                }}>
                <View
                  style={[
                    flex.flex1,
                    {
                      borderRadius: fromBgSize.button.height / 2,
                    },
                  ]}>
                  <LinearGradient
                    style={[fromBgSize.button, theme.fill.fillW, flex.center]}
                    start={{x: 0, y: 0.5}}
                    end={{x: 1, y: 0.5}}
                    colors={basicColor.newButtonLinear}>
                    <View>
                      <Text
                        fontSize={16}
                        color={basicColor.newFontWhite}
                        fontFamily="fontInterBold">
                        {i18n.t('label.logIn')}
                      </Text>
                    </View>
                  </LinearGradient>
                </View>
              </NativeTouchableOpacity>
              <Text
                accent
                size="small"
                calc
                textAlign="center"
                color={basicColor.newFontWhite}
                style={[margin.tops]}>
                {i18n.t('referral.tip.desc')}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <InvitationApplyModal ref={InvitationApplyModalRef} />
    </LinearGradient>
  );
};

export default InvitationApply;
