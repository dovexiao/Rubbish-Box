import React from 'react';
import NavTitle from '@basicComponents/nav-title';
import {View, Image} from 'react-native';
import theme from '@style';
import {goBack, goTo, useResponsiveDimensions} from '@utils';
import {ScrollView} from 'react-native-gesture-handler';
import PhoneInput from './components/phone-input';
import CodeInput from './components/code-input';
import {inputProps, styles} from './login.style';
import {CheckBox, Input} from '@rneui/themed';
import Text from '@basicComponents/text';
import AccountTip from './components/account-tip';
import Button from '@basicComponents/button';
import {userLogin} from './login.service';
import globalStore from '@/services/global.state';
import {BasicObject, NavigatorScreenProps} from '@/types';
import {setScratchAuth} from '@/services/global.service';
import {useTranslation} from 'react-i18next';
import {LazyImageLGBackground} from '@basicComponents/image';
import {useUserActions} from '@/store/useUserStore';
// import LazyImage from '@/components/basic/image';
// const icon = require('../../assets/icons/login/login-botttom.webp');

const SingUp = (props: NavigatorScreenProps) => {
  const {i18n} = useTranslation();

  /** 登录成功的目标页面,回到原页面操作 */
  const sucessPage =
    ((props.route.params as BasicObject)?.sucessPage as string) || null;
  /** 登录成功的目标页面,回到原页面操作 */
  const sucessPageParams =
    ((props.route.params as BasicObject)?.sucessPageParams as BasicObject) ||
    null;
  // const [layoutHeight, setLayoutHeight] = React.useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {width: screenWidth, height: screenHeight} = useResponsiveDimensions();

  const [userPhone, setUserPhone] = React.useState('');
  const [OTPCode, setOTPCode] = React.useState('');
  const [invitaCode, setInvitaCode] = React.useState(
    globalStore.isWeb ? localStorage.getItem('invitationCode') || '' : '',
  );
  // const [invitaCode, setInvitaCode] = React.useState('');
  const [is18, setIs18] = React.useState(false);
  const [agree, setAgree] = React.useState(false);
  const [blured, setBlured] = React.useState(true);
  const [userPhoneCode, setUserPhoneCode] = React.useState(
    globalStore.defaultPhoneCode,
  );
  const {setToken} = useUserActions();
  // const handleLayout = ({nativeEvent}: SafeAny) => {
  //   setLayoutHeight(nativeEvent.layout.height);
  // };
  return (
    <LazyImageLGBackground
      showBottomBG
      locations={[0, 1]}
      style={[theme.fill.fill, theme.flex.col]}>
      <NavTitle onClose={goBack} />
      <ScrollView style={{zIndex: 10}}>
        <View
          // onLayout={handleLayout}
          style={[
            theme.borderRadius.l,
            theme.margin.l,
            theme.background.mainDark,
            {
              padding: theme.paddingSize.l * 2,
            },
          ]}>
          <Text
            fontSize={20}
            blod
            color={theme.fontColor.white}
            style={[theme.margin.btml]}>
            {i18n.t('login.label.sign')}
          </Text>
          <PhoneInput
            userPhoneCode={userPhoneCode}
            setUserPhoneCode={setUserPhoneCode}
            userPhone={userPhone}
            setUserPhone={setUserPhone}
          />
          <View style={styles.interval} />
          <CodeInput
            setValueOrCode={setOTPCode}
            switchIndex={1}
            userPhone={userPhone}
            OTPCode={OTPCode}
          />
          <View style={styles.interval} />
          <View
            style={[
              styles.inputBox,
              blured ? styles.greyBorder : styles.deepBorder,
            ]}>
            <Image
              // eslint-disable-next-line react-native/no-inline-styles
              style={{width: 18, height: 18}}
              source={require('@assets/icons/login/invitation-code.webp')}
            />
            <View style={theme.flex.flex1}>
              <Input
                {...inputProps}
                onFocus={() => setBlured(false)}
                onBlur={() => setBlured(true)}
                value={invitaCode}
                onChangeText={setInvitaCode}
                maxLength={8}
                placeholder={i18n.t('login.tip.referral-code')}
              />
            </View>
          </View>
          {[
            {checked: is18, onPress: setIs18, label: 'login.tip.page18'},
            {checked: agree, onPress: setAgree, label: 'login.tip.notify'},
          ].map((v, i) => (
            <CheckBox
              key={i}
              containerStyle={{
                padding: theme.paddingSize.zorro,
                marginTop: theme.paddingSize.m * 2,
                marginLeft: theme.paddingSize.zorro,
                marginRight: theme.paddingSize.zorro,
                backgroundColor: theme.backgroundColor.mainDark,
              }}
              checked={v.checked}
              onPress={() => v.onPress(!v.checked)}
              checkedIcon={
                <Image
                  style={theme.icon.m}
                  source={require('@assets/icons/checked.webp')}
                />
              }
              uncheckedIcon={
                <Image
                  style={theme.icon.m}
                  source={require('@assets/icons/unchecked.webp')}
                />
              }
              title={
                <Text
                  style={theme.padding.lefts}
                  fontSize={theme.fontSize.m}
                  white>
                  {i18n.t(v.label)}
                </Text>
              }
            />
          ))}
          <View
            style={{
              marginVertical: theme.paddingSize.m * 2,
            }}>
            <Button
              radius={50}
              onPress={() => {
                globalStore.globalLoading.next(true);
                userLogin(userPhone, OTPCode, invitaCode, false)
                  .then(res => {
                    globalStore.token = res.token;
                    setToken(res.token);
                    const data: BasicObject = {fromLogin: true};
                    sucessPage && (data.sucessPage = sucessPage);
                    sucessPageParams &&
                      (data.sucessPageParams = sucessPageParams);
                    setScratchAuth();
                    goTo('SetPassword', data);
                  })
                  .finally(() => globalStore.globalLoading.next(false));
              }}
              disabled={
                userPhone.length !== 10 ||
                OTPCode.length !== 6 ||
                !is18 ||
                !agree
              }
              style={{
                backgroundColor: '#F3BA63', // 修改按钮背景色
              }}>
              <Text
                color={theme.basicColor.white}
                size="large"
                fontWeight="700">
                {i18n.t('login.label.next')}
              </Text>
            </Button>
          </View>

          <AccountTip
            tip="login.tip.has-account"
            linkTip="login.tip.sign-in"
            onPressLink={() => goTo('Login')}
          />
        </View>
        {/* {globalStore.packageId === 2 && (
          <LazyImage
            occupancy="transparent"
            width={screenWidth}
            height={290}
            imageUrl={icon}
          />
        )} */}
      </ScrollView>
    </LazyImageLGBackground>
  );
};

export default SingUp;
