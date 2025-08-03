import React, {useCallback, useEffect, useState, useRef, useMemo} from 'react';
import {RefreshControl, View, ScrollView, Animated} from 'react-native';
import theme from '@style';
import {getBannerList, getDigitList, getKeralaList} from './home.service';
import globalStore from '@services/global.state';
import HomeHeader from './components/home-header';
import Download from './components/download';
import HomeBanner from './components/home-banner';
import {BannerListItem, DigitListItem, KeralaListItem} from './home.type';
import HomeGameList from './components/home-game-list';
import {setDataForSettled, debounce} from '@/utils';
import HomeService from './components/home-service';
import {NoMoreData} from '@basicComponents/default-page';
import Spin from '@basicComponents/spin';
import HomeTabListContent from './home-list-tab-content';
import LinearGradient from '@/components/basic/linear-gradient';
import {useLuckySpinActions} from '@/store/luckySpinStore';
import {useLuckySpinModal} from '@/common-pages/luckyspin/luckyspin.hooks';
import HomeFish from './components/home-fish';
import HomeLive from './components/home-live';
import HomeCasino from './components/home-casino';
import HomeGameTop from '@/pages/home/home-game-top';

const Home = () => {
  const basePx = globalStore.screenWidth / 375;
  const [selectedGame, setSelectedGame] = useState<number>(1);
  const [refreshing, setRefreshing] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [bannerList, setbannerList] = useState<BannerListItem[]>([]);
  const [keralaList, setKeralaList] = useState<KeralaListItem[]>([]);
  const [digitList, setDigitList] = useState<DigitListItem[]>([]);
  const [showTabs, setShowTabs] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const measures = useRef<number[]>([]);
  const topHeight = useRef(0);

  const getGame2List = useCallback(() => {
    setPageLoading(true);
    Promise.allSettled([getKeralaList(), getDigitList()])
      .then(([kerala, digit]) => {
        setDataForSettled(setKeralaList, kerala);
        setDataForSettled(setDigitList, digit);
      })
      .finally(() => {
        setPageLoading(false);
        setRefreshing(false);
      });
  }, []);

  const handleScroll = useCallback(({value}: {value: number}) => {
    const y = value;
    const totalTop = topHeight.current;
    setShowTabs(y >= totalTop);
  }, []);

  const debouncedHandleScroll = useMemo(
    () => debounce(handleScroll, 60),
    [handleScroll],
  );

  useEffect(() => {
    getBannerList(2).then(setbannerList);
    const listenerId = scrollAnim.addListener(debouncedHandleScroll);
    return () => {
      scrollAnim.removeListener(listenerId);
    };
  }, [scrollAnim, debouncedHandleScroll]);

  useEffect(() => {
    if (selectedGame === 2 && digitList.length === 0) {
      getGame2List();
    }
  }, [selectedGame, digitList.length, getGame2List]);

  // Lucky Spin
  const [freeCount] = useState(0);
  const [spinBatchCount] = useState(30);
  const [spinBasePrice] = useState(10);
  const {setSpinConfig} = useLuckySpinActions();
  const {renderModal: renderSpin, show: spinShow} = useLuckySpinModal({
    onNotice: () => {
      // onRefreshSpinConfig();
      if (globalStore.token) {
        setSpinConfig(true);
      }
    },
    batchCount: spinBatchCount,
    singleAmount: spinBasePrice,
    freeCount,
  });

  // const onRefreshSpinConfig = () => {
  //   if (globalStore.token) {
  //     postSpinConfig(true).then(data => {
  //       setFreeCount(data?.myFree || 0);
  //     });
  //   }
  // };

  // useEffect(() => {
  //   const sub = globalStore.tokenSubject.subscribe(token => {
  //     postSpinConfig(!!token).then(data => {
  //       setSpinBasePrice(data?.singleAmount);
  //       setSpinBatchCount(data?.batchCount);
  //       setFreeCount(data?.myFree || 0);
  //     });
  //   });
  //   return () => sub.unsubscribe();
  // }, []);
  return (
    <LinearGradient
      colors={theme.linearGradientColor.mainNavigationLinearGradientBtnColor}
      style={[theme.flex.col, theme.fill.fill]}>
      <Spin loading={pageLoading} style={[theme.flex.col, theme.fill.fill]}>
        <View style={[theme.fill.fill, theme.flex.col]}>
          <HomeHeader />
          {globalStore.isWeb && !globalStore.viewType && <Download />}
          <Animated.ScrollView
            ref={scrollViewRef}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            onScroll={Animated.event(
              [{nativeEvent: {contentOffset: {y: scrollAnim}}}],
              {useNativeDriver: true},
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  selectedGame === 2
                    ? getGame2List()
                    : getBannerList(2)
                        .then(setbannerList)
                        .finally(() => setRefreshing(false));
                }}
              />
            }>
            <View
              onLayout={e => {
                topHeight.current = e.nativeEvent.layout.height;
              }}>
              <HomeBanner bannerList={bannerList} />
              <HomeGameList setSelectedGame={setSelectedGame} />
              {selectedGame === 2 && <HomeGameTop />}
            </View>
            {selectedGame === 2 && showTabs ? (
              <View
                style={{
                  height: basePx * 72 + 20,
                  marginTop: -1,
                  marginBottom: 2,
                }}
              />
            ) : (
              <View style={{height: 0}} />
            )}

            {selectedGame === 1 && <HomeCasino />}
            {selectedGame === 2 && (
              <HomeTabListContent
                digitList={digitList}
                keralaList={keralaList}
                onMeasure={(index, anchor) => {
                  measures.current[index] = anchor;
                  measures.current = [...measures.current];
                }}
              />
            )}
            {selectedGame === 3 && <HomeLive />}
            {selectedGame === 4 && <HomeFish />}
            <NoMoreData text="" />
          </Animated.ScrollView>
          <HomeService spinShow={spinShow} />
          {renderSpin}
        </View>
      </Spin>
    </LinearGradient>
  );
};

export default Home;
