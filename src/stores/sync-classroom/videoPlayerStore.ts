import { create } from "zustand"

/**
 * 视频播放器 Store 状态接口
 * 用于维护视频播放期间产生的需要在该播放器父组件下子组件之间分享的数据
 */
interface VideoPlayerState {
  // 视频播放总时长（秒）
  totalDuration: number
  
  // 当前视频播放时间（秒）
  currentTime: number
  
  // 操作方法
  setTotalDuration: (duration: number) => void
  setCurrentTime: (time: number) => void
  updatePlaybackTime: (time: number, duration: number) => void
  reset: () => void
}

/**
 * 视频播放器 Store
 * 用于在播放器父组件下的子组件之间共享播放状态数据
 * 避免传参地狱
 */
export const useVideoPlayerStore = create<VideoPlayerState>((set) => ({
  // 初始状态
  totalDuration: 0,
  currentTime: 0,
  
  // 设置总时长
  setTotalDuration: (duration: number) => {
    set({ totalDuration: Math.max(0, duration) })
  },
  
  // 设置当前播放时间
  setCurrentTime: (time: number) => {
    set({ currentTime: Math.max(0, time) })
  },
  
  // 同时更新播放时间和总时长
  updatePlaybackTime: (time: number, duration: number) => {
    set({
      currentTime: Math.max(0, time),
      totalDuration: Math.max(0, duration),
    })
  },
  
  // 重置状态
  reset: () => {
    set({
      totalDuration: 0,
      currentTime: 0,
    })
  },
}))

/**
 * 选择器：获取播放进度百分比
 */
export const selectPlaybackProgress = (state: VideoPlayerState): number => {
  if (state.totalDuration <= 0) return 0
  return (state.currentTime / state.totalDuration) * 100
}

/**
 * 选择器：是否已播放完成
 */
export const selectIsPlaybackComplete = (state: VideoPlayerState): boolean => {
  return state.totalDuration > 0 && state.currentTime >= state.totalDuration
}

export default useVideoPlayerStore

