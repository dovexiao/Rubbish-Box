import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  // BannerInfo,
  NewGamePageInfo,
  postBannerInfo,
  postNewGameList,
  postNotifications,
} from './casino.service';
import theme from '@style';
import LazyImage, {LazyImageLGBackground} from '@basicComponents/image';
import Text from '@basicComponents/text';
import Card from '@basicComponents/card';
import {NoMoreData} from '@basicComponents/default-page';
import DetailNavTitle from '@businessComponents/detail-nav-title';
import globalStore from '@/services/global.state';
// import {setDataForSettled} from '@/utils';
// import {useFocusEffect} from '@react-navigation/native';
import {useFlatListAutoPlay} from '../hooks/autoplay.hooks';
// import CasinoBanner from './casino-banner';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import {useAsyncPageSpin} from '../hooks/async.hooks';
import {usePaging} from '../hooks/paging.hooks';
import {BasicObject, NavigatorScreenProps} from '@/types';
import {toGame} from '../game-navigate';
import {useTranslation} from 'react-i18next';
import {goBack} from '@/utils';
const messageIcon = require('./assets/message.webp');
// const gameIcon = require('./assets/game.webp');

const Casino = (props: NavigatorScreenProps) => {
  const {route} = props;
  const {i18n} = useTranslation();
  const categoryId = (route.params as BasicObject)?.categoryId || '5';
  // const [bannerList, setBannerList] = useState<BannerInfo[]>([]);
  const [messageList, setMessageList] = useState<string[]>([]);
  const [messageCycle, setMessageCycle] = useState<number>(1);
  const {renderSpin, doAsyncAction} = useAsyncPageSpin();
  const first = useRef(true);

  const {
    resultList: gameList,
    init,
    onScroll,
    isEnd,
    // refreshNextPage,
  } = usePaging(pageNo => {
    return doAsyncAction(() => {
      return postNewGameList({
        pageNo,
        categoryId,
      });
    }) as Promise<NewGamePageInfo>;
  });

  const getList = useCallback(() => {
    return Promise.allSettled([init(), postNotifications(), postBannerInfo()])
      .then(([, notify]) => {
        if (notify.status === 'fulfilled' && notify.value) {
          setMessageList([...notify.value, notify.value[0]]);
          setMessageCycle(notify.value.length);
        }
        // setDataForSettled(setBannerList, banners);
      })
      .finally(() => {
        setRefreshing(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleInit = useCallback(() => {
    doAsyncAction(getList, first.current);
    first.current = false;
    const sub = globalStore.tokenSubject.subscribe(token => {
      if (token) {
        globalStore.amountCheckOut.next();
      }
    });
    return () => {
      sub.unsubscribe();
    };
  }, [doAsyncAction, getList]);

  // useFocusEffect(handleInit);

  useEffect(() => {
    handleInit();
  }, [handleInit]);

  const gameCardWidth =
    (globalStore.screenWidth - 4 * theme.paddingSize.l - theme.paddingSize.s) /
    2;

  const {flatListRef: messageRef} = useFlatListAutoPlay(messageList, {
    canPlay: true,
    overListLength: 1,
    timeout: 3000,
    row: false,
    cycle: messageCycle,
    size: theme.iconSize.m,
  });

  const [refreshing, setRefreshing] = useState<boolean>(false);
  return (
    <LazyImageLGBackground>
      {renderSpin(
        <>
          <DetailNavTitle
            onBack={goBack}
            title={i18n.t('home.tab.casino')}
            titleColor={theme.fontColor.main}
            hideServer
            containerStyle={[theme.background.white]}
            iconColor={'black'}
          />
          <ScrollView
            style={[theme.flex.flex1]}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  getList();
                }}
              />
            }
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            onScroll={onScroll}>
            {/* <CasinoBanner bannerList={bannerList} /> */}
            {messageList?.length > 0 && (
              <View
                style={[
                  theme.margin.topl,
                  theme.flex.row,
                  theme.flex.centerByCol,
                  theme.margin.lrl,
                  theme.padding.lrl,
                  theme.padding.tbs,
                  theme.background.white,
                  theme.borderRadius.m,
                ]}>
                <LazyImage
                  imageUrl={messageIcon}
                  width={theme.iconSize.m}
                  height={theme.iconSize.m}
                  occupancy={'transparent'}
                />
                <FlatList
                  data={messageList}
                  ref={messageRef}
                  scrollEnabled={false}
                  style={[{height: theme.iconSize.m}]}
                  renderItem={({item, index}) => (
                    <Text
                      fontSize={theme.fontSize.m}
                      key={index}
                      style={[theme.font.second, theme.margin.lefts]}>
                      {item}
                    </Text>
                  )}
                />
              </View>
            )}
            <View
              style={[
                messageList?.length > 0 && theme.margin.topl,
                theme.margin.lrl,
              ]}>
              <Card
                radius={theme.borderRadiusSize.m}
                backgroundColor={theme.backgroundColor.white}>
                <Card.Title title="Games Lobby" style={[styles.cardTitle]} />
                <View
                  style={[
                    theme.padding.lrl,
                    theme.flex.row,
                    theme.flex.wrap,
                    theme.flex.between,
                  ]}>
                  {gameList.map((game, index) => (
                    <View style={[theme.margin.btms]} key={index}>
                      <NativeTouchableOpacity onPress={() => toGame(game)}>
                        <Card
                          key={index}
                          radius={theme.borderRadiusSize.m}
                          backgroundColor={theme.basicColor.white}>
                          <Card.Image
                            imageUrl={game.gamePic}
                            width={gameCardWidth}
                            height={gameCardWidth}
                          />
                        </Card>
                        {/* <View
                          style={[
                            theme.padding.lrs,
                            styles.smallCardContent,
                            theme.flex.col,
                            theme.flex.alignStart,
                            theme.flex.centerByRow,
                            theme.background.lightGrey,
                            theme.margin.tops,
                            theme.borderRadius.m,
                          ]}>
                          <Text
                            fontSize={theme.fontSize.s}
                            blod
                            second
                            style={[
                              {
                                maxWidth:
                                  gameCardWidth - theme.paddingSize.s * 2 - 1,
                              },
                            ]}
                            numberOfLines={1}
                            ellipsizeMode={'tail'}>
                            {game.name}
                          </Text>
                          <Text
                            fontSize={theme.fontSize.xs}
                            style={[theme.font.secAccent]}>
                            {game.provider || '-'}
                          </Text>
                        </View> */}
                      </NativeTouchableOpacity>
                    </View>
                  ))}
                </View>
              </Card>
            </View>
            {isEnd && <NoMoreData />}
          </ScrollView>
        </>,
      )}
    </LazyImageLGBackground>
  );
};

const styles = StyleSheet.create({
  cardTitle: {
    height: 42,
  },
  smallCardContent: {
    height: 40,
  },
});

export default Casino;
