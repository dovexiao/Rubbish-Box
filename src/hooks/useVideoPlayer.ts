import { useCallback, useEffect, useRef } from 'react'
import { Video, Audio } from 'expo-av'
import { AppState } from 'react-native'
import { useVideoPlayerStore } from '@/stores/videoPlayerStore'
import { withTimeout, OperationLock } from '@/utils/video/videoOperationLock'

export interface UseVideoPlayerOptions {
  videoRef: React.RefObject<Video>
  onLoad?: (status: any) => void
  onError?: (error: any) => void
  onProgressUpdate?: (currentTime: number, totalDuration: number) => void
}

/**
 * 视频播放器核心逻辑 Hook
 * 封装播放、暂停、跳转等核心操作
 */
export function useVideoPlayer(options: UseVideoPlayerOptions) {
  const { videoRef, onLoad, onError, onProgressUpdate } = options

  const operationLock = useRef(new OperationLock())
  const userInteractedRef = useRef(false)
  const isLoadedRef = useRef(false)

  const setIsPlaying = useVideoPlayerStore((state) => state.setIsPlaying)
  const setIsVideoReady = useVideoPlayerStore((state) => state.setIsVideoReady)
  const setIsLoading = useVideoPlayerStore((state) => state.setIsLoading)
  const setCurrentTime = useVideoPlayerStore((state) => state.setCurrentTime)
  const setTotalDuration = useVideoPlayerStore((state) => state.setTotalDuration)
  const updateProgress = useVideoPlayerStore((state) => state.updateProgress)


  /**
   * 播放视频
   */
  const play = useCallback(async () => {
    if (!videoRef.current || !isLoadedRef.current) {
      console.log('⚠️ 播放失败: 视频引用不存在或未加载', {
        hasVideoRef: !!videoRef.current,
        isLoaded: isLoadedRef.current
      })
      return
    }

    if (!operationLock.current.tryLock()) {
      console.log('⚠️ 播放失败: 操作锁被占用')
      return
    }

    try {
      // 确保应用在前台 - 如果不在前台，等待一小段时间后重试一次
      let currentState = AppState.currentState
      if (currentState !== 'active') {
        console.log('⚠️ 应用不在前台，等待100ms后重试', { currentState })
        operationLock.current.release()
        
        // 等待应用状态稳定
        await new Promise(resolve => setTimeout(resolve, 100))
        currentState = AppState.currentState
        
        if (currentState !== 'active') {
          console.log('⚠️ 播放失败: 应用仍不在前台', { currentState })
          return
        }
        
        // 重新获取锁
        if (!operationLock.current.tryLock()) {
          console.log('⚠️ 重试时操作锁被占用')
          return
        }
      }


      console.log('▶️ 开始播放视频，AppState:', currentState)
      await withTimeout(videoRef.current.playAsync(), 2000)
      setIsPlaying(true)
      userInteractedRef.current = true
      console.log('✅ 视频播放成功')
    } catch (error) {
      // 过滤掉应用在后台时无法获取音频焦点的错误
      // 这通常发生在页面切换的瞬间，应用状态短暂变为 inactive
      const errorMessage = (error as any)?.message || String(error || '')
      if (errorMessage.includes('AudioFocusNotAcquiredException') || 
          errorMessage.includes('audio focus could not be acquired')) {
        const appState = AppState.currentState
        console.log('⚠️ 音频焦点获取失败（可能是页面切换时的短暂状态变化）', { 
          appState,
          error: errorMessage 
        })
        operationLock.current.release()
        return
      }
      
      console.error('❌ 播放视频时出错:', error)
      onError?.(error)
    } finally {
      operationLock.current.release()
    }
  }, [videoRef, setIsPlaying, onError])

  /**
   * 暂停视频
   */
  const pause = useCallback(async () => {
    if (!videoRef.current || !isLoadedRef.current) {
      return
    }

    if (!operationLock.current.tryLock()) {
      return
    }

    try {
      await withTimeout(videoRef.current.pauseAsync(), 2000)
      setIsPlaying(false)
      userInteractedRef.current = true
    } catch (error) {
      onError?.(error)
    } finally {
      operationLock.current.release()
    }
  }, [videoRef, setIsPlaying, onError])

  /**
   * 切换播放/暂停
   */
  const togglePlay = useCallback(async () => {
    const isPlaying = useVideoPlayerStore.getState().isPlaying
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
    if (!videoRef.current || !isLoadedRef.current) {
      return
    }

    if (!operationLock.current.tryLock()) {
      return
    }

    try {
      await withTimeout(videoRef.current.setPositionAsync(time * 1000), 2000)
      setCurrentTime(time)
      const totalDuration = useVideoPlayerStore.getState().totalDuration
      if (totalDuration > 0) {
        updateProgress(time, totalDuration)
      }
    } catch (error) {
      onError?.(error)
    } finally {
      operationLock.current.release()
    }
  }, [videoRef, setCurrentTime, updateProgress, onError])

  /**
   * 设置播放速度
   */
  const setPlaybackRate = useCallback(async (rate: number) => {
    if (!videoRef.current || !isLoadedRef.current) {
      return
    }

    try {
      await withTimeout(videoRef.current.setRateAsync(rate, true), 2000)
      useVideoPlayerStore.getState().setPlaybackRate(rate)
    } catch (error) {
      // 过滤掉应用在后台时无法获取音频焦点的错误
      const errorMessage = (error as any)?.message || String(error || '')
      if (errorMessage.includes('AudioFocusNotAcquiredException') ||
          errorMessage.includes('audio focus could not be acquired')) {
        const appState = AppState.currentState
        console.log('⚠️ 音频焦点获取失败（可能是页面切换时的短暂状态变化）', {
          appState,
          error: errorMessage
        })
        return
      }

      onError?.(error)
    }
  }, [videoRef, onError])

  /**
   * 处理视频加载完成
   */
  const handleLoad = useCallback((status: any) => {
    isLoadedRef.current = true
    setIsLoading(false)

    if (status.isLoaded) {
      const duration = status.durationMillis
        ? status.durationMillis / 1000
        : 0

      if (duration > 0) {
        setTotalDuration(duration)
      }
    }

    onLoad?.(status)
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
  const handlePlaybackStatusUpdate = useCallback((status: any) => {
    if (!status.isLoaded) {
      return
    }

    if (status.didJustFinish) {
      setIsPlaying(false)
      useVideoPlayerStore.getState().setIsCompleted(true)
      return
    }

    // 🔒 如果正在拖动进度条，跳过进度更新，避免闪烁
    const isDragging = useVideoPlayerStore.getState().isDragging
    if (isDragging) {
      return
    }

    if (status.positionMillis !== undefined) {
      const currentTime = status.positionMillis / 1000
      const totalDuration = status.durationMillis
        ? status.durationMillis / 1000
        : useVideoPlayerStore.getState().totalDuration

      setCurrentTime(currentTime)
      updateProgress(currentTime, totalDuration)
      onProgressUpdate?.(currentTime, totalDuration)
    }

    if (status.isPlaying !== undefined) {
      setIsPlaying(status.isPlaying)
    }
  }, [setIsPlaying, setCurrentTime, updateProgress, onProgressUpdate])

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
    if (userInteractedRef.current || !videoRef.current || !isLoadedRef.current) {
      console.log('⚠️ 自动播放跳过: 用户已交互或视频未准备好', {
        userInteracted: userInteractedRef.current,
        hasVideoRef: !!videoRef.current,
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

      // seek 和 play 内部会各自管理锁，这里不需要额外加锁
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
  }, [videoRef, play, seek, onError])

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

