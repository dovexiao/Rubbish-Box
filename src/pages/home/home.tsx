/* eslint-disable prettier/prettier */
import React, {useCallback, useEffect} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import theme from '@style';
import globalStore from '@services/global.state';
import HomeHeader from './components/home-header';
import Download from './components/download';
import HomeService from './components/home-service';
import {LazyImageLGBackground} from '@/components/basic/image';
import useHomeStore from '@/store/useHomeStore';
import {useToken} from '@/store/useUserStore';
import {useShallow} from 'zustand/react/shallow';
import useNotificationStore from '@/store/useNotificationStore';
import HomeCategoryPageTabs from '@/pages/home/components/home-category-page-tabs';
import HomeTabPageGame from '@/pages/home/pages/tab-page-game';
import HomeTabPageLive from '@/pages/home/pages/tab-page-live';
import HomeTabPageSlots from '@/pages/home/pages/tab-page-slots';
import HomeTabPagePopularOld from '@/pages/home/pages/tab-page-popular-old';
import {useLuckySpinModal} from '@/common-pages/luckyspin/luckyspin.hooks';
import {useLuckySpinActions} from '@/store/luckySpinStore';
import {getNoticeCheck} from '@/pages/home/home.service';

const Home = () => {
  const {isLogin} = useToken();
  const {getHomeBannerList, oneCategoryPageIndex} = useHomeStore(
    useShallow(state => ({
      oneCategoryPageIndex: state.oneCategoryPageIndex,
      getHomeBannerList: state.getHomeBannerList,
    }))
  );

  const {setSpinConfig} = useLuckySpinActions();

  // 🎯 LuckySpin 配置
  const LUCKY_SPIN_CONFIG = {
    freeCount: 0,
    spinBatchCount: 30,
    spinBasePrice: 10,
  };

  const {renderModal: renderSpin, show: spinShow} = useLuckySpinModal({
    onNotice: () => {
      if (globalStore.token) {
        doNotice(globalStore.token);
        setSpinConfig(true);
      }
    },
    batchCount: LUCKY_SPIN_CONFIG.spinBatchCount,
    singleAmount: LUCKY_SPIN_CONFIG.spinBasePrice,
    freeCount: LUCKY_SPIN_CONFIG.freeCount,
  });

  const {getNoticeMap, getUnReadCount} = useNotificationStore(
    useShallow(state => ({
      getNoticeMap: state.getNoticeMap,
      getUnReadCount: state.getUnReadCount,
    }))
  );

  // 📢 拉取公告提示
  const doNotice = useCallback(async (token: string | null) => {
    if (!token) return;
    try {
      const noticeList = await getNoticeCheck();
      const mapped: Record<string, number> = {
        FREE_LOTTERY: 0,
        REBATE: 0,
        LUCKY_SPIN: 0,
      };
      for (const item of noticeList) {
        if (mapped.hasOwnProperty(item.noticeKey)) {
          mapped[item.noticeKey] = item.noticeCount;
        }
      }
      // 若你希望后续使用，可以 useState 保存 mapped
    } catch (err) {
      console.error('公告检查失败', err);
    }
  }, []);

  // 🎯 页面聚焦时监听 token 变化
  useFocusEffect(
    useCallback(() => {
      const sub = globalStore.tokenSubject.subscribe(token => {
        if (token) {
          globalStore.amountCheckOut.next();
          getUnReadCount();
        }
      });
      return () => sub.unsubscribe();
    }, [getUnReadCount])
  );

  // 🎯 页面挂载时加载轮播图 + 公告提示
  useEffect(() => {
    getHomeBannerList();
    if (isLogin) {
      getNoticeMap();
    }
  }, [isLogin, getHomeBannerList, getNoticeMap]);

  return (
    <LazyImageLGBackground
      showBottomBG={false}
      subtractBottomTabHeight
      style={[theme.fill.fill, theme.position.rel]}
    >
      <HomeHeader />
      {globalStore.isWeb && !globalStore.viewType && <Download />}
      <HomeCategoryPageTabs />

      {oneCategoryPageIndex === 1 && <HomeTabPageSlots />}
      {oneCategoryPageIndex === 10 && <HomeTabPagePopularOld />}
      {oneCategoryPageIndex === 3 && <HomeTabPageLive />}
      {oneCategoryPageIndex === 2 && <HomeTabPageGame />}

      <HomeService spinShow={spinShow} />
      {renderSpin}
    </LazyImageLGBackground>
  );
};

export default Home;
