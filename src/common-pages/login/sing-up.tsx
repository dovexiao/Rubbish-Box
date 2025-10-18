/* eslint-disable */
/* prettier-ignore */
import React from 'react';
import NavTitle from '@basicComponents/nav-title';
import {View, Image, Platform} from 'react-native';
import theme from '@style';
import {goBack, goTo, scaleSize, useResponsiveDimensions} from '@utils';
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
import Clipboard from '@react-native-clipboard/clipboard';
import DeviceInfo from 'react-native-device-info';

import { trackRegister } from '@utils/AdjustEventTracker';
import AdjustService from '@/utils/AdjustService';
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
  // const handleLayout = ({nativeEvent}: SafeAny) => {
  //   setLayoutHeight(nativeEvent.layout.height);
  // };
  // 状态管理
  const [inviteCode, setInviteCode] = React.useState<string>('');
  const [equipmentType, setEquipmentType] = React.useState<string>('');
  const [systemType, setSystemType] = React.useState<string>('');

  console.log('inviteCode', inviteCode);
  console.log('equipmentType', equipmentType);
  console.log('systemType', systemType);

  React.useEffect(() => {
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
            {
              backgroundColor: theme.basicColor.newBgInOne,
              padding: theme.paddingSize.l * 2,
            },
          ]}>
          <Text fontSize={20} blod color={theme.basicColor.newFontYellow} style={[{marginBottom: 10}]}>
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
              style={{width: scaleSize(13), height: scaleSize(13)}}
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
                backgroundColor: theme.basicColor.newBgInOne,
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
                  color={theme.basicColor.newFontWhite}>
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
              type="linear-primary"
              radius={theme.borderRadiusSize.l}
              onPress={() => {
                globalStore.globalLoading.next(true);
                let deviceCode = '';
                if (Platform.OS !== 'android') {
                  deviceCode = localStorage.getItem('gps_adid') || '';
                }
                userLogin(
                  userPhone,
                  OTPCode,
                  deviceCode,
                  inviteCode,
                  equipmentType,
                  systemType,
                  invitaCode,
                  false,
                )
                  .then(res => {
                    if (res.isNewUser === true) {
                      AdjustService.track('register');
                      console.log('上报成功');
                    }
                    if (globalStore.channel === 'hipfc01') {
                      const url =
                        'https://ppprfd.pgoriginad.com/action/3b982489-5c0b-484c-991e-b3fe72720144/319047';
                      fetch(url);
                    }
                    globalStore.token = res.token;
                    globalStore.isNewUser = String(res.isNewUser);
                    const data: BasicObject = {fromLogin: true};
                    sucessPage && (data.sucessPage = sucessPage);
                    sucessPageParams &&
                      (data.sucessPageParams = sucessPageParams);
                    setScratchAuth();
                    goTo('SetPassword', data);
                    Platform.OS === 'android' && trackRegister();
                  })
                  .finally(() => globalStore.globalLoading.next(false));
              }}
              disabled={
                userPhone.length !== 10 ||
                OTPCode.length !== 6 ||
                !is18 ||
                !agree
              }>
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
