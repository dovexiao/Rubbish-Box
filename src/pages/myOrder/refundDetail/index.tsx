import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { PageContainer } from '@/components';
import { showToast } from '@/utils';
import { getOrderRefundApplyList } from '@/services/order';
import dayjs from 'dayjs';
import styles from './styles';

type RefundRecord = {
  id: string;
  time: string;
  applyAmount: number;
  reason: string;
  resultText: string;
  resultColor: string;
  secondColor?: string;
};

export default function MyOrderRefundDetail() {
  const route = useRoute<any>();
  const [loading, setLoading] = useState(true);
  const orderNo = String(route.params?.orderNo || '');
  const [apiRecords, setApiRecords] = useState<any[]>([]);

  const fetchRefundRecords = useCallback(async () => {
    if (!orderNo) {
      setApiRecords([]);
      return;
    }

    try {
      const res: any = await getOrderRefundApplyList({ orderNo });
      if (res?.success && Array.isArray(res?.data)) {
        setApiRecords(res.data);
        return;
      }

      setApiRecords([]);
      showToast({
        title: res?.msg || res?.message || '加载退款记录失败',
        icon: 'info',
      });
    } catch {
      setApiRecords([]);
      showToast({ title: '加载退款记录失败', icon: 'info' });
    } finally {
      setLoading(false);
    }
  }, [orderNo]);

  useEffect(() => {
    void fetchRefundRecords();
  }, [fetchRefundRecords]);

  const getStatusColor = useCallback((status?: number) => {
    if (status === 10) return '#FF8C62';
    if (status === 20) return '#07C160';
    if (status === 30) return '#FF2B24';
    return '#999999';
  }, []);

  const records = useMemo<RefundRecord[]>(() => {
    if (Array.isArray(apiRecords) && apiRecords.length > 0) {
      return apiRecords.map((item: any, index: number) => {
        const statusList = Array.isArray(item?.statusList)
          ? item.statusList
          : [];
        const firstStatus = statusList[0];
        const secondStatus = statusList[1];

        const firstAmount = Number(firstStatus?.amount || 0);
        const secondAmount = Number(secondStatus?.amount || 0);
        const firstText = firstStatus
          ? `${firstAmount}元${firstStatus?.statusDesc || ''}`
          : '';
        const secondText = secondStatus
          ? `${secondAmount}元${secondStatus?.statusDesc || ''}`
          : '';

        return {
          id: String(item?.id || item?.applyNo || index),
          time: item?.applyTime
            ? dayjs(item.applyTime).format('YYYY-MM-DD HH:mm:ss')
            : '',
          applyAmount: Number(item?.applyRefundAmount || 0),
          reason: String(item?.refundReason || '--'),
          resultText: secondText ? `${firstText}  ${secondText}` : firstText,
          resultColor: getStatusColor(firstStatus?.status),
          secondColor: getStatusColor(secondStatus?.status),
        };
      });
    }

    const list = route.params?.records;
    if (Array.isArray(list) && list.length > 0) {
      return list;
    }

    return [];
  }, [apiRecords, getStatusColor, route.params?.records]);

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      scrollable={false}
      pageNavProps={{
        text: '退款详情',
        showBack: true,
        background: '#FFFFFF',
      }}
      loading={loading}
      loadingType="content"
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {records.map((item, index) => {
          const hasTwo = item.resultText.includes('  ');
          const parts = hasTwo
            ? item.resultText.split('  ')
            : [item.resultText];

          return (
            <View
              key={item.id || String(index)}
              style={[
                styles.item,
                index === records.length - 1 ? styles.itemLast : null,
              ]}
            >
              <Text
                style={styles.timeText}
              >{`${item.time}发起退款${item.applyAmount}元`}</Text>

              <View style={styles.resultRow}>
                <Text style={[styles.resultText, { color: item.resultColor }]}>
                  {parts[0] || ''}
                </Text>
                {parts[1] ? (
                  <Text
                    style={[
                      styles.resultText,
                      { color: item.secondColor || '#FF2B24' },
                    ]}
                  >
                    {parts[1]}
                  </Text>
                ) : null}
              </View>

              <Text
                style={styles.reasonText}
              >{`退款原因:  ${item.reason}`}</Text>
            </View>
          );
        })}
      </ScrollView>
    </PageContainer>
  );
}
