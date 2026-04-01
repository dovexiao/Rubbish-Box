import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ListRenderItem,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PageContainer, Flex } from '@/components';
import { useRoute } from '@react-navigation/native';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { getHandOverList } from '@/services';
import { styles } from './style';
import { showToast } from '@/utils';

type Device = {
  id: number;
  lockName: string;
  imageUrl: string;
  isGroup: boolean;
  isShare: boolean;
};

const PAGE_SIZE = 20;

export default function HandOverDevice() {
  const route = useRoute<any>();
  const navigation = useAppNavigation();
  const adminMobile = route.params?.adminMobile as string | undefined;

  const [lockIds, setLockIds] = useState<number[]>([]);
  const [deviceList, setDeviceList] = useState<Device[]>([]);
  const [complete, setComplete] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const loadList = useCallback(
    async (refresh: boolean) => {
      if (refresh) setRefreshing(true);
      else setLoadingMore(true);
      try {
        const offset = refresh ? 0 : deviceList.length;
        const res: any = await getHandOverList({ offset, pageSize: PAGE_SIZE });
        if (res?.code === 200 && res?.success) {
          const data = res?.data || {};
          const list: Device[] = Array.isArray(data.list)
            ? data.list
            : data.list ?? [];
          setComplete(list.length < PAGE_SIZE);
          setDeviceList(prev => (refresh ? list : [...prev, ...list]));
        } else {
          showToast({
            title: res?.message || res?.msg || '加载设备列表失败',
            icon: 'info',
          });
        }
      } catch {
        showToast({ title: '加载设备列表失败', icon: 'info' });
      } finally {
        setInitialLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [deviceList.length],
  );

  useEffect(() => {
    void loadList(true);
  }, [loadList]);

  const toggleDevice = useCallback((deviceId: number) => {
    setLockIds(prev => {
      const exists = prev.includes(deviceId);
      return exists ? prev.filter(id => id !== deviceId) : [...prev, deviceId];
    });
  }, []);

  const canNext = lockIds.length > 0;

  const footer = (
    <View style={styles.pageFooter}>
      <TouchableOpacity
        activeOpacity={0.85}
        style={[styles.sureCreateBtn, !canNext && styles.disabledBtn]}
        onPress={() => {
          if (!canNext) return;
          navigation.navigate('HandOverVerify' as any, {
            adminMobile,
            id: lockIds.join(','),
          });
        }}
      >
        <Text style={styles.sureCreateBtnText}>下一步</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem: ListRenderItem<Device> = useCallback(
    ({ item }) => {
      const selected = lockIds.includes(item.id);
      const showTips = selected && (item.isGroup || item.isShare);
      const itemHeightStyle =
        showTips && item.isGroup && item.isShare ? styles.h220 : styles.h160;

      return (
        <TouchableOpacity
          activeOpacity={0.85}
          style={[styles.deviceItem, itemHeightStyle]}
          onPress={() => toggleDevice(item.id)}
        >
          <Image
            source={{ uri: item.imageUrl }}
            style={styles.deviceImg}
            resizeMode="contain"
          />

          <Flex style={styles.flexBox} direction="row">
            {showTips ? (
              <Flex
                style={{ width: '100%', height: '100%' }}
                direction="column"
                justify="between"
              >
                <Text style={styles.itemName}>{item.lockName}</Text>
                {item.isGroup ? (
                  <Text style={styles.groupToast}>
                    {item.isShare ? '1、' : ''}
                    当前设备位于组合设备中，移交成功后，此设备自动从组合设备中移除
                  </Text>
                ) : null}
                {item.isShare ? (
                  <Text style={styles.groupToast}>
                    {item.isGroup ? '2、' : ''}
                    当前此设备已生成的贵宾码将立即作废，使用贵宾码将无法解锁地锁
                  </Text>
                ) : null}
              </Flex>
            ) : (
              <Text style={styles.itemName}>{item.lockName}</Text>
            )}
          </Flex>

          <Image
            source={{
              uri: `https://g.18qjz.cn/img/boklock/${
                selected ? 'radio_checked' : 'radio_default'
              }.png`,
            }}
            style={styles.radioImg}
            resizeMode="contain"
          />
        </TouchableOpacity>
      );
    },
    [lockIds, toggleDevice],
  );

  const empty = useMemo(() => {
    if (initialLoading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Image
          source={{ uri: 'https://g.18qjz.cn/img/boklock/order_empty.png' }}
          style={styles.emptyImage}
          resizeMode="contain"
        />
        <Text style={styles.emptyText}>空空如也</Text>
      </View>
    );
  }, [initialLoading]);

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: '请选择移交的设备',
        showBack: true,
        background: '#FFFFFF',
      }}
      navBorder
      scrollable={false}
      loading={initialLoading}
      footer={footer}
      padding={0}
    >
      <View style={styles.container}>
        <View style={styles.deviceContent}>
          <FlatList
            data={deviceList}
            keyExtractor={item => String(item.id)}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            refreshing={refreshing}
            onRefresh={() => void loadList(true)}
            onEndReachedThreshold={0.3}
            onEndReached={() => {
              if (!refreshing && !loadingMore && !complete)
                void loadList(false);
            }}
            ListEmptyComponent={empty}
            ListFooterComponent={
              loadingMore ? (
                <View style={{ paddingVertical: 12 }}>
                  <ActivityIndicator color="#333333" />
                </View>
              ) : null
            }
          />
        </View>
      </View>
    </PageContainer>
  );
}
