import { Flex, PageContainer } from '@/components';
import React, { useState, useEffect } from 'react';
import { Text, ScrollView, RefreshControl, Image } from 'react-native';
import { styles } from './style';
import { getRiceInfoList } from '@/services/device';
import { useRoute } from '@react-navigation/native';
import { px } from '@/utils/ui';

interface RiceDataRecord {
  id: string;
  beforeStatus: number;
  currentStatus: number;
  optDesc: string;
  createTime: string;
  createTimeStr: string;
}

interface RiceData {
  date: string;
  dateLabel: string;
  records: RiceDataRecord[];
}

const DeviceLog: React.FC = () => {
  const { params } = useRoute() as {
    params: { lockId: number };
  };
  const [list, setList] = useState<RiceData[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const mergeList = (oldList: RiceData[], newList: RiceData[]) => {
    const existing = [...oldList];
    const incoming = [...newList];

    if (existing.length === 0) {
      return incoming;
    }

    const currentListLastItem = existing[existing.length - 1];
    const newListFirstItem = incoming[0];

    if (
      currentListLastItem &&
      newListFirstItem &&
      currentListLastItem.date === newListFirstItem.date
    ) {
      const updatedOldList = existing.slice(0, existing.length - 1);
      const mergedRecords = currentListLastItem.records.concat(
        newListFirstItem.records,
      );
      const mergedLastItem = { ...currentListLastItem, records: mergedRecords };
      return [...updatedOldList, mergedLastItem, ...incoming.slice(1)];
    } else {
      return [...existing, ...incoming];
    }
  };

  const getList = async (mode: 'initial' | 'refresh' | 'more') => {
    if (mode === 'refresh') setRefreshing(true);
    if (mode === 'more') setLoadingMore(true);
    if (mode === 'initial') setInitialLoading(true);

    const res: any = await getRiceInfoList({
      lockId: params?.lockId,
      offset:
        mode === 'more' ? list.map(item => item.records).flat().length : 0,
      pageSize: 20,
    });

    if (res.data) {
      setList(prevList => {
        if (mode !== 'more') {
          return res.data.list;
        } else {
          return mergeList(prevList, res.data.list);
        }
      });
      setHasMore(
        res.data.list.map((item: RiceData) => item.records).flat().length ===
          20,
      );
    }
    if (mode === 'refresh') setRefreshing(false);
    if (mode === 'more') setLoadingMore(false);
    if (mode === 'initial') setInitialLoading(false);
  };

  useEffect(() => {
    getList('initial');
  }, []);

  const handleScroll = ({ nativeEvent }: any) => {
    if (initialLoading || refreshing || loadingMore) return;
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const paddingToBottom = px(50);
    if (
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom
    ) {
      if (hasMore) {
        getList('more');
      }
    }
  };

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: '设备日志',
        showBack: true,
      }}
      navBorder
      scrollable={false}
      padding={0}
      loading={initialLoading}
    >
      <ScrollView
        style={styles.containerScrollView}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => getList('refresh')}
          />
        }
      >
        {list?.length > 0 ? (
          list?.map(item => (
            <Flex key={item.date} direction="column">
              <Text style={styles.date}>{item.dateLabel}</Text>
              <Flex style={styles.card} direction="column">
                {item.records.map(record => (
                  <Flex justify="between" key={record.id}>
                    <Text style={styles.left}>{record.optDesc}</Text>
                    <Text style={styles.right}>{record.createTimeStr}</Text>
                  </Flex>
                ))}
              </Flex>
            </Flex>
          ))
        ) : (
          <></>
        )}
      </ScrollView>
    </PageContainer>
  );
};

export default DeviceLog;
