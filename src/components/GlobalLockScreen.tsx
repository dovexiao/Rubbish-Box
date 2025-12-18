import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Dimensions, StyleSheet, View, Text, TouchableOpacity, Image } from "react-native"
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  // useAnimatedProps,
  runOnJS,
  useDerivedValue,
  // interpolateColor,
} from "react-native-reanimated"
// import { BlurView } from "expo-blur"
import { createStyles, rpx } from "../utils/rpxStyleSheet"
import { Images } from "../constants/Assets"
import { useLockScreenStore } from "../stores/lockScreenStore"
import StatusBar from "./StatusBar"

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

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window")
const DURATION_UNLOCK = 1000
const DURATION_LOCK = 2500
// const EASING = Easing.bezier(0.33, 0.78, 0.15, 1)
const TRANSLATE_Y_OFFSET = SCREEN_HEIGHT + 50
const PROGRESS_START = 0.6 // 下滑 60% 高度时开始对 children 缩放/模糊

// 轮播相关常量
const AUTO_SCROLL_INTERVAL = 10000 // 自动滑动间隔 10秒

// 绽放动画参数
const DURATION_BLOOM = 2000 // 绽放动画持续时间 700ms
const BLOOM_EASING = Easing.bezier(0.16, 1, 0.3, 1) // cubic-bezier(0.16, 1, 0.3, 1) - 快速启动，极慢停止
const BLOOM_SCALE_START = 0.96 // 缩放起始值
const BLOOM_SCALE_END = 1.0 // 缩放结束值
const BLOOM_OVERLAY_OPACITY_START = 1 // 黑色遮罩起始透明度
const BLOOM_OVERLAY_OPACITY_END = 0 // 黑色遮罩结束透明度

// 单个壁纸视图宽度（设计宽 750rpx，会等比转换为屏幕宽度）
const WALLPAPER_WIDTH = rpx(750)

