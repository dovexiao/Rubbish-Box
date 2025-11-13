import React, {useEffect, useRef, useCallback, useState, useMemo} from 'react';
import {StyleSheet, Pressable, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  runOnJS,
  cancelAnimation,
} from 'react-native-reanimated';
import {LazyImageBackground} from '@/components/basic/image';
import {useScreenSize} from '@/common-pages/hooks/size.hooks';
import useRedPacketFloatButtonStore from './red-packet-float-button.store';
import Text from '@/components/basic/text';
import theme from '@/style';
import {Image} from 'react-native';
import {NativeTouchableOpacity} from '@/components/basic/touchable-opacity';

interface RedPacketFloatButtonProps {
  parentHeight: number;
  endTimestamp?: number;
  onPress?: () => void;
  enableBreathing?: boolean; // 是否启用呼吸效果
  visible?: boolean; // 是否可见
  onCountdownFinish?: () => void; // 倒计时结束回调
  onHide?: () => void; // 隐藏回调
}

const RedPacketFloatButton: React.FC<RedPacketFloatButtonProps> = ({
  parentHeight,
  onPress,
  enableBreathing = true, // 默认启用呼吸效果
  visible = true, // 默认可见
  onCountdownFinish,
  onHide,
}) => {
  const {calcActualSize} = useScreenSize();
  const buttonWidth = calcActualSize(75);
  const buttonHeight = buttonWidth; // 1:1 宽高比
  const rightOffset = calcActualSize(10); // 距离右侧边缘的距离
  const closeButtonWidth = calcActualSize(15); // 关闭按钮宽度
  const closeButtonHeight = calcActualSize(14.5); // 关闭按钮高度

  const {positionRatio, setPositionRatio, endTimestamp: storeEndTimestamp} =
    useRedPacketFloatButtonStore();
  // 使用传入的 endTimestamp 或 store 中的 endTimestamp
  const endTimestamp = useMemo(() => {
    return storeEndTimestamp;
  }, [storeEndTimestamp]);

  // 倒计时相关状态
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const onCountdownFinishRef = useRef(onCountdownFinish);
  const onHideRef = useRef(onHide);
  const handleHideRef = useRef<((callback?: () => void) => void) | null>(null);

  // 计算剩余秒数
  const calculateRemainingSeconds = useCallback(() => {
    if (!endTimestamp) return 0;
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((endTimestamp - now) / 1000));
    return remaining;
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
      timerRef.current = null;
    }

    if (!endTimestamp) {
      setRemainingSeconds(0);
      return;
    }

    const updateTimer = () => {
      const remaining = calculateRemainingSeconds();
      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        // 触发隐藏动画，动画结束后再执行回调
        handleHideRef.current?.(() => {
          onCountdownFinishRef.current?.();
        });
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
  }, [endTimestamp, calculateRemainingSeconds]);

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

  // 格式化倒计时显示文本
  const countdownText = useMemo(() => {
    return `${timeValues.hours} : ${timeValues.minutes} : ${timeValues.seconds}`;
  }, [timeValues]);

  const translateY = useSharedValue(0);
  const startY = useSharedValue(0);
  const parentHeightRef = useRef(parentHeight);
  const isDragging = useSharedValue(false);
  const isDraggingRef = useRef(false); // 用于在 Pressable 中访问拖动状态
  const scale = useSharedValue(1); // 呼吸动画的缩放值
  const closeButtonTranslateY = useSharedValue(0); // 关闭按钮的垂直移动值
  const closeButtonMovedUp = useSharedValue(false); // 标记关闭按钮是否已经上移
  const opacity = useSharedValue(1); // 透明度
  const isHiding = useSharedValue(false); // 是否正在隐藏

  // 更新回调引用
  useEffect(() => {
    onCountdownFinishRef.current = onCountdownFinish;
    onHideRef.current = onHide;
  }, [onCountdownFinish, onHide]);

  // 计算有效位置范围
  const getValidPositionRange = (height: number) => {
    const topOffset = 20;
    const minY = Math.max(0, height * 0.05 - topOffset);
    const maxY = Math.max(minY, height * 0.95 - buttonHeight - topOffset);
    return {minY, maxY, topOffset};
  };

  useEffect(() => {
    parentHeightRef.current = parentHeight;
    // 初始化位置时，从 store 读取保存的位置或使用默认位置
    if (parentHeight > 0) {
      const {minY, maxY, topOffset} = getValidPositionRange(parentHeight);
      let initialY: number;
      // console.log('存储的位置', positionRatio);
      if (positionRatio !== null && positionRatio >= 0 && positionRatio <= 1) {
        // 从保存的百分比恢复位置
        const savedY = parentHeight * positionRatio - topOffset;
        initialY = Math.max(minY, Math.min(maxY, savedY));
      } else {
        // 使用默认位置（60%处）
        initialY = Math.max(
          minY,
          Math.min(maxY, parentHeight * 0.6 - topOffset),
        );
      }
      translateY.value = initialY;
    }
  }, []);

  // 呼吸动画效果：周期性变大变小
  useEffect(() => {
    if (enableBreathing) {
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
    } else {
      // 如果禁用呼吸效果，恢复到正常大小
      scale.value = withTiming(1, {
        duration: 300,
        easing: Easing.inOut(Easing.ease),
      });
    }

    // 清理函数：组件卸载或依赖项变化时，取消动画
    return () => {
      // 直接赋值当前值来停止动画
      // react-native-reanimated 会在赋值新值时自动取消之前的动画
      // 这里赋值当前值可以确保动画停止，同时保持视觉连续性
      const currentValue = scale.value;
      scale.value = currentValue;
    };
  }, [enableBreathing, scale]);

  // 限制按钮位置，确保在 parentHeight 的中间 90% 范围内（5% 到 95%）
  const clampPosition = (y: number): number => {
    'worklet';
    const topOffset = 20; // 固定的 top 值
    // 最小位置：parentHeight 的 5% 减去 topOffset
    const minY = Math.max(0, parentHeightRef.current * 0.05 - topOffset);
    // 最大位置：parentHeight 的 95% 减去按钮高度和 topOffset
    const maxY = Math.max(
      minY,
      parentHeightRef.current * 0.95 - buttonHeight - topOffset,
    );
    return Math.max(minY, Math.min(maxY, y));
  };

  // 隐藏处理函数
  const handleHide = useCallback(
    (callback?: () => void) => {
      if (isHiding.value) {
        return; // 如果已经在隐藏中，不重复执行
      }
      isHiding.value = true;

      // 1. 取消呼吸动画，重置 scale
      cancelAnimation(scale);
      scale.value = 1;

      // 2. 暴力打断可能的手势拖动
      cancelAnimation(translateY);
      cancelAnimation(closeButtonTranslateY);
      isDragging.value = false;
      isDraggingRef.current = false;

      // 3. 计算向下位移
      const currentCloseButtonY = translateY.value;
      const downOffset = 20;
      const finalTranslateY = currentCloseButtonY + downOffset;

      // 4. 执行渐变跳跃式隐藏动画
      opacity.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      });
      translateY.value = withTiming(finalTranslateY, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      }, (finished) => {
        if (finished) {
          // 动画结束后执行回调
          if (callback) {
            runOnJS(callback)();
          }
        }
      });
    },
    [scale, translateY, closeButtonTranslateY, isDragging, opacity, isHiding],
  );

  // 更新 handleHide 引用
  useEffect(() => {
    handleHideRef.current = handleHide;
  }, [handleHide]);

  // 重置拖动状态的函数
  const resetDraggingState = useCallback(() => {
    isDraggingRef.current = false;
    isDragging.value = false;
  }, []);

  const resetDragStateAfterDelay = useCallback(() => {
    const timer = setTimeout(() => {
      resetDraggingState();
      clearTimeout(timer);
    }, 100);
  }, [])

  const panGesture = Gesture.Pan()
    .activeOffsetY([-10, 10]) // 只响应垂直方向的拖动
    .onStart(() => {
      startY.value = translateY.value;
      isDragging.value = false;
      isDraggingRef.current = false;
      closeButtonMovedUp.value = false; // 重置关闭按钮移动状态
    })
    .onUpdate(event => {
      // 如果垂直移动距离超过阈值，认为是拖动
      if (Math.abs(event.translationY) > 5) {
        isDragging.value = true;
        isDraggingRef.current = true;
        // 拖动时，关闭按钮上移动画（只在第一次检测到拖动时触发）
        if (!closeButtonMovedUp.value) {
          closeButtonMovedUp.value = true;
          closeButtonTranslateY.value = withTiming(-buttonHeight / 2, {
            duration: 200,
            easing: Easing.out(Easing.ease),
          });
        }
      }
      // 只使用垂直方向的移动
      const newY = startY.value + event.translationY;
      translateY.value = clampPosition(newY);
    })
    .onEnd(() => {
      const finalY = clampPosition(translateY.value);
      translateY.value = withSpring(finalY);
      // 结束拖动时，关闭按钮下移动画
      if (closeButtonMovedUp.value) {
        closeButtonMovedUp.value = false;
        closeButtonTranslateY.value = withTiming(0, {
          duration: 200,
          easing: Easing.out(Easing.ease),
        });
      }
      // console.log('拖动状态', isDraggingRef.current, isDragging.value);
      // 拖动结束后，保存位置到 store
      if (isDraggingRef.current || isDragging.value) {
        const topOffset = 20;
        const actualPosition = topOffset + finalY;
        const ratio = actualPosition / parentHeightRef.current;
        // console.log('滑动结束', ratio);
        runOnJS(setPositionRatio)(ratio);
        // 延迟重置拖动状态，确保 Pressable 的 onPress 能正确判断
        runOnJS(resetDragStateAfterDelay)();
      } else {
        // 如果没有拖动，立即重置状态
        runOnJS(resetDraggingState)();
      }
    });

  // 外层容器的动画样式（拖动效果 + 隐藏效果）
  const wrapperAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{translateY: translateY.value}],
    };
  }, [opacity, translateY]);

  // 按钮的动画样式（呼吸效果）
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{scale: scale.value}],
    };
  }, [scale]);

  // 关闭按钮的动画样式（上下移动）
  const closeButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: closeButtonTranslateY.value}],
    };
  }, [closeButtonTranslateY]);

  // 计算文本容器样式
  const textContainerStyle = useMemo(() => {
    return {
      marginBottom: calcActualSize(7),
      marginHorizontal: calcActualSize(5),
      marginTop: calcActualSize(44),
    };
  }, [calcActualSize]);

  const textStyle = useMemo(() => {
    return {
      fontSize: calcActualSize(9),
      lineHeight: calcActualSize(14),
    };
  }, [calcActualSize]);

   // 如果不可见，不渲染组件
   if (!visible) {
    return null;
  }

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View
        style={[
          styles.wrapper,
          {
            right: rightOffset,
          },
          wrapperAnimatedStyle,
        ]}>
        <Animated.View
          style={[
            styles.container,
            {
              width: buttonWidth,
              height: buttonHeight,
            },
            buttonAnimatedStyle,
          ]}>
          <Pressable
            onPress={() => {
              // 只有在没有拖动的情况下才触发点击
              if (!isDraggingRef.current && onPress) {
                onPress();
              }
            }}
            style={styles.pressable}>
            <LazyImageBackground
              imageUrl={require('@assets/imgs/withdraw/redPacket-float-button.webp')}
              width={buttonWidth}
              height={buttonHeight}
              style={styles.imageBackground}
            >
              <View style={[styles.textContainer, textContainerStyle]}>
                <Text style={[styles.countdownText, textStyle]} color="#FFF090">
                  {countdownText}
                </Text>
                <Text style={[styles.failureText, textStyle]} color="#FFF090">
                  after failure
                </Text>
              </View>
            </LazyImageBackground>
          </Pressable>
        </Animated.View>
        <Animated.View
          style={[
            styles.closeButtonContainer,
            theme.margin.topm,
            closeButtonAnimatedStyle,
          ]}>
          <NativeTouchableOpacity
            onPress={() => {
              // 触发隐藏动画，动画结束后再执行回调
              if (isDraggingRef.current) {
                return;
              }
              handleHide(() => {
                onHideRef.current?.();
              });
            }}
            style={styles.closeButton}>
            <Image
              source={require('@assets/imgs/withdraw/redPacket-float-button-close.webp')}
              style={[
                {
                  width: closeButtonWidth,
                  height: closeButtonHeight,
                },
              ]}
            />
          </NativeTouchableOpacity>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: 20,
    zIndex: 10,
    alignItems: 'center', // 水平方向居中
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2, // 红包按钮在上层，遮住关闭按钮
  },
  pressable: {
    width: '100%',
    height: '100%',
  },
  imageBackground: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    alignItems: 'center', // 水平方向居中
    justifyContent: 'center',
  },
  countdownText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  failureText: {
    textAlign: 'center',
    fontWeight: 'bold',
  },
  closeButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1, // 关闭按钮在下层，上移时被红包按钮遮住
  },
  closeButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RedPacketFloatButton;
