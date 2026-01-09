import { useCallback, useEffect, useRef } from 'react'
import { VideoPlayer } from 'expo-video'
import { AppState } from 'react-native'
import { useVideoPlayerStoreV2 } from '@/stores/videoPlayerStoreV2'
import { withTimeout, OperationLock } from '@/utils/video/videoOperationLock'

export interface UseVideoPlayerV2Options {
  player: VideoPlayer | null
  onLoad?: (duration: number) => void
  onError?: (error: any) => void
  onProgressUpdate?: (currentTime: number, totalDuration: number) => void
}

/**
 * 视频播放器核心逻辑 Hook V2 (expo-video)
 * 封装播放、暂停、跳转等核心操作
 */
export function useVideoPlayerV2(options: UseVideoPlayerV2Options) {
  const { player, onLoad, onError, onProgressUpdate } = options

  const operationLock = useRef(new OperationLock())
  const userInteractedRef = useRef(false)
  const isLoadedRef = useRef(false)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isManualControlRef = useRef(false) // 标记是否是手动控制（避免监听器重复更新）

  const setIsPlaying = useVideoPlayerStoreV2((state) => state.setIsPlaying)
  const setIsVideoReady = useVideoPlayerStoreV2((state) => state.setIsVideoReady)
  const setIsLoading = useVideoPlayerStoreV2((state) => state.setIsLoading)
  const setCurrentTime = useVideoPlayerStoreV2((state) => state.setCurrentTime)
  const setTotalDuration = useVideoPlayerStoreV2((state) => state.setTotalDuration)
  const updateProgress = useVideoPlayerStoreV2((state) => state.updateProgress)

  /**
   * 播放视频
   */
  const play = useCallback(async () => {
    if (!player || !isLoadedRef.current) {
      console.log('⚠️ 播放失败: 播放器不存在或未加载', {
        hasPlayer: !!player,
        isLoaded: isLoadedRef.current
      })
      return
    }

    if (!operationLock.current.tryLock()) {
      console.log('⚠️ 播放失败: 操作锁被占用')
      return
    }

    try {
      // 确保应用在前台
      let currentState = AppState.currentState
      if (currentState !== 'active') {
        console.log('⚠️ 应用不在前台，等待100ms后重试', { currentState })
        operationLock.current.release()
        
        await new Promise(resolve => setTimeout(resolve, 100))
        currentState = AppState.currentState
        
        if (currentState !== 'active') {
          console.log('⚠️ 播放失败: 应用仍不在前台', { currentState })
          return
        }
        
        if (!operationLock.current.tryLock()) {
          console.log('⚠️ 重试时操作锁被占用')
          return
        }
      }

      console.log('▶️ 开始播放视频 (expo-video)，AppState:', currentState)
      isManualControlRef.current = true // 标记为手动控制
      player.play()
      setIsPlaying(true) // 立即更新状态，提供即时反馈
      userInteractedRef.current = true
      console.log('✅ 视频播放成功')
      // 延迟重置标记，让监听器可以继续工作
      setTimeout(() => {
        isManualControlRef.current = false
      }, 100)
    } catch (error) {
      console.error('❌ 播放视频时出错:', error)
      onError?.(error)
    } finally {
      operationLock.current.release()
    }
  }, [player, setIsPlaying, onError])

  /**
   * 暂停视频
   */
  const pause = useCallback(async () => {
    if (!player || !isLoadedRef.current) {
      return
    }

    if (!operationLock.current.tryLock()) {
      return
    }

    try {
      isManualControlRef.current = true // 标记为手动控制
      player.pause()
      setIsPlaying(false) // 立即更新状态，提供即时反馈
      userInteractedRef.current = true
      // 延迟重置标记，让监听器可以继续工作
      setTimeout(() => {
        isManualControlRef.current = false
      }, 100)
    } catch (error) {
      onError?.(error)
    } finally {
      operationLock.current.release()
    }
  }, [player, setIsPlaying, onError])

  /**
   * 切换播放/暂停
   */
  const togglePlay = useCallback(async () => {
    const isPlaying = useVideoPlayerStoreV2.getState().isPlaying
    if (isPlaying) {
      await pause()
    } else {
      await play()
    }
  }, [play, pause])

  /**
   * 跳转到指定时间
   */
  const seek = useCallback(async (time: number) => {
    if (!player || !isLoadedRef.current) {
      return
    }

    if (!operationLock.current.tryLock()) {
      return
    }

    try {
      player.currentTime = time
      setCurrentTime(time)
      const totalDuration = useVideoPlayerStoreV2.getState().totalDuration
      if (totalDuration > 0) {
        updateProgress(time, totalDuration)
      }
    } catch (error) {
      onError?.(error)
    } finally {
      operationLock.current.release()
    }
  }, [player, setCurrentTime, updateProgress, onError])

  /**
   * 设置播放速度
   */
  const setPlaybackRate = useCallback(async (rate: number) => {
    if (!player || !isLoadedRef.current) {
      return
    }

    try {
      player.playbackRate = rate
      useVideoPlayerStoreV2.getState().setPlaybackRate(rate)
    } catch (error) {
      onError?.(error)
    }
  }, [player, onError])

  /**
   * 处理视频加载完成
   */
  const handleLoad = useCallback((duration: number) => {
    isLoadedRef.current = true
    setIsLoading(false)

    if (duration > 0) {
      setTotalDuration(duration)
      onLoad?.(duration)
    }
  }, [setIsLoading, setTotalDuration, onLoad])

  /**
   * 处理视频准备显示
   */
  const handleReadyForDisplay = useCallback(() => {
    setIsVideoReady(true)
  }, [setIsVideoReady])

  /**
   * 处理播放状态更新
   */
  const handlePlaybackStatusUpdate = useCallback((currentTime: number, duration: number, isPlaying: boolean) => {
    // 🔒 如果正在拖动进度条，跳过进度更新，避免闪烁
    const isDragging = useVideoPlayerStoreV2.getState().isDragging
    if (isDragging) {
      return
    }

    setCurrentTime(currentTime)
    
    if (duration > 0) {
      const currentDuration = useVideoPlayerStoreV2.getState().totalDuration
      if (currentDuration !== duration) {
        setTotalDuration(duration)
      }
    }
    
    updateProgress(currentTime, duration)
    onProgressUpdate?.(currentTime, duration)

    // 检查是否完成
    if (duration > 0 && currentTime >= duration - 1) {
      useVideoPlayerStoreV2.getState().setIsCompleted(true)
      setIsPlaying(false)
    }

    // 不在这里更新播放状态，让 playingChange 监听器统一管理
    // setIsPlaying(isPlaying)
  }, [setIsPlaying, setCurrentTime, setTotalDuration, updateProgress, onProgressUpdate])

  /**
   * 处理错误
   */
  const handleError = useCallback((error: any) => {
    setIsLoading(false)
    onError?.(error)
  }, [setIsLoading, onError])

  /**
   * 自动播放（从上次观看位置）
   */
  const autoPlay = useCallback(async (lastSavedTime: number) => {
    if (userInteractedRef.current || !player || !isLoadedRef.current) {
      console.log('⚠️ 自动播放跳过: 用户已交互或播放器未准备好', {
        userInteracted: userInteractedRef.current,
        hasPlayer: !!player,
        isLoaded: isLoadedRef.current
      })
      return
    }

    try {
      const currentState = AppState.currentState
      if (currentState !== 'active') {
        console.log('⚠️ 自动播放跳过: 应用不在前台', { currentState })
        return
      }

      if (lastSavedTime > 0) {
        console.log('⏩ 自动播放: 跳转到上次观看位置', lastSavedTime)
        await seek(lastSavedTime)
      }

      console.log('▶️ 自动播放: 开始播放')
      await play()
    } catch (error) {
      console.error('❌ 自动播放失败:', error)
      onError?.(error)
    }
  }, [player, play, seek, onError])

  // 监听播放器状态变化
  useEffect(() => {
    if (!player) return

    // 监听播放状态（只在非手动控制时更新，避免重复更新）
    const playingSubscription = player.addListener('playingChange', (newIsPlaying) => {
      console.log('🎬 播放状态变化:', newIsPlaying, 'isManualControl:', isManualControlRef.current)
      // 如果刚刚手动控制过，跳过这次更新（避免重复）
      if (!isManualControlRef.current) {
        setIsPlaying(newIsPlaying)
      }
    })

    // 监听状态变化
    const statusSubscription = player.addListener('statusChange', (status) => {
      console.log('📊 播放器状态变化:', status)
      
      if (status.status === 'readyToPlay') {
        const duration = status.duration || 0
        handleLoad(duration)
        handleReadyForDisplay()
      } else if (status.status === 'error') {
        handleError(status.error)
      }
    })

    // 定期更新进度
    progressIntervalRef.current = setInterval(() => {
      if (player && isLoadedRef.current) {
        const currentTime = player.currentTime || 0
        const duration = player.duration || 0
        const isPlaying = player.playing
        handlePlaybackStatusUpdate(currentTime, duration, isPlaying)
      }
    }, 250) // 每250ms更新一次

    return () => {
      playingSubscription.remove()
      statusSubscription.remove()
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
      }
    }
  }, [player, handleLoad, handleReadyForDisplay, handleError, handlePlaybackStatusUpdate, setIsPlaying])

  // 自动恢复操作锁（防止卡死）
  useEffect(() => {
    const interval = setInterval(() => {
      if (operationLock.current.isLockedNow()) {
        const lockTime = operationLock.current.getLockTime()
        if (lockTime && Date.now() - lockTime > 5000) {
          console.warn('⚠️ 操作锁超时，自动释放')
          operationLock.current.release()
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return {
    play,
    pause,
    togglePlay,
    seek,
    setPlaybackRate,
    handleLoad,
    handleReadyForDisplay,
    handlePlaybackStatusUpdate,
    handleError,
    autoPlay,
    isLoaded: isLoadedRef.current,
    userInteracted: userInteractedRef.current,
  }
}

