import theme from '@style';
import {homeServiceStyle} from '../home.style';
import React, {useState} from 'react';
import {Platform} from 'react-native';
import TouchableOpacity from '@basicComponents/touchable-opacity';
import {goCS, goTo} from '@/utils';
import LazyImage from '@basicComponents/image/lazy-image';
import {View} from 'react-native';
import HomePopTwo from './home-pop-two';

const HomeService = ({
  spinShow,
  firstShow,
  menuImgUrl,
  dynamicUrl,
  isLogin,
}: {
  spinShow: () => void;
  firstShow?: number;
  menuImgUrl?: string;
  isLogin?: boolean;
  dynamicUrl?: string;
}) => {
  const [isImageVisible, setIsImageVisible] = useState(false);
  const toggleModal = () => {
    setIsImageVisible(!isImageVisible);
  };
  return (
    <View
      style={[theme.position.abs, homeServiceStyle.service, theme.flex.center]}>
      <TouchableOpacity
        onPress={() => {
          spinShow();
        }}>
        <LazyImage
          width={70}
          height={70}
          imageUrl={require('@assets/icons/luckyspin.gif')}
        />
      </TouchableOpacity>
      {/*{(firstShow === 1 || !isLogin) && (*/}
      {/*  <TouchableOpacity*/}
      {/*    style={{marginBottom: 8}}*/}
      {/*    onPress={() => {*/}
      {/*      if (!isLogin) {*/}
      {/*        goTo('Login');*/}
      {/*        return;*/}
      {/*      }*/}
      {/*      toggleModal();*/}
      {/*    }}>*/}
      {/*    <LazyImage*/}
      {/*      width={60}*/}
      {/*      height={60}*/}
      {/*      // imageUrl={require('@assets/gif/first-recharge.gif')}*/}
      {/*      imageUrl={menuImgUrl || ''}*/}
      {/*    />*/}
      {/*  </TouchableOpacity>*/}
      {/*)}*/}

      <TouchableOpacity
        style={{marginBottom: 8}}
        onPress={() => {
          // if (!isLogin) {
          //   goTo('Login');
          //   return;
          // }
          toggleModal();
        }}>
        <LazyImage
          width={60}
          height={60}
          // imageUrl={require('@assets/gif/first-recharge.gif')}
          imageUrl={menuImgUrl || ''}
        />
      </TouchableOpacity>

      {Platform.OS !== 'web' ? (
        <TouchableOpacity onPress={goCS}>
          <LazyImage
            width={55}
            height={55}
            imageUrl={require('@components/assets/icons/service.webp')}
          />
        </TouchableOpacity>
      ) : (
        <View style={{width: 55, height: 55}}></View>
      )}
      <HomePopTwo
        isImageVisible={isImageVisible}
        dynamicUrl={dynamicUrl}
        setIsImageVisible={setIsImageVisible}
      />
    </View>
  );
};

export default HomeService;
