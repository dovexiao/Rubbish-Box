import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { createStyles, rpx } from '../../utils/rpxStyleSheet';
import { Images } from '../../constants/Assets';
import { getPointsBalance, type PointsBalanceData } from '../../services/pointsMall';
import { useUserStore } from '../../stores/userStore';

interface CurrencyAmountProps {
  onPress?: () => void;
  style?: ViewStyle;
}

const CurrencyAmount: React.FC<CurrencyAmountProps> = ({ onPress, style }) => {
  // 展示金额的状态定义
  const [pointsBalance, setPointsBalance] = useState<number>(0);

  // 展示金额获取函数封装
  const fetchPointsBalance = useCallback(async () => {
    // 检查是否有token，没有则直接返回
    const token = useUserStore.getState().token;
    if (!token) {
      console.log("未找到token，跳过积分余额获取");
      return;
    }

    try {
      const res: PointsBalanceData = await getPointsBalance();
      if (res.points !== undefined) {
        setPointsBalance(res.points);
      }
    } catch (error) {
      console.error("获取积分余额失败:", error);
    }
  }, []);

  // 初始化时执行
  useEffect(() => {
    fetchPointsBalance();
  }, [fetchPointsBalance]);

  // 页面聚焦时执行
  useFocusEffect(
    useCallback(() => {
      fetchPointsBalance();
    }, [fetchPointsBalance])
  );

  return (
    <View style={[styles.container, style]}>
      {/* 货币数量文本 */}
      <Text style={styles.amountText}>{pointsBalance}</Text>
      
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
          size={rpx(7.8125)}
          color="#FF9D00"
        />
      </TouchableOpacity>
    </View>
  );
};

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
    backgroundColor: '#FFFFFFCC', // rgba(255, 255, 255, 0.8)
    paddingTop: 3.125, // 8
    paddingRight: 6.25, // 16
    paddingBottom: 3.125, // 8
    paddingLeft: 6.25, // 16
    marginLeft: 6.640625, // 17
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 3.125, // 8
  },
  coinIcon: {
    width: 14.0625, // 36
    height: 14.0625, // 36
  },
  currencyText: {
    fontFamily: 'PingFang-SC',
    fontSize: 8.59375, // 22
    fontWeight: '500' as const,
    color: '#FF9D00',
    marginBottom: 2.1484375, // 5.5
  },
});

export default CurrencyAmount;
