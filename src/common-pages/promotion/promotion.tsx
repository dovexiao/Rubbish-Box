/* eslint-disable prettier/prettier */
import DetailNavTitle from '@businessComponents/detail-nav-title';
import React, {useRef, useState, useEffect, useCallback} from 'react';
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

const Promotion = () => {
  const {i18n} = useTranslation();
  const {
    size: {itemImgWidth, signImgHeight},//itemImgHeight,
    listStyle,
  } = useInnerStyle();

  const [refreshing, setRefreshing] = useState(false);
  const pageNo = useRef(1);
  const totalPage = useRef(1);
  const [promotionList, setPromotionList] = useState<PromotionListItem[]>([]);
  const tagIndex = 0;

  const {screenHeight} = useSettingWindowDimensions();

  const fetchPageData = useCallback(
    async (isMore = false) => {
      try {
        const pageInfo = await getPromotionList(pageNo.current, tagIndex);
        if (pageInfo?.content) {
          setPromotionList(prev =>
            isMore ? [...prev, ...pageInfo.content] : [...pageInfo.content],
          );
          totalPage.current = pageInfo.totalPages;
        }
      } catch (e) {
        console.error('Error fetching promotions:', e);
      }
    },
    [tagIndex],
  );

  const refreshPage = useCallback(async () => {
    globalStore.globalLoading.next(true);
    pageNo.current = 1;
    await fetchPageData(false);
    globalStore.globalLoading.next(false);
    setRefreshing(false);
  }, [fetchPageData]);

  const loadNextPage = useCallback(async () => {
    if (pageNo.current < totalPage.current) {
      pageNo.current++;
      globalStore.globalLoading.next(true);
      await fetchPageData(true);
      globalStore.globalLoading.next(false);
    }
  }, [fetchPageData]);

  useEffect(() => {
    refreshPage();
  }, [refreshPage]);

  const onPressItemTo = (item: PromotionListItem) => {
    if (!item?.activityUrl) {
      goTo('PromotionDetail', {id: item?.id});
    } else {
      goToUrl(item.activityUrl, item.activityTitle);
    }
  };

  const renderItem = ({item}: ListRenderItemInfo<PromotionListItem>) => (
    <View
      style={[
        // theme.border.primary50,
        theme.borderRadius.m,
        theme.margin.bottomMd,
        // {backgroundColor: theme.basicColor.newBgInOne},
      ]}>
      <Card>
        <NativeTouchableOpacity onPress={() => onPressItemTo(item)}>
          <Card.Image
            style={[
              theme.flex.centerByCol,
              theme.borderRadius.m,
              theme.position.rel,
            ]}
            width={itemImgWidth}
            height={
              item.activityType === 'signin' ? signImgHeight : 122
            }
            imageUrl={item.activityIcon}
          />
        </NativeTouchableOpacity>
      </Card>
    </View>
  );

  return (
    <LazyImageLGBackground style={{height: screenHeight}} >
      <DetailNavTitle title={i18n.t('promotion.title')} hideServer />
      <FlatList
        data={promotionList}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              refreshPage();
            }}
          />
        }
        ListEmptyComponent={
          <View style={theme.padding.xxl}>
            <NoData />
          </View>
        }
        onEndReached={loadNextPage}
        contentContainerStyle={[theme.padding.lrl, listStyle.list]}
        ListFooterComponent={
          promotionList.length > 0 && pageNo.current >= totalPage.current ? (
            <NoMoreData />
          ) : null
        }
      />
    </LazyImageLGBackground>
  );
};

export default Promotion;
