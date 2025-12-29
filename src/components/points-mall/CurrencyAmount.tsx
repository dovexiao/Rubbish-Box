import React, { useState, useEffect, useCallback, useImperativeHandle, forwardRef, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { createStyles, rpx } from '../../utils/rpxStyleSheet';
import { Images } from '../../constants/Assets';
import { getPointsBalance, type PointsBalanceData } from '../../services/pointsMall';
import { devError } from '@/services/WebSocketManager';

interface CurrencyAmountProps {
  onPress?: () => void;
  style?: ViewStyle;
}

export type CurrencyAmountRef = {
  refreshBalance: () => Promise<void>;
}

const CurrencyAmount = forwardRef<CurrencyAmountRef, CurrencyAmountProps>(({ onPress, style }, ref) => {
  // 展示金额的状态定义
  const [pointsBalance, setPointsBalance] = useState<number>(0);
  const loadingRef = useRef(false);

  // 展示金额获取函数封装
  const fetchPointsBalance = useCallback(async () => {
    // 保证幂等
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      const res: PointsBalanceData = await getPointsBalance();
      if (res.points !== undefined) {
        setPointsBalance(res.points);
      }
    } catch (error: unknown) {
      devError("获取积分余额失败:", error);
    } finally {
      loadingRef.current = false;
    }
  }, []);

  // 初始化时执行
  useEffect(() => {
    fetchPointsBalance();
  }, []);

  // 页面聚焦时执行
  useFocusEffect(
    useCallback(() => {
      fetchPointsBalance();
    }, [fetchPointsBalance])
  );

  // 暴露刷新方法给父组件
  useImperativeHandle(ref, () => ({
    refreshBalance: fetchPointsBalance,
  }), [fetchPointsBalance]);

  // 大数处理
  const formatPointsBalance = useCallback((points: number) => {
    if (typeof points !== 'number' || points < 0) {
      return '0';
    }
    if (points > 999999) {
      return '999999+';
    }
    return points.toString();
  }, []);

  return (
    <View style={[styles.container, style]}>
      {/* 货币数量文本 */}
      <Text style={styles.amountText}>{formatPointsBalance(pointsBalance)}</Text>
      
      {/* 货币记录入口 */}
      <TouchableOpacity
        style={styles.entryButton}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <Image
          source={Images.pointsMallGoldCoin}
          style={styles.coinIcon}
          resizeMode="contain"
        />
        <Text style={styles.currencyText}>货币</Text>
        <Ionicons
          name="chevron-forward"
          size={rpx(9.375)} // 24
          color="#FF9D00"
        />
      </TouchableOpacity>
    </View>
  );
});

const styles = createStyles({
  container: {
    height: 31.640625, // 81
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  amountText: {
    fontFamily: 'PingFang-SC',
    fontSize: 22.65625, // 58
    fontWeight: '500' as const,
    color: '#000000',
    marginBottom: 5.6640625, // 14.5
  },
  entryButton: {
    width: 53.125, // 136
    height: 20.3125, // 52
    borderRadius: 23.4375, // 60
    borderWidth: 0.2890625, // 0.74
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFFCC',
    // paddingVertical: 3.125, // 8
    paddingLeft: 6.25, // 16
    marginLeft: 6.640625, // 17
    flexDirection: 'row' as const,
    // justifyContent: 'space-evenly' as const,
    alignItems: 'center' as const,
    // gap: 3.125, // 8
  },
  coinIcon: {
    width: 14.0625, // 36
    height: 14.0625, // 36
    marginRight: 3.125, // 8
  },
  currencyText: {
    fontFamily: 'PingFang-SC',
    fontSize: 8.59375, // 22
    fontWeight: '500' as const,
    color: '#FF9D00',
  },
});

export default CurrencyAmount;
