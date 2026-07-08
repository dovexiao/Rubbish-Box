import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  ImageStyle,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PageContainer, TextInput, Flex, Popup } from '@/components';
import AppIcon from '@/components/AppIcon';
import { useRoute } from '@react-navigation/native';
import { defaultName, groupChooseList, saveGroup } from '@/services';
import { hideLoading, setStorage, showLoading, showToast } from '@/utils';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { px } from '@/utils/ui';
import { styles } from './styles';
import IconFont from '@/iconfont';

type DeviceItem = {
  id: number;
  lockName?: string;
  imageUrl?: string;
  checked?: boolean;
};

export default function CombineDeviece() {
  const navigation = useAppNavigation();
  const route = useRoute<any>();
  const deviceSn = route.params?.deviceSn ?? '';

  const [groupName, setGroupName] = useState('');
  const [deviceList, setDeviceList] = useState<DeviceItem[]>([]);
  const [addDeviceVisible, setAddDeviceVisible] = useState(false);
  const [chooseList, setChooseList] = useState<DeviceItem[]>([]);
  const [chooseLoading, setChooseLoading] = useState(false);

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

  const canCreate = useMemo(() => {
    return !!groupName?.trim() && deviceList.length > 1;
  }, [groupName, deviceList.length]);

  const hasSelectedInPopup = useMemo(
    () => chooseList.some(item => item.checked),
    [chooseList],
  );

  const syncChooseChecked = useCallback(
    (rows: DeviceItem[]) => {
      const exists = new Set(deviceList.map(item => item.id));
      return rows.map(item => ({
        ...item,
        checked: exists.has(item.id),
      }));
    },
    [deviceList],
  );

  const openAddPopup = useCallback(async () => {
    setAddDeviceVisible(true);

    if (chooseList.length > 0) {
      setChooseList(prev => syncChooseChecked(prev));
      return;
    }
    if (chooseLoading) return;

    try {
      setChooseLoading(true);
      const res = await groupChooseList({
        pageSize: 50,
        offset: 0,
      } as any);

      if (res.code === 200 && res.success) {
        const data: any = res.data || {};
        const rows: DeviceItem[] = Array.isArray(data.list)
          ? data.list
          : data.list ?? [];
        setChooseList(syncChooseChecked(rows));
      } else {
        showToast({
          title: res.msg || res.message || '加载可选设备失败',
          icon: 'info',
        });
      }
    } catch {
      showToast({ title: '加载可选设备失败', icon: 'info' });
    } finally {
      setChooseLoading(false);
    }
  }, [chooseList.length, chooseLoading, syncChooseChecked]);

  const toggleChooseItem = useCallback((item: DeviceItem) => {
    setChooseList(prev =>
      prev.map(it =>
        it.id === item.id ? { ...it, checked: !it.checked } : it,
      ),
    );
  }, []);

  const handleAddConfirm = useCallback(() => {
    const selected = chooseList.filter(item => item.checked);
    if (selected.length === 0) {
      setAddDeviceVisible(false);
      return;
    }

    const currentIds = new Set(deviceList.map(item => item.id));
    const newItems = selected.filter(item => !currentIds.has(item.id));

    if (newItems.length > 0) {
      setDeviceList(prev => [...newItems, ...prev]);
    }
    setAddDeviceVisible(false);
  }, [chooseList, deviceList]);

  const handleRemoveDevice = useCallback((id: number) => {
    setDeviceList(prev => prev.filter(item => item.id !== id));
    setChooseList(prev =>
      prev.map(it => (it.id === id ? { ...it, checked: false } : it)),
    );
  }, []);

  const handleCreateGroup = useCallback(async () => {
    if (!groupName?.trim()) {
      showToast({ title: '请填写设备名称', icon: 'info' });
      return;
    }
    if (deviceList.length < 2) {
      showToast({ title: '至少选择两个设备', icon: 'info' });
      return;
    }

    showLoading({ title: '创建中...' });
    try {
      const params: any = {
        ids: deviceList.map(item => item.id),
        lockName: groupName.trim(),
      };

      if (deviceSn) {
        params.gatewayKeySn = deviceSn;
      }

      const res = await saveGroup({
        ...params,
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
  }, [groupName, navigation, deviceList]);

  const renderItem = useCallback(
    ({ item }: { item: DeviceItem }) => {
      return (
        <Flex justify="between" align="center" style={styles.deviceItem}>
          <Image
            source={{ uri: item.imageUrl || '' }}
            style={{ width: px(36), height: px(36) } as ImageStyle}
          />
          <Text
            numberOfLines={1}
            style={[styles.username, { flex: 1, marginLeft: px(12) }]}
          >
            {item.lockName || ''}
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleRemoveDevice(item.id)}
          >
            <Image
              source={{
                uri: 'https://g.18qjz.cn/img/boklock/icon_delete.png',
              }}
              style={{ width: px(20), height: px(20) } as ImageStyle}
            />
          </TouchableOpacity>
        </Flex>
      );
    },
    [handleRemoveDevice],
  );

  const keyExtractor = useCallback(
    (item: DeviceItem, index: number) => String(item.id ?? index),
    [],
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

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      scrollable={false}
      pageNavProps={{
        customTitle: (
          <View style={styles.navTitle}>
            <Text style={styles.navTitleText}>创建组合设备</Text>
            {deviceSn ? (
              <View style={styles.gatewayName}>
                <Text style={styles.gatewayNameText}>433网关</Text>
              </View>
            ) : null}
          </View>
        ),
        showBack: true,
        background: '#FFFFFF',
      }}
      navBorder
      footer={footer}
      padding={0}
    >
      <View style={styles.container}>
        {deviceSn ? (
          <View style={styles.row}>
            <Text style={styles.label}>设备编号：</Text>
            <Text style={styles.value}>{deviceSn}</Text>
          </View>
        ) : null}
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
          <TouchableOpacity
            style={styles.roundBg}
            onPress={() => {
              void openAddPopup();
            }}
          >
            <Text style={styles.labels}>新增设备</Text>
            <IconFont name="add" size={14} color="#333333" />
          </TouchableOpacity>
        </View>

        <View style={styles.deviceContent}>
          {deviceList.length === 0 ? (
            empty
          ) : (
            <FlatList
              data={deviceList}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>

      <Popup
        visible={addDeviceVisible}
        showClose={false}
        onClose={() => setAddDeviceVisible(false)}
      >
        <View style={{ paddingTop: px(16) }}>
          <Flex
            direction="row"
            justify="between"
            align="start"
            style={styles.paddingH16}
          >
            <Text style={{ width: px(24), height: px(24) }}></Text>
            <Text style={styles.popTitle}>新增【市电款】设备</Text>
            <AppIcon
              onPress={() => setAddDeviceVisible(false)}
              name={'close'}
              size={px(24)}
              color={'#333333'}
            />
          </Flex>
          <Text style={styles.popSubTip}>仅可选择未被使用的地锁</Text>
          <View style={{ flex: 1 }}>
            {chooseLoading ? (
              <Text style={{ textAlign: 'center', marginTop: px(16) }}>
                加载中...
              </Text>
            ) : (
              <FlatList
                data={chooseList}
                style={{ maxHeight: px(200) }}
                keyExtractor={(item, index) => String(item.id ?? index)}
                renderItem={({ item }) => (
                  <Flex
                    justify="between"
                    align="center"
                    style={styles.card}
                    isTouchView
                    onPress={() => toggleChooseItem(item)}
                  >
                    <Image
                      source={{
                        uri: item.imageUrl,
                      }}
                      style={{ width: px(36), height: px(36) } as ImageStyle}
                    />
                    <Text
                      numberOfLines={1}
                      style={[styles.username, { flex: 1, marginLeft: px(12) }]}
                    >
                      {item.lockName}
                    </Text>
                    <Image
                      source={{
                        uri: item.checked
                          ? 'https://g.18qjz.cn/img/boklock/radio_checked.png'
                          : 'https://g.18qjz.cn/img/boklock/radio_default.png',
                      }}
                      style={{ width: px(20), height: px(20) } as ImageStyle}
                    />
                  </Flex>
                )}
                ListEmptyComponent={
                  <Flex
                    justify="center"
                    align="center"
                    style={{ marginTop: px(32) }}
                  >
                    <Image
                      source={{
                        uri: 'https://g.18qjz.cn/img/boklock/empty.png',
                      }}
                      style={{ width: px(80), height: px(80) } as ImageStyle}
                    />
                  </Flex>
                }
              />
            )}
          </View>

          <Flex
            justify="between"
            align="center"
            style={[styles.btnContainerWrapper, styles.paddingH16]}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.btnContainer, styles.btnContainerClose]}
              onPress={() => setAddDeviceVisible(false)}
            >
              <Text style={styles.btnContainerCloseText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.btnContainer,
                {
                  backgroundColor: hasSelectedInPopup ? '#333333' : '#999999',
                },
              ]}
              disabled={!hasSelectedInPopup}
              onPress={handleAddConfirm}
            >
              <Text style={styles.btnContainerConfirmText}>确定</Text>
            </TouchableOpacity>
          </Flex>
        </View>
      </Popup>
    </PageContainer>
  );
}
