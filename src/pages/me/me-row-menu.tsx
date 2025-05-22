/* eslint-disable react-native/no-inline-styles */
import React, {useRef, useState} from 'react';
import theme from '@style';
import {
  StyleSheet,
  View,
  TextInput,
  ImageRequireSource,
  ColorValue,
  Modal,
} from 'react-native';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import LazyImage from '@/components/basic/image';
import {useTranslation} from 'react-i18next';
import Text from '@basicComponents/text';
import {goToWithLogin, goTo} from '@utils';
import {designToDp} from '@utils';
import {useModal} from '@/components/basic/modal';
// import {useGetModal} from '@/common-pages/luckyspin/getmodal.hooks';
import {getGiftCodeAmount} from './me.service';
// import globalStore from '@/services/global.state';
// import {useUserActions} from '@/store/useUserStore';
import LinearGradient from '@/components/basic/linear-gradient';
const {backgroundColor, borderRadiusSize, margin, flex, font, padding} = theme;

export interface MeRowMenuProps {}

const MeRowMenu: React.FC<MeRowMenuProps> = () => {
  const styles = StyleSheet.create({
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
  const {i18n} = useTranslation();

  const toRecharge = () => {
    goToWithLogin('Recharge');
  };

  const toWithdraw = () => {
    goToWithLogin('Withdraw');
  };

  const toTransfer = () => {
    // goToWithLogin('Transfer');
    setCode('');
    show();
  };

  /********************gift code */
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
              white
              fontSize={22}
              style={{lineHeight: 30, textAlign: 'center'}}>
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
            <Text white fontSize={15}>
              {buttonText}
            </Text>
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
        placeholderTextColor={'#FFFFFF'}
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
          <Text style={[font.accent, font.m]}>{i18n.t('label.cancel')}</Text>
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

  const renderItem = ({
    url,
    title,
    bgColor,
    onPress,
  }: {
    url: ImageRequireSource | string;
    title: string;
    onPress?: () => void;
    bgColor?: ColorValue;
  }) => {
    return (
      <NativeTouchableOpacity
        style={[
          flex.row,
          flex.centerByCol,
          // flex.around,
          theme.padding.leftm,
          theme.border.primary,
          theme.borderRadius.s,
          theme.background.primary15,
          styles.bottomNavItem,
          {
            backgroundColor: bgColor,
          },
        ]}
        onPress={onPress}>
        <View style={[styles.upIcon, flex.center]}>
          <LazyImage
            occupancy={'transparent'}
            imageUrl={url}
            width={30}
            height={30}
          />
        </View>
        <Text blod style={[font.s, font.white]}>
          {title}
        </Text>
      </NativeTouchableOpacity>
    );
  };

  return (
    <View style={[flex.row, styles.bottomNav, flex.between, margin.topl]}>
      {renderItem({
        url: require('@assets/icons/me/recharge.webp'),
        title: i18n.t('me.bottom.deposit'),
        onPress: toRecharge,
        bgColor: theme.backgroundColor.mainDark,
      })}
      {renderItem({
        url: require('@assets/icons/me/withdraw.webp'),
        title: i18n.t('me.bottom.withdraw'),
        onPress: toWithdraw,
        bgColor: theme.backgroundColor.mainDark,
      })}
      {renderItem({
        url: require('@assets/icons/me/transfer.webp'),
        title: i18n.t('me.bottom.giftCode'),
        onPress: toTransfer,
        bgColor: theme.backgroundColor.mainDark,
      })}
      {renderModal}
      {/* {renderGetModal} */}
      {showModal ? modal : null}
    </View>
  );
};

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

export default MeRowMenu;
