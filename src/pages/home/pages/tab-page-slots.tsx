import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';

import globalStore from '@/services/global.state';
import {useAsyncPageSpin} from '@/common-pages/hooks/async.hooks';

import useHomeStore from '@/store/useHomeStore';
import {useShallow} from 'zustand/react/shallow';
import theme from '@/style';
import GameList from '../components/game-list/game-list';
// import GameHomeList from '../components/game-list/game-home-list';
import HomePageTagTabs from '../components/home-page-tag-tabs';
import GameHomeList from '../components/game-list/game-home-list';
// import GameHomeList from '../components/game-list/game-home-list';
// import GameHomeList from '@/pages/home/components/game-list/game-home-list';
import {useSettingWindowDimensions} from '@/store/useSettingStore';

const HomeTabPageSlots = () => {
  const {screenHeight} = useSettingWindowDimensions();
  const {} = useAsyncPageSpin();
  const first = useRef(true);

  const {pageTagIndex} = useHomeStore(
    useShallow(state => ({
      pageTagIndex: state.pageTagIndex,
      setTagIndex: state.setState,
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

  useEffect(() => {
    handleInit();
  }, [handleInit]);

  return (
    <View style={[theme.flex.flex1]}>
      <HomePageTagTabs />
      {pageTagIndex === -1 && <GameHomeList />}
      {pageTagIndex !== -1 && (
        <View style={{height: screenHeight - 230}}>
          {/* 设置高度 */}
          <GameList />
        </View>
      )}
    </View>
  );
};

export default HomeTabPageSlots;
