import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  Image,
  ListRenderItem,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PageContainer } from '@/components';
import type { OrderItemDTO } from './typing';
import styles from './styles';
import { showToast } from '@/utils';
import AppIcon from '@/components/AppIcon';
import { px } from '@/utils/ui';
import Flex from '@/components/Flex';

type BizOrderType = 'income' | 'expense';
type BizOrderStatus = 'all' | 'todo' | 'unpaid' | 'done' | 'aftersale';

type OrderTab = {
  id: BizOrderStatus;
  name: string;
  badge?: number;
};

const ORDER_TYPE_TABS: Array<{ id: BizOrderType; name: string }> = [
  { id: 'income', name: '收入订单' },
  { id: 'expense', name: '消费订单' },
];

const STATUS_TABS_MAP: Record<BizOrderType, OrderTab[]> = {
  income: [
    { id: 'all', name: '全部' },
    { id: 'todo', name: '待完成' },
    { id: 'done', name: '已完成' },
    { id: 'aftersale', name: '售后', badge: 3 },
  ],
  expense: [
    { id: 'all', name: '全部' },
    { id: 'todo', name: '待完成' },
    { id: 'unpaid', name: '待付款' },
    { id: 'done', name: '已完成' },
    { id: 'aftersale', name: '售后' },
  ],
};

const STATUS_UI_MAP: Record<
  Exclude<BizOrderStatus, 'all'>,
  { text: string; color: string; useCurrentFee?: boolean }
> = {
  done: { text: '已完成', color: '#2ACB52' },
  todo: { text: '待完成', color: '#999999', useCurrentFee: true },
  aftersale: { text: '售后', color: '#FF2B24' },
  unpaid: { text: '待付款', color: '#FF8C62' },
};

const MOCK_ORDER_POOL: Array<
  Pick<OrderItemDTO, 'id' | 'orderNo'> & {
    bizType: BizOrderType;
    bizStatus: Exclude<BizOrderStatus, 'all'>;
    deviceName: string;
    createdAt: string;
    parkingDuration: string;
    amount: number;
  }
