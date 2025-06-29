import React, {useCallback, useEffect, useState, useRef, useMemo} from 'react';
import {ScrollView, View} from 'react-native';

import globalStore from '@/services/global.state';
import {useAsyncPageSpin} from '@/common-pages/hooks/async.hooks';
import {appBroadcast} from '@services/global.service';
import useHomeStore from '@/store/useHomeStore';
import {useShallow} from 'zustand/react/shallow';
import theme from '@/style';
import {MessagePlay} from '@basicComponents/messagePlay';
import HomeBanner from '@/pages/home/components/home-banner';
import GameList from '../components/game-list/game-list';
import GameHomeList from '../components/game-list/game-home-list';
import HomePageTagTabs from '../components/home-page-tag-tabs';
import {useSettingWindowDimensions} from '@/store/useSettingStore';

const HomeTabPageSlots = () => {
  const {} = useAsyncPageSpin();
  const scrollViewRef1 = useRef<ScrollView>(null);

  const first = useRef(true);
  const {screenHeight} = useSettingWindowDimensions();

  const homeBannerList = useHomeStore(state => state.homeBannerList);
  const memoBannerList = useMemo(() => {
    return homeBannerList;
  }, [homeBannerList]);

  const {pageTagIndex, getHomeTagList, getCategoryHomeList} = useHomeStore(
    useShallow(state => ({
      pageTagIndex: state.pageTagIndex,
      getHomeTagList: state.getHomeTagList,
      getCategoryHomeList: state.getCategoryHomeList,
    })),
  );

  const [noticeList, setNoticeList] = useState<string[]>([]);
  useEffect(() => {
    appBroadcast()
      .then(list => {
        setNoticeList(list);
      })
      .finally(() => {});
  }, []);

  const handleInit = useCallback(() => {
    first.current = false;
    const sub = globalStore.tokenSubject.subscribe(token => {
      if (token) {
        globalStore.amountCheckOut.next();
      }
    });
    return () => {
      sub.unsubscribe();
    };
  }, []);

  // useFocusEffect(handleInit);

  useEffect(() => {
    handleInit();
  }, [getCategoryHomeList, getHomeTagList, handleInit]);

  return (
    <ScrollView
      ref={scrollViewRef1}
      style={[theme.flex.flex1NoHidden]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{gap: 10}}>
      <HomeBanner bannerList={memoBannerList} />
      {noticeList && noticeList.length > 0 && (
        <MessagePlay notices={noticeList} />
      )}
      <HomePageTagTabs />
      {pageTagIndex === -1 && <GameHomeList />}
      {pageTagIndex !== -1 && (
        <View style={{height: screenHeight - 230}}>
          <GameList />
        </View>
      )}
    </ScrollView>
  );
};

export default HomeTabPageSlots;
