import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Dimensions, StyleSheet, View, Text, TouchableOpacity } from "react-native"
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  useAnimatedProps,
  runOnJS,
  useDerivedValue,
  interpolateColor,
} from "react-native-reanimated"
import { BlurView } from "expo-blur"
import { createStyles, rpx } from "../utils/rpxStyleSheet"

type GlobalLockScreenProps = {
  /**
   * 自定义锁屏内容（可选），若不传则使用默认样式
   */
  renderLockContent?: () => React.ReactNode
  /**
   * 关闭锁屏的回调
   */
  onUnlock?: () => void
  /**
   * 自定义解锁按钮文案
   */
  unlockText?: string
  /**
   * 子组件
   */
  children: React.ReactNode
}

const { height: SCREEN_HEIGHT } = Dimensions.get("window")
const DURATION_UNLOCK = 1000
const DURATION_LOCK = 2500
const EASING = Easing.bezier(0.33, 0.78, 0.15, 1)
const TRANSLATE_Y_OFFSET = SCREEN_HEIGHT + 50
const PROGRESS_START = 0.6 // 下滑 60% 高度时开始对 children 缩放/模糊

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)

/**
 * 全局锁屏组件
 * - 锁屏内容从屏幕上方 (-H) 滑入到 0，透明度 0 -> 1
 * - children 随滑动进度在 40% 处开始缩放 1 -> 0.85，并叠加模糊 0 -> 1
 * - 内置解锁按钮，点击后反向执行动画并回调 onUnlock
 */
const GlobalLockScreen: React.FC<GlobalLockScreenProps> = ({
  renderLockContent,
  onUnlock,
  unlockText = "解锁",
  children,
}) => {
  const [locked, setLocked] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const translateY = useSharedValue(-TRANSLATE_Y_OFFSET)
  const lockOpacity = useSharedValue(0)

  // 自动锁屏：未锁定状态下 10 秒后自动锁屏
  // useEffect(() => {
  //   if (!locked) {
  //     timerRef.current && clearTimeout(timerRef.current)
  //     timerRef.current = setTimeout(() => {
  //       setLocked(true)
  //     }, 10000)
  //   } else if (timerRef.current) {
  //     clearTimeout(timerRef.current)
  //     timerRef.current = null
  //   }
  //   return () => {
  //     if (timerRef.current) {
  //       clearTimeout(timerRef.current)
  //       timerRef.current = null
  //     }
  //   }
  // }, [locked])

  useEffect(() => {
    if (locked) {
      // translateY.value = withTiming(0, { duration: DURATION, easing: EASING })
      translateY.value = withTiming(0, { duration: DURATION_LOCK, easing: Easing.out(Easing.cubic) })
      lockOpacity.value = withTiming(1, { duration: DURATION_LOCK, easing: Easing.linear })
    } else {
      translateY.value = withTiming(-TRANSLATE_Y_OFFSET, { duration: DURATION_UNLOCK, easing: Easing.in(Easing.quad) })
      lockOpacity.value = withTiming(0, { duration: DURATION_UNLOCK, easing: Easing.linear })
    }
  }, [locked])

  const progress = useDerivedValue(() => {
    return Math.min(Math.max(translateY.value / TRANSLATE_Y_OFFSET + 1, 0), 1) // -H -> 0 映射到 0 -> 1
  }, [translateY.value])

  const progressStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      progress.value,
      [PROGRESS_START, 1],
      [1, 0.85],
      Extrapolation.CLAMP,
    )

    return {
      transform: [{ scale }],
      opacity: 1,
    } as any
  }, [progress, translateY.value])

  const lockAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: interpolate(progress.value, [PROGRESS_START, 1], [0, 1], Extrapolation.CLAMP),
    }
  }, [progress, translateY.value])

  const animatedBlurProps = useAnimatedProps(() => {
    return {
      intensity: interpolate(progress.value, [PROGRESS_START, 1], [0, 100], Extrapolation.CLAMP),
    } as any
  }, [progress, translateY.value])

  const blurAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [PROGRESS_START, 1], [0, 1], Extrapolation.CLAMP),
      // backgroundColor: interpolateColor(progress.value, [PROGRESS_START, 1], ['#00000000', '#00000080'], 'RGB'),
    }
  }, [progress.value])

  const handleUnlock = useCallback(() => {
    setLocked(false)
    onUnlock?.()
  }, [onUnlock])

  const defaultLockContent = useMemo(
    () => (
      <View style={styles.lockIndicatorContainer}>
        <View style={styles.lockOuterCircle}>
          <View style={styles.lockInnerCircle} />
        </View>
        <Text style={styles.lockHintText}>{unlockText || "点击屏幕解锁"}</Text>
      </View>
    ),
    [unlockText],
  )

  const AnimatedChildren = useCallback(() => {
    return (
      <Animated.View style={[styles.childrenWrapper, progressStyle]}>
        {children}
      </Animated.View>
    )
  }, [children, progressStyle])

  return (
    <View style={styles.container}>
      <AnimatedChildren />

      <Animated.View style={[styles.blurLayer, blurAnimatedStyle]}>
        <AnimatedBlurView
          animatedProps={animatedBlurProps}
          pointerEvents="none"
          // intensity={0}
          blurReductionFactor={10}
          tint="systemChromeMaterialDark"
          experimentalBlurMethod={'dimezisBlurView'}
          style={{ backgroundColor: "#00000080", flex: 1 }}
        />
      </Animated.View>

      <Animated.View style={[styles.lockContentWrapper, lockAnimatedStyle]}>
        <TouchableOpacity
          activeOpacity={1}
          style={[StyleSheet.absoluteFillObject, { zIndex: 1}]}
          onPress={handleUnlock}
        />
        {renderLockContent ? renderLockContent() : defaultLockContent}
      </Animated.View>
    </View>
  )
}

const styles = createStyles({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },
  childrenWrapper: {
    flex: 1,
  },
  blurLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  lockContentWrapper: {
    position: "absolute" as const,
    top: 0 as const,
    left: 0 as const,
    right: 0 as const,
    bottom: 0 as const,
    backgroundColor: "#000000",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    zIndex: 2,
  },
  lockIndicatorContainer: {
    position: "absolute" as const,
    top: 324.6094, // 831
    alignItems: "center" as const,
    alignSelf: "center" as const,
  },
  lockOuterCircle: {
    width: 26.5625, // 68
    height: 26.5625, // 68
    borderRadius: 13.2813, // 34
    backgroundColor: "#FFFFFF4D",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  lockInnerCircle: {
    width: 17.1875, // 44
    height: 17.1875, // 44
    borderRadius: 8.5938, // 22
    backgroundColor: "#FFFFFF66",
  },
  lockHintText: {
    marginTop: 6.25, // 16
    fontSize: 10.1563, // 26
    color: "#FFFFFF",
    fontWeight: "300" as const,
  },
})

export default GlobalLockScreen


