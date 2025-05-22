import theme from '@style';
import {homeServiceStyle} from '../home.style';
import LazyImage from '@basicComponents/image';
import React, {useMemo} from 'react';
import TouchableOpacity from '@basicComponents/touchable-opacity';
import {BasicObject} from '@types';
import globalStore from '@/services/global.state';
import {goToWithLogin} from '@/utils';
const HomeCheckIn = () => {
  const iconShadow = useMemo(() => {
    let shadow = {} as BasicObject;
    if (globalStore.isWeb) {
      shadow = {
        ...shadow,
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

  const onPressToCheckIn = () => {
    goToWithLogin('CheckIn');
  };

  return (
    <TouchableOpacity
      containerStyle={[
        theme.position.abs,
        homeServiceStyle.checkin,
        theme.flex.center,
        iconShadow,
      ]}
      onPress={onPressToCheckIn}>
      <LazyImage
        width={46}
        height={56}
        radius={46}
        imageUrl={require('@assets/imgs/home/checkin.webp')}
      />
    </TouchableOpacity>
  );
};

export default HomeCheckIn;
