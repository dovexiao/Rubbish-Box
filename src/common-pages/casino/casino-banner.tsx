import React, {useState} from 'react';
import globalStore from '@/services/global.state';
import theme from '@/style';
import Carousel from 'react-native-reanimated-carousel';
import {View, StyleSheet} from 'react-native';
import LazyImage from '@basicComponents/image';
import TouchableOpacity from '@basicComponents/touchable-opacity';
import {goTo} from '@/utils';
import {BannerInfo} from './casino.service';

const CasinoBanner = ({bannerList}: {bannerList: BannerInfo[]}) => {
  const bannerWidth = globalStore.screenWidth - theme.paddingSize.l * 2;
  const bannerHeight = (bannerWidth * 136) / 351;

  const [bannerIndex, setBannerIndex] = useState<number>(0);

  const innerStyles = StyleSheet.create({
    indicator: {
      width: bannerWidth,
    },
    indicatorIndex: {
      opacity: 0.7,
    },
    indicatorIndexSelected: {
      width: 12,
    },
  });

  const clickLink = (link: string) => {
    if (!link) {
      return;
    }
    globalStore.token
      ? goTo(
          `${link}${link.indexOf('?') === link.length - 1 ? '' : '&'}cert=${
            globalStore.token
          }`,
        )
      : goTo('Login');
  };
  // TODO 这里仅仅暂时解决了没有滑动标记问题，后续仍需要考虑能不能更好兼容web端
  return (
    <View style={[theme.position.rel]}>
      {
        <View>
          <Carousel
            loop
            width={globalStore.screenWidth}
            height={bannerHeight + theme.paddingSize.l * 2}
            autoPlay={true}
            autoPlayInterval={2000}
            scrollAnimationDuration={1000}
            pagingEnabled
            onProgressChange={(_, absoluteProgress) => {
              setBannerIndex(Math.round(absoluteProgress) % bannerList?.length);
            }}
            data={
              bannerList?.length ? bannerList : [{imgUrl: '', skipLinks: ''}]
            }
            renderItem={({item}) => (
              <TouchableOpacity
                style={[theme.fill.fill, theme.padding.l]}
                onPress={() => {
                  clickLink(item?.skipLinks);
                }}>
                <View
                  style={[
                    theme.fill.fill,
                    theme.borderRadius.m,
                    theme.overflow.hidden,
                    theme.background.lightGrey,
                  ]}>
                  {item.imgUrl && (
                    <LazyImage
                      imageUrl={item.imgUrl}
                      height={bannerHeight}
                      width={bannerWidth}
                    />
                  )}
                </View>
              </TouchableOpacity>
            )}
          />
          <View
            style={[
              styles.indicator,
              innerStyles.indicator,
              theme.flex.row,
              theme.flex.center,
            ]}>
            {bannerList.map((item, index) => (
              <View
                key={index}
                style={[
                  styles.indicatorIndex,
                  theme.borderRadius.xs,
                  index !== bannerIndex
                    ? [theme.background.white, innerStyles.indicatorIndex]
                    : [
                        theme.background.primary,
                        innerStyles.indicatorIndexSelected,
                      ],
                ]}
              />
            ))}
          </View>
        </View>
      }
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
            theme.background.grey,
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  indicator: {
    position: 'absolute',
    zIndex: 1,
    left: 0,
    bottom: theme.paddingSize.s,
    paddingVertical: theme.paddingSize.s,
  },
  indicatorIndex: {
    width: 4,
    height: 4,
    marginRight: theme.paddingSize.xxs,
  },
});

export default CasinoBanner;
