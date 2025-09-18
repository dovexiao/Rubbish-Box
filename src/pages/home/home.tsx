import React, {useCallback, useEffect, useState, useRef, useMemo} from 'react';
import {
  RefreshControl,
  View,
  ScrollView,
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import theme from '@style';
import {getBannerList, getKeralaList} from './home.service';
import globalStore from '@services/global.state';
import HomeHeader from './components/home-header';
import Download from './components/download';
import HomeBanner from './components/home-banner';
import {
  BannerListItem,
  DigitListItem,
  KeralaListItem,
  CasinoGameItem,
  CasinoTypeItem,
} from './home.type';
import HomeGameList from './components/home-game-list';
import {setDataForSettled, debounce} from '@/utils';
import HomeService from './components/home-service';
import {NoMoreData} from '@basicComponents/default-page';
import Spin from '@basicComponents/spin';
import HomeTabListContent from './home-list-tab-content';
import {useLuckySpinActions} from '@/store/luckySpinStore';
import {useLuckySpinModal} from '@/common-pages/luckyspin/luckyspin.hooks';
import HomeFish from './components/home-fish';
import HomeLive from './components/home-live';
import HomeCasino from './components/home-casino';
import HomeGameTop from '@/pages/home/home-game-top';
import {LazyImageLGBackground} from '@basicComponents/image';
import {postSpinConfig} from '@/common-pages/luckyspin/luckyspin.service';
import {getFirstRechargeV1} from '@/pages/home/home.service';
import {useFocusEffect} from '@react-navigation/native';

import {getCasinoList, getCasinoType} from './home.service';

const Home = () => {
  // const basePx = globalStore.screenWidth / 375;
  const [selectedGame, setSelectedGame] = useState<number>(1);
  const [refreshing, setRefreshing] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [bannerList, setbannerList] = useState<BannerListItem[]>([]);
  const [keralaList, setKeralaList] = useState<KeralaListItem[]>([]);
  const [digitList] = useState<DigitListItem[]>([]);
  // const [showTabs, setShowTabs] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);
  const scrollAnim = useRef(new Animated.Value(0)).current;
  const measures = useRef<number[]>([]);
  const topHeight = useRef(0);

  const getGame2List = useCallback(() => {
    setPageLoading(true);
    Promise.allSettled([getKeralaList()])
      .then(([kerala]) => {
        setDataForSettled(setKeralaList, kerala);
        // setDataForSettled(setDigitList, digit);
      })
      .finally(() => {
        setPageLoading(false);
        setRefreshing(false);
      });
  }, []);

  const handleScroll = useCallback(({}: {value: number}) => {
    // console.log(value);
    // const y = value;
    // const totalTop = topHeight.current;
    // setShowTabs(y >= totalTop);
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
  const [freeCount, setFreeCount] = useState(0);
  const [spinBatchCount] = useState(30);
  const [spinBasePrice] = useState(10);
  const {setSpinConfig} = useLuckySpinActions();
  const {renderModal: renderSpin, show: spinShow} = useLuckySpinModal({
    onNotice: () => {
      if (globalStore.token) {
        setSpinConfig(true);
      }
    },
    batchCount: spinBatchCount,
    singleAmount: spinBasePrice,
    freeCount,
  });
  const showModal = () => {
    onRefreshSpinConfig();
    spinShow();
  };
  const onRefreshSpinConfig = () => {
    if (globalStore.token) {
      postSpinConfig(true).then(data => {
        setFreeCount(data || 0);
      });
    }
  };
  const [firstShow, setFirstShow] = useState(0);
  const [dynamicUrl, setDynamicUrl] = useState('');
  const [login, setLogin] = useState(false);
  const getRecharge = async () => {
    const data = await getFirstRechargeV1();
    setFirstShow(data?.isRecharge || 0);
    setDynamicUrl(data?.rechargeImg || '');
  };
  const onFocusEffect = useCallback(() => {
    const sub = globalStore.tokenSubject.subscribe(token => {
      setLogin(!!token);
      if (token) {
        getRecharge();
      }
    });
    const msgSub = globalStore.notificationSubject.subscribe(_countInfo => {});
    return () => {
      sub.unsubscribe();
      msgSub.unsubscribe();
    };
  }, []);
  useFocusEffect(onFocusEffect);

  const [casinoTabs, setCasinoTabs] = useState<CasinoTypeItem[]>([]);
  const [selectedCasinoTab, setSelectedCasinoTab] = useState<string>('');
  const [casinoData, setCasinoData] = useState<CasinoGameItem[]>([]);
  const [casinoLoading, setCasinoLoading] = useState(true);
  const [casinoPageNo, setCasinoPageNo] = useState(1);
  const [casinoHasMore, setCasinoHasMore] = useState(true);
  const [casinoLoadingMore, setCasinoLoadingMore] = useState(false);
  // 获取 Casino Tab 列表
  const fetchCasinoTabs = useCallback(async () => {
    try {
      const res = await getCasinoType();
      if (res && Array.isArray(res)) {
        const filteredTabs = res.filter(item => item.name !== 'Live');
        setCasinoTabs(filteredTabs);
        if (filteredTabs.length > 0) {
          setSelectedCasinoTab(filteredTabs[0].name);
        }
      }
    } catch (error) {
      console.error('Error fetching casino tabs', error);
    }
  }, []);
  // 获取 Casino 数据
  const fetchCasinoData = useCallback(
    async (page: number, isLoadMore = false) => {
      if (isLoadMore) {
        setCasinoLoadingMore(true);
      } else {
        setCasinoLoading(true);
      }

      try {
        const params = {
          pageNo: page,
          gameType: selectedCasinoTab,
          pageSize: 24,
        };
        const res = await getCasinoList(params);

        if (res?.content && Array.isArray(res.content)) {
          setCasinoData(prev =>
            isLoadMore ? [...prev, ...res.content] : res.content,
          );
          setCasinoHasMore(res.totalSize > 51 * page);
        } else {
          setCasinoHasMore(false);
        }
      } catch (error) {
        console.error('Error fetching casino list', error);
        setCasinoHasMore(false);
      } finally {
        setCasinoLoading(false);
        if (isLoadMore) {
          setCasinoLoadingMore(false);
        }
      }
    },
    [selectedCasinoTab],
  );
  // 加载更多 Casino 数据
  const handleCasinoLoadMore = useCallback(() => {
    if (casinoHasMore && !casinoLoadingMore && selectedGame === 1) {
      const nextPage = casinoPageNo + 1;
      setCasinoPageNo(nextPage);
      fetchCasinoData(nextPage, true);
    }
  }, [
    casinoHasMore,
    casinoLoadingMore,
    casinoPageNo,
    fetchCasinoData,
    selectedGame,
  ]);

  // 监听主滚动事件，处理加载更多
  const handleMainScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;

      // 如果是 casino 页面且滚动到底部
      if (selectedGame === 1) {
        const paddingToBottom = 100;
        const isNearBottom =
          contentOffset.y + layoutMeasurement.height >=
          contentSize.height - paddingToBottom;

        if (isNearBottom && casinoHasMore && !casinoLoadingMore) {
          handleCasinoLoadMore();
        }
      }
    },
    [selectedGame, casinoHasMore, casinoLoadingMore, handleCasinoLoadMore],
  );
  // 初始化 Casino Tabs
  useEffect(() => {
    fetchCasinoTabs();
  }, [fetchCasinoTabs]);

  // 切换 Casino Tab 时重新加载数据
  useEffect(() => {
    if (selectedCasinoTab && selectedGame === 1) {
      setCasinoPageNo(1);
      setCasinoData([]);
      setCasinoHasMore(true);
      fetchCasinoData(1, false);
    }
  }, [selectedCasinoTab, selectedGame, fetchCasinoData]);
  return (
    <LazyImageLGBackground style={[theme.flex.col, theme.fill.fill]}>
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
              {useNativeDriver: true, listener: handleMainScroll},
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
            {/* {selectedGame === 2 && showTabs ? (
              <View
                style={{
                  height: basePx * 72 + 20,
                  marginTop: -1,
                  marginBottom: 2,
                }}
              />
            ) : (
              <View style={{height: 0}} />
            )} */}

            {selectedGame === 1 && (
              <HomeCasino
                tabs={casinoTabs}
                selectedTab={selectedCasinoTab}
                onTabChange={setSelectedCasinoTab}
                data={casinoData}
                loading={casinoLoading}
                loadingMore={casinoLoadingMore}
                hasMore={casinoHasMore}
              />
            )}
            {selectedGame === 2 && (
              <HomeTabListContent
                // digitList={digitList}
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
          <View style={{position: 'absolute', bottom: 60, left: 0, right: 0}}>
            <HomeService
              isLogin={login}
              firstShow={firstShow}
              dynamicUrl={dynamicUrl}
              spinShow={showModal}
            />
            {renderSpin}
          </View>
        </View>
      </Spin>
    </LazyImageLGBackground>
  );
};

export default Home;
