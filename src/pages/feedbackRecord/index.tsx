import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import dayjs from 'dayjs';
import { useNavigation } from '@react-navigation/native';
import { Flex, PageContainer } from '@/components';
import AppIcon from '@/components/AppIcon';
import { getOpinionList } from '@/services/user';
import styles from './styles';
import { showToast } from '@/utils';

interface OpinionItem {
  id: number;
  feedbackNo: string;
  feedbackTime: string;
  status: number;
  userMobile: string;
  content: string;
}

const TABS = [
  { key: 0, title: '全部' },
  { key: 1, title: '处理中' },
  { key: 2, title: '已处理' },
];

const STATUS_TEXT: Record<number, string> = {
  1: '处理中',
  2: '已处理',
};

export default function FeedbackRecord() {
  const navigation = useNavigation<any>();
  const [records, setRecords] = useState<OpinionItem[]>([]);
  const [currentTab, setCurrentTab] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchList = useCallback(
    async (reload: boolean, status: number) => {
      if (loading) return;
      setLoading(true);
      try {
        const offset = reload ? 0 : records.length;
        const res = await getOpinionList({
          offset,
          pageSize: 10,
          status: status === 0 ? undefined : status,
        });
        const list: OpinionItem[] =
          (res as any)?.data?.list ?? (res as any)?.list ?? [];
        setRecords(prev => (reload ? list : [...prev, ...list]));
        setHasMore(list.length === 10);
      } catch (e) {
        showToast({ title: '获取反馈记录失败', icon: 'info' });
      } finally {
        setLoading(false);
      }
    },
    [loading, records.length],
  );

  useEffect(() => {
    fetchList(true, currentTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTab]);

  const renderItem = ({ item }: { item: OpinionItem }) => {
    const statusText = STATUS_TEXT[item.status] ?? '';
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate('FeedbackDetail', { feedbackId: item.id })
        }
      >
        <View style={styles.recordItem}>
          <Flex style={styles.rowBetween} align="center">
            <Text style={styles.orderNoText}>反馈编号：{item.feedbackNo}</Text>
            <Flex align="center">
              <Text
                style={[
                  styles.statusText,
                  item.status === 1 && styles.statusProcessing,
                  item.status === 2 && styles.statusDone,
                ]}
              >
                {statusText}
              </Text>
              <AppIcon name="a-headfor-20" size={20} color="#333333" />
            </Flex>
          </Flex>
          <View style={styles.line} />
          <Flex style={styles.rowBetween}>
            <Text style={styles.label}>反馈号码：</Text>
            <Text style={styles.value}>{item.userMobile}</Text>
          </Flex>
          <Flex style={styles.rowBetween}>
            <Text style={styles.label}>反馈时间：</Text>
            <Text style={styles.value}>
              {item.feedbackTime
                ? dayjs(item.feedbackTime).format('YYYY-MM-DD HH:mm')
                : ''}
            </Text>
          </Flex>
          <View style={styles.rowBetween}>
            <Text style={styles.label}>描述：</Text>
            <Text style={styles.value}>{item.content}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <PageContainer
      backgroundColor="#F6F7FA"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: '意见反馈记录',
        showBack: true,
        background: '#FFFFFF',
      }}
      loading={loading && records.length === 0}
    >
      <View style={styles.container}>
        <View style={styles.tabsWrapper}>
          <View style={styles.tabsBox}>
            {TABS.map((tab, index) => (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, currentTab === index && styles.tabActive]}
                onPress={() => setCurrentTab(index)}
                activeOpacity={0.8}
              >
                <Text
                  style={
                    currentTab === index ? styles.tabTextActive : styles.tabText
                  }
                >
                  {tab.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <FlatList
          data={records}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onEndReached={() => {
            if (hasMore && !loading) {
              fetchList(false, currentTab);
            }
          }}
          onEndReachedThreshold={0.2}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.emptyBox}>
                <AppIcon name="order" size={40} color="#CCCCCC" />
                <Text style={styles.emptyText}>暂无反馈记录</Text>
              </View>
            ) : null
          }
        />
      </View>
    </PageContainer>
  );
}
