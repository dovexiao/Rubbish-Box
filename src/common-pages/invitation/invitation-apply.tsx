/* eslint-disable */
/* prettier-ignore */
import React, { useEffect, useRef, useState } from 'react';
import {
  TextInput,
  View,
  Image,
  Platform,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import {
  CardOuterBg,
  invitationApplyColor,
} from './invitation.variables';
import Text from '@basicComponents/text';
import LinearGradient from '@basicComponents/linear-gradient';
import { BasicObject, SafeAny } from '@/types';
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
import { PhoneIcon, SaveIcon } from './svg.variables';
import { NativeTouchableOpacity } from '@/components/basic/touchable-opacity';
import { sendCode, userLogin } from '../login/login.service';
import globalStore from '@/services/global.state';
import i18n from '@/i18n';
import baseVariable from '@/style/base.variable';
import { goTo } from '@/utils';
import theme from '@/style';
import envConfig from '@/utils/env.config';
import {LazyImageBackground} from '@basicComponents/image';
import {useScreenSize} from '@/common-pages/hooks/size.hooks';

const outline: SafeAny = { outline: 0 };

const InvitationApply = (props: SafeAny) => {
  const { route } = props;
  const { screenWidth, screenHeight, calcActualSize } = useScreenSize();

  const [userPhone, setUserPhone] = useState('');
  const [OTPCode, setOTPCode] = useState('');
  const OTPTimeRef = useRef(59);
  const [OTPTime, setOTPTime] = useState(59);
  const [hasOTP, setHasOTP] = useState(false);
  const [OTPLoading, setOTPLoading] = React.useState(false);
  const [inviteCode] = React.useState((route.params as BasicObject)?.code);
  const InvitationApplyModalRef: SafeAny = useRef(null);

  // 使用 useScreenSize hook适配设计稿
  // 页面头高
  const headerHeight: number = calcActualSize(35);
  // 邀请广告尺寸
  const iApplyImageSize = React.useMemo(() => {
    return {
      width: screenWidth * 0.9,
      height: calcActualSize(91),
    };
  }, [screenWidth]);
  // 邀请背景尺寸
  const iApplyBgSize = React.useMemo(() => {
    return {
      width: screenWidth,
      height: calcActualSize(193),
    };
  }, [screenWidth]);
  // 操作卡片背景尺寸
  const cardBgSize = React.useMemo(() => {
    return {
      width: calcActualSize(345),
      height: calcActualSize(359),
      marginTop: iApplyBgSize.height + headerHeight,
      marginHorizontal: calcActualSize(15),
    };
  }, [screenWidth]);
  // 卡片内部尺寸集
  const cardSizes = React.useMemo(() => {
    return {
      header: {
        width: calcActualSize(180),
        marginLeft: calcActualSize(30),
        marginTop: calcActualSize(21),
      },
      content: {
        paddingHorizontal: calcActualSize(23),
      },
      phoneInput: {
        marginTop: calcActualSize(39),
        height: calcActualSize(44),
      },
      otpInput: {
        marginTop: calcActualSize(10),
        height: calcActualSize(44),
      },
      button: {
        marginTop: calcActualSize(29),
        height: calcActualSize(44),
        borderRadius: calcActualSize(22),
      },
      tip: {
        width: calcActualSize(230),
        marginTop: calcActualSize(10),
      },
      gift: {
        width: calcActualSize(123),
        height: calcActualSize(134),
        translateY: -calcActualSize(38),
      },
      titleFontSize: calcActualSize(20),
      titleLineHeight: calcActualSize(24),
      inputIconSize: calcActualSize(20),
      inputFontSize: calcActualSize(18),
      buttonFontSize:  calcActualSize(18),
    };
  }, [cardBgSize])

  const startOTPCountdown = () => {
    setHasOTP(true);
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
        setHasOTP(false);
      }
    }, 1000);
    return () => {
      timer && clearInterval(timer);
    };
  }, [hasOTP]);

  return (
    <View
      style={{
        flex: 1,
        height: Dimensions.get('window').height,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <LinearGradient
        colors={theme.basicColor.newBgOne}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 1, y: 0.92 }}
        style={[theme.position.rel, { height: '100%' }]}
      >
        <View
          style={{flex: 1}}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Image
              style={{
                width: iApplyImageSize.width,
                height: iApplyImageSize.height,
                position: 'absolute',
                top: headerHeight,
                left: '50%',
                transform: [{ translateX: -iApplyImageSize.width / 2 }],
                zIndex: 2,
              }}
              source={{
                uri: envConfig.getInvitationApply,
              }}
            />
            <Image
              style={{
                width: iApplyBgSize.width,
                height: iApplyBgSize.height,
                marginLeft: 'auto',
                marginRight: 'auto',
                position: 'absolute',
                marginTop: headerHeight,
              }}
              source={require('@assets/imgs/invitation/invitation-apply-header-background.webp')}
            />
            <LazyImageBackground
              imageUrl={CardOuterBg}
              occupancy="#000"
              width={cardBgSize.width}
              height={cardBgSize.height}
              style={{ marginHorizontal: cardBgSize.marginHorizontal, marginTop: cardBgSize.marginTop }}
            >
              {/*头部标题*/}
              <View style={cardSizes.header}>
                <Text
                  fontSize={cardSizes.titleFontSize}
                  color={basicColor.newFontWhite}
                  fontFamily="fontInterBold"
                  style={{ lineHeight: cardSizes.titleLineHeight }}
                >
                  {i18n.t('referral.label.title')}
                </Text>
              </View>
              {/*内容*/}
              <View style={cardSizes.content}>
                {/*phone输入框*/}
                <View
                  style={[
                    {
                      height: cardSizes.phoneInput.height,
                      marginTop: cardSizes.phoneInput.marginTop,
                      borderWidth: 1,
                      borderColor: invitationApplyColor.borderColor,
                      backgroundColor:
                      invitationApplyColor.backgroundColor,
                    },
                    padding.lrl,
                    theme.fill.fillW,
                    borderRadius.m,
                    flex.row,
                    flex.centerByCol,
                  ]}
                >
                  <View style={{
                    width: cardSizes.inputIconSize,
                    height: cardSizes.inputIconSize,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <PhoneIcon />
                  </View>
                  <TextInput
                    placeholder="Phone number"
                    style={[
                      {
                        height: cardSizes.phoneInput.height,
                        marginLeft: 16,
                        borderWidth: 0,
                        fontSize: cardSizes.inputFontSize,
                      },
                      flex.flex1,
                      outline,
                    ]}
                    value={userPhone}
                    maxLength={10}
                    keyboardType="numeric"
                    placeholderTextColor={baseVariable.fontColor.secAccent}
                    onChangeText={(v) => setUserPhone(v)}
                  />
                </View>
                {/*otp输入框*/}
                <View
                  style={[
                    {
                      height: cardSizes.otpInput.height,
                      marginTop: cardSizes.otpInput.marginTop,
                      borderWidth: 1,
                      borderColor: invitationApplyColor.borderColor,
                      backgroundColor: invitationApplyColor.backgroundColor,
                    },
                    padding.lrl,
                    theme.fill.fillW,
                    borderRadius.m,
                    flex.row,
                    flex.centerByCol,
                  ]}
                >
                  <View style={{
                    width: cardSizes.inputIconSize,
                    height: cardSizes.inputIconSize,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                    <SaveIcon />
                  </View>
                  <TextInput
                    placeholder="OTP"
                    underlineColorAndroid={'transparent'}
                    style={[
                      {
                        height: cardSizes.otpInput.height,
                        marginLeft: 16,
                        borderWidth: 0,
                        fontSize: cardSizes.inputFontSize,
                      },
                      flex.flex1,
                      outline,
                    ]}
                    value={OTPCode}
                    maxLength={6}
                    keyboardType="numeric"
                    placeholderTextColor={baseVariable.fontColor.secAccent}
                    onChangeText={(v) => {
                      if (/^[0-9]*$/.test(v)) setOTPCode(v);
                    }}
                  />
                  {hasOTP ? (
                    <Text
                      fontSize={cardSizes.inputFontSize}
                      accent
                      style={{ lineHeight: fontSize.s }}
                      textAlign="center"
                      blod
                    >
                      {OTPTime}s
                    </Text>
                  ) : (
                    <NativeTouchableOpacity
                      onPress={() => {
                        if (!userPhone || OTPLoading) return;
                        setOTPLoading(true);
                        sendCode(userPhone)
                          .then(() => {
                            startOTPCountdown();
                            globalStore.globalTotal.next({
                              type: 'success',
                              message: i18n.t('tip.success'),
                            });
                          })
                          .finally(() => setOTPLoading(false));
                      }}
                    >
                      <Text
                        color={basicColor.newFontRed}
                        fontSize={cardSizes.inputFontSize}
                        fontWeight="bold"
                      >
                        Send
                      </Text>
                    </NativeTouchableOpacity>
                  )}
                </View>
                {/*按钮*/}
                <View
                  style={[
                    cardSizes.button,
                    { backgroundColor: '#D7281E' }
                  ]}
                >
                  <NativeTouchableOpacity
                    style={[
                      flex.flex1,
                      theme.fill.fillW,
                      flex.center,
                      { height: cardSizes.button.height }
                    ]}
                    onPress={() => {
                      if (OTPLoading || !userPhone || !OTPCode) return;
                      globalStore.globalLoading.next(true);
                      let deviceCode = '';
                      if (Platform.OS !== 'android') {
                        deviceCode = localStorage.getItem('gps_adid') || '';
                      }
                      userLogin(userPhone, OTPCode, deviceCode, '', '', '', '', inviteCode)
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
                    }}
                  >
                    <Text
                      fontSize={cardSizes.buttonFontSize}
                      color={basicColor.newFontWhite}
                      fontFamily="fontInterBold"
                    >
                      {i18n.t('label.logIn')}
                    </Text>
                  </NativeTouchableOpacity>
                </View>
                {/*tip*/}
                <View style={{
                  marginTop: cardSizes.tip.marginTop,
                  alignItems: 'center',
                }} >
                  <Text
                    accent
                    size="small"
                    calc
                    textAlign="center"
                    color={'#76797D'}
                    style={{ width: cardSizes.tip.width }}
                  >
                    {i18n.t('referral.tip.desc')}
                  </Text>
                </View>
              </View>
              <Image
                style={{
                  width: cardSizes.gift.width,
                  height: cardSizes.gift.height,
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  transform: [{ translateY: cardSizes.gift.translateY }]
                }}
                source={require('@assets/imgs/invitation/gift.webp')}
              />
            </LazyImageBackground>
            <InvitationApplyModal ref={InvitationApplyModalRef} />
          </ScrollView>
        </View>
      </LinearGradient>
    </View>
  );
};

export default InvitationApply;
