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
  KeyboardAvoidingView,
} from 'react-native';
import {CardOuterBg, invitationApplyColor} from './invitation.variables';
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
import {PhoneIcon, SaveIcon} from './svg.variables';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {sendCode, userLogin} from '../login/login.service';
import globalStore from '@/services/global.state';
import i18n from '@/i18n';
import baseVariable from '@/style/base.variable';
import {goTo, useResponsiveDimensions} from '@/utils';
import theme from '@/style';
import envConfig from '@/utils/env.config';
import {LazyImageBackground} from '@basicComponents/image';
import {getDeviceInfo} from '@/utils/device';

const outline: SafeAny = {outline: 0};
const {os} = getDeviceInfo();

const InvitationApply = (props: SafeAny) => {
  const {route} = props;
  const {width: screenWidth, height: screenHeight} = useResponsiveDimensions();

  const [userPhone, setUserPhone] = useState('');
  const [OTPCode, setOTPCode] = useState('');
  const OTPTimeRef = useRef(59);
  const [OTPTime, setOTPTime] = useState(59);
  const [hasOTP, setHasOTP] = useState(false);
  const [OTPLoading, setOTPLoading] = React.useState(false);
  const [inviteCode] = React.useState((route.params as BasicObject)?.code);
  const InvitationApplyModalRef: SafeAny = useRef(null);

  // 以设计稿为主，样式响应式临时方案
  // 页面头高
  const headerHeight: number = (screenWidth * 73) / 750;
  // 邀请广告尺寸
  const iApplyImageSize = React.useMemo(() => {
    return {
      width: screenWidth * 0.9,
      height: (screenWidth * 0.9 * 273) / 1013,
    };
  }, [screenWidth]);
  // 邀请背景尺寸
  const iApplyBgSize = React.useMemo(() => {
    return {
      width: screenWidth,
      height: (screenWidth * 386) / 750,
    };
  }, [screenWidth]);
  // 操作卡片背景尺寸
  const cardBgSize = React.useMemo(() => {
    return {
      width: screenWidth - theme.paddingSize.l * 2,
      height: ((screenWidth - theme.paddingSize.l * 2) * 718) / 690,
    };
  }, [screenWidth]);
  // 卡片内部尺寸集
  const cardSizes = React.useMemo(() => {
    return {
      header: {
        width: (cardBgSize.width * 360) / 690,
        marginLeft: (cardBgSize.width * 61) / 690,
        marginTop: (cardBgSize.width * 43) / 690,
      },
      content: {
        paddingHorizontal: (cardBgSize.width * 46) / 690,
      },
      phoneInput: {
        marginTop: (cardBgSize.width * 77) / 690,
        height: (cardBgSize.width * 88) / 690,
      },
      otpInput: {
        marginTop: (cardBgSize.width * 20) / 690,
        height: (cardBgSize.width * 88) / 690,
      },
      button: {
        marginTop: (cardBgSize.width * 57) / 690,
        height: (cardBgSize.width * 88) / 690,
        borderRadius: (cardBgSize.width * 88) / 690 / 2,
      },
      tip: {
        width: (cardBgSize.width * 460) / 690,
        marginTop: (cardBgSize.width * 20) / 690,
      },
      gift: {
        width: (cardBgSize.width * 246) / 690,
        height: (cardBgSize.width * 267) / 690,
        translateY: (-cardBgSize.width * 76) / 690,
      },
      inputIconSize: (cardBgSize.width * 40) / 690,
    };
  }, [cardBgSize]);

  // 用 Animated 实现平滑上移
  const translateY = useRef(new Animated.Value(0)).current;

  const handleFocus = (offset: number) => {
    if (os === 'android') {
      Animated.timing(translateY, {
        toValue: -offset,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleBlur = () => {
    if (os === 'android') {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

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
      }}>
      <LinearGradient
        colors={theme.basicColor.newBgOne}
        start={{x: 0.2, y: 0}}
        end={{x: 1, y: 0.92}}
        style={[theme.position.rel, {height: '100%'}]}>
        <Animated.View
          style={{
            transform: [{translateY}],
            flex: 1,
          }}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <Image
              style={{
                width: iApplyImageSize.width,
                height: iApplyImageSize.height,
                position: 'absolute',
                top: headerHeight,
                left: '50%',
                transform: [{translateX: -iApplyImageSize.width / 2}],
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

            <View
              style={[
                theme.fill.fillW,
                padding.lrl,
                {
                  marginTop: iApplyBgSize.height + headerHeight,
                },
              ]}>
              <LazyImageBackground
                imageUrl={CardOuterBg}
                occupancy="#000"
                width={cardBgSize.width}
                height={cardBgSize.height}>
                {/*头部标题*/}
                <View style={cardSizes.header}>
                  <Text
                    fontSize={20}
                    calc
                    color={basicColor.newFontWhite}
                    fontFamily="fontInterBold">
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
                        backgroundColor: invitationApplyColor.backgroundColor,
                      },
                      padding.lrl,
                      theme.fill.fillW,
                      borderRadius.m,
                      flex.row,
                      flex.centerByCol,
                    ]}>
                    <PhoneIcon
                      width={cardSizes.inputIconSize}
                      height={cardSizes.inputIconSize}
                    />
                    <TextInput
                      placeholder="Phone number"
                      style={[
                        {
                          height: cardSizes.phoneInput.height,
                          marginLeft: 16,
                          borderWidth: 0,
                          fontSize: 18,
                        },
                        flex.flex1,
                        outline,
                      ]}
                      value={userPhone}
                      maxLength={10}
                      keyboardType="numeric"
                      placeholderTextColor={baseVariable.fontColor.secAccent}
                      onFocus={() => handleFocus(150)} // 聚焦时上移
                      onBlur={handleBlur}
                      onChangeText={v => setUserPhone(v)}
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
                    ]}>
                    <SaveIcon
                      width={cardSizes.inputIconSize}
                      height={cardSizes.inputIconSize}
                    />
                    <TextInput
                      placeholder="OTP"
                      underlineColorAndroid={'transparent'}
                      style={[
                        {
                          height: cardSizes.otpInput.height,
                          marginLeft: 16,
                          borderWidth: 0,
                          fontSize: 16,
                        },
                        flex.flex1,
                        outline,
                      ]}
                      value={OTPCode}
                      maxLength={6}
                      keyboardType="numeric"
                      placeholderTextColor={baseVariable.fontColor.secAccent}
                      onFocus={() => handleFocus(250)} // 聚焦时上移更多
                      onBlur={handleBlur}
                      onChangeText={v => {
                        if (/^[0-9]*$/.test(v)) setOTPCode(v);
                      }}
                    />
                    {hasOTP ? (
                      <Text
                        fontSize={fontSize.s}
                        accent
                        style={{lineHeight: fontSize.s}}
                        textAlign="center"
                        blod>
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
                        }}>
                        <Text
                          color={basicColor.newFontRed}
                          fontSize={16}
                          fontWeight="bold">
                          Send
                        </Text>
                      </NativeTouchableOpacity>
                    )}
                  </View>
                  {/*按钮*/}
                  <View
                    style={[cardSizes.button, {backgroundColor: '#D7281E'}]}>
                    <NativeTouchableOpacity
                      style={[
                        flex.flex1,
                        theme.fill.fillW,
                        flex.center,
                        {height: cardSizes.button.height},
                      ]}
                      onPress={() => {
                        if (OTPLoading || !userPhone || !OTPCode) return;
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
                          '',
                          inviteCode,
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
                      <Text
                        fontSize={17}
                        color={basicColor.newFontWhite}
                        fontFamily="fontInterBold">
                        {i18n.t('label.logIn')}
                      </Text>
                    </NativeTouchableOpacity>
                  </View>
                  {/*tip*/}
                  <View
                    style={{
                      marginTop: cardSizes.tip.marginTop,
                      alignItems: 'center',
                    }}>
                    <Text
                      accent
                      size="small"
                      calc
                      textAlign="center"
                      color={'#76797D'}
                      style={{width: cardSizes.tip.width}}>
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
                    transform: [{translateY: cardSizes.gift.translateY}],
                  }}
                  source={require('@assets/imgs/invitation/gift.webp')}
                />
              </LazyImageBackground>
            </View>
            <InvitationApplyModal ref={InvitationApplyModalRef} />
          </ScrollView>
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

export default InvitationApply;
