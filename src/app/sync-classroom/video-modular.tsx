import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions, Platform } from 'react-native'
import { Video, ResizeMode, Audio } from 'expo-av'
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router'
import { StatusBar as RNStatusBar } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  interpolate,
} from 'react-native-reanimated'
import { Ionicons } from '@expo/vector-icons'
import * as Brightness from 'expo-brightness'
import { useVideoPlayerStore } from '@/stores/videoPlayerStore'
import { useActivityTracking } from '@/hooks/useActivityTracking'
import { useVideoPlayer } from '@/hooks/useVideoPlayer'
import { parseTimeToSeconds, formatTime } from '@/utils/video/videoTimeUtils'
import { globalImmersive } from '@/utils/globalImmersive'
import { createStyles, rpx } from '@/utils/rpxStyleSheet'
import { showError } from '@/utils/toast'
import {
  VideoHeader,
  VideoProgressBar,
  VideoControls,
  CenterPlayButton,
  CompleteTip,
} from '@/components/video'
import VideoBottomBar from '@/components/video/VideoBottomBar'
import SpeedMenu from '@/components/video/SpeedMenu'
import {
  getVideoBasicInfo,
  saveStudyProgress,
  generatePracticeQuestions,
  type CourseVideoInfoResponse,
} from '@/services/classroom'
import { useUserStore } from '@/stores/userStore'
import { useDeviceStatusStore, selectCanDragVideo } from '@/stores/deviceStatusStore'

interface VideoParams {
  videoCode?: string
  title?: string
  Duration?: string
  totalDuration?: string
  educational_system?: string
  grade_stage?: string
}

/**
 * 模块化视频播放器组件
 * 使用 expo-av，集成所有模块化组件
 */
