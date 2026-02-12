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
import { Toast } from '@ant-design/react-native';
import Flex from '@/components/Flex';
import IconFont from '@/iconfont';
import Popup from '@/components/Popup';
import { PageContainer, TextInput } from '@/components';
import { groupSubList, saveGroup, groupChooseList } from '@/services/combine';
import { ListItem, AddListItem } from './typing';
import { styles } from './manageStyle';

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

  const [deleteVisible, setDeleteVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);

  const [chooseList, setChooseList] = useState<AddListItem[]>([]);
  const [chooseLoading, setChooseLoading] = useState(false);

  const addIdsRef = useRef<Set<number>>(new Set());
  const removeIdsRef = useRef<Set<number>>(new Set());
  const hasInitLockNameRef = useRef(false);

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
          Toast.fail(res.msg || res.message || '加载组合设备失败');
        }
      } catch (e) {
        Toast.fail('加载组合设备失败');
      } finally {
        setLoading(false);
      }
    },
    [lockId, list.length, loading],
  );

  useEffect(() => {
    void loadList(true);
  }, [loadList]);

  const handleDelete = useCallback(() => {
    if (!currentRow) return;
    if (list.length <= 2) {
      Toast.fail('移除失败，组合设备至少保留两个设备');
      return;
    }

    if (currentRow.isNew) {
      addIdsRef.current.delete(currentRow.id as number);
    } else {
      removeIdsRef.current.add(currentRow.id as number);
    }

    setList(prev => prev.filter(item => item.id !== currentRow.id));
    setCurrentRow(null);
    setDeleteVisible(false);
    Toast.success('删除成功');
  }, [currentRow, list.length]);

  const openAddPopup = useCallback(async () => {
    setAddVisible(true);
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
        Toast.fail(res.msg || res.message || '加载可选设备失败');
      }
    } catch (e) {
      Toast.fail('加载可选设备失败');
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
      setAddVisible(false);
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
    setAddVisible(false);
  }, [chooseList, list]);

  const handleSubmit = useCallback(async () => {
    if (!lockId) {
      Toast.fail('缺少组合设备编号');
      return;
    }
    if (!lockName?.trim()) {
      Toast.fail('请输入组合名称');
      return;
    }

    const ids = Array.from(addIdsRef.current);
    const delIds = Array.from(removeIdsRef.current);

    const toastKey = Toast.loading('保存中...', 0);
    try {
      const res = await saveGroup({
        id: lockId,
        lockName: lockName.trim(),
        ids,
        delIds,
      } as any);

      if (res.code === 200 && res.success) {
        Toast.success('保存成功');
        navigation.goBack();
      } else {
        Toast.fail(res.msg || res.message || '保存失败');
      }
    } catch (e) {
      Toast.fail('保存失败');
    } finally {
      Toast.remove(toastKey as any);
    }
  }, [lockId, lockName, navigation]);

  const renderItem = useCallback(({ item }: { item: ListItem }) => {
    return (
      <Flex key={item.id} justify="between" align="center" style={styles.card}>
        <Image
          source={item.imageUrl ? { uri: String(item.imageUrl) } : undefined}
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
            setDeleteVisible(true);
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
              style={[styles.input, { flex: 1, marginLeft: 8 }]}
              placeholder="请输入组合名称"
              placeholderTextColor="#CCCCCC"
              value={lockName}
              onChangeText={setLockName}
              showClear
            />
            <IconFont name="redact" size={20} color="#CCCCCC" />
          </Flex>
          <Flex
            justify="between"
            align="center"
            style={{ marginTop: 12, ...styles.itemContent }}
          >
            <Text style={styles.label}>选择设备组合：</Text>
            <Flex
              align="center"
              style={styles.addBox}
              isTouchView
              onPress={() => {
                void openAddPopup();
              }}
            >
              <Text style={styles.addBtnText}>新增【市电款】设备</Text>
              <IconFont name="add" size={12} color="#333333" />
            </Flex>
          </Flex>
        </View>

        <View style={{ flex: 1, marginTop: 16 }}>
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
      <Popup
        visible={deleteVisible}
        title={
          currentRow
            ? `确定要移除此地锁【${currentRow.lockName}】吗？`
            : '确定要移除此地锁吗？'
        }
        onClose={() => {
          setDeleteVisible(false);
          setCurrentRow(null);
        }}
      >
        <View>
          <Text style={styles.popSubTip}>删除后该设备将不再属于此组合</Text>
          <Flex
            justify="center"
            align="center"
            style={styles.btnContainerWrapper}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.btnContainer,
                styles.btnContainerClose,
                { marginRight: 12 },
              ]}
              onPress={() => {
                setDeleteVisible(false);
                setCurrentRow(null);
              }}
            >
              <Text style={styles.btnContainerCloseText}>保留</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.btnContainer, styles.btnContainerConfirm]}
              onPress={() => {
                handleDelete();
              }}
            >
              <Text style={styles.btnContainerConfirmText}>移除</Text>
            </TouchableOpacity>
          </Flex>
        </View>
      </Popup>

      {/* 新增设备弹窗 */}
      <Popup
        visible={addVisible}
        title="新增设备"
        onClose={() => setAddVisible(false)}
      >
        <View>
          <Text style={styles.popSubTip}>仅可选择未被使用的地锁</Text>
          <View style={{ maxHeight: 400, marginTop: 16 }}>
            {chooseLoading ? (
              <Text style={{ textAlign: 'center', marginTop: 16 }}>
                加载中...
              </Text>
            ) : (
              <FlatList
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
                      source={
                        item.imageUrl
                          ? { uri: String(item.imageUrl) }
                          : undefined
                      }
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
            justify="center"
            align="center"
            style={styles.btnContainerWrapper}
          >
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.btnContainer,
                styles.btnContainerClose,
                { marginRight: 12 },
              ]}
              onPress={() => setAddVisible(false)}
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
