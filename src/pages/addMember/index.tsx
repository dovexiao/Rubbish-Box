import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  ListRenderItem,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { PageContainer } from '@/components';
import LockItem from './com/lockItem';
import { modifyStaff, staffDetail, staffLockList } from '@/services/user';
import { hideLoading, mobileExp, showLoading, showToast } from '@/utils';
import GradientButton from '@/components/GradientButton';
import styles from './styles';

type ListItem = {
  id: number | null;
  userId: number | null;
  username: string;
  mobile: string;
};

type LockListItem = {
  id: number | null;
  lockName: string;
  lockType: number | null;
  lockTypeName: string;
  groupCount: number | null;
  isBind: boolean;
  isForever: boolean;
  endTime: number | null;
  imageUrl: string;
};

const PAGE_SIZE = 20;

export default function AddMember() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const memberId: number | undefined = route.params?.id
    ? Number(route.params.id)
    : undefined;

  const [info, setInfo] = useState<ListItem | null>(null);
  const [locks, setLocks] = useState<LockListItem[]>([]);
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  const hasSelected = useMemo(() => locks.some(item => item.isBind), [locks]);

  const disabled = useMemo(() => {
    if (!info) return true;
    if (!info.username || !info.mobile) return true;
    if (!mobileExp(info.mobile)) return true;
    if (!hasSelected) return true;
    return false;
  }, [info, hasSelected]);

  const loadDetail = useCallback(async () => {
    if (!memberId) {
      // 新增成员，不需要请求详情，只初始化空对象
      setInfo({
        id: null,
        userId: null,
        username: '',
        mobile: '',
      });
      return;
    }

    const res = await staffDetail({ id: memberId });
    if (res.code === 200 && res.success) {
      setInfo(res.data as ListItem);
    } else {
      showToast(res.msg || res.message || '获取成员详情失败');
    }
  }, [memberId]);

  const loadLocks = useCallback(
    async (refresh: boolean) => {
      if (loading) return;

      if (refresh) {
        setInitialLoading(true);
      } else {
        setLoading(true);
      }

      try {
        const offset = refresh ? 0 : locks.length;
        const res = await staffLockList({
          id: memberId,
          pageSize: PAGE_SIZE,
          offset,
        });

        if (res.code === 200 && res.success) {
          const data = (res.data || {}) as any;
          const rows: LockListItem[] = Array.isArray(data.list)
            ? data.list
            : data.list ?? [];
          setLocks(prev => (refresh ? rows : [...prev, ...rows]));
          setComplete(rows.length < PAGE_SIZE);
        } else {
          showToast(res.msg || res.message || '获取地锁列表失败');
        }
      } catch (e) {
        showToast('获取地锁列表失败');
      } finally {
        setLoading(false);
        setInitialLoading(false);
      }
    },
    [locks.length, memberId, loading],
  );

  useEffect(() => {
    void (async () => {
      setInitialLoading(true);
      try {
        await loadDetail();
        await loadLocks(true);
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [loadDetail, loadLocks]);

  const handleUpdateLock = useCallback((next: LockListItem) => {
    setLocks(prev => prev.map(item => (item.id === next.id ? next : item)));
  }, []);

  const handleSubmit = useCallback(async () => {
    showLoading({ title: '提交中...' });
    if (!info) return;

    if (!info.username) {
      showToast('请输入成员昵称');
      return;
    }

    if (!info.mobile) {
      showToast('请输入手机号');
      return;
    }

    if (!mobileExp(info.mobile)) {
      showToast('请输入正确的手机号');
      return;
    }

    const selectedLocks = locks.filter(item => item.isBind);
    if (selectedLocks.length === 0) {
      showToast('至少选择一个地锁');
      return;
    }

    try {
      const res = await modifyStaff({
        ...info,
        lockList: selectedLocks,
        pageSize: PAGE_SIZE,
        offset: locks.length ?? 0,
      });
      console.log(res, '===res');

      if (res.code === 200 && res.success) {
        hideLoading();
        showToast('操作成功');
        navigation.goBack();
      } else {
        hideLoading();
        showToast(res.msg || res.message || '操作失败');
      }
    } catch (e) {
      hideLoading();
      showToast('操作失败');
    }
  }, [info, locks, navigation]);

  const renderLockItem: ListRenderItem<LockListItem> = useCallback(
    ({ item }) => {
      return <LockItem data={item} onChange={handleUpdateLock} />;
    },
    [handleUpdateLock],
  );

  const keyExtractor = useCallback(
    (item: LockListItem, index: number) => String(item.id ?? index),
    [],
  );

  const title = useMemo(() => (memberId ? '编辑成员' : '新增成员'), [memberId]);

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
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      scrollable={false}
      pageNavProps={{
        text: title,
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
            colors={disabled ? ['#999999', '#999999'] : ['#333333', '#333333']}
            style={styles.submitButton}
            onPress={() => {
              if (!disabled) {
                void handleSubmit();
              }
            }}
          >
            <Text style={styles.submitButtonText}>
              {memberId ? '确定编辑' : '确定新增'}
            </Text>
          </GradientButton>
        </View>
      }
    >
      <View style={styles.container}>
        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>成员昵称</Text>
          <TextInput
            value={info?.username ?? ''}
            placeholder="请输入"
            placeholderTextColor="#CCCCCC"
            style={styles.fieldInput}
            textAlign="right"
            onChangeText={text =>
              setInfo(prev => (prev ? { ...prev, username: text } : prev))
            }
          />
        </View>

        <View style={styles.fieldRow}>
          <Text style={styles.fieldLabel}>成员手机号码</Text>
          <TextInput
            value={info?.mobile ?? ''}
            placeholder="请输入"
            placeholderTextColor="#CCCCCC"
            style={styles.fieldInput}
            textAlign="right"
            keyboardType="number-pad"
            maxLength={11}
            onChangeText={text =>
              setInfo(prev => (prev ? { ...prev, mobile: text } : prev))
            }
          />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>授权操作地锁</Text>
        </View>

        <FlatList
          data={locks}
          keyExtractor={keyExtractor}
          renderItem={renderLockItem}
          contentContainerStyle={styles.lockListContent}
          ListEmptyComponent={listEmptyComponent}
        />
      </View>
    </PageContainer>
  );
}
