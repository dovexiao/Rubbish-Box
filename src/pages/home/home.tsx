/* eslint-disable prettier/prettier */
import React, {useCallback, useEffect, useState} from 'react';
import theme from '@style';
import globalStore from '@services/global.state';
import HomeHeader from './components/home-header';
import Download from './components/download';
import HomeService from './components/home-service';
import HomeRegister from './components/home-register';
import {useFocusEffect} from '@react-navigation/native';
import {LazyImageLGBackground} from '@/components/basic/image';
import useHomeStore from '@/store/useHomeStore';
import {useToken} from '@/store/useUserStore';
import {useShallow} from 'zustand/react/shallow';
import useNotificationStore from '@/store/useNotificationStore';
import HomeCategoryPageTabs from '@/pages/home/components/home-category-page-tabs';
// import HomeTabPageLobby from '@/pages/home/pages/tab-page-lobby';
// import HomeTabPageLottery from '@/pages/home/pages/tab-page-lottery';
import HomeTabPageGame from '@/pages/home/pages/tab-page-game';
import HomeTabPageSlots from '@/pages/home/pages/tab-page-slots';
import HomeTabPageLive from '@/pages/home/pages/tab-page-live';
import HomeTabPagePopularOld from '@/pages/home/pages/tab-page-popular-old';

const Home = () => {
  const {isLogin} = useToken();
  const {getHomeBannerList, oneCategoryPageIndex} = useHomeStore(
    useShallow(state => ({
      oneCategoryPageIndex: state.oneCategoryPageIndex,
      getHomeBannerList: state.getHomeBannerList,
      pageTagList: state.pageTagList,

    })),
  );
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
      {/*{oneCategoryPageIndex === 0 && <HomeTabPageLobby />}*/}
      {/*{oneCategoryPageIndex === 1 && <HomeTabPageLottery />}*/}
      {oneCategoryPageIndex === 10 && <HomeTabPagePopularOld />}
      {oneCategoryPageIndex === 2 && <HomeTabPageGame />}
      {oneCategoryPageIndex === 4 && <HomeTabPageSlots />}
      {oneCategoryPageIndex === 3 && <HomeTabPageLive />}
      <HomeRegister />
      <HomeService />
    </LazyImageLGBackground>
  );
};

export default Home;
