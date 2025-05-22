import React, {useCallback, useEffect, useRef, useMemo, useState} from 'react';
import DetailNavTitle from '@/components/business/detail-nav-title';
import theme from '@/style';

import LazyImage, {LazyImageLGBackground} from '@/components/basic/image';
import {goBack} from '@/utils';
import {useTranslation} from 'react-i18next';
import {
  ActivityIndicator,
  ScrollView,
  View,
  RefreshControl,
} from 'react-native';
import Text from '@/components/basic/text';
import {
  FeedBackRecordItem,
  getFeedBackRecordListService,
} from './feedback.service';
import NoData from '@/components/basic/error-pages/no-data';
import {FlatList} from 'react-native-gesture-handler';
import useInfiniteScroll from '../hooks/load-more.hooks';
const FEEDBACK_RECORD_FLAT_LIST_ID = 'feedback-record-flat-list-id';

const FeedBackRecord = () => {
  const {i18n} = useTranslation();

  const tableRef = useRef<FlatList>(null);

  const pageNoRef = useRef(1);
  const isRefresh = useRef(false);
  const [recordList, setRecordList] = useState<FeedBackRecordItem[]>([]);
  const [hasMoreData, setHasMoreData] = useState(true);
  const {onEndReachedCalledDuringMomentum} = useInfiniteScroll(
    FEEDBACK_RECORD_FLAT_LIST_ID,
  );

  const fetchData = useCallback(
    async (refresh = false) => {
      if (refresh) {
        pageNoRef.current = 1;
        isRefresh.current = true;
      } else {
        pageNoRef.current = pageNoRef.current + 1;
      }
      const res = await getFeedBackRecordListService({
        pageNo: pageNoRef?.current,
        pageSize: 10,
      });
      const newListData =
        pageNoRef.current === 1 ? [...res] : [...recordList, ...res];
      setRecordList(newListData);
      setHasMoreData(newListData?.length === res.length ? false : true);
      isRefresh.current = false;
    },
    [recordList],
  );

  const refreshList = useCallback(() => {
    if (pageNoRef.current === 1) {
      return;
    }
    fetchData(true);
  }, [fetchData]);

  const loadMore = () => {
    if (hasMoreData && !onEndReachedCalledDuringMomentum.current) {
      fetchData();
      onEndReachedCalledDuringMomentum.current = true;
    }
  };

  useEffect(() => {
    fetchData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const keyExtractor = useCallback((item: any, index: number) => {
    return `fb-record${index}`;
  }, []);

  const ListFooterComponent = useMemo(() => {
    if (recordList?.length === 0) {
      return null;
    }
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
  }, [hasMoreData, recordList]);

  const renderItem = useCallback(
    ({item}: {item: FeedBackRecordItem}) => {
      return (
        <View style={[theme.background.primary10, theme.borderRadius.s]}>
          <View
            style={[
              theme.flex.row,
              theme.flex.centerByCol,
              theme.padding.lrl,
              theme.background.mainDark,
              theme.borderRadius.s,
              theme.flex.between,
            ]}>
            <View
              style={[
                theme.flex.row,
                theme.padding.tbm,
                theme.gap.m,
                theme.flex.centerByCol,
              ]}>
              <LazyImage
                imageUrl={require('@assets/icons/feedback.webp')}
                height={20}
                width={20}
              />
              <Text white fontSize={14} blod>
                FeedBack
              </Text>
            </View>
            <Text color={theme.fontColor.white60} fontSize={14} blod>
              {item?.messageTime}
            </Text>
          </View>
          <View style={[theme.margin.l, theme.gap.m]}>
            <Text white fontSize={14} blod>
              Your feedback
            </Text>
            <Text color={theme.fontColor.white60}>{item?.messageContent}</Text>
            {item?.messageImg ? (
              <ScrollView
                horizontal={true}
                style={[{height: 60, width: '100%'}]}
                contentContainerStyle={[theme.gap.m]}>
                {item?.messageImg.split(',').map(src => {
                  return <LazyImage imageUrl={src} height={60} width={60} />;
                })}
              </ScrollView>
            ) : null}
            {item?.systemMessage ? (
              <>
                <View
                  style={[
                    theme.background.primary10,
                    {height: 1, width: '100%'},
                  ]}
                />
                <Text white fontSize={14} blod>
                  Platform response
                </Text>
                <Text color={theme.fontColor.white60}>
                  {item?.systemMessage}
                </Text>
              </>
            ) : null}
          </View>
        </View>
      );
    },

    [],
  );

  return (
    <LazyImageLGBackground style={[theme.fill.fill, theme.flex.col]}>
      <DetailNavTitle
        onBack={goBack}
        hideServer
        hideAmount
        title={i18n.t('feedback.record')}
      />
      <FlatList
        id={FEEDBACK_RECORD_FLAT_LIST_ID}
        ref={tableRef}
        data={recordList}
        scrollEventThrottle={16}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListFooterComponent={ListFooterComponent}
        ListEmptyComponent={
          <View style={[theme.borderRadius.l]}>
            <NoData />
          </View>
        }
        refreshControl={
          isRefresh.current ? (
            <RefreshControl
              refreshing={isRefresh.current}
              onRefresh={refreshList}
            />
          ) : undefined
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        // eslint-disable-next-line react-native/no-inline-styles
        contentContainerStyle={[theme.margin.lrl, {gap: 10}]}
        showsVerticalScrollIndicator={false}
        onScroll={() => {
          onEndReachedCalledDuringMomentum.current = false;
        }}
        onMomentumScrollBegin={() => {
          onEndReachedCalledDuringMomentum.current = false;
        }}
      />
    </LazyImageLGBackground>
  );
};

export default FeedBackRecord;
