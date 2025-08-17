import React, {useEffect} from 'react';
// import {ScrollView, View, Animated, Image} from 'react-native';
import {ScrollView, View, Animated} from 'react-native';
import theme from '@style';
import {debounce} from '@utils';
// import Tabs from '../components/tab/tab';
import HomeGameTabListContent from './home-game-list-content';
import useHomeStore from '@/store/useHomeStore';
import {useShallow} from 'zustand/react/shallow';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
interface HomeTabPagePopularProps {
  onPress?: (position: number) => void;
}

const HomeGameList: React.FC<HomeTabPagePopularProps> = props => {
  // const {screenWidth} = useSettingWindowDimensions();
  const {} = props;
  const {screenHeight} = useSettingWindowDimensions();
  const {lotteryPageData} = useHomeStore(
    useShallow(state => ({
      lotteryPageData: state.lotteryPageData,
      getLotteryPageData: state.getLotteryPageData,
    })),
  );

  // const [activeTab, setActiveTab] = React.useState(0);
  const topHeight = React.useRef(0);

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

  const scrollViewRef = React.useRef<ScrollView>(null);
  const scrollAnim = React.useRef(new Animated.Value(0)).current;
  const measures = React.useRef<number[]>([]);

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

  // const scrollToCurrentGame = (index: number) => {
  //   // const tabHeight = 48;
  //   const totalTop = topHeight.current;
  //   setActiveTab(index);
  //   // onPress?.(getToTopHeight(index) + totalTop + 2);
  //   scrollViewRef.current?.scrollTo({
  //     x: 0,
  //     y: getToTopHeight(index) + totalTop + 2,
  //     animated: true,
  //   });
  // };
  return (
    <View style={[theme.flex.flex1]}>
      {/*{<Tabs activeTab={activeTab} scrollToCurrentGame={scrollToCurrentGame} />}*/}
      <AnimatedScrollView
        ref={scrollViewRef}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event<{contentOffset: {y: number}}>(
          [
            {
              nativeEvent: {
                contentOffset: {
                  y: scrollAnim,
                },
              },
            },
          ],
          {
            useNativeDriver: true,
            listener: event => {
              useHomeStore.setState({
                isShowCategoryTab:
                  event?.nativeEvent?.contentOffset?.y < screenHeight,
              });
            },
          },
        )}
        style={[theme.flex.flex1NoHidden]}
        stickyHeaderIndices={[1]}>
        <HomeGameTabListContent
          // diceList={lotteryPageData?.diceList}
          // colorList={lotteryPageData?.colorList}
          // digitList={lotteryPageData?.digitList}
          quickDigitList={lotteryPageData?.quickDigitList}
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

export default HomeGameList;
