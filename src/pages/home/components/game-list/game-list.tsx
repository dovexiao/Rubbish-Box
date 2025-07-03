/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {useCallback, useEffect, useRef, useMemo} from 'react';
import Card from '@/components/basic/card';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {View, ActivityIndicator, FlatList, RefreshControl} from 'react-native';
import theme from '@/style';
import {toGame} from '@/common-pages/game-navigate';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import usePaginatedList from './usePaginatedList';
import useHomeStore from '@/store/useHomeStore';
import Text from '@/components/basic/text';
import {useShallow} from 'zustand/react/shallow';
import SubTagTabs from '../tab/sub-tag-tabs';
import {PageTagItem} from '../../home.type';
import CountDown from '../count-down';

const GameList = () => {
  const {screenWidth, screenHeight} = useSettingWindowDimensions();
  const {
    hasMoreData,
    HOME_GAME_LIST_ID,
    isRefresh,
    gameList,
    refreshList,
    loadMore,
    onEndReachedCalledDuringMomentum,
  } = usePaginatedList();

  const {pageTagIndex, pageTagList, pageSubTagId} = useHomeStore(
    useShallow(state => ({
      pageTagIndex: state.pageTagIndex,
      pageTagList: state.pageTagList,
      pageSubTagId: state.pageSubTagId,
    })),
  );

  const tableRef = useRef<FlatList>(null);

  const gameCardGap = 10;
  const gameCardWidth = useMemo(() => {
    return (screenWidth - 24 - gameCardGap * 2) / 3;
  }, [screenWidth]);

  const gameCardHeight = (gameCardWidth / 200) * 220;

  useEffect(() => {
    tableRef.current?.scrollToOffset({offset: 0, animated: true});
  }, [pageTagIndex]);

  const keyExtractor = useCallback((item: any) => {
    return item?.id.toString();
  }, []);

  const renderItem = useCallback(
    ({item, index}: {item: any; index: number}) => {
      const isLastInRow = (index + 1) % 3 === 0;
      return (
        <NativeTouchableOpacity onPress={() => toGame(item)}>
          <View
            style={{
              width: gameCardWidth,
              height: gameCardHeight + 20,
              marginRight: isLastInRow ? 0 : gameCardGap,
              marginBottom: gameCardGap,
            }}>
            <Card radius={theme.borderRadiusSize.m}>
              <Card.Image
                imageUrl={item?.gamePic}
                width={gameCardWidth}
                height={gameCardHeight}
              />
              <Text
                numberOfLines={1}
                fontSize={10}
                color={theme.fontColor.white}
                style={[
                  theme.font.center,
                  theme.fill.fillW,
                  {
                    position: 'absolute',
                    bottom: 2,
                    textAlign: 'center',
                  },
                ]}>
                {item?.gameType === 'pick3' ? (
                  <CountDown
                    remain={
                      item.drawTime ? Math.round(item.drawTime / 1000) : 0
                    }
                  />
                ) : null}
              </Text>
            </Card>
            <Text
              numberOfLines={1}
              fontSize={12}
              color={theme.fontColor.white}
              style={[theme.font.center, theme.margin.topxxs]}>
              {item?.name}
            </Text>
          </View>
        </NativeTouchableOpacity>
      );
    },
    [gameCardWidth, gameCardHeight],
  );

  const onPressSubTagItem = useCallback((id: number) => {
    useHomeStore.setState({pageSubTagId: id});
  }, []);

  const ListHeaderComponent = useMemo(() => {
    const findSubTagList = pageTagList?.find(
      item => item?.id === pageTagIndex,
    )?.subTagList;
    if (findSubTagList?.length === 0) {
      return <View style={{height: 0}} />;
    }
    return (
      <SubTagTabs
        tabOptions={findSubTagList as PageTagItem[]}
        activeTab={pageSubTagId}
        onPressItem={onPressSubTagItem}
      />
    );
  }, [pageTagList, pageSubTagId, onPressSubTagItem, pageTagIndex]);

  const ListFooterComponent = useMemo(() => {
    if (hasMoreData) {
      return (
        <View style={[theme.flex.center, theme.padding.m]}>
          <ActivityIndicator />
        </View>
      );
    }
    return (
      <View style={[theme.flex.center, theme.padding.m]}>
        <Text style={[theme.font.white]}>Load complete</Text>
      </View>
    );
  }, [hasMoreData]);

  // 修复刷新后未重置触底标志的问题
  useEffect(() => {
    if (!isRefresh) {
      onEndReachedCalledDuringMomentum.current = false;
    }
  }, [isRefresh, onEndReachedCalledDuringMomentum]);

  // 如果列表数据加载后不满一屏，主动触发加载更多
  useEffect(() => {
    if (gameList.length > 0 && hasMoreData && gameList.length <= 6) {
      setTimeout(() => {
        loadMore();
      }, 300);
    }
  }, [gameList, hasMoreData, loadMore]);

  return (
    <View style={[theme.flex.flex1]}>
      <FlatList
        id={HOME_GAME_LIST_ID}
        ref={tableRef}
        data={gameList}
        scrollEventThrottle={16}
        onScroll={e => {
          useHomeStore.setState({
            isShowCategoryTab: e.nativeEvent.contentOffset.y < screenHeight,
          });
        }}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        refreshControl={
          <RefreshControl
            refreshing={isRefresh}
            onRefresh={refreshList}
            colors={['red', '#ffd500', '#0080ff', '#99e600']}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3} // 增大临界值
        numColumns={3}
        columnWrapperStyle={[
          theme.padding.lrl,
          {
            justifyContent: 'flex-start',
          },
        ]}
        showsVerticalScrollIndicator={false}
        onMomentumScrollBegin={() => {
          onEndReachedCalledDuringMomentum.current = false;
        }}
      />
    </View>
  );
};

export default GameList;
