/* eslint-disable prettier/prettier */
import React from 'react';
import {BannerListItem} from '../home.type';
import theme from '@/style';
import {View} from 'react-native';
import {BannerSwiper} from '../../../components/basic/swiper';
import {useSettingWindowDimensions} from '@/store/useSettingStore';

const HomeBanner = ({bannerList}: {bannerList: BannerListItem[]}) => {
  const {screenWidth, calculateItemWidth} = useSettingWindowDimensions();
  const bannerWidth = screenWidth - theme.paddingSize.l * 2;
  const bannerHeight = calculateItemWidth(125);

  return (
    <View
      style={[
        theme.padding.topl,
        theme.padding.lrl,
        // eslint-disable-next-line react-native/no-inline-styles
        {
          paddingTop: 6,
        },
      ]}>
      <BannerSwiper
        bannerList={bannerList}
        bannerWidth={bannerWidth}
        bannerHeight={bannerHeight}
        bannerOverlaySize="small"
      />
    </View>
  );
};

export default HomeBanner;
