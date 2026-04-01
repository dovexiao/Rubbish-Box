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
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { PageContainer } from '@/components';
import PopConfirm from '@/components/popConfirm';
import AppIcon from '@/components/AppIcon';
import { deleteStaff, getStaffList } from '@/services/user';
import styles from './styles';
import GradientButton from '@/components/GradientButton';
import { showToast } from '@/utils';

type StaffItem = {
  id: number;
  userId?: number;
  username: string;
  mobile: string;
};

const PAGE_SIZE = 20;

export default function MemberList() {
  const navigation = useNavigation<any>();

  const [list, setList] = useState<StaffItem[]>([]);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [currentRow, setCurrentRow] = useState<StaffItem | null>(null);

  const deleteRef = useRef<any>(null);

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
        const res = await getStaffList({
          pageSize: PAGE_SIZE,
          offset,
        });

        if (res.code === 200 && res.success) {
          const data = (res.data || {}) as any;
          const rows: StaffItem[] = Array.isArray(data.list)
            ? data.list
            : data.list ?? [];
          setList(prev => (refresh ? rows : [...prev, ...rows]));
          setComplete(rows.length < PAGE_SIZE);
        } else {
          showToast({
            title: res.msg || res.message || '获取成员列表失败',
            icon: 'info',
          });
        }
      } catch (e) {
        showToast({ title: '获取成员列表失败', icon: 'info' });
      } finally {
        setLoading(false);
        setRefreshing(false);
        setInitialLoading(false);
      }
    },
    [list.length, loading],
  );

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      void loadData(true);
    });
    return unsubscribe;
  }, [navigation, loadData]);

  const handleLoadMore = useCallback(() => {
    if (!loading && !complete && list.length > 0) {
      void loadData(false);
    }
  }, [loading, complete, list.length, loadData]);

  const handleRefresh = useCallback(() => {
    void loadData(true);
  }, [loadData]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!currentRow) return false;
    try {
      const res = await deleteStaff({ id: currentRow.id });
      if (res.code === 200 && res.success) {
        showToast({ title: '删除成功', icon: 'info' });
        setList(prev => prev.filter(item => item.id !== currentRow.id));
        setCurrentRow(null);
        return true;
      }
      showToast({ title: res.msg || res.message || '删除失败', icon: 'info' });
      return false;
    } catch (e) {
      showToast({ title: '删除失败', icon: 'info' });
      return false;
    }
  }, [currentRow]);

  const renderItem: ListRenderItem<StaffItem> = useCallback(({ item }) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.card}
        onPress={() => {
          // 这里可以跳转到成员编辑页面，后续根据需要实现
          navigation.navigate('AddMember', { id: item.id });
        }}
      >
        <View style={styles.row}>
          <Text style={styles.username}>{item.username}</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.editRow}
            onPress={e => {
              // 阻止事件继续冒泡到外层卡片
              e.stopPropagation?.();
              navigation.navigate('AddMember', { id: item.id });
            }}
          >
            <Text style={styles.username}>编辑</Text>
            <AppIcon name="a-headfor-20" size={12} color="#333333" />
          </TouchableOpacity>
        </View>

        <View style={[styles.row, { marginTop: 10 }]}>
          <Text style={styles.mobile}>{item.mobile}</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={e => {
              e.stopPropagation?.();
              setCurrentRow(item);
              deleteRef.current?.open();
            }}
          >
            <Text style={styles.removeText}>移除</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }, []);

  const keyExtractor = useCallback(
    (item: StaffItem) => String(item.id ?? item.mobile),
    [],
  );

  const listEmptyComponent = useMemo(() => {
    return (
      <View style={styles.emptyContainer}>
        <Image
          source={{ uri: 'https://g.18qjz.cn/img/boklock/empty.png' }}
          resizeMode="contain"
          style={{ width: 80, height: 80 }}
        />
        <Text style={styles.emptyText}>暂无成员</Text>
      </View>
    );
  }, []);

  return (
    <PageContainer
      backgroundColor="#F6F7FA"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      scrollable={false}
      pageNavProps={{
        text: '成员管理',
        showBack: true,
        background: '#FFFFFF',
      }}
      // loading={initialLoading}
      footer={
        <View style={styles.footer}>
          <GradientButton
            btnBorderRadius={16}
            width={196}
            height={48}
            colors={['#4A4A4A', '#282828']}
            style={styles.buttonWrap}
            onPress={() => {
              navigation.navigate('AddMember');
            }}
          >
            <Text style={styles.addButtonText}>添加成员</Text>
          </GradientButton>
        </View>
      }
    >
      <View style={styles.container}>
        <FlatList
          data={list}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={listEmptyComponent}
        />

        <PopConfirm
          ref={deleteRef}
          textWeight="bold"
          title={`确定要移除【${currentRow?.username ?? ''}】吗？`}
          onConfirm={handleDeleteConfirm}
        />
      </View>
    </PageContainer>
  );
}
