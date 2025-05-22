/* eslint-disable prettier/prettier */
import DetailNavTitle from '@businessComponents/detail-nav-title';
import React, {useRef, useState, useEffect, useMemo} from 'react';
import {useInnerStyle} from './promotion.hooks';
import theme from '@style';
import {FlatList, ListRenderItemInfo, RefreshControl, View} from 'react-native';
import Card from '@basicComponents/card';
import Text from '@basicComponents/text';
import Button from '@/components/basic/button';
import {NoMoreData} from '@/components/basic/default-page';
import {PromotionListItem, getPromotionList} from './promotion.service';
import globalStore from '@/services/global.state';
import NoData from '@/components/basic/error-pages/no-data';
import {NativeTouchableOpacity} from '@basicComponents/touchable-opacity';
import {useTranslation} from 'react-i18next';
import {goToUrl} from '@/common-pages/game-navigate';
import {LazyImageLGBackground} from '@/components/basic/image';
import {BannerSwiper} from '@/components/basic/swiper';
import useHomeStore from '@/store/useHomeStore';
import {useSettingWindowDimensions} from '@/store/useSettingStore';
import PromotionTab from './promotion-tab';
import {titlePositionStyle} from './promotion.util';
import {goTo} from '@/utils';
// import { useRoute } from '@react-navigation/native';

const Promotion = () => {
  // const route = useRoute();
  const {i18n} = useTranslation();
  const {
    size: {itemImgWidth, itemImgHeight, signImgHeight},
    itemStyle,
    listStyle,
  } = useInnerStyle();
  const [tagIndex, setTagIndex] = useState(0);

  const {screenWidth, screenHeight, designWidth, calculateItemWidth} =
    useSettingWindowDimensions();
  const bannerWidth = screenWidth - theme.paddingSize.l * 2;
  const bannerHeight = calculateItemWidth(400);
  const bannerList = useHomeStore(state => state.homeBannerList);
  const memoPromotionBannerList = useMemo(() => {
    return bannerList?.filter(item => item?.putPage.indexOf('Activity') !== -1);
  }, [bannerList]);

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

  const renderTitlePosition = (item: PromotionListItem) => {
    const {containerStyle, titleStyle} = titlePositionStyle(
      item?.titlePosition,
    );
    return (
      <View style={containerStyle}>
        <View style={[theme.flex.flex1]}>
          <Text style={titleStyle} white fontSize={15}>
            {item?.activityTitle.replace(/\\n/g, '\n')}
          </Text>
          <Text
            style={titleStyle}
            color={theme.fontColor.white60}
            fontSize={12}>
            {item?.activitySubTitle.replace(/\\n/g, '\n')}
          </Text>
        </View>
        {item?.buttonText ? (
          <Button
            buttonStyle={[theme.margin.tops]}
            title={item?.buttonText}
            type="linear-primary"
            size="xsmall"
            onPress={() => {
              onPressItemTo(item);
            }}
          />
        ) : null}
      </View>
    );
  };

  const renderItem = ({item, index}: ListRenderItemInfo<PromotionListItem>) => {
    // 此处先使用固定的图片，后面再根据接口替换
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
              imageUrl={item.activityIcon}>
              {item?.activityTitle &&
                item?.titlePosition !== 0 &&
                renderTitlePosition(item)}
              <View
                style={[
                  theme.flex.row,
                  theme.gap.m,
                  theme.position.abs,
                  // eslint-disable-next-line react-native/no-inline-styles
                  {right: 12, top: 12},
                ]}>
                {item?.tagList.map((tagItem: any) => {
                  return (
                    <View
                      style={[
                        theme.padding.lrm,
                        theme.padding.tbxxs,
                        theme.background.secAccent,
                        theme.borderRadius.s,
                      ]}>
                      <Text white>{tagItem?.name}</Text>
                    </View>
                  );
                })}
              </View>
            </Card.Image>
            {item.activityType === 'signin' && (
              <View
                style={[
                  theme.flex.row,
                  theme.flex.centerByCol,
                  theme.flex.between,
                  theme.padding.l,
                ]}>
                <View style={[itemStyle.leftText]}>
                  <Text
                    main
                    fontSize={theme.fontSize.m}
                    blod
                    style={[theme.margin.btmxxs]}>
                    {item.activityTitle}
                  </Text>
                  {item.activityType === 'signin' && (
                    <Text
                      accent
                      fontSize={theme.fontSize.s}
                      numberOfLines={3}
                      ellipsizeMode="tail">
                      {item.activityContent}
                    </Text>
                  )}
                </View>
                {item.activityType === 'signin' && (
                  <Button
                    titleBold
                    buttonStyle={itemStyle.button}
                    width={(screenWidth * 96) / designWidth}
                    onPress={() => {
                      onPressItemTo(item);
                    }}>
                    <Text
                      blod
                      fontSize={theme.fontSize.s}
                      color={theme.basicColor.white}>
                      {item.activityType === 'signin'
                        ? i18n.t('promotion.go')
                        : i18n.t('promotion.view')}
                    </Text>
                  </Button>
                )}
              </View>
            )}
            {item?.activityTitle &&
              item?.titlePosition === 0 &&
              renderTitlePosition(item)}
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
        ListHeaderComponent={
          <View style={[theme.gap.m]}>
            <BannerSwiper
              bannerList={memoPromotionBannerList}
              bannerHeight={bannerHeight}
              bannerWidth={bannerWidth}
            />
            <PromotionTab tagIndex={tagIndex} setTagIndex={setTagIndex} />
          </View>
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
