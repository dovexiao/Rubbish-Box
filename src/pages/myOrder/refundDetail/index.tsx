import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { PageContainer } from '@/components';
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

  const records = useMemo<RefundRecord[]>(() => {
    const list = route.params?.records;
    if (Array.isArray(list) && list.length > 0) return list;

    return [
      {
        id: 'r1',
        time: '2019-09-20 18:06:25',
        applyAmount: 20,
        reason: 'XXXXX',
        resultText: '20元退款中',
        resultColor: '#FF8C62',
      },
    ];
  }, [route.params?.records]);

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
