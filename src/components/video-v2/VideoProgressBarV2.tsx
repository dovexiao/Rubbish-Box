import React, { useState, useRef, useMemo, useCallback } from 'react'
import { View, Text, LayoutChangeEvent, TouchableOpacity, StyleSheet } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  interpolate,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useVideoPlayerStoreV2 } from '@/stores/videoPlayerStoreV2'
import { formatTime } from '@/utils/video/videoTimeUtils'
import { createStyles } from '@/utils/rpxStyleSheet'

export interface VideoProgressBarV2Props {
  onSeek?: (time: number) => void
  canDrag?: boolean
  onDragDisabled?: () => void
  onDragStart?: () => void // 拖动开始回调
  onDragEnd?: () => void // 拖动结束回调
}

/**
 * 视频进度条组件 V2 (expo-video)
 * 支持点击和拖动手势
 */
export const VideoProgressBarV2: React.FC<VideoProgressBarV2Props> = ({
  onSeek,
  canDrag = true,
  onDragDisabled,
  onDragStart,
  onDragEnd,
}) => {
  const [progressBarWidth, setProgressBarWidth] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragTime, setDragTime] = useState(0)
  const [timeDelta, setTimeDelta] = useState(0)
  
  const currentTime = useVideoPlayerStoreV2((state) => state.currentTime)
  const totalDuration = useVideoPlayerStoreV2((state) => state.totalDuration)
  const progressPercent = useVideoPlayerStoreV2((state) => state.progressPercent)
  const setStoreIsDragging = useVideoPlayerStoreV2((state) => state.setIsDragging)

  // 使用 SharedValue 来获得更流畅的动画
  const dragPercent = useSharedValue(0)
  const indicatorOpacity = useSharedValue(0)
  const indicatorScale = useSharedValue(0.8)
  const startTimeSnapshot = useSharedValue(0)
  const progressBarWidthSV = useSharedValue(0)
  const isDraggingSV = useSharedValue(false) // 用于 worklet 中检查拖动状态

  // 根据位置计算时间
  const calculateTimeFromX = (x: number): number => {
    if (!totalDuration || !progressBarWidth) return 0
    const clickX = Math.max(0, Math.min(progressBarWidth, x))
    const percent = clickX / progressBarWidth
    const newTime = percent * totalDuration
    return Math.floor(Math.max(0, Math.min(totalDuration, newTime)))
  }

  // 处理布局变化
  const handleLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout
    setProgressBarWidth(width)
    progressBarWidthSV.value = width
  }

  // 更新显示文本的函数（用于 runOnJS）
  const updateDisplayText = useCallback((percent: number, time: number, delta: number) => {
    setDragTime(time)
    setTimeDelta(delta)
  }, [])

  // 显示拖动指示器
  const showDragIndicator = useCallback(() => {
    indicatorOpacity.value = withTiming(1, { duration: 200 })
    indicatorScale.value = withTiming(1, { duration: 200 })
  }, [])

  // 隐藏拖动指示器
  const hideDragIndicator = useCallback(() => {
    indicatorOpacity.value = withTiming(0, { duration: 200 })
    indicatorScale.value = withTiming(0.8, { duration: 200 })
  }, [])

  // 初始化拖动（用于 runOnJS）
  const initializeDrag = useCallback((x: number) => {
    if (!canDrag || !totalDuration || !progressBarWidth) {
      return
    }
    startTimeSnapshot.value = currentTime
    isDraggingSV.value = true
    setIsDragging(true)
    setStoreIsDragging(true)
    
    const percent = (x / progressBarWidth) * 100
    const clampedPercent = Math.max(0, Math.min(100, percent))
    dragPercent.value = clampedPercent
    
    const newTime = calculateTimeFromX(x)
    const delta = newTime - currentTime
    updateDisplayText(clampedPercent, newTime, delta)
    
    showDragIndicator()
    onDragStart?.()
  }, [canDrag, totalDuration, progressBarWidth, currentTime, setStoreIsDragging, showDragIndicator, onDragStart])

  // 结束拖动（用于 runOnJS）
  const finalizeDrag = useCallback((x: number) => {
    if (!canDrag || !totalDuration || !progressBarWidth) {
      isDraggingSV.value = false
      setIsDragging(false)
      setStoreIsDragging(false)
      hideDragIndicator()
      return
    }
    const seekTime = calculateTimeFromX(x)
    
    isDraggingSV.value = false
    setIsDragging(false)
    setStoreIsDragging(false)
    hideDragIndicator()
    onDragEnd?.()
    onSeek?.(seekTime)
  }, [canDrag, totalDuration, progressBarWidth, setStoreIsDragging, hideDragIndicator, onDragEnd, onSeek])

  // 使用 react-native-gesture-handler 获得更流畅的拖动体验
  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(3) // 降低阈值，让拖动更灵敏
        .onStart((event) => {
          'worklet'
          if (!canDrag) {
            if (onDragDisabled) {
              runOnJS(onDragDisabled)()
            }
            return
          }
          if (!totalDuration || progressBarWidthSV.value === 0) {
            return
          }
          runOnJS(initializeDrag)(event.x)
        })
        .onChange((event) => {
          'worklet'
          if (!canDrag || !totalDuration || progressBarWidthSV.value === 0) {
            return
          }
          // 计算拖动位置（相对于进度条）
          const x = Math.max(0, Math.min(progressBarWidthSV.value, event.x))
          const percent = (x / progressBarWidthSV.value) * 100
          const clampedPercent = Math.max(0, Math.min(100, percent))
          dragPercent.value = clampedPercent
          
          // 计算时间和变化量
          const newTime = (clampedPercent / 100) * totalDuration
          const delta = newTime - startTimeSnapshot.value
          runOnJS(updateDisplayText)(clampedPercent, newTime, delta)
        })
        .onEnd((event) => {
          'worklet'
          runOnJS(finalizeDrag)(event.x)
        })
        .onFinalize(() => {
          'worklet'
          if (isDraggingSV.value) {
            isDraggingSV.value = false
            runOnJS(setIsDragging)(false)
            runOnJS(setStoreIsDragging)(false)
            runOnJS(hideDragIndicator)()
            if (onDragEnd) {
              runOnJS(onDragEnd)()
            }
          }
        }),
    [canDrag, totalDuration, onDragDisabled, initializeDrag, finalizeDrag, updateDisplayText, hideDragIndicator, onDragEnd, setStoreIsDragging]
  )

  // 进度条填充动画样式
  const progressFillStyle = useAnimatedStyle(() => {
    const percent = isDragging ? dragPercent.value : progressPercent
    return {
      width: `${percent}%`,
    }
  })

  // 进度条手柄动画样式
  const progressHandleStyle = useAnimatedStyle(() => {
    const percent = isDragging ? dragPercent.value : progressPercent
    return {
      left: `${percent}%`,
    }
  })

  // 拖动指示器动画样式
  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
    transform: [{ scale: indicatorScale.value }],
  }))

  // 计算时间变化文本
  const getTimeDeltaText = () => {
    const delta = Math.round(timeDelta)
    if (delta > 0) {
      return `+${delta}秒`
    } else if (delta < 0) {
      return `${delta}秒`
    }
    return '0秒'
  }

  // 处理点击（非拖动）
  const handleProgressClick = useCallback((event: any) => {
    if (isDragging) {
      return
    }
    if (!canDrag) {
      onDragDisabled?.()
      return
    }
    if (!totalDuration || !progressBarWidth) {
      return
    }
    const { locationX } = event.nativeEvent
    const seekTime = calculateTimeFromX(locationX)
    onSeek?.(seekTime)
  }, [isDragging, canDrag, totalDuration, progressBarWidth, onDragDisabled, onSeek])

  return (
    <View style={styles.container}>
      {/* 左侧：当前时间 */}
      <Text style={styles.timeText}>
        {formatTime(currentTime)}
      </Text>

      {/* 中间：进度条 */}
      <GestureDetector gesture={panGesture}>
        <View style={styles.progressBar} onLayout={handleLayout}>
          <TouchableOpacity
            style={styles.progressBarTouchable}
            onPress={handleProgressClick}
            activeOpacity={1}
          >
            <View style={styles.progressBarInner}>
              <View style={styles.progressBg} />
              <Animated.View style={[styles.progressFill, progressFillStyle]} />
              <Animated.View style={[styles.progressHandle, progressHandleStyle]} />
            </View>
          </TouchableOpacity>
        </View>
      </GestureDetector>

      {/* 右侧：总时间 */}
      <Text style={styles.timeText}>
        {formatTime(totalDuration)}
      </Text>

      {/* 拖动指示器（类似 YouTube） */}
      {isDragging && (
        <Animated.View style={[styles.dragIndicator, indicatorStyle]}>
          <View style={styles.dragIndicatorContent}>
            {/* 快进/快退图标 */}
            <Ionicons
              name={timeDelta >= 0 ? 'play-forward' : 'play-back'}
              size={24}
              color="#4891FF"
            />
            {/* 时间变化 */}
            <Text style={styles.dragDeltaText}>{getTimeDeltaText()}</Text>
            {/* 预览时间 */}
            <Text style={styles.dragTimeText}>
              {formatTime(dragTime)} / {formatTime(totalDuration)}
            </Text>
          </View>
        </Animated.View>
      )}
    </View>
  )
}

