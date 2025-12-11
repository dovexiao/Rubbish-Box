import React, { useRef, useState, useEffect, useCallback } from 'react';
import { View, PanResponder, StyleSheet, Animated, Platform, LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Brightness from 'expo-brightness';
import { rpx } from '../utils/rpxStyleSheet';

interface BrightnessSliderProps {
  initialValue?: number; // 0-100
  style?: any;
}

/**
 * 自定义亮度调节滑块
 * 仿 iOS 控制中心交互，追求极致丝滑
 */
export const BrightnessSlider = ({ initialValue = 50, style }: BrightnessSliderProps) => {
  // 默认给一个宽度，防止 onLayout 延迟导致无法交互
  const [containerWidth, setContainerWidth] = useState(150);
  // 动画值 0-1
  const progress = useRef(new Animated.Value(initialValue / 100)).current;
  // 当前值 ref，用于计算
  const currentValRef = useRef(initialValue / 100);
  // 拖动起始值
  const startValRef = useRef(0);
  
  // 节流定时器
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 初始化
  useEffect(() => {
    // 确保权限
    (async () => {
      if (Platform.OS === 'android') {
        const { status } = await Brightness.getPermissionsAsync();
        if (status !== 'granted') {
          await Brightness.requestPermissionsAsync();
        }
      }
    })();
  }, []);

  // 设置系统亮度（带节流）
  const setSystemBrightness = useCallback((val: number) => {
    if (throttleTimeoutRef.current) return;

    throttleTimeoutRef.current = setTimeout(() => {
        Brightness.setSystemBrightnessAsync(val).catch(err => {
            console.warn('设置亮度失败', err);
        });
        throttleTimeoutRef.current = null;
    }, 50); // 50ms 节流，保证跟手
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false, // 阻止父组件（如ScrollView）夺取控制权
      onPanResponderGrant: (evt) => {
        // 记录起始值，供 Move 使用（改为相对拖动模式，点击不跳变）
        startValRef.current = currentValRef.current;
        console.log('PanGrant: startVal', startValRef.current);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (containerWidth > 0) {
            // 增量
            const diff = gestureState.dx / containerWidth;
            let newVal = startValRef.current + diff;
            newVal = Math.max(0, Math.min(1, newVal));
            
            // 立即更新 UI
            progress.setValue(newVal);
            currentValRef.current = newVal;
            
            // 设置亮度
            setSystemBrightness(newVal);
        }
      },
      onPanResponderRelease: () => {
        // 结束时确保设置一次最终值
        Brightness.setSystemBrightnessAsync(currentValRef.current);
      },
      onPanResponderTerminate: () => {
         Brightness.setSystemBrightnessAsync(currentValRef.current);
      }
    })
  ).current;

  // 测量容器宽度
  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    console.log('BrightnessSlider layout width:', width);
    setContainerWidth(width);
  };

  // 插值计算宽度百分比
  const widthAnim = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View 
      style={[styles.container, style]} 
      onLayout={onLayout}
      collapsable={false} // 防止 Android 视图优化导致手势失效
      {...panResponder.panHandlers}
    >
      {/* 进度条背景（白色填充） */}
      <Animated.View style={[styles.fill, { width: widthAnim }]} />
      
      {/* 图标层 - 绝对定位，不阻挡点击 */}
      <View style={styles.iconContainer} pointerEvents="none">
        <Ionicons name="sunny" size={rpx(10)} color="#666" />
      </View>
      
      {/* 文本层 - 绝对定位，右侧显示百分比（可选，为了还原 iOS 风格可以不加，或者加在中间） */}
      {/* <View style={styles.textContainer} pointerEvents="none">
         <Text style={styles.text}>亮度</Text>
      </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 30, 
    backgroundColor: '#FFFFFF33', // 背景色
    borderRadius: 999, // 50% 圆角
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
  },
  fill: {
    height: '100%',
    backgroundColor: '#FFFAFA', // 进度条颜色
    borderRadius: 999, // 四个圆角
  },
  iconContainer: {
    position: 'absolute',
    left: 4, // 稍微靠左一点
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  textContainer: {
      position: 'absolute',
      right: rpx(20),
      top: 0,
      bottom: 0,
      justifyContent: 'center',
  },
  text: {
      fontSize: rpx(12),
      color: '#333'
  }
});

