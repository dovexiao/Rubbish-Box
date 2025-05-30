import React from 'react';
import {FlatList, View, ActivityIndicator} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import dayjs from 'dayjs';

import theme from '@/style';
import {TabType, getList} from './transaction-service';
import {SafeAny} from '@/types';
import NoData from '@/components/basic/error-pages/no-data';
import TransactionItem from './transaction-item';
import useInfiniteScroll from '../hooks/load-more.hooks';

export interface TransactionListType {
  type: string;
  name?: string;
  amount?: number | 0;
  index: number | 0;
  tabs: TabType[];
  isActive?: boolean;
}

const pageSize = 10;

const TransactionList = (props: TransactionListType) => {
  const pageRef = React.useRef(1);
  const hasMores = React.useRef(false);
  const [list, setList] = React.useState<SafeAny[]>([]);
  const [currentDate] = React.useState<Date>(new Date());
  const [loading, setLoading] = React.useState(false);
  const [firstLoad, setFirstLoad] = React.useState(true);
  const [moreLoading, setMoreLoading] = React.useState(false);
  const {type, index, tabs = [], isActive = false} = props;

  const {onEndReachedCalledDuringMomentum} = useInfiniteScroll(
    `transaction-id-${index}`,
  );

  const onLoadMore = async () => {
    if (hasMores.current && !onEndReachedCalledDuringMomentum.current) {
      await onGetItemList(false, currentDate);
      onEndReachedCalledDuringMomentum.current = true;
    }
  };

  const onGetItemList = async (refresh: boolean, date: Date) => {
    if (loading || moreLoading) {
      return;
    }

    if (refresh) {
      pageRef.current = 1;
      if (!firstLoad) {
        setLoading(true);
      }
    } else {
      pageRef.current += 1;
      setMoreLoading(true);
    }

    const yearMonth = dayjs(date).format('YYYYMM');

    try {
      const res = await getList({
        pageNo: pageRef.current,
        pageSize,
        changeDesc: type,
        yearMonth,
      });

      if (res) {
        setList(refresh ? res : list.concat(res));
        hasMores.current = res.length >= pageSize;
      }
    } finally {
      if (firstLoad) {
        setFirstLoad(false);
      }
      setLoading(false);
      setMoreLoading(false);
    }
  };

  React.useEffect(() => {
    if (!hasMores.current) {
      hasMores.current = true;
    }
    if (isActive || index === 0) {
      onGetItemList(true, currentDate).then();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate, isActive]);

  const Footer = React.useMemo(() => {
    if (moreLoading) {
      return (
        <View style={[theme.flex.center, theme.padding.l]}>
          <ActivityIndicator />
        </View>
      );
    }
    return null;
  }, [moreLoading]);

  return (
    <SafeAreaView style={{flex: 1}}>
      <FlatList
        id={`transaction-id-${index}`}
        style={{flex: 1}}
        contentContainerStyle={{
          paddingHorizontal: 0,
          paddingTop: 12,
          paddingBottom: 32,
          flexGrow: 1, // 保证内容区高度撑满
        }}
        data={list}
        keyExtractor={(item, i) => `${item?.id ?? i}`}
        renderItem={({item}) => <TransactionItem tabs={tabs} info={item} />}
        ListFooterComponent={Footer}
        ListEmptyComponent={!firstLoad && !loading ? <NoData /> : null}
        refreshing={loading}
        onRefresh={() => {
          setFirstLoad(true);
          setList([]);
          onGetItemList(true, new Date());
        }}
        onEndReachedThreshold={0.2}
        onMomentumScrollBegin={() => {
          onEndReachedCalledDuringMomentum.current = false;
        }}
        onEndReached={onLoadMore}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={21}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
};

export default TransactionList;
