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
  TextInput,
  View,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { PageContainer } from '@/components';
import LockItem from './com/lockItem';
import { modifyStaff, staffDetail, staffLockList } from '@/services/user';
import {
  eventCenter,
  hideLoading,
  mobileExp,
  showLoading,
  showToast,
} from '@/utils';
import GradientButton from '@/components/GradientButton';
import styles from './styles';
import { px } from '@/utils/ui';

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

const PAGE_SIZE = 5;

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
  const [currentLockList, setCurrentLockList] = useState<LockListItem[]>([]);
  const [initialLoading, setInitialLoading] = useState(false);
  const loadingRef = useRef(false);
  const offsetRef = useRef(0);

  const hasSelected = useMemo(
    () => currentLockList.some(item => item.isBind),
    [currentLockList],
  );

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
      setCurrentLockList(res.data.lockList as LockListItem[]);
    } else {
      showToast({
        title: res.message || res.msg || '获取成员详情失败',
        icon: 'info',
      });
    }
  }, [memberId]);

  const loadLocks = useCallback(
    async (refresh: boolean) => {
      if (loadingRef.current) return;
      loadingRef.current = true;

      if (refresh) {
        setInitialLoading(true);
      } else {
        setLoading(true);
      }

      try {
        const offset = refresh ? 0 : offsetRef.current;
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
          offsetRef.current = refresh
            ? rows.length
            : offsetRef.current + rows.length;
          const total =
            typeof data.total === 'number' && Number.isFinite(data.total)
              ? data.total
              : undefined;
          if (typeof total === 'number') {
            setComplete(offset + rows.length >= total);
          } else {
            setComplete(rows.length < PAGE_SIZE);
          }
        } else {
          showToast({
            title: res.message || res.msg || '获取地锁列表失败',
            icon: 'info',
          });
        }
      } catch (e) {
        showToast({ title: '获取地锁列表失败', icon: 'info' });
      } finally {
        setLoading(false);
        setInitialLoading(false);
        loadingRef.current = false;
      }
    },
    [memberId],
  );

  useEffect(() => {
    void (async () => {
      setInitialLoading(true);
      try {
        await loadDetail();
        offsetRef.current = 0;
        setComplete(false);
        await loadLocks(true);
      } finally {
        setInitialLoading(false);
      }
    })();
  }, [loadDetail, memberId]);

  const handleUpdateLock = useCallback((next: LockListItem) => {
    setCurrentLockList(prev => {
      const exists = prev.some(item => item.id === next.id);
      if (exists) {
        return prev.map(item =>
          item.id === next.id ? { ...item, ...next } : item,
        );
      }
      return [...prev, next];
    });
    setLocks(prev => prev.map(item => (item.id === next.id ? next : item)));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!info) return;

    if (!info.username) {
      showToast({ title: '请输入成员昵称', icon: 'info' });
      return;
    }

    if (!info.mobile) {
      showToast({ title: '请输入手机号', icon: 'info' });
      return;
    }

    if (!mobileExp(info.mobile)) {
      showToast({ title: '请输入正确的手机号', icon: 'info' });
      return;
    }

    const selectedLocks = currentLockList.filter(item => item.isBind);
    if (selectedLocks.length === 0) {
      showToast({ title: '至少选择一个地锁', icon: 'info' });
      return;
    }

    try {
      showLoading({ title: '提交中...' });
      const res = await modifyStaff({
        ...info,
        lockList: selectedLocks,
      });

      if (res.code === 200 && res.success) {
        hideLoading();
        showToast({ title: '操作成功', icon: 'success' });
        eventCenter.trigger('refresh', {
          reload: !memberId,
          currentInfo: info,
        });
        if (memberId) {
          navigation.goBack();
          return;
        }
        if (!!locks.length) {
          const lockInfo = locks?.[0];
          navigation.navigate('CompositeShare', {
            lockId: lockInfo?.id,
            lockType: lockInfo.lockType == 1 ? 'single' : 'multiple',
            navigateBackCount: 2,
          });
        }
      } else {
        hideLoading();
        showToast({
          title: res.message || res.msg || '操作失败',
          icon: 'info',
        });
      }
    } catch (e) {
      hideLoading();
      showToast({ title: '操作失败', icon: 'info' });
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
          style={{ width: px(80), height: px(80) }}
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
            defaultValue={info?.username ?? ''}
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
            defaultValue={info?.mobile ?? ''}
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
          refreshing={initialLoading}
          onRefresh={() => {
            void loadLocks(true);
          }}
          onEndReached={() => {
            if (!loading && !complete) {
              void loadLocks(false);
            }
          }}
          onEndReachedThreshold={0.2}
          ListFooterComponent={() => {
            if (loading) {
              return <Text style={styles.footerText}>加载中...</Text>;
            }
            if (complete && locks.length > 0) {
              return <Text style={styles.footerText}>已加载全部</Text>;
            }
            return null;
          }}
        />
      </View>
    </PageContainer>
  );
}
