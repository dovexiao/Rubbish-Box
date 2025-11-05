/* eslint-disable prettier/prettier */
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
  LayoutChangeEvent,
  ViewStyle,
  StyleProp,
} from 'react-native';
import LazyImage from '@basicComponents/image';
import theme from '@style';
import {designToDp} from '@components/utils/adaptive';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import {BasicObject} from '@/types';
const {background, borderRadius, flex, paddingSize} = theme;

interface SwiperProps {
  delay?: number;
  seamless?: boolean;
  autoPlay?: boolean;
  pictureWidth?: number;
  paddingRight?: number;
  height?: number;
  pictures: BasicObject[]; //临时使用，看看是不是修改，默认是传入uri和videoUri
  model?: string;
  hasIndicator?: boolean;
  scrollViewWidth?: number;
  itemRadius?: number;
  onItemPress?: (index: number) => void;
  renderOverlayComponent?: (index: number) => React.ReactNode;
}

function getSwiperList(items: BasicObject[]) {
  if (!items || items?.length === 0) {
    return [{uri: '', videoUri: ''}];
  }
  if (items.length === 1) {
    return items;
  }
  let swiperList = Array(...items).concat(...Array(...items));
  return swiperList;
}

const ANIMATE_TIME = 800;

export const renderOverlayLinkComponent = ({
  item,
  sizeWidth,
  sizeHeight,
}: // size = 'big',
{
  item: any;
  onPress: () => void;
  sizeWidth: number;
  sizeHeight: number;
  size?: 'small' | 'big';
}) => {
  let position: StyleProp<ViewStyle> = {
    alignItems: 'center',
  };
  if (item?.bannerPosition === 1) {
    position = {
      alignItems: 'center',
      justifyContent: 'flex-end',
    };
  } else if (item?.bannerPosition === 2) {
    position = {
      alignItems: 'flex-start',
    };
  } else if (item?.bannerPosition === 3) {
    position = {
      alignItems: 'flex-end',
    };
  }
  return (
    <View
      style={[
        position,
        theme.padding.lrxxl,
        // eslint-disable-next-line react-native/no-inline-styles
        {width: sizeWidth, height: sizeHeight, paddingVertical: 20},
      ]}></View>
  );
};

const AbsolutePositioning = (props: {
  apWidth: number;
  apHeight: number;
  children: React.ReactNode;
}): React.ReactElement => {
  return (
    <View
      style={[
        theme.position.abs,
        // eslint-disable-next-line react-native/no-inline-styles,
        {
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          width: props?.apWidth,
          height: props?.apHeight,
        },
      ]}>
      {props?.children}
    </View>
  );
};

