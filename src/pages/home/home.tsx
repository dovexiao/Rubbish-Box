/* eslint-disable prettier/prettier */
import React, {useCallback, useEffect, useState} from 'react';
import theme from '@style';
import globalStore from '@services/global.state';
import HomeHeader from './components/home-header';
import Download from './components/download';
import HomeService from './components/home-service';
// import HomeRegister from './components/home-register';
import {useFocusEffect} from '@react-navigation/native';
import {LazyImageLGBackground} from '@/components/basic/image';
import useHomeStore from '@/store/useHomeStore';
import {useToken} from '@/store/useUserStore';
import {useShallow} from 'zustand/react/shallow';
import {BasicObject} from '@types';
import useNotificationStore from '@/store/useNotificationStore';
import HomeCategoryPageTabs from '@/pages/home/components/home-category-page-tabs';
import HomeTabPageGame from '@/pages/home/pages/tab-page-game';
import HomeTabPageLive from '@/pages/home/pages/tab-page-live';
import HomeTabPageSlots from '@/pages/home/pages/tab-page-slots';
import HomeTabPagePopularOld from '@/pages/home/pages/tab-page-popular-old';
import { useLuckySpinModal } from '@/common-pages/luckyspin/luckyspin.hooks';
import { useLuckySpinActions } from '@/store/luckySpinStore';
import { getNoticeCheck } from "@/pages/home/home.service";

const Home = () => {

  const {isLogin} = useToken();
  const {getHomeBannerList, oneCategoryPageIndex} = useHomeStore(
    useShallow(state => ({
      oneCategoryPageIndex: state.oneCategoryPageIndex,
      getHomeBannerList: state.getHomeBannerList,
    })),
  );

  const [freeCount] = useState(0);
  const [spinBatchCount] = useState(30);
  const [spinBasePrice] = useState(10);
  const {setSpinConfig} = useLuckySpinActions();
  const {renderModal: renderSpin, show: spinShow} = useLuckySpinModal({
    onNotice: () => {
      doNotice(globalStore.token);
      // onRefreshSpinConfig();
      if (globalStore.token) {
        setSpinConfig(true);
      }
    },
    batchCount: spinBatchCount,
    singleAmount: spinBasePrice,
    freeCount,
  });

  const [_noticeMap, setNoticeMap] = useState<BasicObject>({
    FREE_LOTTERY: 0,
    REBATE: 0,
    LUCKY_SPIN: 0,
  });

  const doNotice = useCallback((token: string | null) => {
    if (token) {
      getNoticeCheck().then(noticeList => {
        const newNoticeMap: BasicObject = {
          FREE_LOTTERY: 0,
          REBATE: 0,
          LUCKY_SPIN: 0,
        };
        for (const item of noticeList) {
          if (item.noticeKey in newNoticeMap) {
            newNoticeMap[item.noticeKey] = item.noticeCount;
          }
        }
        setNoticeMap(newNoticeMap);
      });
    } else {
      setNoticeMap({FREE_LOTTERY: 0, REBATE: 0, LUCKY_SPIN: 0});
    }
  }, []);

  const {getNoticeMap, getUnReadCount} = useNotificationStore(
    useShallow(state => ({
      getNoticeMap: state.getNoticeMap,
      getUnReadCount: state.getUnReadCount,
    })),
  );
  const [_unreadCount, _setUnreadCount] = useState(0);

  const handleFocusEffect = useCallback(() => {
    const sub = globalStore.tokenSubject.subscribe(token => {
      globalStore.amountCheckOut.next();
      if (token) {
        getUnReadCount();
      }
    });
    return () => {
      sub.unsubscribe();
    };
  }, [getUnReadCount]);
  useFocusEffect(handleFocusEffect);
  useEffect(() => {
    if (isLogin) {
      getNoticeMap();
    } else {
    }
    getHomeBannerList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLogin]);

  return (
    <LazyImageLGBackground
      showBottomBG={false}
      subtractBottomTabHeight={true}
      style={[theme.fill.fill, theme.position.rel]}>
      <HomeHeader />
      {globalStore.isWeb && !globalStore.viewType ? <Download /> : null}
      <HomeCategoryPageTabs />
      {/*{oneCategoryPageIndex === 0 && <HomeTabPagePopular/>}*/}
      {oneCategoryPageIndex === 1 && <HomeTabPageSlots />}
      {oneCategoryPageIndex === 10 && <HomeTabPagePopularOld />}
      {oneCategoryPageIndex === 3 && <HomeTabPageLive />}
      {oneCategoryPageIndex === 2 && <HomeTabPageGame />}
      {/*<HomeRegister />*/}
      <HomeService spinShow={spinShow} />
      {renderSpin}
    </LazyImageLGBackground>
  );
};

export default Home;
