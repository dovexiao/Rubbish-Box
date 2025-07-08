/* eslint-disable prettier/prettier */
import DetailNavTitle from '@businessComponents/detail-nav-title';
import React, {useRef, useState, useEffect} from 'react';
import {useInnerStyle} from './promotion.hooks';
import theme from '@style';
import {FlatList, ListRenderItemInfo, RefreshControl, View} from 'react-native';
import Card from '@basicComponents/card';
import {NoMoreData} from '@/components/basic/default-page';
import {PromotionListItem, getPromotionList} from './promotion.service';
import globalStore from '@/services/global.state';
import NoData from '@/components/basic/error-pages/no-data';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import {useTranslation} from 'react-i18next';
import {goToUrl} from '@/common-pages/game-navigate';
import {LazyImageLGBackground} from '@/components/basic/image';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import {goTo} from '@/utils';
// import { useRoute } from '@react-navigation/native';

const Promotion = () => {
  // const route = useRoute();
  const {i18n} = useTranslation();
  const {
    size: {itemImgWidth, itemImgHeight, signImgHeight},
    listStyle,
  } = useInnerStyle();
  const [tagIndex] = useState(0);

  const {screenHeight} = useSettingWindowDimensions();

  const [refreshing, setRefreshing] = useState(false);
  const pageNo = useRef(1);
  const totalPage = useRef(1);
  const [promotionList, setPromotionList] = useState<PromotionListItem[]>([]);
  const refreshPageInfo = (isMore = false) => {
    return getPromotionList(pageNo.current, tagIndex).then(pageInfo => {
      if (pageInfo?.content) {
        setPromotionList(
          isMore
            ? [...promotionList, ...pageInfo.content]
            : [...pageInfo.content],
        );
        totalPage.current = pageInfo.totalPages;
      }
    });
  };
  const refreshPage = (loading = true, isMore = false) => {
    loading && globalStore.globalLoading.next(true);
    pageNo.current = 1;
    refreshPageInfo(isMore).finally(() => {
      globalStore.globalLoading.next(false);
      setRefreshing(false);
    });
  };
  const refreshNextPage = () => {
    if (pageNo.current < totalPage.current) {
      pageNo.current++;
      globalStore.globalLoading.next(true);
      refreshPageInfo(true).finally(() =>
        globalStore.globalLoading.next(false),
      );
    }
  };
  useEffect(() => {
    refreshPage(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tagIndex]);

  const onPressItemTo = (item: PromotionListItem) => {
    if (!item?.activityUrl || item?.activityUrl.length === 0) {
      goTo('PromotionDetail', {id: item?.id});
      return;
    }
    goToUrl(item.activityUrl, item.activityTitle);
  };

  const renderItem = ({item, index}: ListRenderItemInfo<PromotionListItem>) => {
    return (
      <View
        style={[
          theme.background.mainDark,
          theme.border.primary50,
          theme.borderRadius.s,
        ]}
        key={item.id}>
        <Card key={index}>
          <NativeTouchableOpacity
            onPress={() => {
              onPressItemTo(item);
            }}>
            <Card.Image
              style={[
                theme.flex.centerByCol,
                theme.borderRadius.s,
                theme.position.rel,
              ]}
              width={itemImgWidth}
              height={
                item.activityType === 'signin' ? signImgHeight : itemImgHeight
              }
              imageUrl={item.activityIcon}></Card.Image>
          </NativeTouchableOpacity>
        </Card>
      </View>
    );
  };
  return (
    <LazyImageLGBackground
      style={[{height: screenHeight}]}
      showBottomBG={false}>
      <DetailNavTitle
        title={i18n.t('promotion.title')}
        hideServer
        // onBack={undefined}
        // onBack={(route.path || '').indexOf('index') > -1 ? undefined : goBack}
      />
      <FlatList
        style={[theme.flex.flex1]}
        data={promotionList}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              refreshPage(false);
            }}
          />
        }
        ListEmptyComponent={
          <View style={[theme.padding.xxl]}>
            <NoData />
          </View>
        }
        onEndReached={refreshNextPage}
        contentContainerStyle={[theme.padding.lrl, listStyle.list]}
        ListFooterComponent={
          promotionList &&
          promotionList.length > 0 &&
          pageNo.current >= totalPage.current ? (
            <NoMoreData />
          ) : undefined
        }
      />
    </LazyImageLGBackground>
  );
};

export default Promotion;
