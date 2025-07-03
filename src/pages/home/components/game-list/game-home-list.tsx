import React, {useCallback, useMemo, useState} from 'react';
import {FlatList, View, Image, ActivityIndicator} from 'react-native';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import theme from '@/style';
import {toGame} from '@/common-pages/game-navigate';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import useHomeStore from '@/store/useHomeStore';
import Text from '@/components/basic/text';
import LazyImage from '@/components/basic/image/lazy-image';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {LiveGameListItem, PageGameSectionListItem} from '../../home.type';

const PAGE_SIZE = 30;

const GameHomeList = () => {
  const {screenWidth} = useSettingWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();

  const {categoryHomeList, setState: changeTagIndex} = useHomeStore();

  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const memoCategoryList = useMemo(
    () => categoryHomeList?.filter(item => item?.gameList.length > 0) || [],
    [categoryHomeList],
  );

  const flatListData = useMemo(() => {
    return memoCategoryList.slice(0, page * PAGE_SIZE);
  }, [memoCategoryList, page]);

  const gameCardGap = 12;
  const gameCardWidth = useMemo(() => {
    return (screenWidth - 24 - gameCardGap * 2) / 3;
  }, [screenWidth]);

  const gameCardHeight = (gameCardWidth / 200) * 220;

  const onPressSectionHeader = useCallback(
    (item: PageGameSectionListItem) => {
      changeTagIndex({pageTagIndex: item?.tagId});
    },
    [changeTagIndex],
  );

  const renderGameListGrid = (gameList: LiveGameListItem[]) => (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
      }}>
      {gameList.map((item, index) => {
        const isLastInRow = (index + 1) % 3 === 0;
        return (
          <NativeTouchableOpacity
            key={item?.id}
            onPress={() => toGame(item)}
            style={{
              width: gameCardWidth,
              marginBottom: gameCardGap,
              marginRight: isLastInRow ? 0 : gameCardGap,
            }}>
            <View style={[theme.borderRadius.m]}>
              <LazyImage
                imageUrl={item?.gamePic || ''}
                width={gameCardWidth}
                height={gameCardHeight}
                radius={theme.borderRadiusSize.m}
              />
            </View>
          </NativeTouchableOpacity>
        );
      })}
    </View>
  );

  const renderItem = ({item}: {item: PageGameSectionListItem}) => (
    <View key={item.tagId} style={{marginBottom: 20}}>
      <View
        style={[
          theme.flex.row,
          theme.flex.centerByCol,
          theme.flex.between,
          {height: 40},
        ]}>
        <Text white fontSize={18}>
          {item?.tagName}
        </Text>
        <NativeTouchableOpacity
          style={[theme.flex.row, theme.flex.centerByCol]}
          onPress={() => onPressSectionHeader(item)}>
          <Text fontSize={14} color={theme.fontColor.primaryMain}>
            More
          </Text>
          <Image
            source={require('@assets/icons/right-purple.webp')}
            style={[theme.icon.s, {marginLeft: 4}]}
          />
        </NativeTouchableOpacity>
      </View>
      <View style={{marginTop: 12}}>{renderGameListGrid(item?.gameList)}</View>
    </View>
  );

  const handleLoadMore = () => {
    if (!loadingMore && flatListData.length < memoCategoryList.length) {
      setLoadingMore(true);
      setTimeout(() => {
        setPage(prev => prev + 1);
        setLoadingMore(false);
      }, 300); // 模拟异步加载，正式环境换成真实请求
    }
  };

  const renderFooter = () => {
    if (!loadingMore) {
      return null;
    }
    return (
      <View style={{paddingVertical: 16}}>
        <ActivityIndicator color={theme.fontColor.primaryMain} />
      </View>
    );
  };

  return (
    <FlatList
      data={flatListData}
      keyExtractor={(item, index) => `${item.tagId}-${index}`}
      renderItem={renderItem}
      contentContainerStyle={{
        paddingHorizontal: 12,
        paddingBottom: tabBarHeight + 32,
      }}
      showsVerticalScrollIndicator={false}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.3}
      ListFooterComponent={renderFooter}
    />
  );
};

export default GameHomeList;
