import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';

import globalStore from '@/services/global.state';
import {useAsyncPageSpin} from '@/common-pages/hooks/async.hooks';

import useHomeStore from '@/store/useHomeStore';
import {useShallow} from 'zustand/react/shallow';
import theme from '@/style';
import GameList from '../components/game-list/game-list';
import GameHomeList from '../components/game-list/game-home-list';
import HomePageTagTabs from '../components/home-page-tag-tabs';

const HomeTabPageCasino = () => {
  const {} = useAsyncPageSpin();
  const first = useRef(true);

  const {pageTagIndex, getHomeTagList} = useHomeStore(
    useShallow(state => ({
      pageTagIndex: state.pageTagIndex,
      getHomeTagList: state.getHomeTagList,
    })),
  );

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
  }, [getHomeTagList, handleInit]);

  return (
    <View style={[theme.flex.flex1]}>
      <HomePageTagTabs />
      {pageTagIndex === -1 && <GameHomeList />}
      {pageTagIndex !== -1 && <GameList />}
    </View>
  );
};

export default HomeTabPageCasino;
