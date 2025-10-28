/* eslint-disable react-native/no-inline-styles */
import {BetsSharBorderColor, CloseImg, topBg} from './bets-shard.variable';
import {View, TextInput} from 'react-native';
import Text from '@basicComponents/text';
import {
  basicColor,
  borderRadius,
  flex,
  fontSize,
  margin,
  padding,
  position,
} from '@/components/style';
import React, {useEffect, useRef, useState} from 'react';
import PhoneIcon from './svg/phoneIcon';
import CodeIcon from './svg/codeIcon';
import InvitationIcon from './svg/InvitationIcon';
import LazyImage from '@/components/basic/image';
import {sendCode, userLogin} from '../login/login.service';
import {SafeAny} from '@/types';
import LinearGradient from '@basicComponents/linear-gradient';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import globalStore from '@/services/global.state';
import InvitationApplyModal from './bets-shard-modal';

import i18n from '@/i18n';
const outline: SafeAny = {
  outline: 0,
};

const BetsShardHome = ({
  downloadBtn = 'Register and download',
  topBgEle = (
    <LazyImage imageUrl={topBg} occupancy="#0000" width={'100%'} height={67} />
  ),
  setModalVisible = () => {},
  width = 340,
  close,
  userInviteCode,
}: SafeAny) => {
  const [userPhone, setUserPhone] = useState('');
  const [OTPCode, setOTPCode] = useState('');
  const OTPTimeRef = useRef(59);
  const [OTPTime, setOTPTime] = useState(59);
  const [invitaCode, setInvitaCode] = useState('DMSL');
  const [hasOTP, setOTP] = useState(false);
  const [OTPLoading, setOTPLoading] = React.useState(false);
  const InvitationApplyModalRef: SafeAny = useRef(null);
  useEffect(() => {
    setInvitaCode(userInviteCode);
  }, [userInviteCode]);
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
  return (
    <View style={[{width: width}]}>
      <View style={[position.rel, {overflow: 'hidden'}]}>
        {topBgEle}
        <View style={[position.abs, {top: 9}]}>
          <View style={[position.abs, {left: 18, width: 200}]}>
            <Text
              fontSize={fontSize.xl}
              color={basicColor.white}
              fontWeight="900">
              SIGN UP TO WIN BIG PRIZES
            </Text>
          </View>
        </View>
        {!close && (
          <NativeTouchableOpacity
            style={[position.abs, {right: 4, top: 4}]}
            onPress={() => setModalVisible()}>
            <LazyImage
              imageUrl={CloseImg}
              occupancy="#0000"
              width={24}
              height={24}
            />
          </NativeTouchableOpacity>
        )}
      </View>
      <View
        style={[
          position.rel,
          {
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
            width: '100%',
            paddingTop: 24,
            paddingBottom: 24,
          },
        ]}>
        <View
          style={[
            margin.lrl,
            {
              height: 48,
              borderWidth: 1,
              borderColor: BetsSharBorderColor,
              backgroundColor: '#F4F4F4',
            },
            borderRadius.m,
            padding.lrl,
            flex.row,
            flex.centerByCol,
          ]}>
          <PhoneIcon />
          <TextInput
            placeholder="Phone number"
            style={[
              {
                height: 24,
                marginLeft: 16,
                borderWidth: 0,
                borderColor: 'none',
              },
              flex.flex1,
              outline,
            ]}
            maxLength={10}
            placeholderTextColor={'#BBBBC5'}
            value={userPhone}
            onChange={(e: SafeAny) => setUserPhone(e.target.value)}
          />
        </View>
        <View
          style={[
            {
              margin: 12,
              height: 48,
              borderWidth: 1,
              borderColor: BetsSharBorderColor,
              backgroundColor: '#F4F4F4',
            },
            borderRadius.m,
            padding.lrl,
            flex.row,
            flex.centerByCol,
          ]}>
          <CodeIcon />
          <TextInput
            placeholder="OTP"
            style={[
              {
                height: 24,
                marginLeft: 16,
                borderWidth: 0,
                borderColor: 'none',
              },
              flex.flex1,
              outline,
            ]}
            value={OTPCode}
            maxLength={6}
            placeholderTextColor={'#BBBBC5'}
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
                if (OTPLoading) {
                  return;
                }
                setOTPLoading(true);
                sendCode(
                  (globalStore.sendPhoneCode
                    ? ''
                    : globalStore.defaultPhoneCode) + userPhone,
                )
                  .then(() => {
                    setHasOTP();
                    globalStore.globalTotal.next({
                      type: 'success',
                      message: i18n.t('tip.success'),
                    });
                  })
                  .finally(() => setOTPLoading(false));
              }}>
              <Text color={basicColor.primary} fontSize={15} fontWeight="bold">
                Send
              </Text>
            </NativeTouchableOpacity>
          )}
        </View>
        {!invitaCode && (
          <View
            style={[
              {
                height: 48,
                borderWidth: 1,
                borderColor: BetsSharBorderColor,
                backgroundColor: '#F4F4F4',
              },
              borderRadius.m,
              margin.lrl,
              padding.lrl,
              flex.row,
              flex.centerByCol,
            ]}>
            <InvitationIcon />
            <TextInput
              placeholder="Enter invite code(Optional)"
              style={[
                {
                  height: 24,
                  marginLeft: 16,
                  borderWidth: 0,
                  borderColor: 'none',
                },
                flex.flex1,
                outline,
              ]}
              value={invitaCode}
              maxLength={10}
              placeholderTextColor={'#BBBBC5'}
              onChange={(e: SafeAny) => setInvitaCode(e.target.value)}
            />
          </View>
        )}

        <View style={[padding.lrl, {marginTop: 32, width: '100%'}]}>
          <View
            style={[
              {width: '100%'},
              flex.center,
              {
                height: 48,
                borderRadius: 30,
                overflow: 'hidden',
              },
            ]}>
            <LinearGradient
              style={[
                {
                  width: '100%',
                  height: 48,
                },
                flex.center,
                padding.lrl,
              ]}
              start={{x: 0, y: 1}}
              end={{x: 1, y: 0}}
              colors={['#8700DA', '#7000FF']}>
              <NativeTouchableOpacity
                onPress={() => {
                  if (OTPLoading) {
                    return;
                  }
                  if (!userPhone || !OTPCode) {
                    return;
                  }
                  globalStore.globalLoading.next(true);
                  userLogin(userPhone, OTPCode, '', '', '', '', invitaCode)
                    .then(() => {
                      InvitationApplyModalRef.current.showModal();
                    })
                    .finally(() => globalStore.globalLoading.next(false));
                }}>
                <Text
                  fontSize={fontSize.l}
                  color={basicColor.white}
                  fontWeight="bold">
                  {downloadBtn}
                </Text>
              </NativeTouchableOpacity>
            </LinearGradient>
          </View>
        </View>
      </View>
      <InvitationApplyModal
        ref={InvitationApplyModalRef}
        setModalVisible={setModalVisible}
      />
    </View>
  );
};
export default BetsShardHome;
