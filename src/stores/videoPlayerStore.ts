import { create } from 'zustand'

/**
 * 视频播放器状态接口
 */
export interface VideoPlayerState {
  // 播放状态
  isPlaying: boolean
  isVideoReady: boolean
  isLoading: boolean
  
  // 进度状态
  currentTime: number // 秒
  totalDuration: number // 秒
  progressPercent: number // 0-100
  isDragging: boolean // 是否正在拖动进度条
  
  // 播放控制
  playbackRate: number
  showControls: boolean
  showSpeedMenu: boolean
  
  // 学习相关
  showCompleteTip: boolean
  isCompleted: boolean
  
  // Actions - 播放控制
  setIsPlaying: (isPlaying: boolean) => void
  setIsVideoReady: (isReady: boolean) => void
  setIsLoading: (isLoading: boolean) => void
  
  // Actions - 进度控制
  setCurrentTime: (time: number) => void
  setTotalDuration: (duration: number) => void
  setProgressPercent: (percent: number) => void
  updateProgress: (currentTime: number, totalDuration: number) => void
  setIsDragging: (isDragging: boolean) => void
  
  // Actions - 播放控制
  setPlaybackRate: (rate: number) => void
  setShowControls: (show: boolean) => void
  setShowSpeedMenu: (show: boolean) => void
  
  // Actions - 学习相关
  setShowCompleteTip: (show: boolean) => void
  setIsCompleted: (isCompleted: boolean) => void
  
  // 重置状态
  reset: () => void
}

/**
 * 初始状态
 */
const initialState = {
  isPlaying: false,
  isVideoReady: false,
  isLoading: true,
  currentTime: 0,
  totalDuration: 0,
  progressPercent: 0,
  isDragging: false,
  playbackRate: 1,
  showControls: true,
  showSpeedMenu: false,
  showCompleteTip: false,
  isCompleted: false,
}

/**
 * 视频播放器状态管理 Store
 */
export const useVideoPlayerStore = create<VideoPlayerState>((set) => ({
  ...initialState,
  
  // 播放控制
  setIsPlaying: (isPlaying) => set({ isPlaying }),
  setIsVideoReady: (isReady) => set({ isVideoReady: isReady }),
  setIsLoading: (isLoading) => set({ isLoading }),
  
  // 进度控制
  setCurrentTime: (time) => {
    set((state) => {
      // 🔒 如果正在拖动，不更新 progressPercent，避免闪烁
      if (state.isDragging) {
        return {
          currentTime: time,
        }
      }
      const newPercent = state.totalDuration > 0 
        ? (time / state.totalDuration) * 100 
        : 0
      return {
        currentTime: time,
        progressPercent: newPercent,
      }
    })
  },
  
  setTotalDuration: (duration) => {
    set((state) => {
      // 🔒 如果正在拖动，不更新 progressPercent，避免闪烁
      if (state.isDragging) {
        return {
          totalDuration: duration,
        }
      }
      const newPercent = duration > 0 
        ? (state.currentTime / duration) * 100 
        : 0
      return {
        totalDuration: duration,
        progressPercent: newPercent,
      }
    })
  },
  
  setProgressPercent: (percent) => {
    set((state) => {
      // 🔒 如果正在拖动，不更新 progressPercent，避免闪烁
      if (state.isDragging) {
        return state
      }
      return { progressPercent: Math.max(0, Math.min(100, percent)) }
    })
  },
  
  updateProgress: (currentTime, totalDuration) => {
    set((state) => {
      // 🔒 如果正在拖动，不更新 progressPercent，避免闪烁
      if (state.isDragging) {
        return {
          currentTime,
          totalDuration,
        }
      }
      const newPercent = totalDuration > 0 
        ? (currentTime / totalDuration) * 100 
        : 0
      return {
        currentTime,
        totalDuration,
        progressPercent: newPercent,
      }
    })
  },
  
  setIsDragging: (isDragging) => set({ isDragging }),
  
  // 播放控制
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  setShowControls: (show) => set({ showControls: show }),
  setShowSpeedMenu: (show) => set({ showSpeedMenu: show }),
  
  // 学习相关
  setShowCompleteTip: (show) => set({ showCompleteTip: show }),
  setIsCompleted: (isCompleted) => set({ isCompleted }),
  
  // 重置状态
  reset: () => set(initialState),
}))

/**
 * 选择器：是否正在播放
 */
export const selectIsPlaying = (state: VideoPlayerState) => state.isPlaying

/**
 * 选择器：视频是否准备好
 */
export const selectIsVideoReady = (state: VideoPlayerState) => state.isVideoReady

/**
 * 选择器：当前播放时间
 */
export const selectCurrentTime = (state: VideoPlayerState) => state.currentTime

/**
 * 选择器：总时长
 */
export const selectTotalDuration = (state: VideoPlayerState) => state.totalDuration

/**
 * 选择器：播放进度百分比
 */
export const selectProgressPercent = (state: VideoPlayerState) => state.progressPercent