> = [
  {
    id: 1001,
    orderNo: 'I202605010001',
    bizType: 'income',
    bizStatus: 'done',
    deviceName: '地锁x号',
    createdAt: '2026-05-05 12:00',
    parkingDuration: '02:42:23',
    amount: 6,
  },
  {
    id: 1002,
    orderNo: 'I202605010002',
    bizType: 'income',
    bizStatus: 'todo',
    deviceName: '地锁x号',
    createdAt: '2026-05-05 12:00',
    parkingDuration: '02:42:23',
    amount: 6,
  },
  {
    id: 1003,
    orderNo: 'I202605010003',
    bizType: 'income',
    bizStatus: 'aftersale',
    deviceName: '地锁x号',
    createdAt: '2026-05-05 12:00',
    parkingDuration: '02:42:23',
    amount: 6,
  },
  {
    id: 1004,
    orderNo: 'E202605010004',
    bizType: 'expense',
    bizStatus: 'done',
    deviceName: '地锁x号',
    createdAt: '2026-05-05 12:00',
    parkingDuration: '02:42:23',
    amount: 6,
  },
  {
    id: 1005,
    orderNo: 'E202605010005',
    bizType: 'expense',
    bizStatus: 'todo',
    deviceName: '地锁x号',
    createdAt: '2026-05-05 12:00',
    parkingDuration: '02:42:23',
    amount: 6,
  },
  {
    id: 1006,
    orderNo: 'E202605010006',
    bizType: 'expense',
    bizStatus: 'aftersale',
    deviceName: '地锁x号',
    createdAt: '2026-05-05 12:00',
    parkingDuration: '02:42:23',
    amount: 6,
  },
  {
    id: 1007,
    orderNo: 'E202605010007',
    bizType: 'expense',
    bizStatus: 'unpaid',
    deviceName: '地锁x号',
    createdAt: '2026-05-05 12:00',
    parkingDuration: '02:42:23',
    amount: 6,
  },
  {
    id: 1008,
    orderNo: 'I202605010008',
    bizType: 'income',
    bizStatus: 'done',
    deviceName: '地锁x号',
    createdAt: '2026-05-06 09:12',
    parkingDuration: '01:20:08',
    amount: 12,
  },
  {
    id: 1009,
    orderNo: 'I202605010009',
    bizType: 'income',
    bizStatus: 'todo',
    deviceName: '地锁x号',
    createdAt: '2026-05-06 11:32',
    parkingDuration: '03:10:05',
    amount: 8,
  },
  {
    id: 1010,
    orderNo: 'E202605010010',
    bizType: 'expense',
    bizStatus: 'unpaid',
    deviceName: '地锁x号',
    createdAt: '2026-05-06 12:26',
    parkingDuration: '00:45:09',
    amount: 5,
  },
  {
    id: 1011,
    orderNo: 'E202605010011',
    bizType: 'expense',
    bizStatus: 'done',
    deviceName: '地锁x号',
    createdAt: '2026-05-07 08:26',
    parkingDuration: '02:05:19',
    amount: 10,
  },
  {
    id: 1012,
    orderNo: 'E202605010012',
    bizType: 'expense',
    bizStatus: 'aftersale',
    deviceName: '地锁x号',
    createdAt: '2026-05-07 10:51',
    parkingDuration: '01:55:04',
    amount: 7,
  },
  {
    id: 1013,
    orderNo: 'I202605010013',
    bizType: 'income',
    bizStatus: 'aftersale',
    deviceName: '地锁x号',
    createdAt: '2026-05-07 13:40',
    parkingDuration: '01:12:41',
    amount: 9,
  },
  {
    id: 1014,
    orderNo: 'I202605010014',
    bizType: 'income',
    bizStatus: 'done',
    deviceName: '地锁x号',
    createdAt: '2026-05-08 09:26',
    parkingDuration: '02:32:14',
    amount: 16,
  },
  {
    id: 1015,
    orderNo: 'I202605010015',
    bizType: 'income',
    bizStatus: 'todo',
    deviceName: '地锁x号',
    createdAt: '2026-05-08 11:15',
    parkingDuration: '00:52:37',
    amount: 6,
  },
  {
    id: 1016,
    orderNo: 'E202605010016',
    bizType: 'expense',
    bizStatus: 'todo',
    deviceName: '地锁x号',
    createdAt: '2026-05-08 16:46',
    parkingDuration: '01:59:55',
    amount: 8,
  },
  {
    id: 1017,
    orderNo: 'E202605010017',
    bizType: 'expense',
    bizStatus: 'done',
    deviceName: '地锁x号',
    createdAt: '2026-05-09 09:15',
    parkingDuration: '03:08:02',
    amount: 14,
  },
  {
    id: 1018,
    orderNo: 'E202605010018',
    bizType: 'expense',
    bizStatus: 'unpaid',
    deviceName: '地锁x号',
    createdAt: '2026-05-09 11:27',
    parkingDuration: '00:38:50',
    amount: 4,
  },
  {
    id: 1019,
    orderNo: 'I202605010019',
    bizType: 'income',
    bizStatus: 'aftersale',
    deviceName: '地锁x号',
    createdAt: '2026-05-10 08:25',
    parkingDuration: '02:19:16',
    amount: 11,
  },
  {
    id: 1020,
    orderNo: 'I202605010020',
    bizType: 'income',
    bizStatus: 'done',
    deviceName: '地锁x号',
    createdAt: '2026-05-10 12:03',
    parkingDuration: '01:48:26',
    amount: 13,
  },
];

const PAGE_SIZE = 10;
const EMPTY_IMG = 'https://g.18qjz.cn/img/boklock/order_empty.png';

