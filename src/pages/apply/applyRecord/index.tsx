import { showToast, eventCenter } from '@/utils';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Image,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useRef, useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/core';
import { PageContainer, Flex } from '@/components/index';
import MyEmpty from '@/components/MyEmpty';
import { lockApplyList } from '@/services/device';
import styles from './styles';

interface ApplyRecordItem {
  id: number;
  applyMobile: string;
  applyUserName: string;
  status: number;
  lockName: string;
  lockCount: number;
  imageUrl: string;
}

export default function ApplyRecord() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const lockAdminId = route.params?.lockAdminId
    ? Number(route.params.lockAdminId)
    : undefined;

  const [list, setList] = useState<ApplyRecordItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentTab, setCurrentTab] = useState(0);

  const TAB_LIST = [
    { id: 'sent', name: '我发出的' },
    { id: 'received', name: '我收到的' },
  ] as const;

  const stateConfig: Record<number, { text: string; color: string }> = {
    1: { text: '待审核', color: '#999999' },
    2: { text: '通过', color: '#37C22A' },
    3: { text: '拒绝', color: '#FF2B24' },
  };

  const getList = async (reload?: boolean) => {
    if (loading || (refreshing && !reload)) return;

    if (reload) setRefreshing(true);
    else setLoading(true);

    const offset = reload ? 0 : list.length;
    const pageSize = 20;

    try {
      const res = await lockApplyList({
        offset,
        pageSize,
        listType: currentTab === 0 ? 1 : 0,
        lockAdminId,
      });
      if (Number(res?.code) !== 200) {
        showToast({ title: res?.message || '获取申请记录失败', icon: 'none' });
        return;
      }

      const data = res?.data || {};
      const newList = (data?.list || []) as ApplyRecordItem[];
      const t = Number(data?.total || 0);
      const mergedList = reload ? newList : [...list, ...newList];

      setList(mergedList);
      setTotal(t);
      setHasMore(mergedList.length < t);
    } catch (e) {
      showToast({ title: '获取数据异常', icon: 'none' });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      getList(true);
    }, [currentTab]),
  );

  const handleTabChange = (index: number) => {
    if (currentTab === index) return;
    setCurrentTab(index);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading && !refreshing) {
      getList();
    }
  };

  const renderItem = ({ item }: { item: ApplyRecordItem }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => {
        navigation.navigate('ApplyRecordDetail', {
          id: item.id,
          isAdmin: currentTab,
        });
      }}
    >
      <Flex justify="between" align="center" style={styles.listItem}>
        <Flex direction="column" align="start">
          <Text style={styles.itemText}>
            {item.lockCount > 1 ? '组合' : '单个'}设备
          </Text>
          <Flex align="end" style={styles.imgBox}>
            <Image
              source={{
                uri:
                  item.imageUrl ||
                  'https://g.18qjz.cn/img/boklock/order_empty.png',
              }}
              style={styles.imgBox_img}
            />
            {item.lockCount > 1 && (
              <Flex align="end" style={{ paddingBottom: 12 }}>
                <View style={{ marginBottom: 6, opacity: 0.8 }}>
                  <Text style={{ fontSize: 12, color: '#333333' }}>×</Text>
                </View>
                <Text
                  style={[
                    styles.itemText,
                    { fontWeight: 'bold', marginLeft: 2 },
                  ]}
                >
                  {item.lockCount}
                </Text>
              </Flex>
            )}
          </Flex>
        </Flex>

        <Flex style={{ flex: 1, marginLeft: 20 }} direction="column">
          <Flex style={{ marginBottom: 8 }}>
            <Text style={[styles.itemText2, { marginRight: 16 }]}>
              {item.applyUserName}
            </Text>
            <Text style={styles.itemText2}>{item.applyMobile}</Text>
          </Flex>
          <Text style={styles.itemText2}>{item.lockName}</Text>
        </Flex>

        <Text
          style={{
            color: stateConfig[item.status]?.color || '#333',
            fontSize: 14,
          }}
        >
          {stateConfig[item.status]?.text || '--'}
        </Text>
      </Flex>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loading) return <View style={{ height: 20 }} />;
    return (
      <View style={{ paddingVertical: 20, alignItems: 'center' }}>
        <ActivityIndicator size="small" color="#999999" />
        <Text style={{ color: '#999999', fontSize: 12, marginTop: 5 }}>
          加载中...
        </Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading || refreshing) return null;
    return (
      <MyEmpty
        emptyText="暂无使用申请记录"
        emptyIcon="https://g.18qjz.cn/img/boklock/order_empty.png"
      />
    );
  };

  return (
    <PageContainer
      safeAreaEdges={['top', 'bottom']}
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#ffffff"
      pageNavProps={{
        text: '地锁使用申请记录',
        showBack: true,
        background: '#FFFFFF',
      }}
      navBorder
      backgroundColor="#ffffff"
    >
      <View style={styles.container}>
        <View style={styles.tabsWrap}>
          <View style={styles.tabsBox}>
            {TAB_LIST.map((tab, index) => (
              <TouchableOpacity
                key={tab.id}
                style={[
                  styles.tab,
                  currentTab === index ? styles.tabActive : {},
                ]}
                onPress={() => handleTabChange(index)}
                activeOpacity={0.8}
              >
                <Text
                  style={
                    currentTab === index ? styles.tabTextActive : styles.tabText
                  }
                >
                  {tab.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <FlatList
          data={list}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshing={refreshing}
          onRefresh={() => getList(true)}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      </View>
    </PageContainer>
  );
}
