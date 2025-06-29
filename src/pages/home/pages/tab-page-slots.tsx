import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {ScrollView, View} from 'react-native';

import globalStore from '@/services/global.state';
import {useAsyncPageSpin} from '@/common-pages/hooks/async.hooks';

import useHomeStore from '@/store/useHomeStore';
import {useShallow} from 'zustand/react/shallow';
import theme from '@/style';
import GameList from '../components/game-list/game-list';
import GameHomeList from '../components/game-list/game-home-list';
import HomePageTagTabs from '../components/home-page-tag-tabs';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import HomeBanner from '@/pages/home/components/home-banner';
import {MessagePlay} from '@basicComponents/messagePlay';
import {appBroadcast} from '@services/global.service';

const HomeTabPageSlots = () => {
  const {} = useAsyncPageSpin();
  const first = useRef(true);
  const {screenHeight} = useSettingWindowDimensions();

  const {pageTagIndex, getHomeTagList, getCategoryHomeList} = useHomeStore(
    useShallow(state => ({
      pageTagIndex: state.pageTagIndex,
      getHomeTagList: state.getHomeTagList,
      getCategoryHomeList: state.getCategoryHomeList,
    })),
  );
  const homeBannerList = useHomeStore(state => state.homeBannerList);
  const [noticeList, setNoticeList] = useState<string[]>([]);
  useEffect(() => {
    appBroadcast()
      .then(list => {
        setNoticeList(list);
      })
      .finally(() => {});
  }, []);
  const memoBannerList = useMemo(() => {
    return homeBannerList;
  }, [homeBannerList]);
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
    <ScrollView style={[theme.flex.flex1]}>
      <HomeBanner bannerList={memoBannerList} />
      {noticeList && <MessagePlay notices={noticeList} />}
      <HomePageTagTabs />

      {/* 注意：这里不要再有 ScrollView/FlatList */}
      {pageTagIndex === -1 && (
        <GameHomeList /> // 确保它内部不是可滚动组件
      )}
      {pageTagIndex !== -1 && (
        <View style={{minHeight: screenHeight - 230}}>
          <GameList />
        </View>
      )}
    </ScrollView>
  );
};

export default HomeTabPageSlots;
