import theme from '@style';
import {homeServiceStyle} from '../home.style';
import React, {useMemo} from 'react';
import TouchableOpacity from '@basicComponents/touchable-opacity';
import {BasicObject} from '@types';
import globalStore from '@/services/global.state';
import {goCS} from '@/utils';
import LazyImage from '@basicComponents/image/lazy-image';

const HomeService = () => {
  const iconShadow = useMemo(() => {
    let shadow = {} as BasicObject;
    if (globalStore.isWeb) {
      shadow = {
        ...shadow,
        shadowColor: theme.basicColor.primary30,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 12,
      };
    } else {
      shadow = {
        ...shadow,
        shadowColor: theme.basicColor.primary10,
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 12,
      };
    }
    return shadow;
  }, []);

  return (
    <TouchableOpacity
      containerStyle={[
        theme.position.abs,
        theme.background.primary,
        homeServiceStyle.service,
        theme.flex.center,
        iconShadow,
        {
          bottom: 40,
        },
      ]}
      onPress={goCS}>
      <LazyImage
        width={39}
        height={39}
        radius={39}
        imageUrl={require('@components/assets/icons/service.webp')}
      />
    </TouchableOpacity>
  );
};

export default HomeService;
