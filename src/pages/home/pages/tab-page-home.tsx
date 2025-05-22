import React, {useMemo, useRef, useState} from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Image,
  Modal,
  TextInput,
} from 'react-native';

import theme from '@style';
import useHomeStore from '@/store/useHomeStore';
import HomeBanner from '../components/home-banner';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import LazyImage from '@basicComponents/image';
import {goToUrl} from '@/common-pages/game-navigate';
import {goTo} from '@utils'; //goBack
import {useModal} from '@/components/basic/modal';
import {getGiftCodeAmount} from '@/pages/me/me.service';
import LinearGradient from '@/components/basic/linear-gradient';
import {designToDp} from '@utils';
import {useTranslation} from 'react-i18next';
const {backgroundColor, borderRadiusSize, flex, font, padding} = theme;
interface HomeTabProps {
  kongList?: Array<any>;
}

const HomeTabPageHome: React.FC<HomeTabProps> = ({kongList = []}) => {
  const {screenWidth} = useSettingWindowDimensions();
  const homeBannerList = useHomeStore(state => state.homeBannerList);

  const memoBannerList = useMemo(() => {
    return homeBannerList?.filter(item => item?.putPage.indexOf('Home') !== -1);
  }, [homeBannerList]);
  const scrollViewRef1 = useRef<ScrollView>(null);

  // const scrollToPosition = (position: any) => {
  //   if (scrollViewRef1.current) {
  //     scrollViewRef1.current?.scrollTo({y: position, animated: true});
  //   }
  // };
  const toPromotion = () => {
    goTo('PromotionDetail', {id: 10});
  };
  /********************gift code */
  const {i18n} = useTranslation();
  const clicked = useRef(false);
  const [code, setCode] = useState('');
  // const {getUserInfo} = useUserActions();

  // const refreshAmount = () => {
  //   getUserInfo();
  //   globalStore.updateAmount.next();
  // };

  // const {renderModal: renderGetModal, show1: getModalShow} =
  //   useGetModal(refreshAmount);

  const onPressCancel = () => {
    clicked.current = false;
    hide();
  };
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
      // const amount = res?.amount || '';
      // const type = res?.type || 2;
      setUrl(res?.routing || '');
      setButtonText(res?.buttonText || '');
      setImgUrl(res?.couponImg || '');
      setTitle(res?.title || '');
      setShowMdal(true);
      // if (amount) {
      // getModalShow(amount, type);
      // }
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
          // eslint-disable-next-line react-native/no-inline-styles
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
            // eslint-disable-next-line react-native/no-inline-styles
            {borderRadius: 12},
          ]}>
          <View
            style={[
              theme.flex.flex,
              theme.flex.centerByRow,
              theme.flex.centerByCol,
              // eslint-disable-next-line react-native/no-inline-styles
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
              // eslint-disable-next-line react-native/no-inline-styles
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
              // eslint-disable-next-line react-native/no-inline-styles
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
              // eslint-disable-next-line react-native/no-inline-styles
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
  const {show, hide, renderModal} = useModal(
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
          {/*<Text style={[{color: backgroundColor.mainDark}, font.accent, font.m]}></Text>*/}
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
      <View
        style={[
          theme.flex.row,
          theme.flex.centerByCol,
          theme.flex.shrink0,
          theme.flex.wrap,
          // eslint-disable-next-line react-native/no-inline-styles
          {
            marginLeft: 12,
            marginRight: 12,
            marginBottom: -8,
          },
        ]}>
        {kongList?.map((item, index) => {
          return (
            <View
              key={index}
              style={[
                theme.flex.row,
                theme.flex.centerByRow,
                // eslint-disable-next-line react-native/no-inline-styles
                {
                  width: '20%',
                  marginBottom: 8,
                  height: 80,
                },
              ]}>
              <View
                style={[
                  theme.flex.centerByRow,
                  theme.flex.centerByCol,
                  styles.kongView,
                ]}>
                <NativeTouchableOpacity
                  style={[
                    theme.flex.centerByRow,
                    theme.flex.centerByCol,
                    styles.kongBtn,
                  ]}
                  onPress={() => {
                    if (item.routing) {
                      if (item.routing.includes('http')) {
                        goToUrl(item.routing, item.areaName);
                        return;
                      }
                      let name = item.areaName ? item.areaName : '';
                      goTo(item.routing ? item.routing : 'InviteActivity', {
                        type: name.replace(/ /g, ''),
                      });
                    } else {
                      setCode('');
                      show();
                    }
                  }}>
                  <LazyImage
                    imageUrl={item.areaIcon}
                    width={45}
                    height={45}
                    radius={12}
                    occupancy="transparent"
                  />
                  <Text style={[styles.kongTextStyle]}>{item.areaName}</Text>
                </NativeTouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
      <NativeTouchableOpacity activeOpacity={1} onPress={toPromotion}>
        <Image
          source={require('@assets/imgs/me/advertisement.webp')}
          style={[{height: 68, width: '100%'}, theme.margin.tops]}
        />
      </NativeTouchableOpacity>
      <Image
        source={require('@assets/imgs/footer-image.webp')}
        // eslint-disable-next-line react-native/no-inline-styles
        style={[{height: 180, width: screenWidth}]}
      />
      {renderModal}
      {showModal ? modal : null}
    </ScrollView>
  );
};
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

export default HomeTabPageHome;