export default function VideoPlayerScreenModular() {
  const router = useRouter()
  const params = useLocalSearchParams() as VideoParams
  const userStore = useUserStore()
  const canDragVideo = useDeviceStatusStore(selectCanDragVideo)
  const videoRef = useRef<Video>(null)

  // 活动追踪
  const { startVideo, updateVideoProgress, endVideo } = useActivityTracking({
    throttleDelay: 3000,
    autoExitOnUnmount: true,
  })

  // 页面参数
  const [pointId, setPointId] = useState('')
  const [lessonTitle, setLessonTitle] = useState('')
  const [lastSavedTime, setLastSavedTime] = useState(0)

  // 视频信息状态
  const [videoInfo, setVideoInfo] = useState<CourseVideoInfoResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [videoUrl, setVideoUrl] = useState('')

  // Store 状态
  const reset = useVideoPlayerStore((state) => state.reset)
  const setIsLoading = useVideoPlayerStore((state) => state.setIsLoading)
  const setShowControls = useVideoPlayerStore((state) => state.setShowControls)
  const setShowCompleteTip = useVideoPlayerStore((state) => state.setShowCompleteTip)
  const setIsCompleted = useVideoPlayerStore((state) => state.setIsCompleted)
  const showControls = useVideoPlayerStore((state) => state.showControls)
  const showCompleteTip = useVideoPlayerStore((state) => state.showCompleteTip)
  const isPlaying = useVideoPlayerStore((state) => state.isPlaying)
  
  // 控制栏自动隐藏（仅在播放时自动隐藏，暂停时一直显示）
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null
    if (showControls && isPlaying) {
      timer = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [showControls, isPlaying, setShowControls])

  // 暂停时自动显示控制栏和标题栏
  useEffect(() => {
    if (!isPlaying) {
      setShowControls(true)
    }
  }, [isPlaying, setShowControls])

  // 自动播放标记
  const hasAutoPlayedRef = useRef(false)
  
  // 音频模式设置状态
  const audioModeSetRef = useRef(false)

  // 屏幕尺寸
  const screenWidth = Dimensions.get('window').width
  const screenHeight = Dimensions.get('window').height
  const LEFT_AREA_WIDTH = screenWidth / 3 // 左侧1/3区域用于亮度
  const RIGHT_AREA_WIDTH = screenWidth / 3 // 右侧1/3区域用于音量
  const EFFECTIVE_HEIGHT = rpx(156.25) // 400px，用于计算垂直滑动

  // ==================== 快进快退手势控制 ====================
  const seekStartTime = useSharedValue(0)
  const seekTimeDelta = useSharedValue(0)
  const seekIndicatorOpacity = useSharedValue(0)
  const seekProgressBarWidth = useSharedValue(0)
  const totalDurationSV = useSharedValue(0) // 用于 worklet 中访问总时长
  const [seekDeltaText, setSeekDeltaText] = useState('0秒')
  const [seekPreviewTime, setSeekPreviewTime] = useState('00:00 / 00:00')
  const [seekIconName, setSeekIconName] = useState<'play-forward' | 'play-back'>('play-forward')

  // 同步 totalDuration 到 SharedValue
  const totalDuration = useVideoPlayerStore((state) => state.totalDuration)
  useEffect(() => {
    totalDurationSV.value = totalDuration
  }, [totalDuration, totalDurationSV])

  // ==================== 亮度控制 ====================
  const brightnessProgress = useSharedValue(0.5)
  const brightnessStartProgress = useSharedValue(0.5)
  const brightnessIndicatorOpacity = useSharedValue(0)

  // ==================== 音量控制 ====================
  const volumeProgress = useSharedValue(0.5)
  const volumeStartProgress = useSharedValue(0.5)
  const volumeIndicatorOpacity = useSharedValue(0)

  // 核心播放逻辑
  const {
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
  } = useVideoPlayer({
    videoRef: videoRef as React.RefObject<Video>,
    onLoad: (status) => {
      if (status.isLoaded && status.durationMillis) {
        const duration = status.durationMillis / 1000
        useVideoPlayerStore.getState().setTotalDuration(duration)
      }
    },
    onError: (error) => {
      // 过滤掉应用在后台时无法获取音频焦点的错误（这是正常情况）
      const errorMessage = error?.message || String(error)
      if (errorMessage.includes('AudioFocusNotAcquiredException') || 
          errorMessage.includes('audio focus could not be acquired')) {
        console.log('⚠️ 应用在后台，无法获取音频焦点（正常情况）')
        return
      }
      
      showError('视频播放失败')
      console.error('Video error:', error)
    },
    onProgressUpdate: (currentTime, totalDuration) => {
      updateVideoProgress(currentTime, totalDuration)
      // 检查是否完成
      if (totalDuration > 0 && currentTime >= totalDuration - 1) {
        useVideoPlayerStore.getState().setIsCompleted(true)
      }
    },
  })

  // 初始化页面参数
  useEffect(() => {
    if (params.videoCode && !pointId) {
      const videoCode = params.videoCode
      const title = decodeURIComponent(params.title || '')
      const duration = parseTimeToSeconds(params.Duration || '00:00:00')
      const total = parseTimeToSeconds(params.totalDuration || '00:00:00')

      setPointId(videoCode)
      setLessonTitle(title)
      setLastSavedTime(duration)
      useVideoPlayerStore.getState().setTotalDuration(total)
    }
  }, [params.videoCode, params.title, params.Duration, params.totalDuration, pointId])

  // 加载视频信息
  useEffect(() => {
    if (pointId && !videoUrl) {
      fetchVideoInfo()
      getGeneratePracticeQuestions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointId])

  // 保存学习进度
  const saveProgress = useCallback(async () => {
    const currentTime = useVideoPlayerStore.getState().currentTime
    if (currentTime > 0 && pointId) {
      try {
        await saveStudyProgress({
          video_code: pointId,
          record: `${Math.floor(currentTime / 3600)}:${Math.floor((currentTime % 3600) / 60)}:${Math.floor(currentTime % 60)}`,
          educational_system: params.educational_system || '六三',
          grade_stage: params.grade_stage || '小学',
        })
      } catch (error) {
        // 静默处理错误
      }
    }
  }, [pointId, params.educational_system, params.grade_stage])

  // 自动播放
  useEffect(() => {
    const isVideoReady = useVideoPlayerStore.getState().isVideoReady
    console.log('🔍 自动播放检查:', {
      videoUrl: !!videoUrl,
      loading,
      hasVideoRef: !!videoRef.current,
      isVideoReady,
      hasAutoPlayed: hasAutoPlayedRef.current,
      audioModeSet: audioModeSetRef.current
    })
    
    if (videoUrl && !loading && videoRef.current && isVideoReady && !hasAutoPlayedRef.current) {
      hasAutoPlayedRef.current = true
      console.log('🚀 触发自动播放，等待音频模式设置完成')
      
      // 等待音频模式设置完成的辅助函数
      const waitForAudioMode = async (maxWait = 1000) => {
        const startTime = Date.now()
        while (!audioModeSetRef.current && Date.now() - startTime < maxWait) {
          await new Promise(resolve => setTimeout(resolve, 50))
        }
        return audioModeSetRef.current
      }
      
      const timer = setTimeout(async () => {
        // 确保音频模式已设置
        if (!audioModeSetRef.current) {
          console.log('⏳ 等待音频模式设置完成...')
          const audioModeReady = await waitForAudioMode(1000)
          if (!audioModeReady) {
            console.warn('⚠️ 音频模式设置超时，尝试继续播放')
            // 即使超时也继续，因为 playAsync 时会自动处理
          }
        }
        
        console.log('⏯️ 执行自动播放，lastSavedTime:', lastSavedTime, 'audioModeSet:', audioModeSetRef.current)
        autoPlay(lastSavedTime)
      }, 500)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [videoUrl, loading, lastSavedTime, autoPlay])

  // 监听视频完成
  useEffect(() => {
    const unsubscribe = useVideoPlayerStore.subscribe((state) => {
      if (state.isCompleted) {
        setShowCompleteTip(true)
        saveProgress()
      }
    })
    return unsubscribe
  }, [saveProgress, setShowCompleteTip])

  // 配置音频模式 - 进入页面时立即设置并等待完成
  useFocusEffect(
    useCallback(() => {
      console.log('🎵 视频页面获得焦点，开始设置音频模式')
      audioModeSetRef.current = false
      
      Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,  // 强制获取，不ducking
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: false,
      })
        .then(() => {
          console.log('✅ 音频模式设置完成')
          audioModeSetRef.current = true
        })
        .catch((error) => {
          console.error('❌ 音频模式设置失败:', error)
          audioModeSetRef.current = false
        })

      RNStatusBar.setHidden(true, 'none')
      globalImmersive.forceRestore()

      return () => {
        // 清理
        audioModeSetRef.current = false
      }
    }, [])
  )


  // 视频点击事件
  const handleVideoClick = () => {
    setShowControls(!showControls)
  }

  // 获取视频信息
  const fetchVideoInfo = useCallback(async () => {
    try {
      setLoading(true)
      setIsLoading(true)

      const response = await getVideoBasicInfo(pointId)

      setVideoInfo(response)
      setVideoUrl(response.video_url)
      setLoading(false)
      setIsLoading(false)

      // 启动视频观看追踪
      startVideo({
        videoId: response.video_code,
        videoName: response.course_name,
        progress: lastSavedTime,
        duration: useVideoPlayerStore.getState().totalDuration || undefined,
        courseId: response.album_code,
        courseName: params.title ? decodeURIComponent(params.title) : response.course_name,
      })
    } catch (error) {
      showError('视频加载失败')
      setLoading(false)
      setIsLoading(false)
    }
  }, [pointId, lastSavedTime, params.title, startVideo, setIsLoading])

  // 生成练习题
  const getGeneratePracticeQuestions = useCallback(async () => {
    try {
      await generatePracticeQuestions({
        video_code: pointId,
      })
    } catch (error) {
      // 静默处理错误
    }
  }, [pointId])

  // 处理返回
  const handleBack = async () => {
    await saveProgress()
    endVideo()
    router.back()
  }

  // 继续观看
  const handleContinueWatch = async () => {
    setShowCompleteTip(false)
    setIsCompleted(false)
    await seek(0)
    await play()
  }

  // 开始练习
  const handleStartPractice = () => {
    router.push({
      pathname: '/ai/error-book/practice',
      params: {
        mode: 'multiple',
        type: 'course',
        videoCode: pointId,
      },
    })
  }

  // 处理进度跳转
  const handleSeek = async (time: number) => {
    if (!canDragVideo) {
      showError('当前设备禁止拖拽视频进度')
      return
    }
    await seek(time)
  }

  // ==================== 初始化亮度 ====================
  useEffect(() => {
    const initBrightness = async () => {
      try {
        if (Platform.OS === 'android') {
          const { status } = await Brightness.getPermissionsAsync()
          if (status !== 'granted') {
            await Brightness.requestPermissionsAsync()
          }
        }
        const current = await Brightness.getSystemBrightnessAsync()
        brightnessProgress.value = typeof current === 'number' ? current : 0.5
      } catch (err) {
        console.warn('初始化亮度失败:', err)
        brightnessProgress.value = 0.5
      }
    }
    initBrightness()
  }, [])

  // ==================== 快进快退相关函数 ====================
  const updateSeekDisplay = useCallback((delta: number, startTime: number) => {
    const deltaValue = Math.floor(delta)
    const deltaText = deltaValue > 0
      ? `+${deltaValue}秒`
      : deltaValue < 0
      ? `${deltaValue}秒`
      : '0秒'
    setSeekDeltaText(deltaText)
    setSeekIconName(deltaValue >= 0 ? 'play-forward' : 'play-back')

    const totalDurationValue = totalDurationSV.value
    const previewTime = Math.max(0, Math.min(totalDurationValue, startTime + delta))
    const previewText = `${formatTime(previewTime)} / ${formatTime(totalDurationValue)}`
    setSeekPreviewTime(previewText)
  }, [totalDurationSV])

  const initializeSeek = useCallback(() => {
    const currentTime = useVideoPlayerStore.getState().currentTime
    seekStartTime.value = currentTime
    seekTimeDelta.value = 0
    updateSeekDisplay(0, currentTime)
  }, [updateSeekDisplay])

  const finalizeSeek = useCallback(async (finalTime: number) => {
    if (!canDragVideo) {
      return
    }
    const clampedTime = Math.max(0, Math.min(totalDurationSV.value, finalTime))
    await seek(clampedTime)
  }, [canDragVideo, seek, totalDurationSV])

  // ==================== 亮度控制函数 ====================
  const setSystemBrightness = useCallback((val: number) => {
    Brightness.setSystemBrightnessAsync(val).catch((err) => {
      console.warn('设置亮度失败:', err)
    })
  }, [])

  // ==================== 音量控制函数 ====================
  const setAppVolume = useCallback((val: number) => {
    if (videoRef.current) {
      videoRef.current.setVolumeAsync(val).catch((err: any) => {
        console.warn('设置音量失败:', err)
      })
    }
  }, [])

  // ==================== 手势处理器 ====================
  const canDragVideoValue = useSharedValue(canDragVideo)
  useEffect(() => {
    canDragVideoValue.value = canDragVideo
  }, [canDragVideo, canDragVideoValue])

  // 统一手势处理：根据触摸位置和滑动方向智能识别
  const unifiedGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(10)
        .onStart((event) => {
          'worklet'
          const x = event.x
          const isLeftArea = x < LEFT_AREA_WIDTH
          const isRightArea = x > screenWidth - RIGHT_AREA_WIDTH
          
          // 根据区域初始化对应的手势
          if (isLeftArea) {
            brightnessStartProgress.value = brightnessProgress.value
            brightnessIndicatorOpacity.value = withTiming(1, { duration: 200 })
            volumeIndicatorOpacity.value = withTiming(0, { duration: 200 })
          } else if (isRightArea) {
            volumeStartProgress.value = volumeProgress.value
            volumeIndicatorOpacity.value = withTiming(1, { duration: 200 })
            brightnessIndicatorOpacity.value = withTiming(0, { duration: 200 })
          } else if (canDragVideoValue.value) {
            runOnJS(initializeSeek)()
            seekIndicatorOpacity.value = withTiming(1, { duration: 200 })
          } else {
            runOnJS(showError)('当前设备禁止拖拽视频进度')
          }
        })
        .onChange((event) => {
          'worklet'
          const x = event.x
          const dx = event.translationX
          const dy = event.translationY
          const isLeftArea = x < LEFT_AREA_WIDTH
          const isRightArea = x > screenWidth - RIGHT_AREA_WIDTH
          const isHorizontal = Math.abs(dx) > Math.abs(dy)
          
          // 中间区域：水平滑动 = 快进快退
          if (!isLeftArea && !isRightArea && isHorizontal && canDragVideoValue.value) {
            const delta = Math.round(dx / 5)
            seekTimeDelta.value = delta
            runOnJS(updateSeekDisplay)(delta, seekStartTime.value)
          }
          // 左侧区域：垂直滑动 = 亮度
          else if (isLeftArea && !isHorizontal) {
            const diff = -dy
            let next = brightnessStartProgress.value + diff / EFFECTIVE_HEIGHT
            next = Math.max(0, Math.min(1, next))
            brightnessProgress.value = next
            brightnessIndicatorOpacity.value = 1
            volumeIndicatorOpacity.value = 0
            runOnJS(setSystemBrightness)(next)
          }
          // 右侧区域：垂直滑动 = 音量
          else if (isRightArea && !isHorizontal) {
            const diff = -dy
            let next = volumeStartProgress.value + diff / EFFECTIVE_HEIGHT
            next = Math.max(0, Math.min(1, next))
            volumeProgress.value = next
            volumeIndicatorOpacity.value = 1
            brightnessIndicatorOpacity.value = 0
            runOnJS(setAppVolume)(next)
          }
        })
        .onEnd((event) => {
          'worklet'
          const x = event.x
          const dx = event.translationX
          const dy = event.translationY
          const isLeftArea = x < LEFT_AREA_WIDTH
          const isRightArea = x > screenWidth - RIGHT_AREA_WIDTH
          const isHorizontal = Math.abs(dx) > Math.abs(dy)
          
          // 中间区域：水平滑动 = 快进快退
          if (!isLeftArea && !isRightArea && isHorizontal && canDragVideoValue.value) {
            const finalTime = seekStartTime.value + seekTimeDelta.value
            runOnJS(finalizeSeek)(finalTime)
            seekIndicatorOpacity.value = withTiming(0, { duration: 300 })
          }
          // 左侧区域：垂直滑动 = 亮度
          else if (isLeftArea && !isHorizontal) {
            const finalValue = brightnessProgress.value
            runOnJS(setSystemBrightness)(finalValue)
            brightnessIndicatorOpacity.value = withTiming(0, { duration: 300 })
          }
          // 右侧区域：垂直滑动 = 音量
          else if (isRightArea && !isHorizontal) {
            const finalValue = volumeProgress.value
            runOnJS(setAppVolume)(finalValue)
            volumeIndicatorOpacity.value = withTiming(0, { duration: 300 })
          }
        })
        .onFinalize((event, success) => {
          'worklet'
          if (!success) {
            const distance = Math.sqrt(
              Math.pow(event.translationX, 2) + Math.pow(event.translationY, 2)
            )
            if (distance < 5) {
              // 点击事件，传递给下层
            }
          }
          seekIndicatorOpacity.value = withTiming(0, { duration: 200 })
          brightnessIndicatorOpacity.value = withTiming(0, { duration: 200 })
          volumeIndicatorOpacity.value = withTiming(0, { duration: 200 })
        }),
    [canDragVideoValue, initializeSeek, updateSeekDisplay, finalizeSeek, setSystemBrightness, setAppVolume, screenWidth]
  )

  // ==================== 动画样式 ====================
  const seekIndicatorStyle = useAnimatedStyle(() => ({
    opacity: seekIndicatorOpacity.value,
  }))

  const seekProgressFillStyle = useAnimatedStyle(() => {
    const previewTime = seekStartTime.value + seekTimeDelta.value
    const maxDuration = Math.max(totalDurationSV.value, 1)
    const width = interpolate(
      previewTime,
      [0, maxDuration],
      [0, seekProgressBarWidth.value],
      'clamp'
    )
    return {
      width: withTiming(width, { duration: 80 }),
    }
  })

  const brightnessBarFillStyle = useAnimatedStyle(() => ({
    width: withTiming(`${brightnessProgress.value * 100}%`, { duration: 80 }),
  }))

  const brightnessIndicatorStyle = useAnimatedStyle(() => ({
    opacity: brightnessIndicatorOpacity.value,
  }))

  const volumeBarFillStyle = useAnimatedStyle(() => ({
    width: withTiming(`${volumeProgress.value * 100}%`, { duration: 80 }),
  }))

  const volumeIndicatorStyle = useAnimatedStyle(() => ({
    opacity: volumeIndicatorOpacity.value,
  }))

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      reset()
    }
  }, [reset])

  return (
    <View style={styles.container}>
      {/* 视频头部 */}
      {!loading && (showControls || !isPlaying) && (
        <VideoHeader title={lessonTitle} onBack={handleBack} />
      )}
      {/* 视频区域 */}
      <View style={styles.videoMain}>
        {videoUrl && !loading ? (
          <GestureDetector gesture={unifiedGesture}>
            <TouchableOpacity
              style={styles.videoContainer}
              onPress={handleVideoClick}
              activeOpacity={1}
            >
              <Video
                ref={videoRef}
                source={{
                  uri: videoUrl,
                  headers: {
                    Authorization: `Bearer ${(userStore as any).userInfo?.token || ''}`,
                    Referer: videoInfo?.Referer_video || '',
                  },
                }}
                style={styles.video}
                resizeMode={ResizeMode.CONTAIN}
                useNativeControls={false}
                shouldPlay={false}
                isLooping={false}
                onLoad={handleLoad}
                onReadyForDisplay={handleReadyForDisplay}
                onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
                onError={handleError}
              />

              {/* 中央播放按钮 - 已移除，改为左下角控制 */}
              {/* <CenterPlayButton onPress={togglePlay} /> */}

              {/* 加载中提示 */}
              {useVideoPlayerStore.getState().isLoading && (
                <View style={styles.loading}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={styles.loadingText}>正在加载视频...</Text>
                </View>
              )}

              {/* 快进快退指示器 */}
              <Animated.View style={[styles.seekIndicator, seekIndicatorStyle]}>
                <View style={styles.seekContent}>
                  <Ionicons name={seekIconName} size={rpx(28)} color="#fff" />
                  <Text style={styles.seekDeltaText}>{seekDeltaText}</Text>
                  <View style={styles.seekTimeContainer}>
                    <Text style={styles.seekTimeText}>{seekPreviewTime}</Text>
                  </View>
                  <View
                    style={styles.seekProgressBar}
                    onLayout={(e) => {
                      seekProgressBarWidth.value = e.nativeEvent.layout.width
                    }}
                  >
                    <View style={styles.seekProgressBg} />
                    <Animated.View style={[styles.seekProgressFill, seekProgressFillStyle]} />
                  </View>
                </View>
              </Animated.View>

              {/* 亮度指示器（顶部中间） */}
              <Animated.View 
                style={[
                  styles.topIndicator, 
                  brightnessIndicatorStyle,
                ]}
              >
                <View style={styles.indicatorContent}>
                  <Ionicons name="sunny" size={20} color="#333" style={styles.indicatorIcon} />
                  <Animated.View style={[styles.indicatorBarFill, brightnessBarFillStyle]} />
                </View>
              </Animated.View>

              {/* 音量指示器（顶部中间） */}
              <Animated.View 
                style={[
                  styles.topIndicator, 
                  volumeIndicatorStyle,
                ]}
              >
                <View style={styles.indicatorContent}>
                  <Ionicons name="volume-high" size={20} color="#333" style={styles.indicatorIcon} />
                  <Animated.View style={[styles.indicatorBarFill, volumeBarFillStyle]} />
                </View>
              </Animated.View>
            </TouchableOpacity>
          </GestureDetector>
        ) : loading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>正在加载视频信息...</Text>
          </View>
        ) : (
          <View style={styles.loading}>
            <Text style={styles.loadingText}>视频加载失败</Text>
          </View>
        )}

        {/* 视频控制栏 */}
        {!loading && (showControls || !isPlaying) && (
          <VideoBottomBar
            onPlayPause={togglePlay}
            onSeek={handleSeek}
            canDrag={canDragVideo}
            onDragDisabled={() => showError('当前设备禁止拖拽视频进度')}
          />
        )}

        {/* 侧边栏倍速菜单 (始终在顶层) */}
        <SpeedMenu onSpeedChange={setPlaybackRate} />
      </View>

      {/* 完成提示 */}
      <CompleteTip
        visible={showCompleteTip}
        onContinue={handleContinueWatch}
        onStartPractice={handleStartPractice}
        onClose={() => setShowCompleteTip(false)}
      />
    </View>
  )
}

