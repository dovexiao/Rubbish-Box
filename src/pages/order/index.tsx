import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  ListRenderItem,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Flex, Tabs, Toast } from '@ant-design/react-native';
import { PageContainer } from '@/components';
import { getOrderList } from '@/services/order';
import { OrderItem } from './com/orderItem';
import type { OrderItemDTO } from './typing';
import styles from './styles';

const TAB_LIST = [
  { id: 'pending-shipment', name: '待发货', orderStatus: 20 },
  { id: 'shipped', name: '已发货', orderStatus: 30 },
  { id: 'all', name: '全部', orderStatus: 40 },
] as const;

const PAGE_SIZE = 10;
const EMPTY_IMG = 'https://g.18qjz.cn/img/boklock/order_empty.png';

export default function Order() {
  const navigation = useNavigation<any>();
  const [orderList, setOrderList] = useState<OrderItemDTO[]>([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadList = useCallback(
    async (refresh: boolean, orderStatus?: number) => {
      if (loading) return;

      if (refresh) {
        setRefreshing(true);
        setInitialLoading(true);
      } else {
        setLoading(true);
      }

      try {
        const offset = refresh ? 0 : orderList.length;
        const res = await getOrderList({
          offset,
          pageSize: PAGE_SIZE,
          orderStatus: orderStatus ?? TAB_LIST[currentTab].orderStatus,
        });

        const list: OrderItemDTO[] = Array.isArray((res as any).list)
          ? (res as any).list
          : Array.isArray((res as any).data?.list)
          ? (res as any).data.list
          : [];

        setOrderList(prev => (refresh ? list : [...prev, ...list]));
        setHasMore(list.length >= PAGE_SIZE);
      } catch (e) {
        Toast.fail('获取订单列表失败');
      } finally {
        setLoading(false);
        setRefreshing(false);
        setInitialLoading(false);
      }
    },
    [currentTab, orderList.length, loading],
  );

  useEffect(() => {
    void loadList(true, TAB_LIST[currentTab].orderStatus);
  }, [currentTab]);

  const handleTabChange = useCallback((index: number) => {
    setCurrentTab(index);
  }, []);

  const handleRefresh = useCallback(() => {
    void loadList(true, TAB_LIST[currentTab].orderStatus);
  }, [currentTab, loadList]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && orderList.length > 0) {
      void loadList(false, TAB_LIST[currentTab].orderStatus);
    }
  }, [loading, hasMore, orderList.length, currentTab, loadList]);

  const handlePressItem = useCallback(
    (item: OrderItemDTO) => {
      navigation.navigate('OrderDetail', { orderNo: item.orderNo });
    },
    [navigation],
  );

  const renderItem: ListRenderItem<OrderItemDTO> = useCallback(
    ({ item }) => (
      <OrderItem data={item} onPress={() => handlePressItem(item)} />
    ),
    [handlePressItem],
  );

  const emptyComponent = (
    <View style={styles.emptyContainer}>
      <Image
        source={{ uri: EMPTY_IMG }}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <Text style={styles.emptyText}>暂无订单</Text>
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
        text: '我的订单',
        showBack: true,
        background: '#FFFFFF',
      }}
      loading={initialLoading && orderList.length === 0}
    >
      <View style={styles.tabsWrap}>
        <View style={styles.tabsBox}>
          {TAB_LIST.map((tab, index) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, currentTab === index ? styles.tabActive : {}]}
              onPress={() => handleTabChange(index)}
              activeOpacity={0.8}
            >
              <Text
                style={
                  currentTab === index ? styles.tabTextActive : styles.tabText
                }
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <FlatList
        style={styles.orderContainer}
        contentContainerStyle={
          orderList.length === 0 ? { flexGrow: 1 } : styles.listWrapper
        }
        data={orderList}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={!initialLoading ? emptyComponent : null}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          !initialLoading ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#333333']}
            />
          ) : undefined
        }
      />
    </PageContainer>
  );
}
