import React, { useCallback, useEffect, useState } from 'react';
import { Image, ScrollView, Text, View, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { PageContainer, Flex } from '@/components';
import { getOrderDetail } from '@/services/order';
import { ORDER_STATUS, ORDER_STATUS_NAME } from '@/constants';
import type { OrderDetailDTO } from '../typing';
import styles from './styles';
import { showToast } from '@/utils';

const formatTime = (time?: string) => {
  if (!time) return '';
  if (time.length >= 19) return time.slice(0, 19);
  return time;
};

export default function OrderDetail() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const orderNo = route.params?.orderNo ?? '';

  const [detail, setDetail] = useState<OrderDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);

  const loadDetail = useCallback(async () => {
    if (!orderNo) {
      showToast({ title: '订单号不存在', icon: 'info' });
      navigation.goBack();
      return;
    }

    setLoading(true);
    try {
      const res = await getOrderDetail({ orderNo });
      if (Number(res?.code) === 200) {
        const data = (res.data || res) as OrderDetailDTO;
        setDetail(data || null);
      } else {
        showToast({
          title: res?.message || res?.msg || '获取订单详情失败',
          icon: 'info',
        });
        navigation.goBack();
      }
    } catch (e) {
      showToast({ title: '获取订单详情失败', icon: 'info' });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [orderNo, navigation]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  if (loading) {
    return (
      <PageContainer
        statusBarStyle="dark-content"
        statusBarBackgroundColor="#FFFFFF"
        safeAreaEdges={['top', 'bottom']}
        scrollable={false}
        pageNavProps={{
          text: '订单详情',
          showBack: true,
          background: '#FFFFFF',
        }}
      >
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <ActivityIndicator size="large" color="#333333" />
        </View>
      </PageContainer>
    );
  }

  if (!detail) return null;

  const statusKey =
    ORDER_STATUS[detail.orderStatus as keyof typeof ORDER_STATUS];
  const statusName = statusKey
    ? ORDER_STATUS_NAME[statusKey as keyof typeof ORDER_STATUS_NAME]
    : '';

  return (
    <PageContainer
      backgroundColor="#FFFFFF"
      statusBarStyle="dark-content"
      statusBarBackgroundColor="#FFFFFF"
      safeAreaEdges={['top', 'bottom']}
      scrollable={true}
      pageNavProps={{
        text: '订单详情',
        showBack: true,
        background: '#FFFFFF',
      }}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.orderDetailContainer}
        showsVerticalScrollIndicator={false}
      >
        <Flex justify="between" style={styles.detailItem}>
          <Text style={styles.title}>商品信息</Text>
          <Flex align="center" justify="between">
            <Flex align="center">
              <Image
                source={{ uri: detail.mainImage }}
                style={styles.cardImage}
                resizeMode="contain"
              />
              <Flex direction="column" style={styles.cardContent}>
                <Text style={styles.cardTitle} numberOfLines={2}>
                  {detail.productName}
                </Text>
                <Text style={styles.cardPrice}>¥{detail.currentPrice}</Text>
              </Flex>
            </Flex>
            <Flex align="end" style={styles.cardCountContainer}>
              <Text style={styles.defaultText}>x</Text>
              <Text style={styles.cardCount}>{detail.productNum}</Text>
            </Flex>
          </Flex>
        </Flex>

        <Flex style={styles.detailItem} justify="between">
          <Text style={styles.title}>下单时间</Text>
          <Text style={styles.defaultText}>{formatTime(detail.orderTime)}</Text>
        </Flex>

        <Flex style={styles.detailItem} justify="between">
          <Text style={styles.title}>订单状态</Text>
          <Text style={styles.defaultText}>{statusName}</Text>
        </Flex>

        {detail.orderStatus === 30 && detail.expressNo ? (
          <Flex style={styles.detailItem} justify="between">
            <Text style={styles.title}>快递单号</Text>
            <Text style={styles.defaultText}>{detail.expressNo}</Text>
          </Flex>
        ) : null}

        <Flex style={styles.detailItem} justify="between" align="start">
          <Text style={styles.title}>收货信息</Text>
          <Flex direction="column" align="end">
            <Text style={styles.defaultText}>
              {detail.receiverName} {detail.receiverMobile}
            </Text>
            <Text
              style={[styles.defaultText, styles.address]}
              numberOfLines={4}
            >
              {detail.receiverAddress}
            </Text>
          </Flex>
        </Flex>

        <Flex style={styles.detailItem} justify="between">
          <Text style={styles.title}>订单号</Text>
          <Text style={styles.defaultText}>{detail.orderNo}</Text>
        </Flex>

        <Flex style={styles.detailItem} justify="between">
          <Text style={styles.title}>备注说明</Text>
          <Text style={styles.defaultText}>{detail.remark || '-'}</Text>
        </Flex>
      </ScrollView>
    </PageContainer>
  );
}
