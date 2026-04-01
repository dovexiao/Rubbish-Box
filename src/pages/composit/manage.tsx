import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageStyle,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Flex from '@/components/Flex';
import AppIcon from '@/components/AppIcon';
import { PageContainer, PopConfirm, Popup, TextInput } from '@/components';
import { groupSubList, saveGroup, groupChooseList } from '@/services/combine';
import { ListItem, AddListItem } from './typing';
import { styles } from './manageStyle';
import AnimationPop, { AnimationPopRef } from '@/components/AnimationPop';
import { PopConfirmRef } from '@/components/popConfirm';
import { hideLoading, showLoading, showToast } from '@/utils';

type RouteParams = {
  lockId?: number | string;
};

const PAGE_SIZE = 20;

const ManageComposite = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const lockId: number | string | undefined = route.params?.lockId;

  const [list, setList] = useState<ListItem[]>([]);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lockName, setLockName] = useState('');
  const [currentRow, setCurrentRow] = useState<ListItem | null>(null);
  const [chooseList, setChooseList] = useState<AddListItem[]>([]);
  const [chooseLoading, setChooseLoading] = useState(false);

  const addIdsRef = useRef<Set<number>>(new Set());
  const removeIdsRef = useRef<Set<number>>(new Set());
  const hasInitLockNameRef = useRef(false);
  const [addDeviceVisible, setAddDeviceVisible] = useState(false);
  const deleteConfirmRef = useRef<PopConfirmRef>(null);

  const canLoadMore = useMemo(
    () => !loading && !complete && !!lockId,
    [loading, complete, lockId],
  );

  const loadList = useCallback(
    async (refresh: boolean) => {
      if (!lockId) return;
      if (loading) return;

      setLoading(true);
      try {
        const offset = refresh ? 0 : list.length;
        const res = await groupSubList({
          id: lockId,
          pageSize: PAGE_SIZE,
          offset,
        } as any);

        if (res.code === 200 && res.success) {
          const data: any = res.data || {};
          const rows: ListItem[] = Array.isArray(data.list)
            ? data.list
            : data.list ?? [];
          setList(prev => (refresh ? rows : [...prev, ...rows]));
          setComplete(rows.length < PAGE_SIZE);
          // 只在首次加载时用接口返回的名称初始化，后续不再覆盖用户输入
          if (
            !hasInitLockNameRef.current &&
            typeof data.lockName === 'string'
          ) {
            setLockName(data.lockName);
            hasInitLockNameRef.current = true;
          }
        } else {
          showToast({
            title: res.msg || res.message || '加载组合设备失败',
            icon: 'info',
          });
        }
      } catch (e) {
        showToast({ title: '加载组合设备失败', icon: 'info' });
      } finally {
        setLoading(false);
      }
    },
    [lockId],
  );

  useEffect(() => {
    void loadList(true);
  }, [loadList]);

  const handleDelete = useCallback(() => {
    if (!currentRow) return;
    if (list.length <= 2) {
      showToast({ title: '移除失败，组合设备至少保留两个设备', icon: 'info' });
      return;
    }

    if (currentRow.isNew) {
      addIdsRef.current.delete(currentRow.id as number);
    } else {
      removeIdsRef.current.add(currentRow.id as number);
    }

    setList(prev => prev.filter(item => item.id !== currentRow.id));
    setCurrentRow(null);
    deleteConfirmRef.current?.close();
    showToast({ title: '删除成功', icon: 'success' });
  }, [currentRow, list.length]);

  const openAddPopup = useCallback(async () => {
    setAddDeviceVisible(true);
    if (chooseList.length > 0 || chooseLoading) return;

    try {
      setChooseLoading(true);
      const res = await groupChooseList({
        pageSize: 50,
        offset: 0,
      } as any);

      if (res.code === 200 && res.success) {
        const data: any = res.data || {};
        const rows: AddListItem[] = Array.isArray(data.list)
          ? data.list
          : data.list ?? [];
        const exists = new Set(list.map(item => item.id));
        setChooseList(
          rows.map(item => ({
            ...item,
            checked: exists.has(item.id),
          })),
        );
      } else {
        showToast({
          title: res.msg || res.message || '加载可选设备失败',
          icon: 'info',
        });
      }
    } catch (e) {
      showToast({ title: '加载可选设备失败', icon: 'info' });
    } finally {
      setChooseLoading(false);
    }
  }, [chooseList.length, chooseLoading, list]);

  const toggleChooseItem = useCallback((item: AddListItem) => {
    setChooseList(prev =>
      prev.map(it =>
        it.id === item.id
          ? {
              ...it,
              checked: !it.checked,
            }
          : it,
      ),
    );
  }, []);

  const handleAddConfirm = useCallback(() => {
    const selected = chooseList.filter(item => item.checked);
    if (selected.length === 0) {
      setAddDeviceVisible(false);
      return;
    }

    const currentIds = new Set(list.map(item => item.id));
    const newItems: ListItem[] = [];

    selected.forEach(item => {
      if (!currentIds.has(item.id)) {
        addIdsRef.current.add(item.id as number);
        newItems.push({
          ...(item as any),
          isNew: true,
        } as any);
      }
    });

    if (newItems.length > 0) {
      setList(prev => [...newItems, ...prev]);
    }
    setAddDeviceVisible(false);
  }, [chooseList, list]);

  const handleSubmit = useCallback(async () => {
    if (!lockId) {
      showToast({ title: '缺少组合设备编号', icon: 'info' });
      return;
    }
    if (!lockName?.trim()) {
      showToast({ title: '请输入组合名称', icon: 'info' });
      return;
    }

    const ids = Array.from(addIdsRef.current);
    const delIds = Array.from(removeIdsRef.current);

    showLoading({ title: '保存中...' });
    try {
      const res = await saveGroup({
        id: lockId,
        lockName: lockName.trim(),
        ids,
        delIds,
      } as any);
      hideLoading();
      if (res.code === 200 && res.success) {
        hideLoading();
        showToast({ title: '保存成功', icon: 'success' });
        navigation.goBack();
      } else {
        hideLoading();
        showToast({
          title: res.msg || res.message || '保存失败',
          icon: 'info',
        });
      }
    } catch (e) {
      hideLoading();
      showToast({ title: '保存失败', icon: 'info' });
    }
  }, [lockId, lockName, navigation]);

  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    return (
      <Flex key={item.id} justify="between" align="center" style={styles.card}>
        <Image
          source={{ uri: item.imageUrl }}
          style={{ width: 36, height: 36 } as ImageStyle}
        />
        <Text
          numberOfLines={1}
          style={[styles.username, { flex: 1, marginLeft: 12 }]}
        >
          {item.lockName}
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => {
            setCurrentRow(item);
            deleteConfirmRef.current?.open();
          }}
        >
          <Image
            source={{
              uri: 'https://g.18qjz.cn/img/boklock/icon_delete.png',
            }}
            style={{ width: 20, height: 20 } as ImageStyle}
          />
        </TouchableOpacity>
      </Flex>
    );
  }, []);

  const keyExtractor = useCallback(
    (item: ListItem, index: number) => String(item.id ?? index),
    [],
  );

  const hasSelectedInPopup = useMemo(
    () => chooseList.some(item => item.checked),
    [chooseList],
  );

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      scrollable={false}
      pageNavProps={{
        text: '编辑组合设备',
        showBack: true,
        background: '#FFFFFF',
      }}
      footer={
        <Flex
          justify="center"
          style={[styles.btnContainerWrapper, { paddingHorizontal: 16 }]}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              width: 188,
              backgroundColor: '#333333',
              borderRadius: 16,
              height: 48,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={() => {
              void handleSubmit();
            }}
          >
            <Text style={styles.buttonTitle}>保存</Text>
          </TouchableOpacity>
        </Flex>
      }
    >
      <View style={{ flex: 1 }}>
        <View>
          <Flex justify="between" align="center" style={styles.itemContent}>
            <Text style={styles.label}>组合名称：</Text>
            <TextInput
              style={[styles.input, { flex: 1, marginLeft: 8, marginRight: 2 }]}
              placeholder="请输入组合名称"
              placeholderTextColor="#CCCCCC"
              value={lockName}
              onChangeText={setLockName}
              showClear
            />
            <AppIcon name="pen24" size={24} color="#333333" />
          </Flex>
          <Flex justify="between" align="center" style={styles.itemContent}>
            <Text style={styles.label}>选择设备组合：</Text>
            <Flex
              direction="row"
              justify="center"
              align="center"
              style={styles.addBox}
              isTouchView
              onPress={() => {
                void openAddPopup();
              }}
            >
              <Text style={styles.addBtnText}>新增【市电款】设备</Text>
              <AppIcon name="add" size={12} color="#333333" />
            </Flex>
          </Flex>
        </View>

        <View style={{ flex: 1 }}>
          <FlatList
            data={list}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            onEndReachedThreshold={0.2}
            onEndReached={() => {
              if (canLoadMore) {
                void loadList(false);
              }
            }}
          />
        </View>
      </View>

      {/* 删除确认弹窗 */}

      <PopConfirm
        ref={deleteConfirmRef}
        title={'确定要移除此地锁吗？'}
        onConfirm={() => {
          handleDelete();
        }}
        confirmText="移除"
        cancelText="保留"
        onCancel={() => {
          deleteConfirmRef.current?.close();
          setCurrentRow(null);
        }}
      />

      {/* 新增设备弹窗 */}
      <Popup
        visible={addDeviceVisible}
        showClose={false}
        onClose={() => setAddDeviceVisible(false)}
      >
        <View style={{ paddingTop: 16 }}>
          <Flex
            direction="row"
            justify="between"
            align="start"
            style={styles.paddingH16}
          >
            <Text style={{ width: 24, height: 24 }}></Text>
            <Text style={styles.popTitle}>新增【市电款】设备</Text>
            <AppIcon
              onPress={() => setAddDeviceVisible(false)}
              name={'close'}
              size={24}
              color={'#333333'}
            />
          </Flex>
          <Text style={styles.popSubTip}>仅可选择未被使用的地锁</Text>
          <View style={{ flex: 1 }}>
            {chooseLoading ? (
              <Text style={{ textAlign: 'center', marginTop: 16 }}>
                加载中...
              </Text>
            ) : (
              <FlatList
                // style={{ backgroundColor: '#f12345' }}
                data={chooseList}
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
                      style={{ width: 36, height: 36 } as ImageStyle}
                    />
                    <Text
                      numberOfLines={1}
                      style={[styles.username, { flex: 1, marginLeft: 12 }]}
                    >
                      {item.lockName}
                    </Text>
                    <Image
                      source={{
                        uri: item.checked
                          ? 'https://g.18qjz.cn/img/boklock/radio_checked.png'
                          : 'https://g.18qjz.cn/img/boklock/radio_default.png',
                      }}
                      style={{ width: 20, height: 20 } as ImageStyle}
                    />
                  </Flex>
                )}
                ListEmptyComponent={
                  <Flex
                    justify="center"
                    align="center"
                    style={{ marginTop: 32 }}
                  >
                    <Image
                      source={{
                        uri: 'https://g.18qjz.cn/img/boklock/empty.png',
                      }}
                      style={{ width: 80, height: 80 } as ImageStyle}
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
};

export default ManageComposite;