const styles = createStyles({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoMain: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  videoContainer: {
    width: '100%' as const,
    height: '100%' as const,
    backgroundColor: '#000',
    position: 'relative' as const,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  video: {
    width: '100%' as const,
    height: '100%' as const,
  },
  loading: {
    position: 'absolute' as const,
    top: '50%' as const,
    left: '50%' as const,
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
    marginTop: 10,
  },
  // 旧样式已移除
  // videoControls: { ... },
  // 快进快退指示器
  seekIndicator: {
    position: 'absolute' as const,
    left: '50%' as const,
    top: '50%' as const,
    transform: [{ translateX: -130 }, { translateY: -80 }],
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingVertical: 24,
    minWidth: 260,
    zIndex: 900,
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  seekContent: {
    alignItems: 'center' as const,
    width: '100%' as const,
  },
  seekDeltaText: {
    color: '#4891FF',
    fontSize: 26,
    fontWeight: 'bold' as const,
    marginTop: 14,
    marginBottom: 10,
  },
  seekTimeContainer: {
    marginVertical: 10,
  },
  seekTimeText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500' as const,
  },
  seekProgressBar: {
    width: '100%' as const,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 1.5,
    position: 'relative' as const,
    overflow: 'hidden' as const,
    marginTop: 14,
  },
  seekProgressBg: {
    position: 'absolute' as const,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  seekProgressFill: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#4891FF',
    borderRadius: 1.5,
  },
  // 顶部指示器（亮度/音量共用位置）
  topIndicator: {
    position: 'absolute' as const,
    left: '50%' as const,
    top: 50, // 距离顶部50px
    transform: [{ translateX: -110 }], // 居中，宽度约320px，向左偏移一半
    zIndex: 900,
  },
  indicatorContent: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    // paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.25)', // 半透明白色背景，也是滑块背景
    borderRadius: 20,
    minWidth: 220,
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  indicatorBarFill: {
    position: 'absolute' as const,
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    zIndex: 1,
  },
  indicatorIcon: {
    position: 'relative' as const,
    zIndex: 2,
    marginRight: 8,
    paddingLeft: 10,
  },
})

