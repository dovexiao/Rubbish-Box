import React, {useEffect, useRef, useState, useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import Text from '@/components/basic/text';
import {useScreenSize} from '@/common-pages/hooks/size.hooks';
import LinearGradient from '@/components/basic/linear-gradient';

export interface RedPacketCountdownProps {
  /** 结束时间戳（毫秒） */
  endTimestamp: number;
  /** 倒计时结束回调 */
  onFinish?: () => void;
}

const RedPacketCountdown: React.FC<RedPacketCountdownProps> = ({
  endTimestamp,
  onFinish,
}) => {
  const {calcActualSize} = useScreenSize();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // 计算剩余秒数
  const calculateRemainingSeconds = useMemo(() => {
    return () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((endTimestamp - now) / 1000));
      return remaining;
    };
  }, [endTimestamp]);

  // 初始化剩余时间
  useEffect(() => {
    const initialRemaining = calculateRemainingSeconds();
    setRemainingSeconds(initialRemaining);
  }, [endTimestamp, calculateRemainingSeconds]);

  // 倒计时逻辑
  useEffect(() => {
    // 清除之前的定时器
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    const updateTimer = () => {
      const remaining = calculateRemainingSeconds();
      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        onFinish?.();
      }
    };

    // 立即执行一次
    updateTimer();

    // 设置定时器，每秒更新一次
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [endTimestamp, calculateRemainingSeconds, onFinish]);

  // 格式化时分秒
  const timeValues = useMemo(() => {
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.floor((remainingSeconds % 3600) / 60);
    const seconds = remainingSeconds % 60;

    return {
      hours: hours.toString().padStart(2, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
    };
  }, [remainingSeconds]);

  // 使用calcActualSize计算所有尺寸
  const squareWidth = calcActualSize(35);
  const squareHeight = calcActualSize(39); // 假设317是笔误，应该是31
  const dotSize = calcActualSize(4);
  const dotGap = calcActualSize(8); // 圆点上下间隔
  const squareDotGap = calcActualSize(7); // 方形和圆点的间隔
  const borderRadius = calcActualSize(6); // 圆角大小

  const dynamicStyles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    square: {
      width: squareWidth,
      height: squareHeight,
      borderRadius: borderRadius,
      justifyContent: 'center',
      alignItems: 'center',
    },
    squareText: {
      color: '#FFFFFF',
      fontSize: calcActualSize(16),
      fontWeight: 'bold',
    },
    colonContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: squareDotGap,
    },
    dot: {
      width: dotSize,
      height: dotSize,
      borderRadius: dotSize / 2,
      backgroundColor: '#B52708',
      marginVertical: dotGap / 2,
    },
  });

  return (
    <View style={dynamicStyles.container}>
      {/* 小时 */}
      <LinearGradient
        colors={['#992826', '#780100']}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={dynamicStyles.square}>
        <Text style={dynamicStyles.squareText}>{timeValues.hours}</Text>
      </LinearGradient>

      {/* 第一个冒号（两个圆点） */}
      <View style={dynamicStyles.colonContainer}>
        <View style={dynamicStyles.dot} />
        <View style={dynamicStyles.dot} />
      </View>

      {/* 分钟 */}
      <LinearGradient
        colors={['#992826', '#780100']}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={dynamicStyles.square}>
        <Text style={dynamicStyles.squareText}>{timeValues.minutes}</Text>
      </LinearGradient>

      {/* 第二个冒号（两个圆点） */}
      <View style={dynamicStyles.colonContainer}>
        <View style={dynamicStyles.dot} />
        <View style={dynamicStyles.dot} />
      </View>

      {/* 秒 */}
      <LinearGradient
        colors={['#992826', '#780100']}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
        style={dynamicStyles.square}>
        <Text style={dynamicStyles.squareText}>{timeValues.seconds}</Text>
      </LinearGradient>
    </View>
  );
};

export default RedPacketCountdown;

