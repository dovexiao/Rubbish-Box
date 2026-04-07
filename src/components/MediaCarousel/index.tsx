import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { View, Text, Image, ScrollView, Dimensions } from 'react-native';
import Video from 'react-native-video';
import AppIcon from '@/components/AppIcon';
import styles from './styles';

const DEFAULT_BG = 'https://g.18qjz.cn/img/boklock/default_ad_bg.png';

interface MediaCarouselProps {
  itemList: string[];
}

export default function MediaCarousel({ itemList }: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const carouselRef = useRef<ScrollView>(null);

  const screenWidth = Dimensions.get('window').width;
  const carouselWidth = screenWidth - 32;
  const carouselHeight = 170;

  const renderList = useMemo(() => {
    if (itemList.length <= 1) return itemList;
    return [itemList[itemList.length - 1], ...itemList, itemList[0]];
  }, [itemList]);

  useEffect(() => {
    if (itemList.length > 1) {
      if (currentIndex >= itemList.length) {
        setCurrentIndex(0);
        setTimeout(() => {
          carouselRef.current?.scrollTo({ x: carouselWidth, animated: false });
        }, 10);
      }
    } else if (itemList.length > 0) {
      if (currentIndex >= itemList.length) {
        setCurrentIndex(0);
        setTimeout(() => {
          carouselRef.current?.scrollTo({ x: 0, animated: false });
        }, 10);
      }
    }
  }, [itemList.length, currentIndex, carouselWidth]);

  // Initial layout align
  useEffect(() => {
    if (itemList.length > 1 && currentIndex === 0) {
      setTimeout(() => {
        carouselRef.current?.scrollTo({ x: carouselWidth, animated: false });
      }, 50);
    }
  }, [itemList.length, carouselWidth]);

  // Autoplay
  useEffect(() => {
    if (itemList.length <= 1 || isDragging) return;
    const item = itemList[currentIndex];
    const isVideo = item?.endsWith?.('.mp4');

    let timer: ReturnType<typeof setTimeout>;
    let jumpTimer: ReturnType<typeof setTimeout>;

    if (!isVideo) {
      timer = setTimeout(() => {
        const nextRenderIndex = currentIndex + 2;
        carouselRef.current?.scrollTo({
          x: nextRenderIndex * carouselWidth,
          animated: true,
        });

        let newCurrentIndex = currentIndex + 1;
        if (newCurrentIndex >= itemList.length) {
          newCurrentIndex = 0;
          jumpTimer = setTimeout(() => {
            // jump silently to real first
            carouselRef.current?.scrollTo({
              x: carouselWidth,
              animated: false,
            });
          }, 350); // wait for animated scroll
        }
        setCurrentIndex(newCurrentIndex);
      }, 2000);
    }

    return () => {
      if (timer) clearTimeout(timer);
      if (jumpTimer) clearTimeout(jumpTimer);
    };
  }, [currentIndex, itemList, carouselWidth, isDragging]);

  const handleVideoEnd = useCallback(() => {
    if (itemList.length <= 1) return;
    const nextRenderIndex = currentIndex + 2;
    carouselRef.current?.scrollTo({
      x: nextRenderIndex * carouselWidth,
      animated: true,
    });

    let newCurrentIndex = currentIndex + 1;
    if (newCurrentIndex >= itemList.length) {
      newCurrentIndex = 0;
      setTimeout(() => {
        carouselRef.current?.scrollTo({ x: carouselWidth, animated: false });
      }, 350);
    }
    setCurrentIndex(newCurrentIndex);
  }, [currentIndex, itemList, carouselWidth]);

  const handleMomentumScrollEnd = useCallback(
    (e: any) => {
      setIsDragging(false);
      if (itemList.length <= 1) return;

      const offsetX = e.nativeEvent.contentOffset.x;
      let index = Math.round(offsetX / carouselWidth);

      if (index === 0) {
        // swipe left to fake last -> jump silently to real last
        index = itemList.length;
        carouselRef.current?.scrollTo({
          x: index * carouselWidth,
          animated: false,
        });
      } else if (index === itemList.length + 1) {
        // swipe right to fake first -> jump silently to real first
        index = 1;
        carouselRef.current?.scrollTo({
          x: index * carouselWidth,
          animated: false,
        });
      }

      setCurrentIndex(index - 1);
    },
    [carouselWidth, itemList.length],
  );

  if (itemList.length === 0) return null;

  return (
    <>
      <ScrollView
        ref={carouselRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScrollBeginDrag={() => setIsDragging(true)}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentOffset={
          itemList.length > 1 ? { x: carouselWidth, y: 0 } : undefined
        }
        style={[
          styles.swiperBox,
          { width: carouselWidth, height: carouselHeight },
        ]}
      >
        {renderList.map((item, renderIndex) => {
          const isFocused =
            itemList.length <= 1
              ? renderIndex === 0
              : renderIndex === currentIndex + 1;

          return (
            <View
              key={renderIndex}
              style={[
                styles.swiperItem,
                { width: carouselWidth, height: carouselHeight },
              ]}
            >
              {item?.endsWith?.('.mp4') ? (
                isFocused ? (
                  <Video
                    source={{ uri: item }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                    repeat={false}
                    paused={false}
                    onEnd={handleVideoEnd}
                  />
                ) : (
                  <View style={styles.videoPlaceholder}>
                    <AppIcon name="play" size={40} color="#fff" />
                    <Text style={{ color: '#fff', marginTop: 8 }}>视频</Text>
                  </View>
                )
              ) : /\.(png|jpe?g|webp|gif)$/i.test(item) ? (
                <Image
                  source={{ uri: item }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                />
              ) : (
                <>
                  <Image
                    source={{ uri: DEFAULT_BG }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                  <View style={styles.bannerTextBox}>
                    <Text style={styles.adText}>{item}</Text>
                  </View>
                </>
              )}
            </View>
          );
        })}
      </ScrollView>
      {itemList.length > 1 && (
        <View style={styles.dotWrap}>
          {itemList.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    currentIndex === index ? '#333333' : 'rgba(0,0,0,0.2)',
                },
              ]}
            />
          ))}
        </View>
      )}
    </>
  );
}
