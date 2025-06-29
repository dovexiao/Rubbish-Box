import React, {useCallback, useMemo} from 'react';
import {View, Image, FlatList, ScrollView} from 'react-native';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import theme from '@/style';
import {toGame} from '@/common-pages/game-navigate';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import useHomeStore from '@/store/useHomeStore';
import Text from '@/components/basic/text';
import {LiveGameListItem, PageGameSectionListItem} from '../../home.type';
import LazyImage from '@/components/basic/image/lazy-image';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs'; // ✅ 引入 TabBar 高度 hook

const groupGames = (
  arr: LiveGameListItem[],
  groupSize: number,
): LiveGameListItem[][] => {
  return arr.reduce(
    (acc: LiveGameListItem[][], curr: LiveGameListItem, index: number) => {
      const groupIndex = Math.floor(index / groupSize);
      if (!acc[groupIndex]) {
        acc[groupIndex] = [];
      }
      acc[groupIndex].push(curr);
      return acc;
    },
    [],
  );
};

const GameHomeList = () => {
  const {screenWidth, screenHeight} = useSettingWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight(); // ✅ 获取底部导航高度

  const {categoryHomeList, changeTagIndex} = useHomeStore(state => ({
    categoryHomeList: state.categoryHomeList,
    changeTagIndex: state.setState,
  }));

  const memoCategoryList = useMemo(() => {
    return categoryHomeList?.filter(item => item?.gameList.length > 0) || [];
  }, [categoryHomeList]);

  const gameCardWidth = (screenWidth - 10 - 24) / 3;
  const gameCardHeight = (gameCardWidth / 200) * 220;

  const onPressSectionHeader = useCallback(
    (item: PageGameSectionListItem) => {
      changeTagIndex({pageTagIndex: item?.tagId});
    },
    [changeTagIndex],
  );

  // const keyExtractor = useCallback(item => item?.tagId.toString(), []);

  const renderGameListItem = useCallback(
    (gameList: LiveGameListItem[], index: number) => (
      <View style={[theme.flex.col, theme.gap.m]} key={`${index}Item`}>
        {gameList?.map(item => (
          <NativeTouchableOpacity
            key={item?.id}
            onPress={() => {
              toGame(item);
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
        ))}
      </View>
    ),
    [gameCardHeight, gameCardWidth],
  );

  const renderFlatListItem = useCallback(
    ({item}: {item: PageGameSectionListItem}) => (
      <>
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
              SEE ALL
            </Text>
            <Image
              source={require('@assets/icons/right-purple.webp')}
              style={[theme.icon.s]}
            />
          </NativeTouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[theme.gap.m]}
          style={[
            theme.fill.fillW,
            {height: gameCardHeight}, // 一行显示
          ]}>
          {groupGames(item?.gameList, 1)?.map(renderGameListItem)}
        </ScrollView>
      </>
    ),
    [gameCardHeight, onPressSectionHeader, renderGameListItem],
  );

  return (
    <View style={[theme.flex.flex1, theme.padding.lrl]}>
      <FlatList
        data={memoCategoryList}
        renderItem={renderFlatListItem}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: tabBarHeight,
        }}
        onScroll={e => {
          useHomeStore.setState({
            isShowCategoryTab: e.nativeEvent.contentOffset.y < screenHeight,
          });
        }}
      />
    </View>
  );
};

export default GameHomeList;