const styles = createStyles({
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    height: 30,
    paddingHorizontal: 0,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500' as const,
    minWidth: 35, // 确保时间文本有足够宽度
    textAlign: 'center' as const,
  },
  progressBar: {
    flex: 1, // 让进度条占据剩余空间
    height: 30, // 增大触摸区域
    justifyContent: 'center' as const,
    marginHorizontal: 8, // 左右时间与进度条的间距
  },
  progressBarTouchable: {
    width: '100%' as const,
    height: '100%' as const,
    justifyContent: 'center' as const,
  },
  progressBarInner: {
    width: '100%' as const,
    height: 2, // 进度条高度
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
    position: 'relative' as const,
  },
  progressBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1,
  },
  progressFill: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    height: '100%' as const,
    backgroundColor: '#4891FF', // 腾讯视频主题色
    borderRadius: 1,
  },
  progressHandle: {
    position: 'absolute' as const,
    top: '50%' as const,
    width: 12,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    marginTop: -6, // 垂直居中 (top: 50% - height/2)
    marginLeft: -6, // 水平居中
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  dragIndicator: {
    position: 'absolute' as const,
    bottom: 60,
    left: '50%' as const,
    marginLeft: -100,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 16,
    width: 200,
    alignItems: 'center' as const,
    zIndex: 1000,
  },
  dragIndicatorContent: {
    alignItems: 'center' as const,
  },
  dragDeltaText: {
    color: '#4891FF',
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginVertical: 8,
  },
  dragTimeText: {
    color: '#fff',
    fontSize: 14,
  },
})

export default VideoProgressBarV2

