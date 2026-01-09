import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useVideoPlayerStoreV2 } from '@/stores/videoPlayerStoreV2'
import { createStyles,rpx } from '@/utils/rpxStyleSheet'

export interface VideoControlsV2Props {
  onPlayPause: () => void
  disabled?: boolean
}

/**
 * 视频控制栏组件 V2 (expo-video)
 * 包含播放/暂停、时间显示、倍速等控制按钮
 * 仅负责展示按钮，不包含弹窗逻辑
 */
export const VideoControlsV2: React.FC<VideoControlsV2Props> = ({
  onPlayPause,
  disabled = false,
}) => {
  const isPlaying = useVideoPlayerStoreV2((state) => state.isPlaying)
  const showSpeedMenu = useVideoPlayerStoreV2((state) => state.showSpeedMenu)
  const setShowSpeedMenu = useVideoPlayerStoreV2((state) => state.setShowSpeedMenu)

  return (
    <View style={styles.container}>
      {/* 左侧：播放/暂停按钮 + 时间显示 */}
      <View style={styles.leftControls}>
        <TouchableOpacity
          style={[styles.playButton, disabled && styles.buttonDisabled]}
          onPress={onPlayPause}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isPlaying ? 'pause' : 'play'}
            size={rpx(20)}
            color="#fff"
          />
        </TouchableOpacity>

        {/* 右侧：倍速按钮 */}
        <TouchableOpacity
          style={[styles.speedButton, disabled && styles.buttonDisabled]}
          onPress={() => setShowSpeedMenu(!showSpeedMenu)}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={styles.speedText}>倍速</Text>
        </TouchableOpacity>
      </View>

    
    </View>
  )
}

const styles = createStyles({
  container: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const, // 左右两端对齐
    paddingHorizontal: 0,
    paddingVertical: 5,
    width: '100%' as const,
  },
  leftControls: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    // gap: 8,
  },
  playButton: {
    width: 28,
    height: 40,
    alignItems: 'flex-start' as const, // 左对齐
    justifyContent: 'center' as const,
  },
  speedButton: {
    height: 40,
    justifyContent: 'center' as const,
    alignItems: 'flex-end' as const, // 右对齐
    width: 48,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  speedText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '500' as const,
  },
})

export default VideoControlsV2

