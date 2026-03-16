import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Flex, PageContainer } from '@/components';
import AppIcon from '@/components/AppIcon';
import MyEmpty from '@/components/MyEmpty';
import { getVersionRecords } from '@/services/deviceInfo';
import { cacheGetSync } from '@/utils/cache';
import { styles } from './style';
import { showToast } from '@/utils';

interface HistoryItem {
  /*日期标签（今天、昨天、7月1日等） */
  dateLabel: string;
  /*日期（yyyy-MM-dd格式） */
  date: string;
  /*该天的版本升级记录列表 */
  records: VersionRecord[];
}
interface VersionRecord {
  /*记录ID */
  id: number;
  /*设备编号 */
  deviceNo: string;
  /*版本号 */
  version: string;
  /*升级备注 */
  remark: string;
  /*升级时间 */
  createTime: string;
}

const PAGE_SIZE = 20;

function countRecords(list: HistoryItem[]): number {
  return list.reduce((sum, item) => sum + (item?.records?.length ?? 0), 0);
}

function mergeHistoryLists(
  existingList: HistoryItem[],
  newList: HistoryItem[],
): HistoryItem[] {
  const dateMap = new Map<string, HistoryItem>();

  existingList.forEach(item => {
    const key = String(item?.date || item?.dateLabel || '');
    if (!key) return;
    dateMap.set(key, {
      ...item,
      records: Array.isArray(item.records) ? [...item.records] : [],
    });
  });

  newList.forEach(newItem => {
    const key = String(newItem?.date || newItem?.dateLabel || '');
    if (!key) return;
    const existing = dateMap.get(key);
    if (existing) {
      existing.records = [
        ...(existing.records || []),
        ...(Array.isArray(newItem.records) ? newItem.records : []),
      ];
      existing.dateLabel = newItem.dateLabel || existing.dateLabel;
      existing.date = newItem.date || existing.date;
      dateMap.set(key, existing);
    } else {
      dateMap.set(key, {
        ...newItem,
        records: Array.isArray(newItem.records) ? [...newItem.records] : [],
      });
    }
  });

  return Array.from(dateMap.values()).sort((a, b) => {
    const at = new Date(a.date).getTime();
    const bt = new Date(b.date).getTime();
    return bt - at;
  });
}

export default function VersionHistory() {
  const route = useRoute<any>();
  const lockId = (route.params || {})?.lockId as number | undefined;

  const [list, setList] = useState<HistoryItem[]>([]);
  const [complete, setComplete] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const isEmpty = !initialLoading && list.length === 0;

  const loadList = useCallback(
    async (mode: 'initial' | 'refresh' | 'more') => {
      if (!lockId) {
        setInitialLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
        setList([]);
        setComplete(true);
        return;
      }

      if (mode === 'initial') setInitialLoading(true);
      if (mode === 'refresh') setRefreshing(true);
      if (mode === 'more') setLoadingMore(true);

      const offset = mode === 'more' ? countRecords(list) : 0;

      try {
        const userId = await cacheGetSync('userId');
        const res: any = await getVersionRecords({
          lockId,
          userId,
          pageSize: PAGE_SIZE,
          offset,
        });

        const incoming: HistoryItem[] = Array.isArray(res.data?.list)
          ? res.data.list
          : Array.isArray(res?.data?.list)
          ? res.data.list
          : [];

        const total: number = Number(res?.total ?? res?.data?.total ?? 0);
        const loadedNow = incoming.reduce(
          (sum, item) => sum + (item?.records?.length ?? 0),
          0,
        );

        setList(prev => {
          if (mode !== 'more') return incoming;
          return mergeHistoryLists(prev, incoming);
        });

        if (total > 0) {
          setComplete(offset + loadedNow >= total);
        } else {
          setComplete(loadedNow < PAGE_SIZE);
        }
      } catch (e: any) {
        showToast(e?.message || e?.msg || '获取历史记录失败');
      } finally {
        setInitialLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [list, lockId],
  );

  useEffect(() => {
    void loadList('initial');
  }, []);

  const keyExtractor = useCallback((item: HistoryItem) => {
    return String(item?.date || item?.dateLabel || '');
  }, []);

  const footer = useMemo(() => {
    if (loadingMore) {
      return (
        <View style={styles.footer}>
          <ActivityIndicator />
        </View>
      );
    }
    return <View style={styles.footer} />;
  }, [loadingMore]);

  const renderGroup = useCallback(({ item }: { item: HistoryItem }) => {
    return (
      <View style={styles.group}>
        <Text style={styles.dateLabel}>{item.dateLabel}</Text>

        {item?.records?.map(record => {
          return (
            <View key={String(record.id)} style={styles.itemContent}>
              <Flex style={styles.itemTop} align="center">
                <AppIcon name="explain" color="#333333" size={20} />
                <Text style={styles.itemName} numberOfLines={1}>
                  {`升级固件版本至${record?.version ?? ''}`}
                </Text>
                <Text style={styles.itemTime} numberOfLines={1}>
                  {record?.createTime ?? ''}
                </Text>
              </Flex>

              {record?.remark ? (
                <Text style={styles.bottomContent}>{record.remark}</Text>
              ) : null}
            </View>
          );
        })}
      </View>
    );
  }, []);

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      scrollable={false}
      loading={initialLoading && list.length === 0}
      pageNavProps={{
        text: '历史记录',
        showBack: true,
        background: '#FFFFFF',
      }}
      navBorder
      padding={0}
    >
      {isEmpty ? (
        <MyEmpty emptyIcon="https://g.18qjz.cn/img/boklock/order_empty.png" />
      ) : (
        <FlatList
          data={list}
          keyExtractor={keyExtractor}
          renderItem={renderGroup}
          contentContainerStyle={styles.listContent}
          onEndReachedThreshold={0.3}
          onEndReached={() => {
            if (!refreshing && !loadingMore && !complete) {
              void loadList('more');
            }
          }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadList('refresh')}
            />
          }
          ListFooterComponent={footer}
        />
      )}
    </PageContainer>
  );
}
