import React, {useEffect} from 'react';
import {ViewStyle, TouchableOpacity} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {Ionicons} from '@expo/vector-icons';
import {createStyles, rpx} from '../../../utils/rpxStyleSheet';
import {useReaderThemeStore} from '../../../stores/readerThemeStore';

export interface BackButtonProps {
  /** 是否显示返回键，由外部控制 */
  visible: boolean;
  /** 覆盖容器样式（位置等） */
  containerStyle?: ViewStyle;
  /** 点击返回时的回调 */
  onPress?: () => void;
}

const BackButton: React.FC<BackButtonProps> = ({
  visible,
  containerStyle,
  onPress,
}) => {
  const {themes, currentThemeIndex} = useReaderThemeStore();

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const translateY = useSharedValue(-10);

  // 根据 visible 控制返回键的强调进入 / 低调退出
  useEffect(() => {
    if (visible) {
      // 强调进入：轻微放大 + 下移 + 淡入
      opacity.value = 0;
      scale.value = 0.8;
      translateY.value = -10;

      opacity.value = withTiming(1, {
        duration: 260,
        easing: Easing.out(Easing.cubic),
      });
      scale.value = withTiming(1, {
        duration: 260,
        easing: Easing.out(Easing.back(1.2)),
      });
      translateY.value = withTiming(0, {
        duration: 260,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      // 低调退出：轻微缩小 + 上移 + 淡出
      opacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      });
      scale.value = withTiming(0.9, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      });
      translateY.value = withTiming(-10, {
        duration: 200,
        easing: Easing.in(Easing.ease),
      });
    }
  }, [visible, opacity, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      {scale: scale.value},
      {translateY: translateY.value},
    ],
  }));

  return (
    <Animated.View style={[styles.container, containerStyle, animatedStyle]}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <Ionicons name="close-circle" size={rpx(23.4375)} color={themes[currentThemeIndex].textColor + '80'} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = createStyles({
  container: {
    position: 'absolute' as const,
    top: 37.109375,
    left: 25.390625,
    zIndex: 10,
  },
});

export default BackButton;


