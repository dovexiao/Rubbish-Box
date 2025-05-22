import React, {useCallback, useEffect, useState} from 'react';
import {View, RefreshControl, ScrollView} from 'react-native';
import {useInnerStyle} from './proxy.hooks';
import theme from '@style';
import CommissionDetailUserHeader from './components/commission-detail-user-header';
import {BasicObject, NavigatorScreenProps, SafeAny} from '@/types';
import DetailNavTitle from '@/components/business/detail-nav-title';
import i18n from '@/i18n';
import {goBack, goWhatsAppChat, setDataForSettled} from '@/utils';
import CommissionDetailUserItem, {
  CommissionDetailUserItemProps,
} from './components/commission-detail-user-item';
import {usePaging} from '@/common-pages/hooks/paging.hooks';
import globalStore from '@/services/global.state';
import {getUserCommissionDetail, getUserInfo} from './proxy.service';
import dayjs from 'dayjs';
import {SortType} from '@/components/business/filter/sort-filter';
import CommissionDetailUserFilter from './components/commission-detail-user-filter';
import ErrorInvitePage from './basic-components/error-user-page';
import {NoMoreData} from '@/components/basic/default-page';
import {useFocusEffect} from '@react-navigation/native';
import {IProxyUserInfo} from './proxy.type';
import {LazyImageLGBackground} from '@/components/basic/image';

const ProxyCommissionDetailUser = (props: NavigatorScreenProps) => {
  const {route} = props;
  const userId = (route.params as BasicObject)?.userId;
  const {
    size: {screenHeight},
    commissionDetailStyle,
  } = useInnerStyle();

  const [userInfo, setUserInfo] = useState<IProxyUserInfo>();
  const [sort, setSort] = useState<SortType>('desc');
  const [dateRange, setDateRange] = useState<string[] | null>();
  const [throttleDateRange, setThrottleDateRange] = useState<SafeAny[]>([
    null,
    null,
  ]);
  const {resultList, isEnd, init, onScroll} =
    usePaging<CommissionDetailUserItemProps>(
      (pageNo, pageSize) => {
        const currentDateRange = throttleDateRange;
        return getUserCommissionDetail({
          pageNo,
          pageSize,
          commissionSort: sort === 'asc' ? 0 : 1,
          startDate: currentDateRange[0],
          endDate: currentDateRange[1],
          userId: +userId,
        }).then(({totalPages, content, totalSize}) => {
          return {
            totalPages,
            totalSize,
            content: content.map(item => ({
              type: item.type === 2 ? 'betting' : 'recharge',
              time: item.createTime,
              rechargeAmount: +item.amount,
              game: item.gameName,
              result: item.result,
              rebate: item.rebate,
              rechargeCommission: +item.commissionAmount,
            })),
          };
        });
      },
      {pageSize: 20},
    );

  useFocusEffect(
    useCallback(() => {
      globalStore.globalLoading.next(true);
      Promise.allSettled([init(), getUserInfo(+userId)])
        .then(([, uinfo]) => {
          setDataForSettled(setUserInfo, uinfo);
        })
        .finally(() => globalStore.globalLoading.next(false));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId, sort, throttleDateRange]),
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        !dateRange ||
        (throttleDateRange &&
          dateRange &&
          throttleDateRange[0] === dateRange[0] &&
          throttleDateRange[1] === dateRange[1])
      ) {
        return;
      }
      setThrottleDateRange(
        dateRange || [dayjs().format('YYYYMMDD'), dayjs().format('YYYYMMDD')],
      );
    }, 500);
    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    init().finally(() => setRefreshing(false));
  };

  return (
    <LazyImageLGBackground style={[theme.fill.fillW, {height: screenHeight}]}>
      <DetailNavTitle
        hideAmount
        hideServer
        title={i18n.t('proxy.commission-detail.user.title')}
        onBack={goBack}
      />
      <ScrollView
        style={[theme.flex.flex1]}
        stickyHeaderIndices={[1]}
        onScroll={onScroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }>
        <View style={[theme.padding.topl]}>
          <CommissionDetailUserHeader userId={+userId} userInfo={userInfo} />
        </View>
        <View
          style={[
            theme.flex.col,
            theme.padding.l,
            theme.background.mainDark,
            commissionDetailStyle.userFilter,
          ]}>
          <CommissionDetailUserFilter
            commissionSort={sort}
            onCommissionSortChange={setSort}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
          />
        </View>
        {resultList && resultList.length ? (
          <View style={[theme.flex.col, theme.padding.lrl, theme.margin.topl]}>
            {resultList.map((item, index) => (
              <CommissionDetailUserItem key={index} {...item} />
            ))}
            {resultList.length && isEnd ? <NoMoreData /> : undefined}
          </View>
        ) : (
          <View
            style={[
              theme.background.lightGrey,
              theme.padding.tbxxl,
              commissionDetailStyle.error,
            ]}>
            <ErrorInvitePage
              content={i18n.t('proxy.user.error-no-performance')}
              buttonTitle={i18n.t('proxy.user.contact')}
              onClick={() => goWhatsAppChat(userInfo?.contactPhone)}
            />
          </View>
        )}
      </ScrollView>
    </LazyImageLGBackground>
  );
};

export default ProxyCommissionDetailUser;
