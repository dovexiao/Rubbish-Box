import theme from '@style';
import {homeServiceStyle} from '../home.style';
import LazyImage from '@basicComponents/image';
import React, {useMemo} from 'react';
import TouchableOpacity from '@basicComponents/touchable-opacity';
import {BasicObject} from '@types';
import globalStore from '@/services/global.state';
import {goTo} from '@/utils';
const HomeInvite = () => {
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

  const onPressToInvite = () => {
    goTo('InviteActivity', {
      type: '',
    });
  };

  return (
    <TouchableOpacity
      containerStyle={[
        theme.position.abs,
        homeServiceStyle.invite,
        theme.flex.center,
        iconShadow,
      ]}
      onPress={onPressToInvite}>
      <LazyImage
        width={46}
        height={56}
        radius={46}
        imageUrl={require('@assets/imgs/home/invite.webp')}
      />
    </TouchableOpacity>
  );
};

export default HomeInvite;
