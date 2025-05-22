import React, {useCallback, useEffect, useState} from 'react';
import {ListRenderItem, RefreshControl, View} from 'react-native';
import DetailNavTitle from '@/components/business/detail-nav-title';
import {goBack} from '@/utils';
import DateInlineFilter from '@/components/business/filter/date-inline-filter';
import LazyImage from '@/components/basic/image';
import {
  background,
  basicColor,
  borderRadius,
  flex,
  fontColor,
  margin,
  padding,
} from '@/components/style';
import SortFilter, {SortType} from '@/components/business/filter/sort-filter';
import {defaultHeaderImg, whatsappIcon} from './invitation.variables';
import Text from '@basicComponents/text';
import ErrorInvitePage from '../../common-pages/proxy/basic-components/error-user-page';
import i18n from '@/i18n';
import {RecordListItem, RecordListParams} from './invitation.type';
import {useFocusEffect} from '@react-navigation/native';
import {getRecordList} from './invitation.service';
import {SafeAny} from '@/types';
import dayjs from 'dayjs';
import {FlatList} from 'react-native';
import globalStore from '@/services/global.state';
import {usePaging} from '../hooks/paging.hooks';
import NoMoreData from '@/components/basic/default-page/no-more-data';
import {useInnerStyle} from './invitation.style.hooks';
import {useShare} from '../hooks/share.hooks';
import {goWhatsAppChat} from '@/utils';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import {LazyImageLGBackground} from '@basicComponents/image';

const InvitationRecord = () => {
  const [dateRange, setDateRange] = useState<string[] | null>();
  const [commissionSort, onCommissionSortChange] = useState<SortType>('desc');
  const [refreshing, setRefreshing] = useState(false);
  const {doShare} = useShare(true);
  const {
    size: {screenHeight},
  } = useInnerStyle();
  const [paramter, setParamter] = useState<RecordListParams>({
    startTime: '',
    endTime: '',
    sort: undefined,
  });
  const {resultList, isEnd, init, refreshNextPage} = usePaging(
    (pageNo, pageSize) => {
      return getRecordList({...paramter, pageNo, pageSize});
    },
    {pageSize: 20},
  );
  useFocusEffect(
    useCallback(() => {
      globalStore.globalLoading.next(true);
      init().finally(() => globalStore.globalLoading.next(false));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );
  const handleRefresh = () => {
    setRefreshing(true);
    if (dateRange || commissionSort || paramter.sort) {
      init().finally(() => setRefreshing(false));
    } else {
      setRefreshing(false);
    }
  };
  useEffect(() => {
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramter]);
  useEffect(() => {
    if (dateRange) {
      setParamter({
        ...paramter,
        startTime: dayjs(dateRange[0]).format('YYYY-MM-DD'),
        endTime: dayjs(dateRange[1]).format('YYYY-MM-DD'),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);
  useEffect(() => {
    if (commissionSort) {
      const commissionSortType: SafeAny = commissionSort;
      setParamter({
        ...paramter,
        sort: commissionSortType,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commissionSort]);
  return (
    <LazyImageLGBackground style={[{height: screenHeight}]}>
      <DetailNavTitle
        hideAmount
        hideServer
        title={i18n.t('invitation-record.invitation-record')}
        onBack={goBack}
      />
      <View>
        <View style={[padding.l]}>
          <View style={[flex.row, flex.between]}>
            <SortFilter
              style={[background.mainDark, borderRadius.xs]}
              title={i18n.t('proxy.filter.recharge')}
              required
              sort={commissionSort}
              onSortChange={onCommissionSortChange}
            />
            <DateInlineFilter
              dateRange={dateRange}
              requiredInit={false}
              onDateRangeChanged={setDateRange}
            />
          </View>
        </View>
      </View>
      {resultList.length === 0 ? (
        <View style={[[{marginTop: 52}]]}>
          <ErrorInvitePage
            content={i18n.t('invitation-record.noInvitedFriend')}
            buttonTitle={i18n.t('invitation-record.invite')}
            onClick={() => doShare()}
          />
        </View>
      ) : (
        <View style={[flex.flex1]}>
          <FlatList
            data={resultList}
            renderItem={RenderItem}
            onEndReached={refreshNextPage}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
              />
            }
            ListFooterComponent={
              resultList.length && isEnd ? <NoMoreData /> : undefined
            }
          />
        </View>
      )}
    </LazyImageLGBackground>
  );
};

const RenderItem: ListRenderItem<RecordListItem> = ({item, index}) => {
  return (
    <View
      key={index}
      style={[
        margin.lrl,
        background.white,
        borderRadius.m,
        padding.l,
        margin.btms,
      ]}>
      <View style={[flex.row, flex.between, flex.flex1]}>
        <View style={[flex.row, flex.centerByCol]}>
          <LazyImage
            imageUrl={item?.userAvatar ? item?.userAvatar : defaultHeaderImg}
            occupancy="#0000"
            width={24}
            height={24}
          />
          <Text
            style={[margin.s]}
            fontSize={12}
            color={fontColor.main}
            fontWeight="bold">
            {item?.inviteUserPhone}
          </Text>
        </View>
        <NativeTouchableOpacity
          onPress={() => goWhatsAppChat(item?.inviteUserPhone)}>
          <LazyImage
            imageUrl={whatsappIcon}
            occupancy="#0000"
            width={24}
            height={24}
          />
        </NativeTouchableOpacity>
      </View>
      <View style={[flex.row, flex.between, flex.flex1]}>
        <Text style={[margin.tops]} fontSize={12} color={fontColor.second}>
          {i18n.t('invitation-record.status')}
        </Text>
        <Text
          style={[margin.tops]}
          fontSize={12}
          color={item?.status === 0 ? basicColor.primary : fontColor.main}
          fontWeight={'bold'}>
          {item?.status === 0 ? 'Incomplete' : 'Completed'}
        </Text>
      </View>
      <View style={[flex.row, flex.between, flex.flex1]}>
        <Text style={[margin.tops]} fontSize={12} color={fontColor.second}>
          {i18n.t('invitation-record.registration-time')}
        </Text>

        <Text style={[margin.tops]} fontSize={12} color={fontColor.main}>
          {dayjs(item?.createTime).format('YYYY-MM-DD HH:mm:ss A')}
        </Text>
      </View>
    </View>
  );
};

export default InvitationRecord;
