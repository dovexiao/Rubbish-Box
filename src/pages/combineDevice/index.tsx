import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  ListRenderItem,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PageContainer, TextInput, Flex } from '@/components';
import AppIcon from '@/components/AppIcon';
import { useRoute } from '@react-navigation/native';
import { defaultName, groupChooseList, saveGroup } from '@/services';
import { hideLoading, setStorage, showLoading, showToast } from '@/utils';
import { useAppNavigation } from '@/hooks/useAppNavigation';

type DeviceItem = {
  id: number;
  lockName?: string;
  imageUrl?: string;
};

const PAGE_SIZE = 20;

export default function CombineDeviece() {
  const navigation = useAppNavigation();
  const route = useRoute<any>();

  const lockNameFromRoute: string | undefined = route.params?.lockName;
  const derivedCurrentDeviceId: number | undefined = useMemo(() => {
    const lockId = route.params?.id;
    const type = route.params?.type;
    if (type && String(type) !== 'false' && lockId != null) {
      return Number(lockId);
    }
    return undefined;
  }, [route.params?.id, route.params?.type]);

  const [groupName, setGroupName] = useState('');
  const [selectedDevices, setSelectedDevices] = useState<number[]>([]);
  const [deviceList, setDeviceList] = useState<DeviceItem[]>([]);
  const [total, setTotal] = useState(0);
  const [complete, setComplete] = useState(false);

  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await defaultName({});
        if (res?.code === 200 && res?.success) {
          const name = (res as any)?.data ?? '';
          setGroupName(String(name));
        } else {
          showToast(res.msg || res.message);
        }
      } catch {
        showToast('获取默认名称失败');
      }
    })();
  }, []);

  const loadList = useCallback(
    async (refresh: boolean) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoadingMore(true);
      }
      try {
        const offset = refresh ? 0 : deviceList.length;
        const res = await groupChooseList({
          offset,
          pageSize: PAGE_SIZE,
          id: derivedCurrentDeviceId || 0,
          lockName: lockNameFromRoute || undefined,
        } as any);

        if (res?.code === 200 && res?.success) {
          const data: any = res?.data || {};
          const rows: DeviceItem[] = Array.isArray(data.list)
            ? data.list
            : data.list ?? [];

          setTotal(Number(data.total || 0));
          setComplete(rows.length < PAGE_SIZE);

          setDeviceList(prev => {
            if (refresh) return rows;
            const exists = new Set(prev.map(it => it.id));
            const merged = [...prev];
            rows.forEach(it => {
              if (!exists.has(it.id)) merged.push(it);
            });
            return merged;
          });

          setSelectedDevices(prev => {
            if (refresh) {
              return derivedCurrentDeviceId ? [derivedCurrentDeviceId] : [];
            }
            if (
              derivedCurrentDeviceId &&
              !prev.includes(derivedCurrentDeviceId)
            ) {
              return [derivedCurrentDeviceId, ...prev];
            }
            return prev;
          });
        } else {
          showToast(res?.msg || res?.message);
        }
      } catch {
        showToast('加载设备列表失败');
      } finally {
        setInitialLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [derivedCurrentDeviceId, deviceList.length, lockNameFromRoute],
  );

  useEffect(() => {
    void loadList(true);
    const unsubscribe = navigation.addListener('focus', () => {
      void loadList(true);
    });
    return unsubscribe;
  }, [loadList, navigation]);

  const toggleDevice = useCallback(
    (deviceId: number) => {
      if (derivedCurrentDeviceId === deviceId) return;
      setSelectedDevices(prev => {
        const isSelected = prev.includes(deviceId);
        return isSelected
          ? prev.filter(d => d !== deviceId)
          : [...prev, deviceId];
      });
    },
    [derivedCurrentDeviceId],
  );

  const canCreate = useMemo(() => {
    return !!groupName?.trim() && selectedDevices.length > 1;
  }, [groupName, selectedDevices.length]);

  const handleCreateGroup = useCallback(async () => {
    if (!groupName?.trim()) {
      showToast('请填写设备名称');
      return;
    }
    if (selectedDevices.length < 2) {
      showToast('至少选择两个设备');
      return;
    }

    showLoading({ title: '创建中...' });
    try {
      const res = await saveGroup({
        ids: selectedDevices,
        lockName: groupName.trim(),
      } as any);
      hideLoading();
      if (res?.code === 200 && res?.success) {
        const groupId = (res as any)?.data ?? res;
        await setStorage({ key: 'createdGroupId', data: groupId });
        showToast('创建成功');
        navigation.navigate('MainTabs' as any, { screen: 'Multiple' } as any);
      } else {
        showToast(res?.msg || res?.message);
      }
    } catch {
      hideLoading();
      showToast('创建失败');
    }
  }, [groupName, navigation, selectedDevices]);

  const footer = (
    <View style={styles.pageFooter}>
      <Text style={styles.createToast}>至少添加两个设备</Text>
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.sureCreateBtn, !canCreate && styles.disabledBtn]}
        onPress={handleCreateGroup}
      >
        <Text style={styles.sureCreateBtnText}>确定创建</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem: ListRenderItem<DeviceItem> = useCallback(
    ({ item }) => {
      const checked =
        selectedDevices.includes(item.id) || derivedCurrentDeviceId === item.id;
      return (
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.deviceItem}
          onPress={() => toggleDevice(item.id)}
        >
          <Image
            source={{ uri: item.imageUrl || '' }}
            style={styles.deviceImg}
            resizeMode="contain"
          />
          <Text style={styles.itemName} numberOfLines={1}>
            {item.lockName || ''}
          </Text>
          <Image
            source={{
              uri: `https://g.18qjz.cn/img/boklock/${
                checked ? 'radio_checked' : 'radio_default'
              }.png`,
            }}
            style={styles.radioImg}
            resizeMode="contain"
          />
        </TouchableOpacity>
      );
    },
    [derivedCurrentDeviceId, selectedDevices, toggleDevice],
  );

  const empty = (
    <View style={styles.emptyContainer}>
      <Image
        source={{ uri: 'https://g.18qjz.cn/img/boklock/order_empty.png' }}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <Text style={styles.emptyText}>空空如也</Text>
    </View>
  );

  const listFooter = loadingMore ? (
    <View style={{ paddingVertical: 12 }}>
      <ActivityIndicator color="#333333" />
    </View>
  ) : null;

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      scrollable={false}
      pageNavProps={{
        text: '创建组合设备',
        showBack: true,
        background: '#FFFFFF',
      }}
      navBorder
      loading={initialLoading}
      footer={footer}
      padding={0}
    >
      <View style={styles.container}>
        <View style={styles.row}>
          <Text style={styles.label}>组合名称：</Text>
          <TextInput
            value={groupName}
            showClear
            placeholder="请输入"
            placeholderTextColor="#CCCCCC"
            style={styles.input}
            onChangeText={setGroupName}
          />
          <View style={{ marginLeft: 8 }}>
            <AppIcon name="redact" color="#333333" size={24} />
          </View>
        </View>

        <View style={styles.deviceSectionBox}>
          <Text style={styles.deviceSection}>选择设备：</Text>
          <Text style={styles.bindDeviceToast}>
            (仅市电款的地锁可创建组合设备)
          </Text>
        </View>

        <View style={styles.deviceContent}>
          {deviceList.length === 0 && !initialLoading ? (
            empty
          ) : (
            <FlatList
              data={deviceList}
              keyExtractor={item => String(item.id)}
              renderItem={renderItem}
              onEndReachedThreshold={0.3}
              onEndReached={() => {
                if (!refreshing && !loadingMore && !complete) {
                  void loadList(false);
                }
              }}
              refreshing={refreshing}
              onRefresh={() => void loadList(true)}
              ListFooterComponent={listFooter}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    flexDirection: 'column',
    alignItems: 'center',
    paddingLeft: 24,
    paddingRight: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333333',
    flexDirection: 'column',
    justifyContent: 'center',
    width: 88,
  },
  input: {
    flex: 1,
    fontSize: 14,
    textAlign: 'right',
  },
  deviceSectionBox: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deviceSection: {
    fontWeight: '700',
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    textAlign: 'left',
    marginTop: 16,
    marginBottom: 12,
  },
  bindDeviceToast: {
    height: 17,
    fontWeight: '400',
    fontSize: 12,
    color: '#ff873d',
    lineHeight: 17,
    textAlign: 'left',
  },
  deviceContent: {
    width: '100%',
    flex: 1,
  },
  deviceItem: {
    width: '100%',
    height: 60,
    backgroundColor: '#f7f7fb',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  deviceImg: {
    width: 36,
    height: 36,
  },
  itemName: {
    fontWeight: '700',
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    textAlign: 'left',
    flex: 1,
    paddingLeft: 12,
  },
  radioImg: {
    width: 20,
    height: 20,
  },
  pageFooter: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  createToast: {
    marginBottom: 12,
    fontWeight: '400',
    fontSize: 14,
    color: '#999999',
    lineHeight: 20,
    textAlign: 'center',
  },
  sureCreateBtn: {
    width: 196,
    height: 48,
    backgroundColor: '#333333',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sureCreateBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledBtn: {
    backgroundColor: '#999999',
  },
  emptyContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    marginTop: 50,
  },
  emptyImage: {
    width: 120,
    height: 120,
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 16,
  },
});
