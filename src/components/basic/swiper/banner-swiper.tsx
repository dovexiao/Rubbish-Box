import React, {useState, useCallback} from 'react';
import {View, StyleSheet, Linking} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import {LazyImageBackground} from '@basicComponents/image';
import TouchableOpacity from '@basicComponents/touchable-opacity';
import theme from '@/style';
import globalStore from '@/services/global.state';
import Swiper from './swiper';
import {goToUrl} from '@/common-pages/game-navigate';
import {renderOverlayLinkComponent} from '@/components/basic/swiper';
import {BannerListItem} from '@/pages/home/home.type';

const styles = StyleSheet.create({
  idotBox: {
    bottom: theme.paddingSize.xxl,
  },
  idot: {
    width: theme.paddingSize.xxs,
    height: theme.paddingSize.xxs,
    borderRadius: theme.paddingSize.xxs / 2,
    marginHorizontal: theme.paddingSize.xxs / 2,
    backgroundColor: theme.backgroundColor.palegrey,
  },
  idotActive: {
    backgroundColor: theme.basicColor.primary,
    width: theme.paddingSize.l,
  },
});

interface BannerSwiperProps {
  bannerList: BannerListItem[];
  bannerWidth: number;
  bannerHeight: number;
  bannerOverlaySize?: 'small' | 'big';
  type?: number;
}

const BannerSwiper = ({
  bannerList,
  bannerWidth,
  bannerHeight,
  bannerOverlaySize = 'big',
  type = 1,
}: BannerSwiperProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 使用 useCallback 避免匿名函数重复创建
  const onPressBanner = useCallback(
    (item: BannerListItem) => {
      if (type === 2) {
        if (item?.popUrl) {
          Linking.openURL(item.popUrl);
        }
      } else {
        goToUrl(item.skipLinks, item.title);
      }
    },
    [type],
  );

  // 节流设置 currentIndex
  const onProgressChange = useCallback(
    (e: number) => {
      let index = Math.abs(Math.round(e / bannerWidth));
      if (index >= bannerList.length) {
        index = 0;
      }
      if (index !== currentIndex) {
        setCurrentIndex(index);
      }
    },
    [bannerList.length, bannerWidth, currentIndex],
  );

  return (
    <View style={[theme.position.rel, {marginBottom: theme.paddingSize.s}]}>
      {globalStore.isWeb ? (
        <Swiper
          pictureWidth={bannerWidth}
          seamless={true}
          paddingRight={theme.paddingSize.l}
          height={bannerHeight}
          autoPlay={true}
          hasIndicator={true}
          pictures={bannerList?.map(item => ({
            uri: item.bannerImg,
            videoUri: item?.bannerVideo || '',
          }))}
          itemRadius={theme.borderRadiusSize.m}
          onItemPress={index => {
            onPressBanner(bannerList[index]);
          }}
          renderOverlayComponent={index => {
            const bannerItem = bannerList[index];
            return renderOverlayLinkComponent({
              item: bannerItem,
              onPress: () => onPressBanner(bannerItem),
              sizeHeight: bannerHeight,
              sizeWidth: bannerWidth,
              size: bannerOverlaySize,
            });
          }}
        />
      ) : (
        <>
          <Carousel
            loop
            style={[theme.borderRadius.m, theme.overflow.hidden]}
            width={bannerWidth}
            height={bannerHeight}
            autoPlay={true}
            autoPlayInterval={3000}
            scrollAnimationDuration={1000}
            data={bannerList}
            onProgressChange={onProgressChange}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  theme.fill.fill,
                  // {bottom: 8}
                ]}
                onPress={() => onPressBanner(item)}>
                <View
                  style={[
                    theme.fill.fill,
                    theme.borderRadius.m,
                    theme.overflow.hidden,
                    theme.background.primary,
                  ]}>
                  <LazyImageBackground
                    occupancy={theme.backgroundColor.palegrey}
                    imageUrl={item.bannerImg}
                    height={bannerHeight}
                    width={bannerWidth}>
                    {renderOverlayLinkComponent({
                      item,
                      onPress: () => onPressBanner(item),
                      sizeHeight: bannerHeight,
                      sizeWidth: bannerWidth,
                      size: bannerOverlaySize,
                    })}
                  </LazyImageBackground>
                </View>
              </TouchableOpacity>
            )}
          />
          <View
            style={[
              theme.position.abs,
              theme.fill.fillW,
              theme.flex.row,
              theme.flex.center,
              styles.idotBox,
            ]}>
            {bannerList.map((_v, i) => (
              <View
                key={i}
                style={[styles.idot, currentIndex === i && styles.idotActive]}
              />
            ))}
          </View>
        </>
      )}
      {!bannerList?.length && (
        <View
          style={[
            {
              height: bannerHeight,
              width: bannerWidth,
              // left: 12,
              // top: 8,
            },
            theme.borderRadius.m,
            theme.position.abs,
            theme.background.palegrey,
          ]}
        />
      )}
    </View>
  );
};

export default React.memo(BannerSwiper);
