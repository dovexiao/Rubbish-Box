import React, {useCallback, useMemo} from 'react';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {View, Image, FlatList, ScrollView} from 'react-native';
import theme from '@/style';
import {toGame} from '@/common-pages/game-navigate';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import useHomeStore from '@/store/useHomeStore';
import Text from '@/components/basic/text';
import {LiveGameListItem, PageGameSectionListItem} from '../../home.type';
import LazyImage from '@/components/basic/image/lazy-image';

const groupGames = (
  arr: LiveGameListItem[],
  groupSize: number,
): LiveGameListItem[][] => {
  return arr.reduce(
    (acc: LiveGameListItem[][], curr: LiveGameListItem, index: number) => {
      const groupIndex = Math.floor(index / groupSize);
      if (!acc[groupIndex]) {
        acc[groupIndex] = []; // Initialize group if it doesn't exist
      }
      acc[groupIndex].push(curr); // Add current item to the current group
      return acc;
    },
    [],
  );
};

const GameHomeList = () => {
  const {screenWidth, screenHeight} = useSettingWindowDimensions();

  const {categoryHomeList, changeTagIndex} = useHomeStore(state => ({
    categoryHomeList: state.categoryHomeList,
    changeTagIndex: state.setState,
  }));

  const memoCategoryList = useMemo(() => {
    return (
      categoryHomeList?.filter(
        (item: PageGameSectionListItem) => item?.gameList.length > 0,
      ) || []
    );
  }, [categoryHomeList]);

  const gameCardWidth = (screenWidth - 10 - 24) / 3;
  const gameCardHeight = (gameCardWidth / 200) * 220;

  const onPressSectionHeader = useCallback(
    (item: PageGameSectionListItem) => {
      changeTagIndex({pageTagIndex: item?.tagId});
    },
    [changeTagIndex],
  );

  const keyExtractor = useCallback((item: any) => {
    return item?.tagId.toString();
  }, []);

  const renderGameListItem = useCallback(
    (gameList: LiveGameListItem[], index: number) => {
      return (
        <View style={[theme.flex.col, theme.gap.m]} key={`${index}Item`}>
          {gameList?.map((item: LiveGameListItem) => {
            return (
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
            );
          })}
        </View>
      );
    },
    [gameCardHeight, gameCardWidth],
  );

  const renderFlatListItem = useCallback(
    ({item}: {item: any}) => {
      return (
        <>
          <View
            style={[
              theme.flex.row,
              theme.flex.centerByCol,
              theme.flex.between,
              // eslint-disable-next-line react-native/no-inline-styles
              {height: 40},
            ]}>
            <Text white blod fontSize={18}>
              {item?.tagName}
            </Text>
            <NativeTouchableOpacity
              style={[theme.flex.row, theme.flex.centerByCol]}
              onPress={() => {
                onPressSectionHeader(item);
              }}>
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

              //一组两列显示
              // {height: gameCardHeight * 2 + 10},
              //一组一列显示
              {height: gameCardHeight},
            ]}>
            {groupGames(item?.gameList, 1)?.map(
              (gameItem: LiveGameListItem[], index: number) => {
                return renderGameListItem(gameItem, index);
              },
            )}
          </ScrollView>
        </>
      );
    },
    [gameCardHeight, onPressSectionHeader, renderGameListItem],
  );

  return (
    <View style={[theme.flex.flex1, theme.padding.lrl]}>
      <FlatList
        data={memoCategoryList}
        renderItem={renderFlatListItem}
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
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
