import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useVideoPlayerStore } from '@/stores/videoPlayerStore'
import { createStyles } from '@/utils/rpxStyleSheet'

export interface CenterPlayButtonProps {
  onPress: () => void
  disabled?: boolean
}

/**
 * 中央播放按钮组件
 * 显示在视频中央，用于播放/暂停
 */
export const CenterPlayButton: React.FC<CenterPlayButtonProps> = ({
  onPress,
  disabled = false,
}) => {
  const isPlaying = useVideoPlayerStore((state) => state.isPlaying)
  const showControls = useVideoPlayerStore((state) => state.showControls)

  // 如果正在播放或控制栏隐藏，则不显示
  if (isPlaying || !showControls) {
    return null
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Ionicons
          name="play"
          size={70}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  )
}

const styles = createStyles({
  container: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    zIndex: 1000,
  },
  button: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
})

export default CenterPlayButton

