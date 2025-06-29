import React, {useEffect, useRef} from 'react';
import {ScrollView, View, Animated} from 'react-native';
import theme from '@style';
import {debounce} from '@/utils';
import HomeTabListContent from '../home-list-tab-content';
import {NativeSyntheticEvent, NativeScrollEvent} from 'react-native';
import useHomeStore from '@/store/useHomeStore';
import {useShallow} from 'zustand/react/shallow';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

interface HomeTabPagePopularProps {
  onPress?: (position: number) => void;
}

const HomeTabPagePopularOld: React.FC<HomeTabPagePopularProps> = props => {
  const {} = props;
  const {screenHeight} = useSettingWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight(); // ✅ 获取 tab 高度

  const {lotteryPageData} = useHomeStore(
    useShallow(state => ({
      lotteryPageData: state.lotteryPageData,
      getLotteryPageData: state.getLotteryPageData,
    })),
  );

  const scrollViewRef = useRef<ScrollView>(null);
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const measures = useRef<number[]>([]);
  const topHeight = useRef(0);

  const handleScrollTo = debounce((e: {value: number}) => {
    handleScroll(e);
  }, 60);

  useEffect(() => {
    scrollAnim.addListener(e => {
      handleScrollTo(e);
    });
    return () => {
      scrollAnim.removeAllListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (e: {value: number}) => {
    const {value: y} = e;
    const totalTop = topHeight.current + 1;
    if (!totalTop) {
      return;
    }

    if (y >= totalTop + getToTopHeight(5)) {
      // setActiveTab(5);
    } else if (y >= totalTop + getToTopHeight(4)) {
      // setActiveTab(4);
    } else if (y >= totalTop + getToTopHeight(3)) {
      // setActiveTab(3);
    } else if (y >= totalTop + getToTopHeight(2)) {
      // setActiveTab(2);
    } else if (y >= totalTop + getToTopHeight(1)) {
      // setActiveTab(1);
    } else {
      // setActiveTab(0);
    }
  };

  const getToTopHeight = (index: number) => {
    return measures.current
      .slice(0, index)
      .reduce((accumulator, currentValue) => accumulator + currentValue, 0);
  };

  return (
    <View style={[theme.flex.flex1]}>
      <AnimatedScrollView
        ref={scrollViewRef}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: tabBarHeight + 16, // ✅ 给底部加 padding 避免被遮挡
        }}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollAnim}}}],
          {
            useNativeDriver: true,
            listener: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
              useHomeStore.setState({
                isShowCategoryTab:
                  event.nativeEvent.contentOffset.y < screenHeight,
              });
            },
          },
        )}
        style={[theme.flex.flex1NoHidden]}
        stickyHeaderIndices={[2]}>
        <HomeTabListContent
          diceList={lotteryPageData?.diceList}
          colorList={lotteryPageData?.colorList}
          digitList={lotteryPageData?.digitList}
          // stateList={lotteryPageData?.stateList}
          keralaList={lotteryPageData?.keralaList}
          onMeasure={(index: number, anchor: number) => {
            measures.current[index] = anchor;
            measures.current = [...measures.current];
          }}
        />
      </AnimatedScrollView>
    </View>
  );
};

export default HomeTabPagePopularOld;
