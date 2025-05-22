import DetailNavTitle from '@/components/business/detail-nav-title';
import theme from '@/style';
import {goBack} from '@/utils';
import React, {useCallback, useEffect, useMemo, useState, useRef} from 'react';
import {useTranslation} from 'react-i18next';

import {LazyImageLGBackground} from '@basicComponents/image';
import {postUserGameList} from './my-games.service';
import {ActivityIndicator, FlatList, RefreshControl, View} from 'react-native';
import {TabsRoundOptionItem, TabsRound} from '@/components/basic/tab';
import Text from '@/components/basic/text';
import useListPaging from '../hooks/useListPaging';
import {toGame} from '../game-navigate';
import LazyImage from '@/components/basic/image/lazy-image';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import Button from '@/components/basic/button';
import useWebScrollEvents from '../hooks/useWebScrollEvents';
import NoData from '@/components/basic/error-pages/no-data';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';

const MyGames = () => {
  const {calculateItemWidth} = useSettingWindowDimensions();
  const {i18n} = useTranslation();
  const tableRef = useRef<FlatList>(null);
  const MY_GAME_LIST_ID = 'my-games-list-id';

  const [type, setType] = useState<string | number>(0);
  const tabOptions: TabsRoundOptionItem[] = [
    {
      label: i18n.t('other.betsGames'),
      value: 0,
    },
    {
      label: i18n.t('other.collectGames'),
      value: 1,
    },
    {
      label: i18n.t('other.openGames'),
      value: 2,
    },
  ];

  const {
    refreshList,
    resultList,
    isRefresh,
    hasMoreData,
    loadMore,
    onEndReachedCalledDuringMomentum,
  } = useListPaging(
    pageNo => {
      return postUserGameList({
        pageNo: pageNo,
        pageSize: 20,
        type: type as number,
      });
    },
    {
      listId: MY_GAME_LIST_ID,
    },
  );

  const webProps = useWebScrollEvents({
    onMomentumScrollBegin: () => {
      onEndReachedCalledDuringMomentum.current = false;
    },
  });

  useEffect(() => {
    tableRef.current?.scrollToOffset({offset: 0, animated: true});
    refreshList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const keyExtractor = useCallback((item: any) => {
    return item?.gameId.toString();
  }, []);

  const onPressItem = useCallback((item: any) => {
    toGame({
      source: item?.source,
      name: item?.gameName,
      gameUrl: item?.gameUrl,
      id: item?.gameId,
      tripartiteUniqueness: item?.source,
      type: item?.type,
      provider: item?.provider,
    });
  }, []);

  const renderItem = useCallback(
    ({item}: {item: any}) => (
      <NativeTouchableOpacity
        onPress={() => {
          onPressItem(item);
        }}
        style={[
          theme.margin.lrl,
          theme.padding.lrl,
          theme.flex.row,
          theme.flex.flex,
          theme.borderRadius.xs,
          theme.flex.centerByCol,
          theme.background.mainDark,
          theme.gap.m,
          {height: calculateItemWidth(60)},
        ]}>
        <LazyImage
          imageUrl={item?.gamePic}
          width={calculateItemWidth(40)}
          height={calculateItemWidth(40)}
        />
        <View style={[theme.flex.flex1]}>
          <Text white fontSize={14}>
            {item?.gameName}
          </Text>
          <Text color={theme.fontColor.white60} fontSize={12}>
            {item?.desc}
          </Text>
        </View>
        <Button
          title={'Play Now'}
          type="linear-primary"
          size="xsmall"
          onPress={() => onPressItem(item)}
        />
      </NativeTouchableOpacity>
    ),
    [calculateItemWidth, onPressItem],
  );

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

  return (
    <LazyImageLGBackground style={[theme.fill.fill, theme.flex.col]}>
      <DetailNavTitle
        onBack={goBack}
        hideAmount
        serverRight
        title={i18n.t('me.bottom.games')}
      />
      <TabsRound
        tabOptions={tabOptions}
        value={type}
        onChange={setType}
        style={[theme.margin.lrl]}
      />
      <View style={[theme.flex.flex1, theme.margin.topl]}>
        <FlatList
          ref={tableRef}
          id={MY_GAME_LIST_ID}
          data={resultList}
          scrollEventThrottle={16}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListFooterComponent={ListFooterComponent}
          ListEmptyComponent={<NoData />}
          refreshControl={
            isRefresh ? (
              <RefreshControl
                refreshing={isRefresh}
                onRefresh={refreshList}
                colors={['red', '#ffd500', '#0080ff', '#99e600']}
              />
            ) : undefined
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.1}
          // eslint-disable-next-line react-native/no-inline-styles
          contentContainerStyle={[{gap: 10}]}
          showsVerticalScrollIndicator={false}
          horizontal={false}
          {...webProps}
        />
      </View>
    </LazyImageLGBackground>
  );
};

export default MyGames;
