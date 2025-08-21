/* eslint-disable react-native/no-inline-styles */
import React, {useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import DetailNavTitle from '@/components/business/detail-nav-title';
import {goBack, goTo, useResponsiveDimensions} from '@/utils';
import Modal from './modal';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import Clipboard from '@react-native-clipboard/clipboard';
import globalStore from '@/services/global.state';
import {vipOptionsMap} from '@businessComponents/vip';
import i18n from '@i18n';

import {
  flex,
  margin,
  font,
  padding,
  background,
  position,
  borderRadius,
  overflow,
  fontColor,
  basicColor,
} from '@/components/style';
import LazyImage from '@/components/basic/image';
import Text from '@basicComponents/text';
import {LazyImageLGBackground} from '@basicComponents/image';

import {
  pofileImgWidth,
  defaultHeaderImg,
  pofileMagin,
  edit,
  rightIcon,
  borderRadius50,
  smartphone,
  lock,
  idImg,
} from './profile.variable';

import {ToastType, useToast} from '@/components/basic/modal';
import {CopyImg} from './svg.variable';
import Spin from '@/components/basic/spin';
import {useUserActions, useUserInfo} from '@/store/useUserStore';

const PersonalCenter = () => {
  const {renderModal, show} = useToast();

  const userInfo = useUserInfo();
  const {getUserInfo} = useUserActions();

  const memoVipLevel = useMemo(() => {
    return userInfo?.level && userInfo?.level !== 0 ? userInfo?.level : 0;
  }, [userInfo?.level]);

  const editRef: any = useRef(null);

  const handleCopy = () => {
    if (userInfo?.userId) {
      Clipboard.setString('' + userInfo?.userId);
      show({
        type: ToastType.success,
        message: i18n.t('share.copy-success'),
      });
    }
  };

  const {height: screenHeight} = useResponsiveDimensions();
  const [loading] = useState(false);
  return (
    <LazyImageLGBackground>
      <DetailNavTitle
        title={i18n.t('homeMenu.title.profile')}
        hideServer={true}
        hideAmount={true}
        onBack={() => goBack()}
      />
      <Spin
        loading={loading}
        style={{
          height: screenHeight,
        }}>
        <View
          style={[
            flex.row,
            margin.btmm,
            padding.lrl,
            flex.centerByCol,
            pofileMagin,
            borderRadius50,
            overflow.hidden,
          ]}>
          <View style={[position.rel, flex.center, flex.centerByCol]}>
            <LazyImage
              occupancy={'transparent'}
              resizeMode="cover"
              imageUrl={
                userInfo?.userAvatar ? userInfo?.userAvatar : defaultHeaderImg
              }
              width={pofileImgWidth}
              height={pofileImgWidth}
              radius={pofileImgWidth}
            />
          </View>

          <View style={[flex.flex, flex.around, margin.leftxxl]}>
            <View style={[flex.flex, flex.center, flex.row, margin.btml]}>
              <Text
                style={[
                  margin.leftxxs,
                  margin.rightl,
                  font.white,
                  font.fontInterBold,
                  font.m,
                ]}>
                {userInfo?.userName}
              </Text>
              <NativeTouchableOpacity
                onPress={() => {
                  editRef.current.show();
                  editRef.current.handleSetName(userInfo?.userName);
                }}>
                <LazyImage
                  occupancy={'transparent'}
                  imageUrl={edit}
                  width={24}
                  height={24}
                />
              </NativeTouchableOpacity>
            </View>
            <LazyImage
              occupancy="#0000"
              imageUrl={vipOptionsMap[memoVipLevel].sign}
              width={(globalStore.screenWidth * 45) / 375}
              height={(globalStore.screenWidth * 20) / 375}
            />
          </View>
        </View>

        <View
          style={[
            margin.l,
            background.newBgInOne,
            borderRadius.l,
            padding.lrl,
          ]}>
          <View
            style={[
              flex.flex,
              flex.row,
              flex.between,
              flex.centerByCol,
              {
                height: 48,
                borderBottomWidth: 1,
                borderColor: basicColor.borderShallow,
              },
            ]}>
            <View style={[flex.flex, flex.centerByCol, flex.row]}>
              <LazyImage imageUrl={smartphone} width={18} height={18} />
              <Text blod style={[margin.l, font.m, font.white]}>
                {i18n.t('homeMenu.title.phoneNumber')}
              </Text>
            </View>
            <Text color={fontColor.second} style={[font.white, font.m]}>
              {userInfo?.userPhone}
            </Text>
          </View>
          <View
            style={[
              flex.flex,
              flex.row,
              flex.between,
              flex.centerByCol,
              {
                height: 48,
                borderBottomWidth: 1,
                borderColor: basicColor.borderShallow,
              },
            ]}>
            <View style={[flex.flex, flex.centerByCol, flex.row]}>
              <LazyImage imageUrl={lock} width={18} height={18} />
              <Text blod style={[margin.l, font.white, font.m]}>
                {i18n.t('homeMenu.title.changePassword')}
              </Text>
            </View>
            <NativeTouchableOpacity onPress={() => goTo('SetPassword')}>
              <View
                style={[flex.flex, flex.centerByCol, flex.row, flex.center]}>
                <Text
                  color={fontColor.white}
                  style={[margin.leftxxs, margin.l, font.m]}>
                  ******
                </Text>
                <LazyImage
                  occupancy={'transparent'}
                  imageUrl={rightIcon}
                  width={14}
                  height={14}
                />
              </View>
            </NativeTouchableOpacity>
          </View>
          <View
            style={[
              flex.flex,
              flex.row,
              flex.between,
              flex.centerByCol,
              {height: 48},
            ]}>
            <View style={[flex.flex, flex.centerByCol, flex.row]}>
              <LazyImage imageUrl={idImg} width={18} height={18} />
              <Text blod style={[margin.l, font.white, font.m]}>
                {i18n.t('homeMenu.title.userId')}
              </Text>
            </View>
            <View style={[flex.flex, flex.centerByCol, flex.row, flex.center]}>
              <Text
                color={fontColor.white}
                style={[margin.leftxxs, margin.l, font.m]}>
                {+(userInfo?.userId || 0)}
              </Text>
              <NativeTouchableOpacity onPress={handleCopy}>
                <CopyImg width={16} height={16} />
              </NativeTouchableOpacity>
            </View>
          </View>
        </View>
      </Spin>
      <Modal ref={editRef} getUserInfo={getUserInfo} />
      {renderModal}
    </LazyImageLGBackground>
  );
};

export default PersonalCenter;
