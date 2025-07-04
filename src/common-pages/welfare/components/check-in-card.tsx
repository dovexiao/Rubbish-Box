import React from 'react';

import {useSettingWindowDimensions} from '@/store/useSettingStore';

import CustomCard from './custom-card';
import Text from '@basicComponents/text';
import {LazyImageBackground} from '@/components/basic/image';
import theme from '@/style';
import {View} from 'react-native';
import LazyImage from '@/components/basic/image/lazy-image';
import Button from '@/components/basic/button';
import useWelfareStore from '@/store/useWelfareStore';
import {goToWithLogin} from '@/utils';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';

const CheckInCard = () => {
  const {screenWidth} = useSettingWindowDimensions();
  const {wealCheckinInfo} = useWelfareStore(state => state.welfareHomeData);

  const onPressSignInNow = () => {
    goToWithLogin('CheckIn');
  };

  return (
    <CustomCard title="Check in to share jockpot">
      <LazyImageBackground
        imageUrl={require('@assets/icons/common/common.webp')}
        width={screenWidth - 24}
        height={106}
        style={[theme.margin.tops, theme.flex.centerByCol, theme.flex.end]}>
        <View
          style={[
            theme.flex.end,
            theme.flex.centerByCol,
            // eslint-disable-next-line react-native/no-inline-styles
            {
              marginBottom: -6,
            },
          ]}>
          <Text fontSize={12} blod color={'white'} style={[theme.font.center]}>
            JACKPOT
          </Text>
          <Text fontSize={32} blod color={'#FFE798FF'}>
            {wealCheckinInfo?.jackpotAmount}
          </Text>
        </View>
      </LazyImageBackground>
      <View
        style={[
          theme.flex.flex,
          theme.flex.row,
          theme.margin.topxxl,
          theme.margin.lrl,
          theme.padding.lrl,
          theme.borderRadius.s,
          theme.border.white20,
          theme.flex.center,
          {height: 68, backgroundColor: '#00000066', gap: 8},
        ]}>
        {wealCheckinInfo?.checkinList.map((item, index) => {
          return (
            <NativeTouchableOpacity
              onPress={onPressSignInNow}
              key={`${item?.day + index}`}
              style={[theme.flex.flex1, theme.flex.centerByCol]}>
              <LazyImage imageUrl={item?.statusIcon} width={36} height={36} />
              <Text white>{item?.day}</Text>
            </NativeTouchableOpacity>
          );
        })}
      </View>
      {/* <View style={[theme.flex.center, theme.padding.tbs, theme.padding.lrl]}>
        <Text white style={[theme.font.center]}>
          Check in for 7 consecutive days and share the grand prize on Sunday
        </Text>
      </View> */}
      <Button
        buttonStyle={[theme.margin.l]}
        title="Check in now"
        type="linear-primary"
        size="large"
        onPress={onPressSignInNow}
      />
    </CustomCard>
  );
};

export default CheckInCard;