// const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)

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
  const locked = useLockScreenStore((state) => state.locked)
  const setLocked = useLockScreenStore.getState().setLocked;
  const [showContent, setShowContent] = useState(false) // 内容展示状态（锁屏交互动画结束后为 true）
  const [canUnlock, setCanUnlock] = useState(false) // 控制是否可以解锁（绽放动画结束后才可解锁）
  const [now, setNow] = useState<Date>(new Date()) // 当前时间
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const translateY = useSharedValue(-TRANSLATE_Y_OFFSET)
  const lockOpacity = useSharedValue(0)

  // 绽放动画的 shared values
  const bloomScale = useSharedValue(BLOOM_SCALE_START)
  const bloomOverlayOpacity = useSharedValue(BLOOM_OVERLAY_OPACITY_START)

  // 轮播相关
  const autoScrollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const wallpaperOffsetX = useSharedValue(0) // 当前水平偏移量
  const currentWallpaperIndex = useSharedValue(0) // 当前展示的索引（0 ~ virtualWallpapers.length - 1）

  // 原始图片数据
  const originalWallpapers = useMemo(() => [
    { id: '0', source: Images.lockScreenWallpaper1 },
  ], [])

  // 创建虚拟数据用于无限循环 [...原数据, 第一个项]
  const virtualWallpapers = useMemo(() => {
    return [...originalWallpapers, { ...originalWallpapers[0], id: `${originalWallpapers.length}` }]
  }, [originalWallpapers])

  // 实时时间更新（每秒）
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 60000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  // 自动锁屏：未锁定状态下 10 秒后自动锁屏
  // useEffect(() => {
  //   if (!locked) {
  //     timerRef.current && clearTimeout(timerRef.current)
  //     timerRef.current = setTimeout(() => {
  //       setLocked(true)
  //     }, 5000)
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

  // 锁屏交互动画完成回调
  const onLockAnimationComplete = useCallback(() => {
    setShowContent(true) // 锁屏交互动画结束后，显示内容
  }, [])

  // 解锁动画完成回调
  const onUnlockAnimationComplete = useCallback(() => {
    setShowContent(false) // 解锁动画结束后，隐藏内容
    // 解锁动画结束后，重置绽放动画状态
    bloomScale.value = BLOOM_SCALE_START
    bloomOverlayOpacity.value = BLOOM_OVERLAY_OPACITY_START

    // 重置轮播索引
    currentWallpaperIndex.value = 0
    wallpaperOffsetX.value = 0

    // 停止自动滑动
    if (autoScrollTimerRef.current) {
      clearInterval(autoScrollTimerRef.current)
      autoScrollTimerRef.current = null
    }
  }, [])

  // 自动滑动到下一张
  const scrollToNext = useCallback(() => {
    // 只有在内容展示且锁屏状态下才进行轮播
    if (!showContent || !locked) return

    const currentIndex = currentWallpaperIndex.value
    const targetIndex = currentIndex + 1

    // 目标索引始终在虚拟数据范围内（最后一项是首张的拷贝）
    const maxIndex = virtualWallpapers.length - 1
    const finalIndex = targetIndex > maxIndex ? maxIndex : targetIndex

    // 计算目标偏移量
    const targetOffset = finalIndex * WALLPAPER_WIDTH
    currentWallpaperIndex.value = finalIndex

    wallpaperOffsetX.value = withTiming(
      targetOffset,
      {
        duration: 1500, // 可调节的滑动时长（毫秒）
        easing: Easing.out(Easing.cubic),
      },
      (finished) => {
        if (!finished) return

        // 如果到达虚拟列表最后一项（首张拷贝），瞬间跳回真实首张
        if (finalIndex === maxIndex) {
          wallpaperOffsetX.value = 0
          currentWallpaperIndex.value = 0
        }
      },
    )
  }, [locked, showContent, virtualWallpapers.length])

  // 绽放动画完成回调
  const onBloomComplete = useCallback(() => {
    setCanUnlock(true)

    // 启动自动滑动
    if (originalWallpapers.length > 1) {
      autoScrollTimerRef.current = setInterval(() => {
        scrollToNext()
      }, AUTO_SCROLL_INTERVAL)
    }
  }, [scrollToNext])

  // 解锁回调
  const handleUnlock = useCallback(() => {
    
    // 只有在绽放动画完成后才能解锁
    // if (canUnlock) {
    //   setLocked(false)
    //   onUnlock?.()
    // }
  }, [canUnlock, onUnlock])

  // 锁屏交互动画
  useEffect(() => {
    if (locked) {
      // 重置所有状态
      setShowContent(false)
      setCanUnlock(false)
      bloomScale.value = BLOOM_SCALE_START
      bloomOverlayOpacity.value = BLOOM_OVERLAY_OPACITY_START

      // 锁屏交互动画：从上方滑入
      translateY.value = withTiming(0, { duration: DURATION_LOCK, easing: Easing.out(Easing.ease) })
      lockOpacity.value = withTiming(1, { duration: DURATION_LOCK, easing: Easing.linear }, (finished) => {
        if (finished) {
          // 锁屏交互动画结束后，更新内容展示状态
          runOnJS(onLockAnimationComplete)()
        }
      })
    } else {
      // 解锁时只重置解锁状态，绽放动画状态和内容展示状态等解锁动画完成后再重置
      setCanUnlock(false)
      translateY.value = withTiming(-TRANSLATE_Y_OFFSET, { duration: DURATION_UNLOCK, easing: Easing.in(Easing.quad) })
      lockOpacity.value = withTiming(0, { duration: DURATION_UNLOCK, easing: Easing.linear }, (finished) => {
        if (finished) {
          // 解锁动画结束后，隐藏内容并重置绽放动画状态
          runOnJS(onUnlockAnimationComplete)()
        }
      })
    }
  }, [locked])

  // 内容展示后，执行绽放动画并启动自动滑动
  useEffect(() => {
    if (showContent && locked) {
      // 内容展示后，触发绽放动画
      bloomScale.value = withTiming(BLOOM_SCALE_END, {
        duration: DURATION_BLOOM,
        easing: BLOOM_EASING
      })
      bloomOverlayOpacity.value = withTiming(BLOOM_OVERLAY_OPACITY_END, {
        duration: DURATION_BLOOM,
        easing: BLOOM_EASING
      }, (finished) => {
        if (finished) {
          runOnJS(onBloomComplete)()
        }
      })
    }

    return () => {
      // 停止自动滑动
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current)
        autoScrollTimerRef.current = null
      }
    }
  }, [showContent, locked])

  const progress = useDerivedValue(() => {
    return Math.min(Math.max(translateY.value / TRANSLATE_Y_OFFSET + 1, 0), 1) // -H -> 0 映射到 0 -> 1
  })

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
  })

  const lockAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: interpolate(progress.value, [PROGRESS_START, 1], [0, 1], Extrapolation.CLAMP),
    }
  })

  // const animatedBlurProps = useAnimatedProps(() => {
  //   return {
  //     intensity: interpolate(progress.value, [PROGRESS_START, 1], [0, 80], Extrapolation.CLAMP),
  //   } as any
  // })

  // const blurAnimatedStyle = useAnimatedStyle(() => {
  //   return {
  //     opacity: interpolate(progress.value, [PROGRESS_START, 1], [0, 1], Extrapolation.CLAMP),
  //     // backgroundColor: interpolateColor(progress.value, [PROGRESS_START, 1], ['#00000000', '#00000080'], 'RGB'),
  //   }
  // })

  // 绽放动画样式
  const bloomAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: bloomScale.value }],
    }
  })

  const bloomOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: bloomOverlayOpacity.value,
    }
  })

  // 壁纸长视图动画样式
  const wallpaperStripStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: -wallpaperOffsetX.value,
        },
      ],
    }
  })

  const defaultLockContent = useMemo(
    () => (
      <Animated.View style={[styles.lockContentContainer, bloomAnimatedStyle]}>
        {/* 顶部状态栏 */}
        {/* <StatusBar theme="light" backgroundColor="transparent" translucent={true} /> */}
        {/* 背景图片轮播 */}
        <Animated.View
          style={[
            styles.wallpaperStrip,
            wallpaperStripStyle,
            { width: WALLPAPER_WIDTH * virtualWallpapers.length },
          ]}
        >
          {virtualWallpapers.map((item) => (
            <View key={item.id} style={styles.listItemContainer}>
              <Image
                source={item.source}
                style={styles.lockBackgroundImage}
                resizeMode="cover"
              />
            </View>
          ))}
        </Animated.View>

        {/* 时间视图 */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeDateText}>
            {`${now.getMonth() + 1}月${now.getDate()}日 周${["日", "一", "二", "三", "四", "五", "六"][now.getDay()]}`}
          </Text>
          <View style={styles.timeClockContainer}>
            <Text style={styles.timeClockText}>
              {`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`}
            </Text>
          </View>
        </View>

        {/* 锁屏指示器 */}
        <View style={styles.lockIndicatorContainer}>
          <View style={styles.lockOuterCircle}>
            <View style={styles.lockInnerCircle} />
          </View>
          <Text style={styles.lockHintText}>{unlockText || "点击屏幕解锁"}</Text>
        </View>
        {/* 黑色遮罩层 - 用于实现亮度效果 */}
        <Animated.View style={[styles.lockOverlay, bloomOverlayStyle]} />
      </Animated.View>
    ),
    [unlockText, bloomAnimatedStyle, bloomOverlayStyle, virtualWallpapers],
  )

  useEffect(() => {
    // 卸载时停止自动滑动
    return () => {
      if (autoScrollTimerRef.current) {
        clearInterval(autoScrollTimerRef.current)
        autoScrollTimerRef.current = null
      }
    }
  }, [])

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.childrenWrapper, progressStyle]}>
        {children}
      </Animated.View>

      {/* <Animated.View style={[styles.blurLayer, blurAnimatedStyle]}>
        <AnimatedBlurView
          animatedProps={animatedBlurProps}
          pointerEvents="none"
          // intensity={0}
          blurReductionFactor={10}
          tint="systemChromeMaterialDark"
          experimentalBlurMethod={'dimezisBlurView'}
          style={{ backgroundColor: "#00000080", flex: 1 }}
        />
      </Animated.View> */}

      <Animated.View style={[styles.lockContentWrapper, lockAnimatedStyle]}>
        <TouchableOpacity
          activeOpacity={1}
          style={[StyleSheet.absoluteFillObject, { zIndex: 3 }]}
          onPress={handleUnlock}
          disabled={!canUnlock}
        />
        {showContent && (renderLockContent ? renderLockContent() : defaultLockContent)}
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
  lockContentContainer: {
    flex: 1,
    width: "100%" as const,
    height: "100%" as const,
  },
  wallpaperStrip: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    height: "100%" as const,
    flexDirection: "row" as const,
  },
  listItemContainer: {
    width: 750, // 设计稿宽度，经过 createStyles 会转换为屏幕宽度
    height: "100%" as const,
  },
  lockBackgroundImage: {
    width: "100%" as const,
    height: "100%" as const,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
    zIndex: 1,
  },
  timeContainer: {
    position: "absolute" as const,
    top: 29.6875,
    alignSelf: "center" as const,
    alignItems: "center" as const,
    zIndex: 2,
  },
  timeDateText: {
    fontWeight: "500" as const,
    fontSize: 15.625,
    color: "#FFFFFF99",
  },
  timeClockContainer: {
    height: 65.625, // 168
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  timeClockText: {
    fontWeight: "600" as const,
    fontSize: 46.875,
    color: "#FFFFFF99",
  },
  lockIndicatorContainer: {
    position: "absolute" as const,
    top: 324.6094, // 831
    alignItems: "center" as const,
    alignSelf: "center" as const,
    zIndex: 2,
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


