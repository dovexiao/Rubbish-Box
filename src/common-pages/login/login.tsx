/* eslint-disable */
/* prettier-ignore */
import theme from '@style';
import Text from '@basicComponents/text';
import React from 'react';
import {Animated, KeyboardAvoidingView, View, Platform} from 'react-native';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import {goBack, goTo, navigationRef, scaleSize} from '@/utils';
// import LinearGradient from '@basicComponents/linear-gradient';
import {ScrollView} from 'react-native-gesture-handler';
import Button from '@basicComponents/button';
import globalStore from '@/services/global.state';
import {passwordLogin, userLogin} from './login.service';
import {styles} from './login.style';
import CodeInput from './components/code-input';
import PhoneInput from './components/phone-input';
import NavTitle from '@basicComponents/nav-title';
import AccountTip from './components/account-tip';
import {BasicObject, NavigatorScreenProps} from '@/types';
import {useTranslation} from 'react-i18next';
// import LazyImage from '@/components/basic/image';

import {useUserActions} from '@/store/useUserStore';
import {flex} from '@/components/style';
import {LazyImageLGBackground} from '@basicComponents/image';
// const icon = require('../../assets/icons/login/login-botttom.webp');
import Clipboard from '@react-native-clipboard/clipboard';
import DeviceInfo from 'react-native-device-info';
const Login = (props: NavigatorScreenProps) => {
  const {i18n} = useTranslation();
    const {setToken} = useUserActions();
  /** 直接返回的目标页面,避免原页面加载就需要token */
  const backPage =
    ((props.route.params as BasicObject)?.backPage as string) || null;
  /** 登录成功的目标页面,回到原页面操作,这个是用来传递给注册页面的,登录页面成功直接返回  */
  const sucessPage =
    ((props.route.params as BasicObject)?.sucessPage as string) || null;
  /** 登录成功的目标页面,回到原页面操作 */
  const sucessPageParams =
    ((props.route.params as BasicObject)?.sucessPageParams as BasicObject) ||
    null;
  const [switchIndex, setSwitchIndex] = React.useState(0);
  const [userPhone, setUserPhone] = React.useState('');
  const [userPhoneCode, setUserPhoneCode] = React.useState(
    globalStore.defaultPhoneCode,
  );
  const [OTPCode, setOTPCode] = React.useState('');
  const [userPassword, setUserPassword] = React.useState('');

  const setValueOrCode = (value: string) => {
    switchIndex === 1 ? setOTPCode(value) : setUserPassword(value);
  };

  // 状态管理
  const [inviteCode, setInviteCode] = React.useState<string>('');
  const [equipmentType, setEquipmentType] = React.useState<string>('');
  const [systemType, setSystemType] = React.useState<string>('');

  console.log('inviteCode', inviteCode);
  console.log('equipmentType', equipmentType);
  console.log('systemType', systemType);

  React.useEffect(() => {
    globalStore.removeItem('scratchToken');
    globalStore.removeItem('scratchUrl');
    globalStore.token = null;
    globalStore.userInfo = null;
    if (Platform.OS === 'android') {
      // 只有安卓平台才读取剪切板、设备型号和系统版本
      async function fetchData() {
        try {
          // 获取剪切板内容并检查是否以 nicegame_ 开头
          const clipboardContent = await Clipboard.getString();
          if (clipboardContent.startsWith('nicegame_')) {
            setInviteCode(clipboardContent);
          } else {
            setInviteCode(''); // 如果不符合条件，设置为空串
          }

          // 获取设备型号
          const deviceModel = DeviceInfo.getModel();
          setEquipmentType(deviceModel);

          // 获取系统版本
          const systemVersion = DeviceInfo.getSystemVersion();
          setSystemType(systemVersion);
        } catch (error) {
          console.error('Error fetching data: ', error);
        }
      }
      fetchData();
    } else {
      // 在 Web 平台直接赋值为空串
      setInviteCode('');
      setEquipmentType('');
      setSystemType('');
    }
  }, []);

  React.useEffect(() => {
    setUserPassword('');
    setOTPCode('');
  }, [switchIndex]);
  return (
    <KeyboardAvoidingView
      behavior="height"
      style={[theme.fill.fill, theme.flex.col, theme.position.rel]}>
      <LazyImageLGBackground locations={[0, 1]} showBottomBG>
        <ScrollView keyboardShouldPersistTaps="always" style={[flex.flex1]}>
          <NavTitle
            onClose={() => {
              if (
                globalStore.isWeb &&
                (!navigationRef.current ||
                  navigationRef.current.getState().routes.length < 2)
              ) {
                // 如果web进来,只有一层路由,直接到首页
                goTo(globalStore.homePage);
                return;
              }
              if (backPage) {
                goTo(backPage);
              } else {
                goBack();
              }
            }}
          />
          <View
            style={[
              theme.margin.lrl,
              theme.borderRadius.l,
              theme.padding.l,
              theme.position.rel,
              {
                backgroundColor: theme.basicColor.newBgInOne,
                marginTop: scaleSize(50),
              },
            ]}>
            <View
              style={[
                theme.flex.row,
                theme.position.abs,
                theme.fill.fillW,
                theme.flex.alignEnd,
                {
                  top: scaleSize(-50 + theme.paddingSize.l),
                  width: globalStore.screenWidth - theme.paddingSize.l * 2,
                  left: 0,
                  zIndex: 11,
                },
              ]}>
              {['login.label.password-login', 'login.label.otp-login'].map(
                (v, i) => {
                  const buttonStyle =
                    switchIndex === i
                      ? {
                          backgroundColor: theme.basicColor.newBgInTwo,
                          height: scaleSize(42),
                        }
                      : {
                          backgroundColor: theme.basicColor.newBgInOne,
                          height: scaleSize(50),
                        };

                  let pwdStyle = {};
                  let otpStyle = {};
                  if (switchIndex === i) {
                    pwdStyle = {
                      marginLeft: theme.paddingSize.l,
                      marginRight: 0,
                      paddingTop: 0,
                    };
                    otpStyle = {
                      marginLeft: 0,
                      marginRight: theme.paddingSize.l,
                      paddingTop: 0,
                    };
                  } else {
                    pwdStyle = {
                      marginLeft: 0,
                      marginRight: theme.paddingSize.l,
                      paddingTop: 10,
                    };
                    otpStyle = {
                      marginLeft: theme.paddingSize.l,
                      marginRight: 0,
                      paddingTop: 10,
                    };
                  }

                  return (
                    <NativeTouchableOpacity
                      key={i}
                      activeOpacity={1}
                      onPress={() => setSwitchIndex(i)}
                      style={[
                        theme.flex.flex1,
                        theme.flex.center,
                        {
                          borderTopLeftRadius: theme.borderRadiusSize.l,
                          borderTopRightRadius: theme.borderRadiusSize.l,
                        },
                        buttonStyle,
                        i === 0 ? pwdStyle : {},
                        i === 1 ? otpStyle : {},
                      ]}>
                      <Text
                        style={[
                          theme.font.fm,
                          theme.font.main,
                          switchIndex === i
                            ? {
                                color: theme.basicColor.newFontWhite,
                                fontWeight: 'bold',
                              }
                            : {color: theme.basicColor.newFontWhite},
                        ]}>
                        {i18n.t(v)}
                      </Text>
                    </NativeTouchableOpacity>
                  );
                },
              )}
            </View>

            <View
              style={[
                theme.borderRadius.l,
                theme.padding.lrl,
                {
                  backgroundColor: theme.basicColor.newBgInTwo,
                  borderTopLeftRadius:
                    switchIndex === 0 ? 0 : theme.borderRadiusSize.l,
                  borderTopRightRadius:
                    switchIndex === 1 ? 0 : theme.borderRadiusSize.l,
                  paddingBottom: 80,
                  zIndex: 10,
                },
              ]}>
              <PhoneInput
                userPhone={userPhone}
                setUserPhone={setUserPhone}
                userPhoneCode={userPhoneCode}
                setUserPhoneCode={setUserPhoneCode}
              />
              <View style={styles.interval} />
              <CodeInput
                setValueOrCode={setValueOrCode}
                switchIndex={switchIndex}
                userPhone={userPhone}
                userPhoneCode={userPhoneCode}
                OTPCode={OTPCode}
                userPassword={userPassword}
              />
              {/*<Animated.View style={[theme.overflow.hidden]}>*/}
              {/*  <NativeTouchableOpacity*/}
              {/*    style={[theme.margin.topm, theme.padding.topm]}>*/}
              {/*    <Text*/}
              {/*      size="medium"*/}
              {/*      textAlign="center"*/}
              {/*      color={theme.basicColor.primary}>*/}
              {/*      {i18n.t('login.tip.forgot')}*/}
              {/*    </Text>*/}
              {/*  </NativeTouchableOpacity>*/}
              {/*</Animated.View>*/}
              <Animated.View>
                <View
                  style={{
                    marginVertical: theme.paddingSize.m * 2,
                  }}>
                  <Button
                    type="linear-primary"
                    buttonStyle={[styles.loginButton, theme.overflow.hidden]}
                    radius={theme.borderRadiusSize.l}
                    onPress={() => {
                      if (userPhone === '') {
                        globalStore.globalWaringTotal(
                          i18n.t('login.tip.no-phone'),
                        );
                        return;
                      }
                      if (switchIndex === 1 && OTPCode === '') {
                        globalStore.globalWaringTotal(
                          i18n.t('login.tip.no-otp'),
                        );
                        return;
                      }
                      if (switchIndex === 0 && userPassword === '') {
                        globalStore.globalWaringTotal(
                          i18n.t('login.tip.no-password'),
                        );
                        return;
                      }
                      globalStore.globalLoading.next(true);
                      let deviceCode = '';
                      if (Platform.OS !== 'android') {
                        deviceCode = localStorage.getItem('gps_adid') || '';
                      }
                      const adjustId = globalStore.adjustId || '';
                      (switchIndex === 1
                        ? userLogin(
                            (globalStore.sendPhoneCode ? userPhoneCode : '') +
                              userPhone,
                            OTPCode,
                            deviceCode,
                            inviteCode,
                            equipmentType,
                            systemType,
                            adjustId,
                            '',
                            false,
                          )
                        : passwordLogin(
                            (globalStore.sendPhoneCode ? userPhoneCode : '') +
                              userPhone,
                            userPassword,
                            deviceCode,
                            inviteCode,
                            equipmentType,
                            systemType,
                            adjustId
                          )
                      )
                        .then(res => {
                          if (typeof res === 'string') {
                            globalStore.token = res;
                            setToken(res);
                          } else {
                            globalStore.token = res.token;
                            setToken(res.token);
                            globalStore.isNewUser = String(res.isNewUser);
                          }
                          goBack();
                          globalStore.globalLoading.next(false);
                        })
                        .catch(() => {
                          globalStore.globalLoading.next(false);
                        });
                    }}
                    disabled={
                      switchIndex === 0
                        ? userPassword.length < 6
                        : OTPCode.length !== 6
                    }
                    color={theme.basicColor.white}
                    titleBold
                    title={i18n.t('login.label.login')}
                  />
                </View>
                <AccountTip
                  tip="login.tip.new-account"
                  linkTip="login.tip.sing-in"
                  onPressLink={() => {
                    const data: BasicObject = {};
                    if (backPage) {
                      data.backPage = backPage;
                    }
                    if (sucessPage) {
                      data.sucessPage = sucessPage;
                    }
                    if (sucessPageParams) {
                      data.sucessPageParams = sucessPageParams;
                    }
                    goTo('SingUp', data);
                  }}
                />
              </Animated.View>
            </View>
          </View>
        </ScrollView>
      </LazyImageLGBackground>
    </KeyboardAvoidingView>
  );
};

export default Login;
