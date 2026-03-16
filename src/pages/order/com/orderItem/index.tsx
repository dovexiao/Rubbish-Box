import React from 'react';
import { Text, View, Image, TouchableOpacity } from 'react-native';
import { Flex } from '@/components';
import AppIcon from '@/components/AppIcon';
import { ORDER_STATUS, ORDER_STATUS_NAME } from '@/constants';
import type { OrderItemDTO } from '../../typing';
import styles from './styles';
import dayjs from 'dayjs';

const formatTime = (time?: string) => {
  if (!time) return '';
  time = dayjs(time).format('YYYY-MM-DD HH:mm:ss');
  // if (time.length >= 19) return time.slice(0, 19);
  return time;
};

type Props = { data: OrderItemDTO; onPress: () => void };

export function OrderItem({ data, onPress }: Props) {
  const statusKey = ORDER_STATUS[data.orderStatus as keyof typeof ORDER_STATUS];
  const statusName = statusKey
    ? ORDER_STATUS_NAME[statusKey as keyof typeof ORDER_STATUS_NAME]
    : '';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.orderItem}
      onPress={onPress}
    >
      <Flex justify="between" align="center">
        <Text style={styles.orderNoText}>订单号：{data.orderNo}</Text>
        <Flex align="center">
          <Text style={styles.statusText}>{statusName}</Text>
          <AppIcon name="a-headfor-12" size={20} color="#333333" />
        </Flex>
      </Flex>
      <View style={styles.line} />
      <Flex align="center" justify="between" style={{ width: '100%' }}>
        <Flex align="center">
          <View style={styles.cardImageContent}>
            <Image
              source={{ uri: data.mainImage }}
              style={styles.cardImage}
              resizeMode="contain"
            />
          </View>
          <Flex direction="column" style={styles.cardContent}>
            <Text style={styles.cardTitle} numberOfLines={2}>
              {data.productName}
            </Text>
            <Text style={styles.cardPrice}>¥{data.currentPrice}</Text>
          </Flex>
        </Flex>
        <Flex align="end">
          <Text style={styles.defaultText}>x</Text>
          <Text style={styles.cardCount}>{data.productNum}</Text>
        </Flex>
      </Flex>
      <Flex style={[styles.cardItem]} justify="between">
        <Text style={[styles.title, styles.boldFont]}>总支付</Text>
        <Text style={styles.cardPrice}>¥{data.actualPayAmount}</Text>
      </Flex>
      <Flex style={[styles.cardItem]} justify="between">
        <Text style={[styles.title, styles.boldFont]}>下单时间</Text>
        <Text style={styles.defaultText}>{formatTime(data.orderTime)}</Text>
      </Flex>
      {data.expressNo ? (
        <Flex style={[styles.cardItem]} justify="between">
          <Text style={styles.title}>发货单号</Text>
          <Text style={styles.defaultText}>{data.expressNo}</Text>
        </Flex>
      ) : null}
    </TouchableOpacity>
  );
}
