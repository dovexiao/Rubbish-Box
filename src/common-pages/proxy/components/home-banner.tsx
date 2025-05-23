import React from 'react';
import theme from '@/style';
import Carousel from 'react-native-reanimated-carousel';
import {View} from 'react-native';
import LazyImage from '@basicComponents/image';
import TouchableOpacity from '@basicComponents/touchable-opacity';
import {goToUrl} from '@/common-pages/game-navigate';
import {useInnerStyle} from '../proxy.hooks';
import {BannerListItem} from '../proxy.type';

export interface HomeBannerProps {
  bannerList: BannerListItem[];
}

const HomeBanner: React.FC<HomeBannerProps> = ({bannerList}) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const {
    size: {bannerWidth, bannerHeight},
    bannerStyle,
  } = useInnerStyle();
  return (
    <View style={[theme.position.rel, theme.padding.l]}>
      <Carousel
        loop
        style={[theme.borderRadius.m, theme.overflow.hidden]}
        width={bannerWidth}
        height={bannerHeight}
        autoPlay={true}
        autoPlayInterval={2000}
        scrollAnimationDuration={1000}
        data={bannerList}
        onProgressChange={e => {
          let index = Math.abs(Math.round(e / bannerWidth));
          if (index >= bannerList?.length) {
            index = 0;
          }
          if (index !== currentIndex) {
            setCurrentIndex(index);
          }
        }}
        renderItem={({item}) => (
          <TouchableOpacity
            style={[theme.fill.fill]}
            onPress={() => {
              goToUrl(item.skipLinks || '', item.title);
            }}>
            <View
              style={[
                theme.fill.fill,
                theme.borderRadius.m,
                theme.overflow.hidden,
                theme.background.primary,
              ]}>
              <LazyImage
                occupancy={theme.backgroundColor.palegrey}
                imageUrl={item.bannerImg}
                height={bannerHeight}
                width={bannerWidth}
              />
            </View>
          </TouchableOpacity>
        )}
      />
      {!bannerList?.length && (
        <View
          style={[
            // eslint-disable-next-line react-native/no-inline-styles
            {
              height: bannerHeight,
              width: bannerWidth,
              left: 12,
              top: 8,
            },
            theme.borderRadius.m,
            theme.position.abs,
            theme.background.palegrey,
          ]}
        />
      )}
      <View
        style={[
          theme.position.abs,
          theme.fill.fillW,
          theme.flex.row,
          theme.flex.center,
          bannerStyle.idotBox,
        ]}>
        {bannerList.map((_v, i) => (
          <View
            key={i}
            style={[
              bannerStyle.idot,
              currentIndex === i && bannerStyle.idotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
};

export default HomeBanner;
