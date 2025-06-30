import React, {useCallback, useMemo} from 'react';
import {View, Image, ScrollView} from 'react-native';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import theme from '@/style';
import {toGame} from '@/common-pages/game-navigate';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import useHomeStore from '@/store/useHomeStore';
import Text from '@/components/basic/text';
import {LiveGameListItem, PageGameSectionListItem} from '../../home.type';
import LazyImage from '@/components/basic/image/lazy-image';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';

const GameHomeList = () => {
  const {screenWidth} = useSettingWindowDimensions();
  const tabBarHeight = useBottomTabBarHeight();

  const {categoryHomeList, changeTagIndex} = useHomeStore(state => ({
    categoryHomeList: state.categoryHomeList,
    changeTagIndex: state.setState,
  }));

  const memoCategoryList = useMemo(() => {
    return categoryHomeList?.filter(item => item?.gameList.length > 0) || [];
  }, [categoryHomeList]);

  const gameCardWidth = (screenWidth - 24 - 12 * 2) / 3; // 3 列布局 + 2 个 gap
  const gameCardHeight = (gameCardWidth / 200) * 220;

  const onPressSectionHeader = useCallback(
    (item: PageGameSectionListItem) => {
      changeTagIndex({pageTagIndex: item?.tagId});
    },
    [changeTagIndex],
  );

  const renderGameListGrid = useCallback(
    (gameList: LiveGameListItem[]) => (
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 12,
        }}>
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
    [gameCardWidth, gameCardHeight],
  );

  return (
    <ScrollView
      style={[theme.flex.flex1, theme.padding.lrl]}
      contentContainerStyle={{
        paddingBottom: tabBarHeight + 16,
      }}
      showsVerticalScrollIndicator={false}>
      {memoCategoryList.map(item => (
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
                SEE ALL
              </Text>
              <Image
                source={require('@assets/icons/right-purple.webp')}
                style={[theme.icon.s]}
              />
            </NativeTouchableOpacity>
          </View>
          <View style={{marginTop: 12}}>
            {renderGameListGrid(item?.gameList)}
          </View>
        </View>
      ))}
    </ScrollView>
  );
};

export default GameHomeList;
