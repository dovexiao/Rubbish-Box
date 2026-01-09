import React, { useEffect } from 'react'
import { View, Text, TouchableOpacity, Dimensions, StyleSheet } from 'react-native'
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withSpring,
  runOnJS 
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import { useVideoPlayerStoreV2 } from '@/stores/videoPlayerStoreV2'
import { createStyles } from '@/utils/rpxStyleSheet'

const screenWidth = Dimensions.get('window').width
const screenHeight = Dimensions.get('window').height
const MENU_WIDTH = screenWidth * 0.2 // 侧边栏宽度占屏幕40%

const speedOptions = [3.0, 2.0, 1.5, 1.25, 1.0, 0.5]

/**
 * 倍速设置侧边栏组件 V2 (expo-video)
 * 从屏幕左侧滑出
 */
interface SpeedMenuV2Props {
  onSpeedChange?: (rate: number) => void
}

export const SpeedMenuV2 = ({ onSpeedChange }: SpeedMenuV2Props = {}) => {
  const showSpeedMenu = useVideoPlayerStoreV2((state) => state.showSpeedMenu)
  const setShowSpeedMenu = useVideoPlayerStoreV2((state) => state.setShowSpeedMenu)
  const playbackRate = useVideoPlayerStoreV2((state) => state.playbackRate)
  const setPlaybackRate = useVideoPlayerStoreV2((state) => state.setPlaybackRate)
  
  // 动画值：侧边栏位移 (0: 显示, -MENU_WIDTH: 隐藏)
  const translateX = useSharedValue(-MENU_WIDTH)

  // 监听显示状态变化
  useEffect(() => {
    if (showSpeedMenu) {
      translateX.value = withTiming(0, { duration: 300 })
    } else {
      translateX.value = withTiming(-MENU_WIDTH, { duration: 300 })
    }
  }, [showSpeedMenu])

  // 动画样式
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  const handleSpeedChange = (rate: number) => {
    // 优先使用外部提供的回调，否则使用store
    if (onSpeedChange) {
      onSpeedChange(rate)
    } else {
      setPlaybackRate(rate)
    }
    // 稍微延迟关闭，让用户看到选中效果
    setTimeout(() => {
      setShowSpeedMenu(false)
    }, 150)
  }

  // 如果完全隐藏，不渲染内容以节省资源
  if (!showSpeedMenu) {
    return null
  }

  return (
    <View
      style={styles.overlay}
      pointerEvents={showSpeedMenu ? 'auto' : 'none'}
    >
      {/* 点击空白区域关闭 */}
      <TouchableOpacity 
        style={styles.backdrop} 
        activeOpacity={1} 
        onPress={() => setShowSpeedMenu(false)}
      />
      
      {/* 侧边栏内容 */}
      <Animated.View style={[styles.menuContainer, animatedStyle]}>
        <View style={styles.header}>
          <Text style={styles.title}>倍速设置</Text>
          <Text style={styles.subtitle}>播放速度设置</Text>
        </View>
        
        {/* 倍速选项网格 */}
        <View style={styles.grid}>
          {speedOptions.map((rate) => {
            const isActive = playbackRate === rate
            return (
              <TouchableOpacity
                key={rate}
                style={[
                  styles.optionButton,
                  isActive && styles.optionButtonActive
                ]}
                onPress={() => handleSpeedChange(rate)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.optionText,
                  isActive && styles.optionTextActive
                ]}>
                  {rate === 0.5 ? '0.5X' : `${rate}X`}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </Animated.View>
    </View>
  )
}

const styles = createStyles({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2000, // 最高层级
    flexDirection: 'row-reverse' as const,
  },
  overlayHidden: {
    // 隐藏时不挡住下层操作
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent', // 透明背景，不遮挡视频画面
  },
  menuContainer: {
    width: MENU_WIDTH,
    height: '100%' as const,
    backgroundColor: 'rgba(0, 0, 0, 0.85)', // 半透明黑色背景
    paddingVertical: 40,
    paddingHorizontal: 20,
    justifyContent: 'center' as const,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center' as const, // 标题居中？根据截图侧边栏标题通常居左或居中，这里保持整洁
  },
  title: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold' as const,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  grid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
    gap: 15, // 行间距
  },
  optionButton: {
    width: '45%', // 两列布局
    aspectRatio: 2, // 宽通常大于高
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionButtonActive: {
    backgroundColor: '#fff',
  },
  optionText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500' as const,
  },
  optionTextActive: {
    color: '#000',
    fontWeight: 'bold' as const,
  },
})

export default SpeedMenuV2

