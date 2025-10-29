import React, {useEffect} from 'react';
import {StyleSheet, ViewStyle} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import LinearGradient from '@/components/basic/linear-gradient';
import Text from '@basicComponents/text';

type RechargeQipaoProps = {
  // 定位方位值
  top?: number;
  right?: number;
  left?: number;
  bottom?: number;
  // 高
  height: number;
  // 内容文本
  text: string;
  // 内容样式
  fontSize: number;
  color: string;
  // 渐变色属性值
  gradientColors: string[];
  gradientStart?: {x: number; y: number};
  gradientEnd?: {x: number; y: number};
  gradientLocations?: number[];
  // 半角值（左下角为直角，其他三个角使用此半角值）
  borderRadius: number;
};

const RechargeQipao: React.FC<RechargeQipaoProps> = ({
  // 定位
  top,
  right,
  left,
  bottom,
  // 宽高
  height,
  // 内容
  text,
  // 内容样式
  fontSize,
  color,
  // 渐变色
  gradientColors,
  gradientStart = {x: 0, y: 0.5},
  gradientEnd = {x: 1, y: 0.5},
  gradientLocations,
  // 圆角
  borderRadius,
}) => {
  // 创建缩放动画值，初始值为1（正常大小）
  const scale = useSharedValue(1);

  // 呼吸动画效果：先变大再变小，变化幅度相同
  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        // 从1变大到1.1（增加0.1）
        withTiming(1.1, {
          duration: 700,
          easing: Easing.inOut(Easing.ease),
        }),
        // 从1.1变小到1（减少0.1）
        withTiming(1, {
          duration: 700,
          easing: Easing.inOut(Easing.ease),
        }),
      ),
      -1, // 无限循环
      false, // 不反向播放
    );
  }, [scale]);

  // 应用动画样式
  // 添加依赖数组以支持 Web 环境
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: scale.value}],
    };
  }, [scale]);

  // 气泡样式：左下角为直角，其他三个角使用半角值
  const bubbleStyle: ViewStyle = {
    position: 'absolute',
    height,
    borderTopLeftRadius: borderRadius, // 左上角半角
    borderTopRightRadius: borderRadius, // 右上角半角
    borderBottomLeftRadius: 0, // 左下角直角（写死）
    borderBottomRightRadius: borderRadius, // 右下角半角
    overflow: 'hidden', // 确保内容不超出圆角边界
  };

  // 添加定位样式
  if (top !== undefined) bubbleStyle.top = top;
  if (right !== undefined) bubbleStyle.right = right;
  if (left !== undefined) bubbleStyle.left = left;
  if (bottom !== undefined) bubbleStyle.bottom = bottom;

  return (
    <Animated.View style={[bubbleStyle, animatedStyle]}>
      <LinearGradient
        colors={gradientColors}
        start={gradientStart}
        end={gradientEnd}
        locations={gradientLocations}
        style={styles.gradient}>
        <Text fontSize={fontSize} color={color}>
          {text}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default RechargeQipao;
