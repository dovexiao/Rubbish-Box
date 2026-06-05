import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  ListRenderItem,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PageContainer } from '@/components';
import styles from './styles';
import { getAfterSaleRedDotCount, getLockOrderList } from '@/services/order';
import dayjs from 'dayjs';
import AppIcon from '@/components/AppIcon';
import { px } from '@/utils/ui';
import Flex from '@/components/Flex';
import MyEmpty from '@/components/MyEmpty/index';
import { SimpleLoading } from '@/components';
import { useFocusEffect } from '@react-navigation/core';

type OrderTab = {
  id: number;
  name: string;
};

const ORDER_TYPE_TABS: Array<{ id: number; name: string }> = [
  { id: 1, name: '收入订单' },
  { id: 2, name: '消费订单' },
];

const STATUS_TABS: OrderTab[] = [
  { id: 0, name: '全部' },
  { id: 1, name: '待完成' },
  { id: 2, name: '待付款' },
  { id: 3, name: '已完成' },
  { id: 4, name: '售后' },
];

const STATUS_UI_MAP: Record<
  number,
  { text: string; color: string; useCurrentFee?: boolean }
> = {
  1: { text: '待完成', color: '#999999', useCurrentFee: true },
  2: { text: '待付款', color: '#FF8C62' },
  3: { text: '已完成', color: '#2ACB52' },
  4: { text: '售后', color: '#FF2B24' },
};