const Swiper: React.FC<SwiperProps> = props => {
  let {
    autoPlay = false,
    seamless = false,
    pictures,
    pictureWidth = 351,
    paddingRight = 0,
    delay = 3000,
    height = 150,
    scrollViewWidth = 0,
    hasIndicator = false,
    itemRadius = theme.borderRadiusSize.m,
    onItemPress,
    renderOverlayComponent,
  } = props;
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  // 当前的第几个轮播图
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  // 取得溢出的全图片
  const overPictures = seamless ? getSwiperList(pictures) : pictures;
  // 取得单个图片样子的宽度
  const itemWidth = pictureWidth + paddingRight;
  const [scrolling, setScrolling] = useState<boolean>(false);
  const scrollView = useRef<ScrollView>(null);
  const playTimer = useRef<NodeJS.Timeout | null>(null);
  const playing = useRef<boolean>(false);
  // const touching = useRef<boolean>(false);
  const scrollX = useRef<number>(0);
  const scrollTimer = useRef<NodeJS.Timeout | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  const scrollToIndex = useCallback(
    (index: number) => {
      const scrollOffset = index * itemWidth;
      scrollView.current?.scrollTo({x: scrollOffset, animated: false});
      scrollX.current = scrollOffset;
    },
    [itemWidth],
  );

  const handlePlayEnd = useCallback(
    (toIndex: number) => {
      if (playing.current) {
        playing.current = false;
        scrollToIndex(toIndex);
      }
    },
    [scrollToIndex],
  );

  const scrollToIndexAnimated = useCallback(
    (index: number) => {
      const scrollOffset = index * itemWidth;
      scrollView.current?.scrollTo({x: scrollOffset, animated: true});
      playing.current = true;
      if (seamless) {
        setTimeout(() => {
          handlePlayEnd(index % (pictures.length || 1));
        }, ANIMATE_TIME);
      }
    },
    [handlePlayEnd, itemWidth, pictures.length, seamless],
  );

  const playingCurrentSwiper = useCallback(() => {
    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex % (pictures.length || 1));
    scrollToIndexAnimated(
      seamless ? nextIndex : nextIndex % (pictures.length || 1),
    );
  }, [currentIndex, pictures.length, scrollToIndexAnimated, seamless]);

  const playSwiper = useCallback(() => {
    if (playTimer.current) {
      clearTimeout(playTimer.current);
      playTimer.current = null;
    }
    playTimer.current = setTimeout(() => {
      if (!scrolling && autoPlay) {
        playingCurrentSwiper();
        playSwiper();
      }
    }, delay);
  }, [autoPlay, delay, playingCurrentSwiper, scrolling]);

  const handleLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    setContainerWidth(width);
  };

  useEffect(() => {
    if (overPictures.length <= 1) {
      return;
    }
    playSwiper();
    return () => {
      if (playTimer.current) {
        clearTimeout(playTimer.current);
        playTimer.current = null;
      }
      if (scrollTimer.current) {
        clearTimeout(scrollTimer.current);
        scrollTimer.current = null;
      }
    };
  }, [overPictures.length, playSwiper]);
  const handleScrolling = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (overPictures.length <= 1) {
      return;
    }
    scrollX.current = e.nativeEvent.contentOffset.x;
    refreshIndex();
  };
  const handleBeginDrag = () => {
    if (overPictures.length <= 1) {
      return;
    }
    if (playTimer.current) {
      clearTimeout(playTimer.current);
      playTimer.current = null;
    }
    if (scrollTimer.current) {
      clearTimeout(scrollTimer.current);
      scrollTimer.current = null;
    }
    setScrolling(true);
  };

  const refreshIndex = () => {
    const x = scrollX.current;
    let nowIndex = Math.round(x / itemWidth);
    const _currentIndex = nowIndex % (pictures.length || 1);
    setCurrentIndex(_currentIndex);
    return _currentIndex;
  };

  const handleEndDrag = () => {
    if (overPictures.length <= 1) {
      return;
    }

    setTimeout(() => {
      const index = refreshIndex();
      scrollToIndex(index);
    }, ANIMATE_TIME);
    // scrollToIndexAnimated(nowIndex);

    setScrolling(false);
  };

  const innerStyles = StyleSheet.create({
    indicator: {
      width: containerWidth,
    },
    swiperItemView: {
      paddingHorizontal: paddingRight,
    },
    swiperItem: {
      width: pictureWidth,
      height: height,
    },
    indicatorIndex: {
      opacity: 0.7,
    },
    indicatorIndexSelected: {
      width: designToDp(12),
    },
  });

  const {screenWidth} = useSettingWindowDimensions();

  return (
    <View style={[styles.swiper]} onLayout={handleLayout}>
      <ScrollView
        style={{
          width: scrollViewWidth || screenWidth - 24,
          height: height,
          borderRadius: itemRadius,
          overflow: 'hidden',
        }}
        horizontal={true}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        bounces={false}
        overScrollMode={'never'}
        //控制视图能否被拖动
        scrollEnabled={true}
        ref={scrollView}
        pagingEnabled={true}
        // onMomentumScrollEnd={handlePlayEnd}
        onScroll={handleScrolling}
        onTouchStart={handleBeginDrag}
        onTouchEnd={handleEndDrag}>
        {overPictures.map((item, index) => {
          return (
            <TouchableOpacity
              key={index}
              activeOpacity={1}
              style={[
                theme.position.rel,
                styles.swiperItem,
                {
                  width: pictureWidth,
                  height: height,
                },
              ]}
              onPress={() => {
                onItemPress && onItemPress(index % pictures.length);
              }}>
              {!isVideoLoaded || !item?.videoUri ? (
                <AbsolutePositioning apHeight={height} apWidth={pictureWidth}>
                  <LazyImage
                    width={pictureWidth}
                    height={height}
                    radius={itemRadius}
                    imageUrl={typeof item === 'number' ? item : item.uri || ''}
                  />
                </AbsolutePositioning>
              ) : null}
              {item?.videoUri ? (
                <video
                  width={pictureWidth}
                  height={height}
                  autoPlay
                  playsInline
                  muted
                  loop
                  onLoadedData={() => {
                    setIsVideoLoaded(true);
                  }}
                  src={item?.videoUri}>
                  Your browser does not support the video tag.
                </video>
              ) : null}
              <AbsolutePositioning apHeight={height} apWidth={pictureWidth}>
                {renderOverlayComponent &&
                  renderOverlayComponent(index % pictures.length)}
              </AbsolutePositioning>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {hasIndicator && (
        <View
          style={[
            styles.indicator,
            innerStyles.indicator,
            flex.row,
            flex.center,
          ]}>
          {pictures.map((item, index) => (
            <View
              key={index}
              style={[
                styles.indicatorIndex,
                borderRadius.xs,
                index !== currentIndex
                  ? [background.white, innerStyles.indicatorIndex]
                  : [background.primary, innerStyles.indicatorIndexSelected],
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  swiper: {
    position: 'relative',
  },
  swiperItem: {
    overflow: 'hidden',
    borderRadius: 5,
  },
  indicator: {
    position: 'absolute',
    zIndex: 1,
    left: 0,
    bottom: 4,
    // bottom: paddingSize.s,
    paddingVertical: paddingSize.xxs,
  },
  indicatorIndex: {
    width: 4,
    height: 4,
    marginRight: paddingSize.xxs,
  },
});

/** @deprecated */
export default Swiper;
