import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  ListRenderItem,
  Text,
  TouchableOpacity,
  View,
  Image,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect } from '@react-navigation/core';
import { PageContainer } from '@/components';
import AppIcon from '@/components/AppIcon';
import { getRepairList } from '@/services/user';
import styles from './styles';
import { showToast } from '@/utils';

type RepairItem = {
  id: number;
  repairNo: string;
  problemDescription: string;
  repairProgress: number;
  repairProgressName: string;
};

const PAGE_SIZE = 10;
const EMPTY_IMG = 'https://g.18qjz.cn/img/boklock/order_empty.png';

export default function MaintainService() {
  const navigation = useNavigation<any>();
  const [list, setList] = useState<RepairItem[]>([]);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadList = useCallback(
    async (reload: boolean) => {
      if (loading) return;
      if (reload) {
        setRefreshing(true);
        setInitialLoading(true);
      } else {
        setLoading(true);
      }
      try {
        const offset = reload ? 0 : list.length;
        const res = await getRepairList({ offset, pageSize: PAGE_SIZE });
        if (Number(res?.code) === 200) {
          const data = (res as any).data || res;
          const rows: RepairItem[] = Array.isArray(data?.list) ? data.list : [];
          setList(prev => (reload ? rows : [...prev, ...rows]));
          setComplete(rows.length < PAGE_SIZE);
        } else {
          showToast((res as any)?.message || (res as any)?.msg || '获取失败');
        }
      } catch (e) {
        showToast('获取服务记录失败');
      } finally {
        setLoading(false);
        setRefreshing(false);
        setInitialLoading(false);
      }
    },
    [list.length, loading],
  );

  useFocusEffect(
    useCallback(() => {
      loadList(true);
    }, [loadList]),
  );

  const renderItem: ListRenderItem<RepairItem> = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={styles.serviceItem}
        onPress={() =>
          navigation.navigate('MaintainServiceDetail', { id: item.id })
        }
        activeOpacity={0.8}
      >
        <View style={styles.itemTopBottom}>
          <Text style={styles.itemTopText}>服务号 {item.repairNo}</Text>
          <Text style={[styles.text, { marginRight: 2 }]}>
            {item.repairProgressName}
          </Text>
          <AppIcon name="a-headfor-20" color="#333333" size={20} />
        </View>
        <View style={styles.diviler} />
        <View style={styles.itemTopBottom}>
          <Text>描述：</Text>
          <Text style={[styles.text, styles.rightText]} numberOfLines={2}>
            {item.problemDescription}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [navigation],
  );

  const empty = (
    <View style={styles.emptyContainer}>
      <Image
        source={{ uri: EMPTY_IMG }}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <Text style={styles.emptyText}>暂无服务记录</Text>
    </View>
  );

  return (
    <PageContainer
      backgroundColor="#F6F7FA"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      scrollable={false}
      pageNavProps={{
        text: '服务记录',
        showBack: true,
        background: '#FFFFFF',
      }}
      loading={initialLoading && list.length === 0}
    >
      <FlatList
        data={list}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={
          list.length === 0 ? { flexGrow: 1 } : { paddingHorizontal: 16 }
        }
        ListEmptyComponent={!initialLoading ? empty : null}
        onEndReached={() => {
          if (!loading && !complete && list.length > 0) loadList(false);
        }}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadList(true)}
            colors={['#333333']}
          />
        }
      />
    </PageContainer>
  );
}
