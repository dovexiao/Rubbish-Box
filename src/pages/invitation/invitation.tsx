import CodeInput from '@/common-pages/login/components/code-input';
import PhoneInput from '@/common-pages/login/components/phone-input';
import {useModal} from '@/components/basic/modal';
import Text from '@/components/basic/text';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import globalStore from '@/services/global.state';
import theme from '@/style';
import {BasicObject} from '@/types';
import {downloadApk} from '@/utils';
import {http} from '@/utils';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {ImageBackground, Image, View} from 'react-native';

const invitationBG = require('@assets/imgs/pay-sucess.webp');
// 750 × 1448
const download = require('@assets/imgs/pay-sucess.webp');
// 686 × 1012

/** 这个页面只有web会进入!!!! */
const Invitation = () => {
  const {i18n} = useTranslation();
  const imageHeight = (globalStore.screenWidth / 750) * 1440;
  const [userPhone, setUserPhone] = React.useState('');
  const [userPhoneCode, setUserPhoneCode] = React.useState(
    globalStore.defaultPhoneCode,
  );
  const [OTPCode, setOTPCode] = React.useState('');
  const downloadModal = useModal(
    <NativeTouchableOpacity
      onPress={() => {
        downloadApk();
      }}>
      <Image
        source={download}
        style={[
          {
            width: (globalStore.screenWidth * 2) / 3,
            height: ((globalStore.screenWidth * 2) / 3 / 686) * 1012,
          },
        ]}
      />
    </NativeTouchableOpacity>,
    {
      backDropClose: true,
      overlayStyle: [theme.padding.zorro, theme.borderRadius.xl],
    },
  );
  globalStore.channel = 'Refer';
  return (
    <View style={[theme.fill.fill, theme.position.rel]}>
      <ImageBackground
        source={invitationBG}
        style={[
          theme.position.abs,
          {
            width: globalStore.screenWidth,
            height: imageHeight,
          },
        ]}
        resizeMode="contain"
      />
      <View style={[theme.fill.fill]}>
        <View
          style={[
            {
              height: globalStore.screenHeight - 320,
            },
          ]}
        />
        <View
          style={[
            // eslint-disable-next-line react-native/no-inline-styles
            {
              backgroundColor: '#0047B1',
            },
            theme.borderRadius.xl,
            theme.padding.l,
            theme.margin.lrl,
          ]}>
          <Text fontSize={20} blod color={theme.basicColor.white}>
            {i18n.t('invitation.title.singUp')}
          </Text>
          <View
            style={[
              theme.margin.tbl,
              theme.background.white,
              theme.padding.lrl,
              theme.borderRadius.xl,
            ]}>
            <PhoneInput
              userPhone={userPhone}
              setUserPhone={setUserPhone}
              userPhoneCode={userPhoneCode}
              setUserPhoneCode={setUserPhoneCode}
            />
          </View>
          <View
            style={[
              theme.background.white,
              theme.padding.lrl,
              theme.borderRadius.xl,
            ]}>
            <CodeInput
              setValueOrCode={setOTPCode}
              switchIndex={1}
              userPhone={userPhone}
              userPhoneCode={userPhoneCode}
              OTPCode={OTPCode}
            />
          </View>
          <NativeTouchableOpacity
            style={[
              theme.flex.center,
              theme.margin.topl,
              theme.padding.l,
              {
                borderRadius: theme.borderRadiusSize.xl * 2,
                background: 'linear-gradient(132deg, #71B0F9 0%, #2302F1 100%)',
              } as BasicObject,
            ]}
            onPress={() => {
              globalStore.globalLoading.next(true);
              http
                .post<null, string>('app/userLogin', {
                  userPhone,
                  code: OTPCode,
                  userInviteCode: localStorage.getItem('invitationCode'),
                })
                .then(() => {
                  downloadModal.show();
                })
                .finally(() => {
                  globalStore.globalLoading.next(false);
                });
            }}>
            <Text fontSize={16} blod color={theme.basicColor.white}>
              {i18n.t('invitation.title.singUp')}
            </Text>
          </NativeTouchableOpacity>
        </View>
      </View>
      {downloadModal.renderModal}
    </View>
  );
};

export default Invitation;
