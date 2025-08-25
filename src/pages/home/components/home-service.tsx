import theme from '@style';
import {homeServiceStyle} from '../home.style';
import React, {useState} from 'react';
import TouchableOpacity from '@basicComponents/touchable-opacity';
import {goCS, goTo} from '@/utils';
import LazyImage from '@basicComponents/image/lazy-image';
import {View} from 'react-native';
import globalStore from '@/services/global.state';
import HomePopTwo from './home-pop-two';

const HomeService = ({spinShow}: {spinShow: () => void}) => {
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
      {(globalStore.userInfo?.totalRechargeAmount === 0 ||
        !globalStore.token) && (
        <TouchableOpacity
          style={{marginBottom: 8}}
          onPress={() => {
            if (!globalStore.token) {
              goTo('Login');
              return;
            }
            toggleModal();
          }}>
          <LazyImage
            width={60}
            height={60}
            imageUrl={require('@assets/gif/first-recharge.gif')}
          />
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={goCS}>
        <LazyImage
          width={55}
          height={55}
          imageUrl={require('@components/assets/icons/service.webp')}
        />
      </TouchableOpacity>
      <HomePopTwo
        isImageVisible={isImageVisible}
        setIsImageVisible={setIsImageVisible}
      />
    </View>
  );
};

export default HomeService;
