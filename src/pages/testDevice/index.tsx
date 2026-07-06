import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SearchBar } from '@ant-design/react-native';
import { PageContainer } from '@/components';
import Flex from '@/components/Flex';
import { getTestDeviceList } from '@/services/deviceTest';
import styles from './styles';
import { showToast } from '@/utils';
import { fontSize, px } from '@/utils/ui';

const TEST_STATUS = {
  NORMAL: 0,
  QUALIFIED: 1,
  FAIL: 2,
} as const;

const TEST_STATUS_TEXT: Record<number, string> = {
  [TEST_STATUS.NORMAL]: '暂无测试',
  [TEST_STATUS.FAIL]: '不合格',
  [TEST_STATUS.QUALIFIED]: '合格',
};

interface TestDeviceItem {
  deviceNo: string;
  testResult: number;
  testResultName: string;
  lockId: string;
}

const PAGE_SIZE = 10;

const itemDedupeKey = (item: TestDeviceItem) =>
  `${item.deviceNo ?? ''}__${item.lockId ?? ''}`;

export default function TestDevice() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const type = route.params?.type ?? 1;
  const [deviceList, setDeviceList] = useState<TestDeviceItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');
  const searchRef = useRef('');
  const offsetRef = useRef(0);
  const loadingRef = useRef(false);

  const loadList = useCallback(async (reload: boolean, deviceNo?: string) => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    if (reload) {
      setRefreshing(true);
      setInitialLoading(true);
    } else {
      setLoading(true);
    }

    try {
      const offset = reload ? 0 : offsetRef.current;
      const lockId =
        deviceNo !== undefined
          ? deviceNo || undefined
          : searchRef.current.trim() || undefined;
      const res: any = await getTestDeviceList({
        offset,
        pageSize: PAGE_SIZE,
        lockId,
        testType: type,
      });
      const list: TestDeviceItem[] = Array.isArray(res?.list)
        ? res.list
        : Array.isArray(res?.data?.list)
        ? res.data.list
        : [];
      const total =
        typeof res?.total === 'number' && Number.isFinite(res.total)
          ? res.total
          : typeof res?.data?.total === 'number' &&
            Number.isFinite(res.data.total)
          ? res.data.total
          : undefined;

      setDeviceList(prev => {
        if (reload) return list;
        const seen = new Set(prev.map(itemDedupeKey));
        const next = [...prev];
        for (const item of list) {
          const k = itemDedupeKey(item);
          if (!seen.has(k)) {
            seen.add(k);
            next.push(item);
          }
        }
        return next;
      });
      offsetRef.current = reload
        ? list.length
        : offsetRef.current + list.length;
      if (typeof total === 'number') {
        setHasMore(offset + list.length < total);
      } else {
        setHasMore(list.length >= PAGE_SIZE);
      }
    } catch (error) {
      console.error('getTestDeviceList error:', error);
      showToast({ title: '获取测试设备列表失败', icon: 'info' });
    } finally {
      setLoading(false);
      setRefreshing(false);
      setInitialLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    offsetRef.current = 0;
    void loadList(true);
  }, [loadList]);

  const onSearch = (value: string) => {
    const trimmed = value.trim();
    setSearchValue(trimmed);
    searchRef.current = trimmed;
    offsetRef.current = 0;
    void loadList(true, trimmed);
  };

  const renderItem: ListRenderItem<TestDeviceItem> = ({ item, index }) => {
    const statusText = TEST_STATUS_TEXT[item.testResult] ?? item.testResultName;
    const statusStyle =
      item.testResult === TEST_STATUS.FAIL
        ? styles.failText
        : item.testResult === TEST_STATUS.QUALIFIED
        ? styles.qualifiedText
        : styles.normalText;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.lockContentWrapper}
        onPress={() => {
          navigation.navigate(
            'TestDeviceDetail' as never,
            {
              deviceNo: item.deviceNo,
              type,
            } as never,
          );
        }}
      >
        <Flex justify="between" align="center" style={{ paddingRight: px(12) }}>
          <Flex align="center" style={{ flex: 1 }}>
            <Image
              source={{ uri: 'https://g.18qjz.cn/jijimaClient/occupy.png' }}
              style={{ width: px(60), height: px(60) }}
              resizeMode="contain"
            />
            <Text style={styles.snText} numberOfLines={1}>
              设备SN码：{item.lockId ?? '暂无'}
            </Text>
          </Flex>
          <Flex align="start" style={{ height: '100%', flexShrink: 0 }}>
            <Text style={statusStyle}>{statusText}</Text>
          </Flex>
        </Flex>
      </TouchableOpacity>
    );
  };

  const keyExtractor = (item: TestDeviceItem, index: number) =>
    itemDedupeKey(item) || `row-${index}`;

  const renderEmpty = () =>
    !initialLoading ? (
      <View style={{ alignItems: 'center', marginTop: px(40) }}>
        <Text style={{ fontSize: fontSize(14), color: '#999999' }}>
          暂无测试设备
        </Text>
      </View>
    ) : null;

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: type === 1 ? '泊刻地锁工厂测试' : '泊刻地锁仓库测试',
        showBack: true,
        background: '#FFFFFF',
      }}
      loading={initialLoading}
    >
      <View style={styles.container}>
        <View style={styles.searchWrapper}>
          <SearchBar
            placeholder="请输入设备SN码查询"
            value={searchValue}
            onChange={v => {
              setSearchValue(v);
              searchRef.current = v;
            }}
            onSubmit={v => onSearch(v)}
            returnKeyType="search"
            style={styles.searchBar}
          />
        </View>
        <FlatList
          data={deviceList}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          contentContainerStyle={styles.listWrapper}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onEndReachedThreshold={0.3}
          onEndReached={() => {
            if (loadingRef.current || !hasMore) return;
            void loadList(false);
          }}
          refreshing={refreshing}
          onRefresh={() => void loadList(true)}
          ListEmptyComponent={renderEmpty}
        />
      </View>
    </PageContainer>
  );
}
