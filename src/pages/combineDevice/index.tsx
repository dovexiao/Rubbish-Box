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
import { fontSize, px } from '@/utils/ui';

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
          showToast({ title: res.msg || res.message, icon: 'info' });
        }
      } catch {
        showToast({ title: '获取默认名称失败', icon: 'info' });
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
          showToast({ title: res?.msg || res?.message, icon: 'info' });
        }
      } catch {
        showToast({ title: '加载设备列表失败', icon: 'info' });
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
      showToast({ title: '请填写设备名称', icon: 'info' });
      return;
    }
    if (selectedDevices.length < 2) {
      showToast({ title: '至少选择两个设备', icon: 'info' });
      return;
    }

    showLoading({ title: '创建中...' });
    try {
      const res = await saveGroup({
        ids: selectedDevices,
        lockName: groupName.trim(),
      } as any);

      if (res?.code === 200 && res?.success) {
        const groupId = (res as any)?.data ?? res;
        await setStorage({ key: 'createdGroupId', data: groupId });
        hideLoading();
        showToast({ title: '创建成功', icon: 'success' });
        navigation.navigate('MainTabs' as any, { screen: 'Multiple' } as any);
      } else {
        hideLoading();
        showToast({ title: res?.msg || res?.message, icon: 'info' });
      }
    } catch {
      hideLoading();
      showToast({ title: '创建失败', icon: 'info' });
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
    <View style={{ paddingVertical: px(12) }}>
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
          <View style={{ marginLeft: px(8) }}>
            <AppIcon name="redact" color="#333333" size={px(24)} />
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
    paddingLeft: px(24),
    paddingRight: px(24),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: px(12),
  },
  label: {
    fontSize: fontSize(14),
    fontWeight: '700',
    color: '#333333',
    flexDirection: 'column',
    justifyContent: 'center',
    width: px(88),
  },
  input: {
    flex: 1,
    fontSize: fontSize(14),
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
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    textAlign: 'left',
    marginTop: px(16),
    marginBottom: px(12),
  },
  bindDeviceToast: {
    height: px(17),
    fontWeight: '400',
    fontSize: fontSize(12),
    color: '#ff873d',
    lineHeight: px(17),
    textAlign: 'left',
  },
  deviceContent: {
    width: '100%',
    flex: 1,
  },
  deviceItem: {
    width: '100%',
    height: px(60),
    backgroundColor: '#f7f7fb',
    borderRadius: px(12),
    padding: px(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: px(12),
  },
  deviceImg: {
    width: px(36),
    height: px(36),
  },
  itemName: {
    fontWeight: '700',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    textAlign: 'left',
    flex: 1,
    paddingLeft: px(12),
  },
  radioImg: {
    width: px(20),
    height: px(20),
  },
  pageFooter: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: px(8),
  },
  createToast: {
    marginBottom: px(12),
    fontWeight: '400',
    fontSize: fontSize(14),
    color: '#999999',
    lineHeight: px(20),
    textAlign: 'center',
  },
  sureCreateBtn: {
    width: px(196),
    height: px(48),
    backgroundColor: '#333333',
    borderRadius: px(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  sureCreateBtnText: {
    color: '#ffffff',
    fontSize: fontSize(16),
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
    marginTop: px(50),
  },
  emptyImage: {
    width: px(120),
    height: px(120),
  },
  emptyText: {
    fontSize: fontSize(14),
    color: '#666666',
    marginTop: px(16),
  },
});
