/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useState, useEffect, useMemo} from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
} from 'react-native';

import theme from '@style';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import LazyImage from '@basicComponents/image';
import {goTo} from '@utils'; //goBack
import {useModal} from '@/components/basic/modal';
import {getGiftCodeAmount} from '@/pages/me/me.service';
import LinearGradient from '@/components/basic/linear-gradient';
import {designToDp} from '@utils';
import {useTranslation} from 'react-i18next';
import HomeBanner from '@/pages/home/components/home-banner';
import {MessagePlay} from '@basicComponents/messagePlay';
import useHomeStore from '@/store/useHomeStore';
import {appBroadcast} from '@services/global.service';
import HomePageTagTabs from '@/pages/home/components/home-page-tag-tabs';
const {backgroundColor, borderRadiusSize, flex, font, padding} = theme;
interface HomeTabProps {
  kongList?: Array<any>;
}

const HomeTabPageLobby: React.FC<HomeTabProps> = React.memo(() => {

  const scrollViewRef1 = useRef<ScrollView>(null);

  const homeBannerList = useHomeStore(state => state.homeBannerList);
  const memoBannerList = useMemo(() => {
    return homeBannerList?.filter(item => item?.putPage.indexOf('Home') !== -1);
  }, [homeBannerList]);

  /********************gift code */
  const {i18n} = useTranslation();
  const clicked = useRef(false);
  const [code, setCode] = useState('');
  const onPressCancel = () => {
    clicked.current = false;
    hide();
  };
  const [noticeList, setNoticeList] = useState<string[]>([]);
  useEffect(() => {
    appBroadcast()
      .then(list => {
        setNoticeList(list);
      })
      .finally(() => {});
  }, []);
  const [showModal, setShowMdal] = useState(false);
  const [url, setUrl] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [title, setTitle] = useState('');
  const onPressConfirm = async () => {
    if (!code) {
      return;
    }
    if (clicked.current === true) {
      return;
    }
    clicked.current = true;
    hide();
    try {
      const res = await getGiftCodeAmount(code);
      setUrl(res?.routing || '');
      setButtonText(res?.buttonText || '');
      setImgUrl(res?.couponImg || '');
      setTitle(res?.title || '');
      setShowMdal(true);
      clicked.current = false;
    } catch (error) {
      clicked.current = false;
    }
  };
  const modal = (
    <Modal
      animationType={'fade'}
      visible={showModal}
      transparent={true}
      style={[theme.flex.flex, theme.flex.centerByRow]}>
      <View
        style={[
          theme.flex.flex,
          theme.flex.centerByRow,
          theme.flex.centerByCol,
          {
            width: 280,
            height: 240,
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: -120,
            marginLeft: -140,
          },
        ]}>
        <LinearGradient
          start={{x: 0, y: 0}}
          end={{x: 0, y: 1}}
          colors={['transparent', '#3B1E79', '#8247FF']}
          style={[
            theme.fill.fill,
            theme.flex.flex,
            theme.flex.centerByRow,
            theme.flex.centerByCol,
            {borderRadius: 12},
          ]}>
          <View
            style={[
              theme.flex.flex,
              theme.flex.centerByRow,
              theme.flex.centerByCol,
              {
                marginBottom: 12,
                paddingTop: 20,
              },
            ]}>
            <LazyImage
              occupancy={'transparent'}
              imageUrl={imgUrl || require('@assets/icons/me/recharge.webp')}
              width={80}
              height={80}
            />
          </View>
          <View
            style={[
              theme.flex.flex,
              theme.flex.centerByRow,
              theme.flex.centerByCol,
            ]}>
            <Text
              style={{
                lineHeight: 30,
                fontSize: 22,
                textAlign: 'center',
                color: '#fff',
              }}>
              {title || ' '}
            </Text>
          </View>
          <NativeTouchableOpacity
            onPress={() => {
              setShowMdal(false);
              goTo(url);
            }}
            style={[
              theme.flex.row,
              theme.flex.centerByCol,
              theme.margin.lrl,
              theme.flex.center,
              theme.gap.l,
              {
                height: 40,
                borderRadius: 20,
                width: 175,
                marginBottom: 12,
                marginTop: 12,
                backgroundColor: '#FFBB00',
              },
            ]}>
            <Text style={{color: '#fff', fontSize: 15}}>{buttonText}</Text>
          </NativeTouchableOpacity>
          <NativeTouchableOpacity
            onPress={() => {
              setShowMdal(false);
            }}
            style={[
              styles1.close,
              {
                width: 20,
                height: 20,
              },
            ]}>
            <LazyImage
              occupancy={'transparent'}
              imageUrl={require('@assets/imgs/gift/close.png')}
              width={20}
              height={20}
            />
          </NativeTouchableOpacity>
        </LinearGradient>
      </View>
    </Modal>
  );

  const {hide, renderModal} = useModal(
    <View style={[flex.col, styles.viewW]}>
      <View style={[flex.col, padding.xxl]}>
        <Text style={[font.bold, font.white, font.l, font.center]}>
          {i18n.t('other.enterGiftCode')}
        </Text>
      </View>
      <TextInput
        style={[
          theme.margin.lrl,
          theme.margin.btml,
          padding.l,
          theme.borderRadius.xs,
          {
            borderColor: theme.borderColor.primary50,
            borderWidth: 1,
            color: theme.fontColor.white,
            fontSize: 14,
          },
        ]}
        placeholder={i18n.t('other.enterGiftCode')}
        placeholderTextColor={'#9FA5AC'}
        value={code}
        onChangeText={text => {
          setCode(text);
        }}
        maxLength={6}
      />
      <View style={[flex.row, styles.btnH]}>
        <NativeTouchableOpacity
          activeOpacity={0.8}
          onPress={onPressCancel}
          style={[flex.flex1, styles.border, flex.center, styles.borderRight]}>
          <Text style={[{color: backgroundColor.main}, font.m]}>
            {i18n.t('label.cancel')}
          </Text>
        </NativeTouchableOpacity>
        <NativeTouchableOpacity
          activeOpacity={0.8}
          onPress={onPressConfirm}
          style={[flex.flex1, styles.border, flex.center]}>
          <Text style={[{color: backgroundColor.main}, font.m]}>
            {i18n.t('label.confirm')}
          </Text>
        </NativeTouchableOpacity>
      </View>
    </View>,
    {
      overlayStyle: [
        {
          padding: 0,
          borderRadius: borderRadiusSize.m + borderRadiusSize.s,
          backgroundColor: theme.backgroundColor.mainDark,
        },
      ],
    },
  );

  return (
    <ScrollView
      ref={scrollViewRef1}
      style={[theme.flex.flex1NoHidden]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{gap: 10}}
      scrollEventThrottle={16}>
      <HomeBanner bannerList={memoBannerList} />
      {noticeList && noticeList.length > 0 && (
        <MessagePlay notices={noticeList} />
      )}

      <HomePageTagTabs />

      <View style={[{marginBottom: -12}]}></View>
      {renderModal}
      {showModal ? modal : null}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  bottomView: {
    height: 106,
  },
  inviteLinerBtnStyleL: {
    borderRadius: 8,
  },
  inViteView: {},
  inviteBtnStyle: {
    width: '100%',
    height: 44,
    marginTop: 12,
  },
  kongBtn: {
    width: '100%',
    height: '100%',
  },
  btnStyle: {
    fontSize: 18,
    color: '#fff',
    lineHeight: 24,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  kongView: {
    borderRadius: 8,
  },
  kongTextStyle: {
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 4,
    marginTop: 8,
  },
  bottomNav: {
    height: 43,
  },
  bottomNavItem: {
    position: 'relative',
    width: '32%',
  },
  vipNavsItemTag: {
    position: 'absolute',
    top: 5,
    right: 5,
  },
  upIcon: {},
  border: {borderColor: theme.backgroundColor.grey, borderTopWidth: 1},
  borderRight: {borderRightWidth: 1},
  btnH: {
    height: designToDp(44),
  },
  viewW: {
    width: designToDp(270),
  },
});
const styles1 = StyleSheet.create({
  close: {
    width: 20,
    height: 20,
    position: 'absolute',
    bottom: -25,
    left: '50%',
    marginLeft: -10,
  },
});

export default HomeTabPageLobby;
