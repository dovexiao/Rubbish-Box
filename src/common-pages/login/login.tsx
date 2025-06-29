import theme from '@style';
import Text from '@basicComponents/text';
import React from 'react';
import {Animated, KeyboardAvoidingView, View, Image} from 'react-native';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import {goBack, goTo, navigationRef, scaleSize} from '@/utils';
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
import {setScratchAuth} from '@/services/global.service';
import {useTranslation} from 'react-i18next';

import {flex} from '@/components/style';
import {LazyImageLGBackground} from '@basicComponents/image';
import {useUserActions} from '@/store/useUserStore';
// const icon = require('../../assets/icons/login/login-botttom.webp');
const Login = (props: NavigatorScreenProps) => {
  const {i18n} = useTranslation();
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

  const {setToken, loginOut} = useUserActions();

  React.useEffect(() => {
    globalStore.removeItem('scratchToken');
    globalStore.removeItem('scratchUrl');
    globalStore.token = null;
    globalStore.userInfo = null;
    loginOut();
  }, [loginOut]);

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
              theme.flex.centerByCol,
              theme.margin.lrl,
              theme.borderRadius.s,
              theme.padding.l,
              theme.position.rel,
              theme.background.mainDark,
              theme.border.primary50,
              {
                marginTop: scaleSize(50),
              },
            ]}>
            <Image
              source={require('@/assets/logos/logo.webp')}
              style={[{width: 120, height: 120, marginTop: -30}]}
            />
            <View
              style={[
                theme.flex.row,
                theme.margin.tbm,
                theme.fill.fillW,
                theme.flex.alignEnd,
              ]}>
              {['login.label.password-login', 'login.label.otp-login'].map(
                (v, i) => {
                  return (
                    <NativeTouchableOpacity
                      key={i}
                      activeOpacity={1}
                      onPress={() => setSwitchIndex(i)}
                      style={[theme.flex.flex1, theme.flex.center]}>
                      <Text
                        blod
                        color={
                          switchIndex === i
                            ? theme.fontColor.primary
                            : theme.fontColor.primaryMain
                        }
                        style={[theme.font.l]}>
                        {i18n.t(v)}
                      </Text>
                    </NativeTouchableOpacity>
                  );
                },
              )}
            </View>

            <View
              style={[
                theme.margin.topl,
                theme.borderRadius.l,
                theme.padding.lrl,
                {
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
              <Animated.View>
                <View
                  style={{
                    marginVertical: theme.paddingSize.m * 2,
                  }}>
                  <Button
                    buttonStyle={[styles.loginButton, theme.overflow.hidden]}
                    radius={50}
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
                      (switchIndex === 1
                        ? userLogin(
                            (globalStore.sendPhoneCode ? userPhoneCode : '') +
                              userPhone,
                            OTPCode,
                          )
                        : passwordLogin(
                            (globalStore.sendPhoneCode ? userPhoneCode : '') +
                              userPhone,
                            userPassword,
                          )
                      )
                        .then(res => {
                          if (typeof res === 'string') {
                            globalStore.token = res;
                            setToken(res);
                          } else {
                            globalStore.token = res.token;
                            setToken(res.token);
                          }
                          setScratchAuth();
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
