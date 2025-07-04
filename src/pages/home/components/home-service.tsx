import theme from '@style';
import {homeServiceStyle} from '../home.style';
import React from 'react';
import TouchableOpacity from '@basicComponents/touchable-opacity';
import {goCS} from '@/utils';
import LazyImage from '@basicComponents/image/lazy-image';
import {View} from 'react-native';

const HomeService = ({spinShow}: {spinShow: () => void}) => {
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
          imageUrl={require('@assets/icons/luckyspin1.webp')}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={goCS}>
        <LazyImage
          width={55}
          height={55}
          imageUrl={require('@components/assets/icons/service.webp')}
        />
      </TouchableOpacity>
    </View>
  );
};

export default HomeService;