const formatSeconds = (seconds: number) => {
  if (!seconds) return '00:00:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s
    .toString()
    .padStart(2, '0')}`;
};

const PAGE_SIZE = 10;

export default function Order() {
  const navigation = useNavigation<any>();
  const [orderList, setOrderList] = useState<any[]>([]);
  const [activeOrderType, setActiveOrderType] = useState<number>(1);
  const [activeStatusTab, setActiveStatusTab] = useState(0);
  const [aftersaleBadge, setAftersaleBadge] = useState<number>(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const loadingRef = useRef(false);
  const reachEndLockedRef = useRef(false);

  const statusTabs = useMemo(() => {
    if (activeOrderType === 1) {
      return STATUS_TABS.filter(tab => tab.id !== 2); // 收入订单不显示待付款
    }
    return STATUS_TABS;
  }, [activeOrderType]);

  const currentStatusId = statusTabs[activeStatusTab]?.id ?? 0;

  const fetchAftersaleBadge = useCallback(async (orderDirection: number) => {
    if (orderDirection !== 1) {
      setAftersaleBadge(0);
      return;
    }

    try {
      const res: any = await getAfterSaleRedDotCount({});
      console.log(res, 'rrrr');
      if (res?.success) {
        setAftersaleBadge(Number(res?.data || 0));
        return;
      }
      setAftersaleBadge(0);
    } catch {
      setAftersaleBadge(0);
    }
  }, []);

  const loadList = useCallback(
    async (
      refresh: boolean,
      params?: { orderDirection: number; tab: number },
    ) => {
      if (loadingRef.current) return;
      loadingRef.current = true;

      if (refresh) {
        setRefreshing(true);
        setInitialLoading(true);
      } else {
        setLoading(true);
      }

      try {
        const queryOrderDirection = params?.orderDirection ?? activeOrderType;
        const queryTab = params?.tab ?? currentStatusId;
        const offset = refresh ? 0 : orderList.length;

        if (refresh) {
          void fetchAftersaleBadge(queryOrderDirection);
        }

        const res = await getLockOrderList({
          orderDirection: queryOrderDirection,
          tab: queryTab,
          offset,
          pageSize: PAGE_SIZE,
        });

        if (res.success && res.data) {
          const list = res.data.list || [];
          setOrderList(prev => (refresh ? list : [...prev, ...list]));
          setHasMore(offset + list.length < res.data.total);
        } else {
          setHasMore(false);
        }
      } catch (e) {
        setHasMore(false);
      } finally {
        loadingRef.current = false;
        setLoading(false);
        setRefreshing(false);
        setInitialLoading(false);
      }
    },
    [activeOrderType, currentStatusId, fetchAftersaleBadge, orderList.length],
  );

  useFocusEffect(
    useCallback(() => {
      loadList(true, {
        orderDirection: activeOrderType,
        tab: currentStatusId,
      });
    }, [activeOrderType, currentStatusId, loadList]),
  );

  const handleOrderTypeChange = useCallback((nextType: number) => {
    setActiveOrderType(nextType);
    setActiveStatusTab(0);
    setOrderList([]);
    setHasMore(true);
    setInitialLoading(true);
    reachEndLockedRef.current = false;
  }, []);

  const handleStatusTabChange = useCallback((index: number) => {
    setActiveStatusTab(index);
    setOrderList([]);
    setHasMore(true);
    setInitialLoading(true);
    reachEndLockedRef.current = false;
  }, []);

  const handleRefresh = useCallback(() => {
    void loadList(true, {
      orderDirection: activeOrderType,
      tab: currentStatusId,
    });
  }, [activeOrderType, currentStatusId, loadList]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && orderList.length > 0 && !refreshing) {
      void loadList(false, {
        orderDirection: activeOrderType,
        tab: currentStatusId,
      });
    }
  }, [
    activeOrderType,
    currentStatusId,
    hasMore,
    loadList,
    loading,
    orderList.length,
    refreshing,
  ]);

  const handlePressItem = useCallback(
    (item: any) => {
      navigation.navigate('MyOrderDetail', {
        orderNo: item.orderNo,
        orderType: item.orderDirection === 1 ? 'income' : 'expense',
        orderStatus: item.tabStatus,
        item,
      });
    },
    [navigation],
  );

  const renderItem: ListRenderItem<any> = useCallback(
    ({ item }) => {
      const statusMeta = STATUS_UI_MAP[item.tabStatus] || {
        text: '',
        color: '#999999',
      };

      return (
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.orderCard}
          onPress={() => handlePressItem(item)}
        >
          <View style={styles.orderCardHead}>
            <Text
              style={styles.orderDeviceText}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              设备名称: {item.lockName || item.deviceNo}
            </Text>
            <View style={styles.orderStatusWrap}>
              <Text
                style={[styles.orderStatusText, { color: statusMeta.color }]}
              >
                {statusMeta.text}
              </Text>
              <AppIcon name="a-headfor-20" size={px(16)} color="#333333" />
            </View>
            {item.hasUnprocessedAfterSale && (
              <View style={styles.redDot}></View>
            )}
          </View>

          <View style={styles.orderDivider} />

          <Text style={styles.orderInfoText}>
            订单创建时间:{' '}
            {item.useStartTime
              ? dayjs(item.useStartTime).format('YYYY-MM-DD HH:mm')
              : ''}
          </Text>
          <Text style={styles.orderInfoText}>
            停车时长: {formatSeconds(item.parkingDurationSeconds)}
          </Text>
          <Text style={styles.orderInfoText}>
            {statusMeta.useCurrentFee ? '当前计费' : '订单金额'}:{' '}
            {(item.orderAmount || 0).toFixed(2)}元
          </Text>
        </TouchableOpacity>
      );
    },
    [handlePressItem],
  );

  const emptyComponent = <MyEmpty emptyText="暂无订单" marginTop={px(80)} />;

  return (
    <PageContainer
      backgroundColor="#FFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top']}
      scrollable={false}
      pageNavProps={{
        text: '我的订单',
        showBack: true,
        background: '#FFFFFF',
      }}
    >
      <View style={styles.orderTypeWrap}>
        {ORDER_TYPE_TABS.map(orderType => {
          const active = activeOrderType === orderType.id;
          return (
            <TouchableOpacity
              key={orderType.name}
              style={[
                styles.orderTypeTab,
                active ? styles.orderTypeTabActive : null,
              ]}
              onPress={() => handleOrderTypeChange(orderType.id)}
              activeOpacity={0.8}
            >
              <Text
                style={
                  active ? styles.orderTypeTextActive : styles.orderTypeText
                }
              >
                {orderType.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.content}>
        <Flex align="end" style={{ height: px(52), paddingHorizontal: px(16) }}>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            horizontal
            style={styles.statusTabsWrap}
          >
            {statusTabs.map((tab, index) => {
              const active = activeStatusTab === index;

              return (
                <View
                  style={[
                    styles.tabItemBox,
                    index == 0 && { paddingLeft: px(0) },
                  ]}
                  key={tab.name}
                >
                  <TouchableOpacity
                    style={[
                      styles.statusTab,
                      active ? styles.statusTabActive : null,
                    ]}
                    onPress={() => handleStatusTabChange(index)}
                    activeOpacity={0.85}
                  >
                    <Text
                      style={
                        active
                          ? styles.statusTabTextActive
                          : styles.statusTabText
                      }
                    >
                      {tab.name}
                    </Text>
                  </TouchableOpacity>
                  {activeOrderType === 1 &&
                  tab.id === 4 &&
                  aftersaleBadge > 0 ? (
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>
                        {aftersaleBadge > 99 ? '99+' : aftersaleBadge}
                      </Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </ScrollView>
        </Flex>
        {initialLoading ? (
          <SimpleLoading />
        ) : (
          <FlatList
            style={styles.orderContainer}
            contentContainerStyle={
              orderList.length === 0 ? { flexGrow: 1 } : styles.listWrapper
            }
            data={orderList}
            keyExtractor={(item, index) => item.orderNo + String(index)}
            renderItem={renderItem}
            ListEmptyComponent={!initialLoading ? emptyComponent : null}
            onEndReached={() => {
              if (reachEndLockedRef.current) return;
              reachEndLockedRef.current = true;
              handleLoadMore();
            }}
            onEndReachedThreshold={0.3}
            onMomentumScrollBegin={() => {
              reachEndLockedRef.current = false;
            }}
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
        )}
      </View>
    </PageContainer>
  );
}
