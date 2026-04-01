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
import { PageContainer, Popup } from '@/components';
import { getPickupCodeRecordList } from '@/services/mall';
import styles from './styles';
import { showToast } from '@/utils';

// 状态：1 未填写地址，2 待发货，3 已发货
const statusMap: Record<number, { text: string; color: string }> = {
  1: { text: '发货及预约安装\n请添加客服企业微信', color: '#FF873D' },
  2: { text: '我们会尽快安排发货\n感谢您的耐心等候！', color: '#999999' },
  3: { text: '已发货', color: '#37C22A' },
};

const formatPickupTime = (time?: string) => {
  if (!time) return '';
  if (time.length >= 16) return time.slice(0, 16);
  return time;
};

type RecordItem = {
  id: number | string;
  imageUrl?: string;
  productType?: string;
  pickupTime?: string;
  pickupCode?: string;
  status?: number;
  [key: string]: any;
};

const PAGE_SIZE = 20;
const DEFAULT_DEVICE_IMG = 'https://g.18qjz.cn/img/boklock/device_scan.png';
const EMPTY_IMG = 'https://g.18qjz.cn/img/boklock/order_empty.png';

export default function PickupCodeRecordList() {
  const navigation = useNavigation<any>();
  const [list, setList] = useState<RecordItem[]>([]);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadData = useCallback(
    async (refresh: boolean) => {
      if (loading) return;

      if (refresh) {
        setRefreshing(true);
        setInitialLoading(true);
      } else {
        setLoading(true);
      }

      try {
        const offset = refresh ? 0 : list.length;
        const res = await getPickupCodeRecordList({
          offset,
          pageSize: PAGE_SIZE,
        });

        if (res.code === 200 && res.success) {
          const data = (res.data || res) as any;
          const rows: RecordItem[] = Array.isArray(data.list)
            ? data.list
            : Array.isArray((res as any).list)
            ? (res as any).list
            : [];
          setList(prev => (refresh ? rows : [...prev, ...rows]));
          setComplete(rows.length < PAGE_SIZE);
        } else {
          showToast({
            title: res.msg || res.message || '获取领取记录失败',
            icon: 'info',
          });
        }
      } catch (e) {
        showToast({ title: '获取领取记录失败', icon: 'info' });
      } finally {
        setLoading(false);
        setRefreshing(false);
        setInitialLoading(false);
      }
    },
    [list.length, loading],
  );

  useEffect(() => {
    void loadData(true);
  }, [loadData]);

  const handleLoadMore = useCallback(() => {
    if (!loading && !complete && list.length > 0) {
      void loadData(false);
    }
  }, [loading, complete, list.length, loadData]);

  const handleRefresh = useCallback(() => {
    void loadData(true);
  }, [loadData]);

  const [qrPopupVisible, setQrPopupVisible] = useState(false);

  const handlePressItem = useCallback(
    (item: RecordItem) => {
      navigation.navigate('PickupCodeRecordDetail', {
        id: item.id,
        recordId: item.id,
        fromList: 1,
      });
    },
    [navigation],
  );

  const handlePressStatus = useCallback((item: RecordItem) => {
    if (item.status !== 1) return;
    setQrPopupVisible(true);
  }, []);

  const renderItem: ListRenderItem<RecordItem> = useCallback(
    ({ item }) => {
      const statusInfo = item.status != null ? statusMap[item.status] : null;
      return (
        <View style={styles.card}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.leftArea}
            onPress={() => handlePressItem(item)}
          >
            <Image
              source={{ uri: item.imageUrl || DEFAULT_DEVICE_IMG }}
              style={styles.deviceImg}
              resizeMode="contain"
            />
            <View style={styles.textArea}>
              <Text style={styles.title} numberOfLines={1}>
                {item.productType ?? '领取一台泊刻地锁'}
              </Text>
              <Text style={styles.time}>
                {formatPickupTime(item.pickupTime)}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.statusText, { marginRight: 4 }]}
            onPress={() => handlePressStatus(item)}
          >
            <Text
              style={{
                fontSize: 12,
                color: statusInfo?.color ?? '#333333',
                textAlign: 'right',
              }}
              numberOfLines={2}
            >
              {statusInfo?.text ?? ''}
            </Text>
          </TouchableOpacity>
        </View>
      );
    },
    [handlePressItem, handlePressStatus],
  );

  const emptyComponent = (
    <View style={styles.emptyContainer}>
      <Image
        source={{ uri: EMPTY_IMG }}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <Text style={styles.emptyText}>暂无领取记录</Text>
    </View>
  );

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      scrollable={false}
      pageNavProps={{
        text: '领取记录',
        showBack: true,
        background: '#FFFFFF',
      }}
      loading={initialLoading && list.length === 0}
    >
      <FlatList
        style={styles.container}
        contentContainerStyle={
          list.length === 0 ? { flexGrow: 1 } : styles.listWrapper
        }
        data={list}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={!initialLoading ? emptyComponent : null}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#333333']}
          />
        }
      />

      <Popup
        visible={qrPopupVisible}
        onClose={() => setQrPopupVisible(false)}
        title=" "
        minHeight={150}
      >
        <View style={styles.qrCodeContent}>
          <Image
            source={{
              uri: 'https://g.18qjz.cn/img/boklock/pickupCode/custServiceQRCode.png',
            }}
            style={styles.qrCodeImage}
            resizeMode="contain"
          />
          <Text style={styles.qrCodeContentText}>
            发货及预约安装请添加客服企业微信
          </Text>
        </View>
      </Popup>
    </PageContainer>
  );
}
