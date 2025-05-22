import React from 'react';
import {View} from 'react-native';
import Text from '@basicComponents/text';
import theme from '@/style';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import {goTo} from '@/utils';
import {vipIcon} from '../luckyspin.style';
import {LazyImageBackground} from '@/components/basic/image';
import {useTranslation} from 'react-i18next';
import globalStore from '@/services/global.state';
export interface BottomInfoProps {
  freeCount: number;
  onClose?: () => void;
}

const BottomInfo: React.FC<BottomInfoProps> = ({freeCount, onClose}) => {
  const {i18n} = useTranslation();
  const toVip = () => {
    if (!globalStore.token) {
      onClose?.();
      goTo('Login');
      return;
    }
    goTo('Vip');
    onClose?.();
  };
  return (
    <View
      style={[
        theme.flex.row,
        theme.fill.fillW,
        theme.flex.between,
        theme.padding.lrl,
        theme.padding.topxxs,
      ]}>
      <View style={[theme.flex.row]}>
        <Text fontSize={theme.fontSize.s} color={'#ffffff'}>
          {i18n.t('luckyspin.myfree')}
        </Text>
        <Text
          fontSize={theme.fontSize.s}
          blod
          color={'#ffffff'}
          style={[theme.margin.leftxxs]}>
          {freeCount}
        </Text>
      </View>
      <View style={[theme.flex.row]}>
        <Text fontSize={theme.fontSize.s} color={'#ffffff'}>
          {i18n.t('luckyspin.morefree')}
        </Text>
        <NativeTouchableOpacity onPress={toVip} style={[theme.margin.leftxxs]}>
          <LazyImageBackground
            occupancy={'transparent'}
            style={[theme.flex.center]}
            imageUrl={vipIcon}
            resizeMode="stretch"
            width={34}
            height={18}>
            <Text fontSize={theme.fontSize.s} color={'#ffffff'}>
              VIP
            </Text>
          </LazyImageBackground>
        </NativeTouchableOpacity>
      </View>
    </View>
  );
};

export default BottomInfo;
