import React, {useEffect, useRef, useState} from 'react';
import {TextInput, View, Image, ScrollView} from 'react-native';
import Text from '@basicComponents/text';
import LinearGradient from '@basicComponents/linear-gradient';
import {BasicObject, SafeAny} from '@/types';

import InvitationApplyModal from './invitation-apply-modal';
import {
  borderRadius,
  flex,
  fontSize,
  margin,
  padding,
} from '@/components/style';
// import {PhoneIcontwo, SaveIcontwo} from './svg.variables';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {sendCode, userLogin} from '../login/login.service';
import globalStore from '@/services/global.state';
import i18n from '@/i18n';
import baseVariable from '@/style/base.variable';
import {goTo, useResponsiveDimensions} from '@/utils';
import theme from '@/style';
import {LazyImageLGBackground} from '@/components/basic/image';
import {useUserActions} from '@/store/useUserStore';
const outline: SafeAny = {
  outline: 0,
};
const InvitationApply = (props: SafeAny) => {
  const {setToken} = useUserActions();
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
    <LazyImageLGBackground style={[theme.fill.fill, theme.flex.col]}>
      <ScrollView style={[theme.flex.flex1]}>
        <View
          style={[
            theme.position.rel,
            theme.padding.xxl,
            {height: screenHeight, marginBottom: 120},
          ]}>
          <NativeTouchableOpacity
            onPress={() => {
              // goTo('HomeDetail');
              goTo(globalStore.homePage);
            }}>
            <LinearGradient
              style={[
                theme.borderRadius.xl,
                {
                  width: '100%',
                  aspectRatio: '343/71',
                  border: '1px solid ',
                  borderColor: theme.basicColor.primary15,
                },
              ]}
              colors={[theme.basicColor.primary15, theme.basicColor.primary50]}>
              <View
                style={[
                  theme.fill.fill,
                  theme.flex.flex,
                  theme.flex.row,
                  theme.flex.centerByCol,
                  // eslint-disable-next-line react-native/no-inline-styles
                  {
                    paddingLeft: 20,
                  },
                ]}>
                <Image
                  style={[
                    // eslint-disable-next-line react-native/no-inline-styles
                    {
                      width: 48,
                      height: 48,
                      borderRadius: 6,
                      borderColor: theme.basicColor.primary15,
                      borderWidth: 1,
                    },
                  ]}
                  source={require('@assets/logos/logo.webp')}
                />
                <View
                  style={[
                    {
                      marginLeft: 10,
                    },
                  ]}>
                  <Text
                    fontSize={22}
                    fontWeight="700"
                    style={[
                      {
                        color: '#FFFFFF',
                      },
                    ]}>
                    Indra Lottery
                  </Text>
                  <Text
                    fontSize={12}
                    fontWeight="400"
                    style={[
                      {
                        color: '#FFFFFF',
                      },
                    ]}>
                    Very fun game platform
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </NativeTouchableOpacity>
          <Image
            style={[
              {
                width: '100%',
                height: '55%',
                aspectRatio: 1,
                marginTop: 15,
                marginBottom: 15,
                borderRadius: 10,
              },
            ]}
            source={{
              uri: 'https://apk.megadreamlottery.com/manager/54cfbbf55c484d3faa6aa608def9ea6b.png',
            }}
          />
          {/*<Image*/}
          {/*  style={[*/}
          {/*    {*/}
          {/*      width: '100%',*/}
          {/*      aspectRatio: 1,*/}
          {/*      marginTop: 15,*/}
          {/*      marginBottom: 15,*/}
          {/*      borderRadius: 10,*/}
          {/*    },*/}
          {/*  ]}*/}
          {/*/>*/}
          <LinearGradient
            style={[
              theme.borderRadius.xl,
              {
                width: '100%',
                aspectRatio: '343/333',
                border: '1px solid ',
                borderColor: theme.basicColor.primary15,
              },
            ]}
            colors={[theme.basicColor.primary15, theme.basicColor.primary50]}>
            <View style={[fromBgSize.formTitleBg, theme.flex.centerByRow]}>
              <Text
                fontSize={22}
                calc
                color={'#FFFFFF'}
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
                },
              ]}>
              <View style={[theme.flex.flex1, theme.flex.center]}>
                <View
                  style={[
                    // eslint-disable-next-line react-native/no-inline-styles
                    {
                      height: fromBgSize.button.height,
                      borderWidth: 1,
                      borderColor: theme.basicColor.primary60,
                      background: theme.basicColor.primary30,
                    },
                    padding.lrl,
                    theme.fill.fillW,
                    borderRadius.m,
                    flex.row,
                    flex.centerByCol,
                  ]}>
                  {/*<PhoneIcontwo width={24} height={24} />*/}
                  <Image
                    style={{
                      width: 18,
                      height: 18,
                    }}
                    source={require('@components/assets/pofile/smartphone.webp')}
                  />
                  <TextInput
                    placeholder="Phone number"
                    style={[
                      // eslint-disable-next-line react-native/no-inline-styles
                      {
                        height: fromBgSize.button.height,
                        marginLeft: 16,
                        borderWidth: 0,
                        borderColor: 'none',
                        color: '#FFFFFF',
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
                      borderColor: theme.basicColor.primary60,
                      background: theme.basicColor.primary30,
                    },
                    padding.lrl,
                    theme.fill.fillW,
                    borderRadius.m,
                    flex.row,
                    flex.centerByCol,
                    margin.topl,
                  ]}>
                  {/*<SaveIcontwo width={24} height={24} />*/}
                  <Image
                    style={{
                      width: 18,
                      height: 18,
                    }}
                    source={require('@components/assets/pofile/idImg.webp')}
                  />
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
                        color: '#FFFFFF',
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
                      <Text color={'#FFFFFF'} fontSize={14} fontWeight="400">
                        Get OTP
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
                  userLogin(userPhone, OTPCode, invitaCode)
                    .then((res: SafeAny) => {
                      globalStore.globalTotal.next({
                        type: 'success',
                        message: i18n.t('tip.success'),
                      });
                      globalStore.token = res.token;
                      setToken(res.token);
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
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}
                    colors={['#04CC9B1A 0%', '#04CC9B80 98%']}>
                    <View>
                      <Text
                        fontSize={16}
                        color={'#fff'}
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
                style={[margin.tops, {color: theme.basicColor.primary60}]}>
                {i18n.t('referral.tip.desc')}
              </Text>
            </View>
          </LinearGradient>
          <InvitationApplyModal ref={InvitationApplyModalRef} />
        </View>
      </ScrollView>
    </LazyImageLGBackground>
  );
};

export default InvitationApply;
