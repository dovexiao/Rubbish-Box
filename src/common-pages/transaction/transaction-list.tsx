import dayjs from 'dayjs';
import React from 'react';
import {FlatList, View, ActivityIndicator} from 'react-native';
import theme from '@/style';
import {TabType, getList} from './transaction-service';
import {SafeAny} from '@/types';
import NoData from '@/components/basic/error-pages/no-data';
import TransactionItem from './transaction-item';
import globalStore from '@/services/global.state';
import useInfiniteScroll from '../hooks/load-more.hooks';
// import {DatePickerItem} from '@/components/basic/date-picker';

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
  const [listHeight, setListHeight] = React.useState(0);
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
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
    if (isActive) {
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

  const leftHeight = React.useMemo(() => {
    return {height: listHeight};
  }, [listHeight]);

  return (
    <View
      style={[theme.flex.flex1]}
      onLayout={e => setListHeight(e.nativeEvent.layout.height)}>
      <FlatList
        id={`transaction-id-${index}`}
        style={[theme.flex.flex1]}
        // contentContainerStyle={[theme.padding.lrl]}
        // ListHeaderComponent={
        //   <>
        //     <DatePickerItem value={currentDate} onChange={setCurrentDate} />
        //   </>
        // }
        onEndReachedThreshold={0.2}
        onMomentumScrollBegin={() => {
          onEndReachedCalledDuringMomentum.current = false;
        }}
        onEndReached={() => {
          onLoadMore();
        }}
        ListFooterComponent={Footer}
        ListEmptyComponent={
          !firstLoad && !loading ? (
            <View style={[leftHeight]}>
              <NoData />
            </View>
          ) : null
        }
        keyExtractor={(item, i) => `${i}`}
        refreshing={loading}
        onRefresh={() => {
          if (globalStore.isAndroid) {
            setCurrentDate(new Date());
          }
        }}
        data={list}
        renderItem={({item}) => <TransactionItem tabs={tabs} info={item} />}
      />
    </View>
  );
};

export default TransactionList;
