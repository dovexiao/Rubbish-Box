import useHomeStore from '@/store/useHomeStore';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import theme from '@/style';
import React, {useCallback, useEffect} from 'react';
import {useShallow} from 'zustand/react/shallow';
import HomeTabPageHome from '../pages/tab-page-home';
import HomeLottery from '../pages/tab-page-lottery';
import HomeCasino from '../pages/tab-page-casino';
import i18n from '@i18n';

const HomeCategoryPageTabs = () => {
  const {TabView, TabBar, SceneMap} = require('react-native-tab-view');
  const {screenWidth} = useSettingWindowDimensions();
  const {
    isShowCategoryTab,
    oneCategoryPageIndex,
    changeIndex,

    getLotteryPageData,
    getHomeTagList,
  } = useHomeStore(
    useShallow(state => ({
      isShowCategoryTab: state.isShowCategoryTab,
      oneCategoryPageIndex: state.oneCategoryPageIndex,
      changeIndex: state.setState,
      getLotteryPageData: state.getLotteryPageData,
      getHomeTagList: state.getHomeTagList,
    })),
  );

  //其实应该传id后续看需要修改不
  const onPressItem = useCallback(
    (index: number) => {
      // 需要更改oneCategoryPageIndex和pageTagIndex两个值
      //每次切换oneCategoryPageIndex需要把pageTagIndex重置
      changeIndex({
        oneCategoryPageIndex: index,
        pageTagIndex: -1,
      });
    },
    [changeIndex],
  );

  const renderScene = SceneMap({
    Home: HomeTabPageHome,
    Lottery: HomeLottery,
    Casino: HomeCasino,
  });

  const [routes] = React.useState([
    {key: 'Home', title: i18n.t('headers.home')},
    {key: 'Lottery', title: i18n.t('headers.lottery')},
    {key: 'Casino', title: i18n.t('headers.casino')},
    {key: 'Live', title: i18n.t('headers.live')},
  ]);

  useEffect(() => {
    useHomeStore.setState({isShowCategoryTab: true});
  }, []);

  useEffect(() => {
    useHomeStore.setState({pageTagIndex: -1});
    if (oneCategoryPageIndex === 1) {
      getLotteryPageData();
    }
    if (oneCategoryPageIndex === 2 || oneCategoryPageIndex === 3) {
      getHomeTagList();
    }
  }, [getHomeTagList, getLotteryPageData, oneCategoryPageIndex]);

  return (
    <TabView
      lazy={({route}: any) => route.title === 'Casino'}
      renderTabBar={(props: any) => (
        <TabBar
          {...props}
          style={[
            theme.borderRadius.m,
            theme.background.primary15,
            // eslint-disable-next-line react-native/no-inline-styles
            {
              height: isShowCategoryTab ? 48 : 0,
              overflow: 'hidden',
              width: screenWidth,
            },
          ]}
          indicatorStyle={{
            backgroundColor: theme.basicColor.primary,
          }}
        />
      )}
      navigationState={{index: oneCategoryPageIndex, routes}}
      renderScene={renderScene}
      onIndexChange={(index: number) => {
        onPressItem(index);
      }}
      swipeEnabled={false}
      initialLayout={{width: screenWidth}}
    />
  );
};

export default HomeCategoryPageTabs;
