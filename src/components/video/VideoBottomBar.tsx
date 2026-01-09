import React from 'react'
import { View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { VideoProgressBar } from './VideoProgressBar'
import { VideoControls } from './VideoControls'
import { createStyles } from '@/utils/rpxStyleSheet'

export interface VideoBottomBarProps {
  onPlayPause: () => void
  onSeek: (time: number) => void
  canDrag: boolean
  onDragDisabled: () => void
}

/**
 * 视频底部控制栏容器
 * 包含进度条和控制按钮
 * 负责整体布局和背景
 */
export const VideoBottomBar: React.FC<VideoBottomBarProps> = ({
  onPlayPause,
  onSeek,
  canDrag,
  onDragDisabled,
}) => {
  return (
    <LinearGradient
      colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.85)']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* 顶部：进度条 */}
        <View style={styles.progressContainer}>
          <VideoProgressBar
            onSeek={onSeek}
            canDrag={canDrag}
            onDragDisabled={onDragDisabled}
          />
        </View>

        {/* 底部：控制按钮 */}
        <View style={styles.controlsContainer}>
          <VideoControls onPlayPause={onPlayPause} />
        </View>
      </View>
    </LinearGradient>
  )
}

const styles = createStyles({
  container: {
    position: 'absolute' as const,
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 30, // 渐变高度
    paddingBottom: 15, // 底部安全区
    paddingHorizontal: 20,
    zIndex: 800,
  },
  content: {
    flexDirection: 'column' as const,
    gap: 0, // 减小间距
  },
  progressContainer: {
    width: '100%',
    height: 20, // 减少高度，让进度条更紧凑
    justifyContent: 'center',
    marginBottom: -5, // 向上拉一点，使进度条更贴近按钮，或根据需要调整
  },
  controlsContainer: {
    width: '100%',
  },
})

export default VideoBottomBar

