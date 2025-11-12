/* eslint-disable react-native/no-inline-styles */
import theme from '@style';
import {homeServiceStyle} from '../home.style';
import LazyImage from '@basicComponents/image';
import TouchableOpacity from '@basicComponents/touchable-opacity';
import {useToken} from '@/store/useUserStore';
import {
  Modal,
  View,
  StyleSheet,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {goTo, goToWithLogin} from '@utils';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import {useTranslation} from 'react-i18next';
import React, {useState, useEffect, useRef} from 'react'; //, {useMemo}
// import {BasicObject} from '@types';
// import globalStore from '@/services/global.state';
const HomeRegister = () => {
  const {i18n} = useTranslation();
  const {isLogin} = useToken();
  const [showModal, setShowModal] = useState(false);
  const bounceValue = useRef(new Animated.Value(1)).current;
  const {screenWidth} = useSettingWindowDimensions();
  const modalWidth = screenWidth * 0.61;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceValue, {
          toValue: 1.2,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(bounceValue, {
          toValue: 1,
          duration: 500,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [bounceValue]);

  // const iconShadow = useMemo(() => {
  //   let shadow = {} as BasicObject;
  //   if (globalStore.isWeb) {
  //     shadow = {
  //       ...shadow,
  //       shadowColor: theme.basicColor.primary30,
  //       shadowOffset: {width: 0, height: 4},
  //       shadowOpacity: 1,
  //       shadowRadius: 4,
  //       elevation: 12,
  //     };
  //   } else {
  //     shadow = {
  //       ...shadow,
  //       shadowColor: theme.basicColor.primary10,
  //       shadowOffset: {width: 0, height: 4},
  //       shadowOpacity: 1,
  //       shadowRadius: 4,
  //       elevation: 12,
  //     };
  //   }
  //   return shadow;
  // }, []);

  const modal = (
    <Modal
      animationType={'fade'}
      visible={showModal}
      transparent={true}
      style={[
        theme.flex.flex,
        theme.flex.centerByRow,
        {backgroundColor: 'transparent', borderWidth: 0},
      ]}>
      {
        <View
          style={[
            theme.flex.flex,
            theme.flex.centerByRow,
            theme.flex.centerByCol,

            {
              width: modalWidth,
              height: 380,
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: -190,
              marginLeft: -(modalWidth / 2),
            },
          ]}>
          <NativeTouchableOpacity
            activeOpacity={1}
            onPress={() => {
              if (isLogin) {
                goToWithLogin('Deposit');
              } else {
                goTo('Login');
              }
              setShowModal(false);
            }}
            style={{
              borderWidth: 0,
              borderColor: 'transparent',
              alignItems: 'center',
              justifyContent: 'center',
              ...(Platform.OS === 'web' && {
                outlineStyle: 'none',
                outlineWidth: 0,
                outlineColor: 'transparent',
              }),
              // outline: 'none',
            }}>
            <LazyImage
              occupancy={'transparent'}
              imageUrl={
                'https://apk.megadreamlottery.com/manager/547443bece6c4cf0bc07ac3937d43051.webp'
              }
              width={modalWidth}
              height={380}
              radius={10}
            />
          </NativeTouchableOpacity>
          <NativeTouchableOpacity
            onPress={() => {
              setShowModal(false);
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
        </View>
      }
    </Modal>
  );
  const onPressToInvite = () => {
    setShowModal(true);
    return;
  };

  return (
    <View>
      <TouchableOpacity
        containerStyle={[
          theme.position.abs,
          homeServiceStyle.invite,
          theme.flex.center,
          // iconShadow,
          {
            bottom: 110,
            right: 15,
          },
        ]}
        onPress={onPressToInvite}>
        <Animated.View style={{transform: [{scale: bounceValue}]}}>
          <LazyImage
            width={50}
            height={50}
            imageUrl={require('@assets/icons/home-register.webp')}
          />
        </Animated.View>
      </TouchableOpacity>
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

export default HomeRegister;
