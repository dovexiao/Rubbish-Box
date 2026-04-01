import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  ListRenderItem,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { PageContainer } from '@/components';
import { getLockList } from '@/services/device';
import styles from './styles';
import { showToast } from '@/utils';

type LockItem = {
  id: number;
  lockName?: string;
  imageUrl?: string;
  [key: string]: any;
};

const PAGE_SIZE = 20;
const EMPTY_IMG = 'https://g.18qjz.cn/img/boklock/order_empty.png';

export default function MaintainLockChoose() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const chooseId = route.params?.lockId;

  const [lockList, setLockList] = useState<LockItem[]>([]);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadList = useCallback(
    async (refresh: boolean) => {
      if (loading) return;
      if (refresh) {
        setRefreshing(true);
        setInitialLoading(true);
      } else {
        setLoading(true);
      }
      try {
        const offset = refresh ? 0 : lockList.length;
        const res = await getLockList({ offset, pageSize: PAGE_SIZE });
        const data = (res as any).data || res;
        const list: LockItem[] = Array.isArray(data?.list) ? data.list : [];
        setLockList(prev => (refresh ? list : [...prev, ...list]));
        setComplete(list.length < PAGE_SIZE);
      } catch (e) {
        showToast({ title: '加载设备列表失败', icon: 'info' });
      } finally {
        setLoading(false);
        setRefreshing(false);
        setInitialLoading(false);
      }
    },
    [lockList.length, loading],
  );

  useEffect(() => {
    loadList(true);
  }, []);

  const onSelect = useCallback(
    (item: LockItem) => {
      navigation.navigate('OnlineRepair', {
        lockId: item.id,
        lockName: item.lockName || '',
      });
    },
    [navigation],
  );

  const renderItem: ListRenderItem<LockItem> = useCallback(
    ({ item }) => (
      <TouchableOpacity
        style={[
          styles.item,
          chooseId != null && item.id === chooseId && styles.borderActive,
        ]}
        onPress={() => onSelect(item)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.imageUrl || '' }}
          style={{ width: 36, height: 36 }}
          resizeMode="cover"
        />
        <Text style={styles.lockName}>{item.lockName || `设备${item.id}`}</Text>
      </TouchableOpacity>
    ),
    [chooseId, onSelect],
  );

  const empty = (
    <View style={styles.emptyContainer}>
      <Image
        source={{ uri: EMPTY_IMG }}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <Text style={styles.emptyText}>暂无设备</Text>
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
        text: '选择地锁',
        showBack: true,
        background: '#FFFFFF',
      }}
      loading={initialLoading && lockList.length === 0}
    >
      <FlatList
        data={lockList}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={
          lockList.length === 0 ? { flexGrow: 1 } : { paddingHorizontal: 24 }
        }
        ListEmptyComponent={!initialLoading ? empty : null}
        onEndReached={() => {
          if (!loading && !complete && lockList.length > 0) loadList(false);
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