export default function Order() {
  const navigation = useNavigation<any>();
  const [orderList, setOrderList] = useState<typeof MOCK_ORDER_POOL>([]);
  const [activeOrderType, setActiveOrderType] =
    useState<BizOrderType>('income');
  const [activeStatusTab, setActiveStatusTab] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const loadingRef = useRef(false);
  const reachEndLockedRef = useRef(false);

  const statusTabs = useMemo(
    () => STATUS_TABS_MAP[activeOrderType],
    [activeOrderType],
  );

  const currentStatus = statusTabs[activeStatusTab]?.id ?? 'all';

  const getFilteredMockList = useCallback(
    (orderType: BizOrderType, status: BizOrderStatus) => {
      return MOCK_ORDER_POOL.filter(item => {
        if (item.bizType !== orderType) return false;
        if (status === 'all') return true;
        return item.bizStatus === status;
      });
    },
    [],
  );

  const loadList = useCallback(
    async (
      refresh: boolean,
      params?: { orderType: BizOrderType; status: BizOrderStatus },
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
        const queryOrderType = params?.orderType ?? activeOrderType;
        const queryStatus = params?.status ?? currentStatus;
        const source = getFilteredMockList(queryOrderType, queryStatus);

        await new Promise<void>(resolve => {
          setTimeout(() => resolve(), 240);
        });

        const offset = refresh ? 0 : orderList.length;
        const nextPage = source.slice(offset, offset + PAGE_SIZE);

        setOrderList(prev => (refresh ? nextPage : [...prev, ...nextPage]));
        setHasMore(offset + nextPage.length < source.length);
      } catch (e) {
        showToast({ title: '获取订单列表失败', icon: 'info' });
      } finally {
        loadingRef.current = false;
        setLoading(false);
        setRefreshing(false);
        setInitialLoading(false);
      }
    },
    [activeOrderType, currentStatus, getFilteredMockList, orderList.length],
  );

  useEffect(() => {
    void loadList(true, {
      orderType: activeOrderType,
      status: currentStatus,
    });
  }, [activeOrderType, currentStatus, loadList]);

  const handleOrderTypeChange = useCallback((nextType: BizOrderType) => {
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
    void loadList(true, { orderType: activeOrderType, status: currentStatus });
  }, [activeOrderType, currentStatus, loadList]);

  const handleLoadMore = useCallback(() => {
    if (!loading && hasMore && orderList.length > 0 && !refreshing) {
      void loadList(false, {
        orderType: activeOrderType,
        status: currentStatus,
      });
    }
  }, [
    activeOrderType,
    currentStatus,
    hasMore,
    loadList,
    loading,
    orderList.length,
    refreshing,
  ]);

  const handlePressItem = useCallback(
    (item: (typeof MOCK_ORDER_POOL)[number]) => {
      navigation.navigate('MyOrderDetail', {
        orderNo: item.orderNo,
        orderType: item.bizType,
        orderStatus: item.bizStatus,
        item,
      });
    },
    [navigation],
  );

  const renderItem: ListRenderItem<(typeof MOCK_ORDER_POOL)[number]> =
    useCallback(
      ({ item }) => {
        const statusMeta = STATUS_UI_MAP[item.bizStatus];

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
                设备名称: {item.deviceName}
              </Text>
              <View style={styles.orderStatusWrap}>
                <Text
                  style={[styles.orderStatusText, { color: statusMeta.color }]}
                >
                  {statusMeta.text}
                </Text>
                <AppIcon name="a-headfor-20" size={px(16)} color="#333333" />
              </View>
            </View>

            <View style={styles.orderDivider} />

            <Text style={styles.orderInfoText}>
              订单创建时间: {item.createdAt}
            </Text>
            <Text style={styles.orderInfoText}>
              停车时长: {item.parkingDuration}
            </Text>
            <Text style={styles.orderInfoText}>
              {statusMeta.useCurrentFee ? '当前计费' : '订单金额'}:{' '}
              {item.amount}元
            </Text>
          </TouchableOpacity>
        );
      },
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
              key={orderType.id}
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
        <Flex align="center" style={{ height: px(64) }}>
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
                  key={tab.id}
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
                    {tab.badge ? (
                      <View style={styles.statusBadge}>
                        <Text style={styles.statusBadgeText}>{tab.badge}</Text>
                      </View>
                    ) : null}
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </Flex>
        <FlatList
          style={styles.orderContainer}
          contentContainerStyle={
            orderList.length === 0 ? { flexGrow: 1 } : styles.listWrapper
          }
          data={orderList}
          keyExtractor={item => String(item.id)}
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
      </View>
    </PageContainer>
  );
}
