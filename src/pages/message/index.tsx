import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PageContainer } from '@/components';
import IconFont from '@/iconfont';
import { MESSAGE_TYPE } from '@/constants';
import MyEmpty from '@/components/MyEmpty';
import { cacheGetSync, reLaunch, showToast } from '@/utils';
import { getLockInfo } from '@/services/device';
import { getMsgList, getUserLockExist, readMsg } from '@/services/user';
import type { msgListProps, messagesProps } from './type';
import { styles } from './style';
import { useAppNavigation } from '@/hooks/useAppNavigation';

type SectionItem = {
  title: string;
  date: string;
  data: messagesProps[];
};

function countMessages(list: msgListProps[] | null | undefined) {
  return (
    list?.map(item => item?.messages?.length ?? 0).reduce((a, b) => a + b, 0) ??
    0
  );
}

function mergeMessageLists(
  existingList: msgListProps[],
  newList: msgListProps[],
) {
  const dateMap = new Map<string, msgListProps>();

  existingList.forEach(item => {
    dateMap.set(item.dateLabel, {
      ...item,
      messages: [...(item.messages || [])],
    });
  });

  newList.forEach(newItem => {
    const prev = dateMap.get(newItem.dateLabel);
    if (prev) {
      dateMap.set(newItem.dateLabel, {
        ...prev,
        ...newItem,
        messages: [...(prev.messages || []), ...(newItem.messages || [])],
      });
      return;
    }
    dateMap.set(newItem.dateLabel, {
      ...newItem,
      messages: [...(newItem.messages || [])],
    });
  });

  return Array.from(dateMap.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

function markMessageRead(list: msgListProps[], msgId: number) {
  return list.map(group => ({
    ...group,
    messages: group.messages.map(msg =>
      msg.id === msgId ? { ...msg, isRead: 1 } : msg,
    ),
  }));
}

export default function MessageScreen() {
  const navigation = useAppNavigation();
  const [messageList, setMessageList] = useState<msgListProps[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [complete, setComplete] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const inFlightRef = useRef(false);

  const fetchList = useCallback(
    async (refresh: boolean) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;
      if (refresh) setRefreshing(true);
      else setLoading(true);

      try {
        const userId = await cacheGetSync('userId');
        const offset = refresh ? 0 : countMessages(messageList);
        const res: any = await getMsgList({
          userId,
          pageSize: 20,
          offset,
        });

        if (res?.code !== 200 || res?.success === false) {
          showToast(res?.message || res?.msg || '获取消息失败');
          return;
        }

        const list: msgListProps[] =
          res?.data?.list ?? res?.list ?? res?.data ?? [];
        const total: number = Number(res?.data?.total ?? res?.total ?? 0);

        setMessageList(prev => {
          const next = refresh ? list : mergeMessageLists(prev || [], list);
          const loadedCount = countMessages(next);
          setComplete(total > 0 ? loadedCount >= total : list.length === 0);
          return next;
        });

        if (refresh && total === 0) {
          setIsEmpty(true);
        } else if (refresh) {
          setIsEmpty(false);
        }
      } catch (e) {
        showToast('获取消息失败');
      } finally {
        inFlightRef.current = false;
        setRefreshing(false);
        setLoading(false);
      }
    },
    [messageList],
  );

  useEffect(() => {
    void fetchList(true);
  }, [fetchList]);

  const handleEnterDevice = useCallback(
    async (id: number, msgId: number) => {
      try {
        const existRes = await getUserLockExist({ id });
        if (existRes.code === 200) {
          if (!existRes.data) {
            showToast(existRes.message || existRes.msg || '设备不存在');
            return;
          }
          const readRes = await readMsg({ id: msgId });
          if (readRes.code === 200 && readRes.data) {
            reLaunch('Index', { lockId: id });
          } else {
            showToast(readRes.msg || readRes.message);
          }
        } else {
          showToast('无权限查看此设备');
        }
      } catch (e) {
        showToast('跳转失败');
      }
    },
    [navigation],
  );

  const handleMessageDetail = useCallback(async (msgId: number) => {
    try {
      const readRes: any = await readMsg({ id: msgId });
      if (readRes.code === 200 && readRes.data) {
        navigation.navigate('MessageDetail', { msgId });
      } else {
        showToast(readRes.msg || readRes.message);
      }
    } catch {
      showToast('操作失败');
    }
  }, []);

  const sections: SectionItem[] = useMemo(() => {
    if (!messageList) return [];
    return messageList.map(item => ({
      title: item.dateLabel,
      date: item.date,
      data: item.messages || [],
    }));
  }, [messageList]);

  const renderItem = useCallback(
    ({ item }: { item: messagesProps }) => {
      const isInstallDone = item.messageType === 3;
      const headerTitle = isInstallDone
        ? '设备安装服务完成，请您验收确定'
        : `【${item.lockName || ''}】地锁`;
      const typeText = isInstallDone
        ? '尊敬的泊刻地锁用户您好！'
        : (MESSAGE_TYPE as any)[item.messageType] || item.messageTypeName || '';
      const contentText = isInstallDone
        ? '您的设备已经安装完成，麻烦您进行验收'
        : item.messageContent || '';

      return (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => {
            if (isInstallDone) {
              void handleMessageDetail(item.id);
              return;
            }
            void handleEnterDevice(Number(item.lockId), item.id);
          }}
          style={styles.itemContent}
        >
          <View style={styles.itemHeaderRow}>
            <Text style={styles.itemName} numberOfLines={1}>
              {headerTitle}
            </Text>
            <IconFont name="a-headfor-20" size={20} color="#333333" />
          </View>

          <View style={styles.divider} />

          <View style={styles.messageBody}>
            <View style={styles.messageMetaRow}>
              <IconFont name="explain" size={20} color="#333333" />
              <Text style={styles.messageType} numberOfLines={1}>
                {typeText}
              </Text>
              <Text style={styles.messageTime} numberOfLines={1}>
                {item.createTime || ''}
              </Text>
            </View>
            <Text style={styles.bottomContent}>{contentText}</Text>
          </View>

          {item.isRead === 0 && <View style={styles.unreadDot} />}
        </TouchableOpacity>
      );
    },
    [handleEnterDevice, handleMessageDetail],
  );

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      pageNavProps={{
        text: '消息中心',
        showBack: true,
        background: '#FFFFFF',
      }}
      loading={loading && !messageList}
    >
      <View style={styles.container}>
        {isEmpty ? (
          <MyEmpty emptyIcon="https://g.18qjz.cn/img/boklock/order_empty.png" />
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={item => String(item.id)}
            renderItem={renderItem}
            renderSectionHeader={({ section }) => (
              <Text style={styles.itemTime}>{section.title}</Text>
            )}
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            onRefresh={() => fetchList(true)}
            refreshing={refreshing}
            onEndReached={() => {
              if (!loading && !refreshing && !complete) {
                void fetchList(false);
              }
            }}
            onEndReachedThreshold={0.2}
            ListFooterComponent={
              loading && messageList && !complete ? (
                <View style={styles.footerLoading}>
                  <ActivityIndicator color="#333333" />
                </View>
              ) : (
                <View style={styles.footerSpace} />
              )
            }
            ListEmptyComponent={
              !loading && messageList ? (
                <MyEmpty emptyIcon="https://g.18qjz.cn/img/boklock/order_empty.png" />
              ) : null
            }
          />
        )}
      </View>
    </PageContainer>
  );
}
