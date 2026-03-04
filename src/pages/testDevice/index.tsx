import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  ListRenderItem,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SearchBar } from '@ant-design/react-native';
import { PageContainer } from '@/components';
import Flex from '@/components/Flex';
import { getTestDeviceList } from '@/services/deviceTest';
import styles from './styles';
import { showToast } from '@/utils';

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

export default function TestDevice() {
  const navigation = useNavigation<any>();
  const [deviceList, setDeviceList] = useState<TestDeviceItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [searchValue, setSearchValue] = useState('');

  const loadList = useCallback(
    async (reload: boolean, deviceNo?: string) => {
      if (loading) return;

      if (reload) {
        setRefreshing(true);
        setInitialLoading(true);
      } else {
        setLoading(true);
      }

      try {
        const offset = reload ? 0 : deviceList.length;
        const res: any = await getTestDeviceList({
          offset,
          pageSize: PAGE_SIZE,
          lockId: deviceNo ?? (searchValue || undefined),
        });
        const list: TestDeviceItem[] = Array.isArray(res?.list)
          ? res.list
          : Array.isArray(res?.data?.list)
          ? res.data.list
          : [];

        setDeviceList(prev => (reload ? list : [...prev, ...list]));
        setHasMore(list.length >= PAGE_SIZE);
      } catch (error) {
        console.error('getTestDeviceList error:', error);
        showToast('获取测试设备列表失败');
      } finally {
        setLoading(false);
        setRefreshing(false);
        setInitialLoading(false);
      }
    },
    [deviceList.length, loading, searchValue],
  );

  useEffect(() => {
    void loadList(true);
  }, [loadList]);

  const onSearch = (value: string) => {
    setSearchValue(value.trim());
    void loadList(true, value.trim());
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
            } as never,
          );
        }}
      >
        <Flex justify="between" align="center" style={{ paddingRight: 12 }}>
          <Flex align="center">
            <Image
              source={{ uri: 'https://g.18qjz.cn/jijimaClient/occupy.png' }}
              style={{ width: 60, height: 60 }}
              resizeMode="contain"
            />
            <Text style={styles.snText}>设备SN码：{item.lockId ?? '暂无'}</Text>
          </Flex>
          <Flex align="start" style={{ height: '100%' }}>
            <Text style={statusStyle}>{statusText}</Text>
          </Flex>
        </Flex>
      </TouchableOpacity>
    );
  };

  const keyExtractor = (item: TestDeviceItem, index: number) =>
    `${item.deviceNo || 'device'}-${index}`;

  const renderHeader = () => (
    <View style={styles.searchWrapper}>
      <SearchBar
        placeholder="请输入设备SN码查询"
        value={searchValue}
        onChange={v => setSearchValue(v)}
        onSubmit={v => onSearch(v)}
        onBlur={() => onSearch(searchValue)}
        returnKeyType="search"
        style={styles.searchBar}
      />
    </View>
  );

  const renderEmpty = () =>
    !initialLoading ? (
      <View style={{ alignItems: 'center', marginTop: 40 }}>
        <Text style={{ fontSize: 14, color: '#999999' }}>暂无测试设备</Text>
      </View>
    ) : null;

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: '泊刻地锁工厂测试',
        showBack: true,
        background: '#FFFFFF',
      }}
      loading={initialLoading}
    >
      <View style={styles.container}>
        <FlatList
          data={deviceList}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listWrapper}
          onEndReachedThreshold={0.3}
          onEndReached={() => {
            if (!loading && hasMore) {
              void loadList(false);
            }
          }}
          refreshing={refreshing}
          onRefresh={() => void loadList(true)}
          ListEmptyComponent={renderEmpty}
        />
      </View>
    </PageContainer>
  );
}
