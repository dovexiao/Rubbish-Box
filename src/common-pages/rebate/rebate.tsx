import {TabsRound, TabsRoundOptionItem} from '@/components/basic/tab';
import DetailNavTitle from '@/components/business/detail-nav-title';
import theme from '@/style';
import {goBack} from '@/utils';
import React, {useEffect, useState} from 'react';
import {FlatList, ListRenderItem, RefreshControl, View} from 'react-native';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';
import NoData from '@/components/basic/error-pages/no-data';
import {NoMoreData} from '@/components/basic/default-page';
import RebateCard from './rebate-card';
import {usePaging} from '../hooks/paging.hooks';
import {RecordItem, getRecord} from './rebate.service';
import globalStore from '@/services/global.state';

import {useRebateRules} from './rebate-rules.hooks';
import RuleIcon from './svg/ruleIcon';
import dayjs from 'dayjs';
import {useTranslation} from 'react-i18next';
import {LazyImageLGBackground} from '@basicComponents/image';
import {DatePickerItem} from '@/components/basic/date-picker';
import {useInnerStyle} from './rebate.hooks';
import {NOW_DATE} from '@/constants';

const Rebate = () => {
  const {i18n} = useTranslation();
  const [value, setValue] = useState<string | number>('3');
  const [date, setDate] = useState(NOW_DATE);
  const {rebateStyle} = useInnerStyle();
  const [refreshing, setRefreshing] = useState(false);
  const rebateOptions: TabsRoundOptionItem[] = [
    {
      label: i18n.t('rebate.tabs.all'),
      value: '3',
    },
    {
      label: i18n.t('rebate.tabs.finish'),
      value: '0',
    },
    {
      label: i18n.t('rebate.tabs.collect'),
      value: '1',
    },
    {
      label: i18n.t('rebate.tabs.received'),
      value: '2',
    },
  ];
  // const [dateVisible, setDateVisible] = useState(false);
  // const [date, setDate] = useState<Date | undefined>();
  const {renderModal, show} = useRebateRules();

  const {resultList, isEnd, init, refreshNextPage} = usePaging(pageNo => {
    return getRecord({
      startDate: date
        ? dayjs(date).startOf('month').format('YYYYMMDD')
        : undefined,
      endDate: date ? dayjs(date).endOf('month').format('YYYYMMDD') : undefined,
      receiveStatus: value !== '3' ? +value : undefined,
      pageNo,
    });
  });

  useEffect(() => {
    globalStore.globalLoading.next(true);
    init().finally(() => globalStore.globalLoading.next(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    globalStore.globalLoading.next(true);
    init().finally(() => globalStore.globalLoading.next(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const handleRefresh = () => {
    setRefreshing(true);
    init().finally(() => setRefreshing(false));
  };

  const renderItem: ListRenderItem<RecordItem> = ({item, index}) => {
    return (
      <View style={[theme.margin.btms]} key={index}>
        <RebateCard onRefresh={handleRefresh} data={item} />
      </View>
    );
  };

  return (
    <LazyImageLGBackground style={[theme.flex.col, rebateStyle.container]}>
      <DetailNavTitle
        title={i18n.t('rebate.title')}
        onBack={goBack}
        hideServer
        hideAmount
        rightNode={
          <NativeTouchableOpacity onPress={show}>
            <RuleIcon />
          </NativeTouchableOpacity>
        }
      />
      <TabsRound
        scroll={true}
        tabOptions={rebateOptions}
        value={value}
        onChange={setValue}
        style={[theme.margin.lrl]}
      />
      <DatePickerItem value={date} onChange={setDate} />
      <View style={[theme.flex.row, theme.padding.l, theme.flex.flex1]}>
        <FlatList
          data={resultList}
          renderItem={renderItem}
          onEndReached={refreshNextPage}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <View style={{}}>
              <NoData />
            </View>
          }
          ListFooterComponent={
            resultList.length && isEnd ? <NoMoreData /> : undefined
          }
        />
      </View>
      {renderModal}
    </LazyImageLGBackground>
  );
};

export default Rebate;
