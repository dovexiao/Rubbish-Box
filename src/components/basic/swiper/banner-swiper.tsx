/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React from 'react';
import globalStore from '@/services/global.state';
import theme from '@/style';
import Carousel from 'react-native-reanimated-carousel';
import {View, StyleSheet, Linking} from 'react-native';
import {LazyImageBackground} from '@basicComponents/image';
import TouchableOpacity from '@basicComponents/touchable-opacity';
import Swiper from './swiper';
import {goToUrl} from '@/common-pages/game-navigate';
import {renderOverlayLinkComponent} from '@/components/basic/swiper';
import {BannerListItem} from '@/pages/home/home.type';

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
  const [currentIndex, setCurrentIndex] = React.useState(0);
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
  return globalStore.isWeb ? (
    <Swiper
      pictureWidth={bannerWidth}
      seamless={true}
      paddingRight={theme.paddingSize.l}
      height={bannerHeight}
      autoPlay={true}
      hasIndicator={true}
      pictures={bannerList?.map(
        (item: {bannerImg: string; bannerVideo: string}) => ({
          uri: item.bannerImg,
          videoUri: item?.bannerVideo || '',
        }),
      )}
      itemRadius={theme.borderRadiusSize.s}
      onItemPress={_index => {
        if (type === 2) {
          Linking.openURL(bannerList[_index]?.popUrl);
          return;
        } else {
          goToUrl(bannerList[_index].skipLinks, bannerList[_index].title);
        }
      }}
      renderOverlayComponent={index => {
        const bannerItem = bannerList[index];
        return renderOverlayLinkComponent({
          item: bannerItem,
          onPress: () => {
            goToUrl(bannerItem.skipLinks, bannerItem.title);
          },
          sizeHeight: bannerHeight,
          sizeWidth: bannerWidth,
          size: bannerOverlaySize,
        });
      }}
    />
  ) : (
    <View style={[theme.position.rel]}>
      <Carousel
        loop
        style={[theme.borderRadius.m, theme.overflow.hidden]}
        width={bannerWidth}
        height={bannerHeight}
        autoPlay={true}
        autoPlayInterval={3000}
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
            style={[theme.fill.fill, {bottom: 8}]}
            onPress={() => {
              if (type === 2) {
                Linking.openURL(item?.popUrl);
                return;
              } else {
                goToUrl(item.skipLinks, item.title);
              }
            }}>
            <View
              style={[
                theme.fill.fill,
                theme.borderRadius.s,
                theme.overflow.hidden,
                theme.background.primary,
              ]}>
              <LazyImageBackground
                occupancy={theme.backgroundColor.palegrey}
                imageUrl={item.bannerImg}
                height={bannerHeight}
                width={bannerWidth}>
                {renderOverlayLinkComponent({
                  item: item,
                  onPress: () => {
                    goToUrl(item.skipLinks, item.title);
                  },
                  sizeHeight: bannerHeight,
                  sizeWidth: bannerWidth,
                  size: bannerOverlaySize,
                })}
              </LazyImageBackground>
            </View>
          </TouchableOpacity>
        )}
      />
      {!bannerList?.length && (
        <View
          style={[
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
          styles.idotBox,
        ]}>
        {bannerList.map((_v, i) => (
          <View
            key={i}
            style={[styles.idot, currentIndex === i && styles.idotActive]}
          />
        ))}
      </View>
    </View>
  );
};

export default BannerSwiper;
