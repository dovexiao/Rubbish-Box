import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, Dimensions, Platform } from 'react-native'
import { VideoView, useVideoPlayer } from 'expo-video'
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
import { useVideoPlayerStoreV2 } from '@/stores/videoPlayerStoreV2'
import { useActivityTracking } from '@/hooks/useActivityTracking'
import { useVideoPlayerV2 } from '@/hooks/useVideoPlayerV2'
import { parseTimeToSeconds, formatTime } from '@/utils/video/videoTimeUtils'
import { globalImmersive } from '@/utils/globalImmersive'
import { createStyles, rpx } from '@/utils/rpxStyleSheet'
import { showError } from '@/utils/toast'
import {
  VideoHeaderV2,
  VideoBottomBarV2,
  SpeedMenuV2,
  CompleteTipV2,
} from '@/components/video-v2'
import {
  getVideoBasicInfo,
  saveStudyProgress,
  generatePracticeQuestions,
  type CourseVideoInfoResponse,
} from '@/services/classroom'
import { useUserStore } from '@/stores/userStore'
import { useDeviceStatusStore, selectCanDragVideo } from '@/stores/deviceStatusStore'
import { useLockScreenStore } from '@/stores/lockScreenStore'

interface VideoParams {
  videoCode?: string
  title?: string
  Duration?: string
  totalDuration?: string
  educational_system?: string
  grade_stage?: string
}

/**
 * 模块化视频播放器组件 V2
 * 使用 expo-video，集成所有模块化组件
 */
export default function VideoPlayerScreenModularV2() {
  const router = useRouter()
  const params = useLocalSearchParams() as VideoParams
  const userStore = useUserStore()
  const canDragVideo = useDeviceStatusStore(selectCanDragVideo)
  const locked = useLockScreenStore((state) => state.locked)

  // 活动追踪
  const { startVideo, updateVideoProgress, endVideo } = useActivityTracking({
    throttleDelay: 3000,
    autoExitOnUnmount: true,
  })

  // 页面参数
  const [pointId, setPointId] = useState('')
  const [lessonTitle, setLessonTitle] = useState('')
  const [lastSavedTime, setLastSavedTime] = useState(0)
  const progressSaveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 视频信息状态
  const [videoInfo, setVideoInfo] = useState<CourseVideoInfoResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [videoUrl, setVideoUrl] = useState('')

  // 创建 expo-video 播放器
  const player = useVideoPlayer(
    videoUrl
      ? {
          uri: videoUrl,
          headers: {
            Authorization: `Bearer ${(userStore as any).userInfo?.token || ''}`,
            Referer: videoInfo?.Referer_video || '',
          },
        }
      : null,
    (player) => {
      player.loop = false
      player.muted = false
    }
  )

  // Store 状态
  const reset = useVideoPlayerStoreV2((state) => state.reset)
  const setIsLoading = useVideoPlayerStoreV2((state) => state.setIsLoading)
  const setShowControls = useVideoPlayerStoreV2((state) => state.setShowControls)
  const setShowCompleteTip = useVideoPlayerStoreV2((state) => state.setShowCompleteTip)
  const setIsCompleted = useVideoPlayerStoreV2((state) => state.setIsCompleted)
  const showControls = useVideoPlayerStoreV2((state) => state.showControls)
  const showCompleteTip = useVideoPlayerStoreV2((state) => state.showCompleteTip)
  const isPlaying = useVideoPlayerStoreV2((state) => state.isPlaying)
  
  // 控制栏自动隐藏定时器引用
  const autoHideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // 使用 ref 存储最新的状态值，避免闭包问题
  // 防止重复显示完成提示
  const hasShownCompleteTipRef = useRef(false)
  const showControlsRef = useRef(showControls)
  const isPlayingRef = useRef(isPlaying)
  // 防止 handleVideoClick 重复调用
  const handleVideoClickLockRef = useRef(false)

  // 同步状态到 ref
  useEffect(() => {
    showControlsRef.current = showControls
  }, [showControls])

  useEffect(() => {
    isPlayingRef.current = isPlaying
  }, [isPlaying])

  // 清除自动隐藏定时器
  const clearAutoHideTimer = useCallback(() => {
    if (autoHideTimerRef.current) {
      clearTimeout(autoHideTimerRef.current)
      autoHideTimerRef.current = null
    }
  }, [])

  // 启动自动隐藏定时器（使用 ref 获取最新值，避免闭包问题）
  const startAutoHideTimer = useCallback(() => {
    clearAutoHideTimer()
    // 使用 ref 获取最新值，而不是闭包中的旧值
    if (showControlsRef.current && isPlayingRef.current) {
      console.log('⏰ 启动自动隐藏定时器 (3秒后隐藏)')
      autoHideTimerRef.current = setTimeout(() => {
        console.log('⏰ 自动隐藏定时器触发，隐藏控件')
        setShowControls(false)
        autoHideTimerRef.current = null
      }, 3000)
    } else {
      console.log('⏰ 不启动自动隐藏定时器:', {
        showControls: showControlsRef.current,
        isPlaying: isPlayingRef.current
      })
    }
  }, [setShowControls, clearAutoHideTimer])

  // 控制栏自动隐藏（仅在播放时自动隐藏，暂停时一直显示）
  useEffect(() => {
    console.log('🔄 useEffect [showControls, isPlaying] 触发:', {
      showControls,
      isPlaying,
      showControlsRef: showControlsRef.current,
      isPlayingRef: isPlayingRef.current
    })
    startAutoHideTimer()
    return () => {
      clearAutoHideTimer()
    }
  }, [showControls, isPlaying, startAutoHideTimer, clearAutoHideTimer])

  // 暂停时自动显示控制栏和标题栏
  useEffect(() => {
    if (!isPlaying) {
      clearAutoHideTimer()
      setShowControls(true)
    }
  }, [isPlaying, setShowControls, clearAutoHideTimer])

  // 自动播放标记
  const hasAutoPlayedRef = useRef(false)

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
  const currentTimeSV = useSharedValue(0) // 用于 worklet 中访问当前时间
  const [seekDeltaText, setSeekDeltaText] = useState('0秒')
  const [seekPreviewTime, setSeekPreviewTime] = useState('00:00 / 00:00')
  const [seekIconName, setSeekIconName] = useState<'play-forward' | 'play-back'>('play-forward')
  
  // 节流控制：使用 SharedValue 存储上次调用时间（可在 worklet 中使用）
  const lastSeekDisplayUpdate = useSharedValue(0)
  const lastBrightnessUpdate = useSharedValue(0)
  const lastVolumeUpdate = useSharedValue(0)
  const lastBrightnessValue = useSharedValue(0.5)
  const lastVolumeValue = useSharedValue(0.5)
  const SEEK_DISPLAY_THROTTLE = 100 // 快进快退显示更新节流：100ms
  const BRIGHTNESS_THROTTLE = 200 // 亮度更新节流：200ms
  const VOLUME_THROTTLE = 100 // 音量更新节流：100ms
  const BRIGHTNESS_THRESHOLD = 0.01 // 亮度变化阈值（超过此值才更新）
  const VOLUME_THRESHOLD = 0.01 // 音量变化阈值（超过此值才更新）

  // 同步 totalDuration 到 SharedValue
  const totalDuration = useVideoPlayerStoreV2((state) => state.totalDuration)
  useEffect(() => {
    totalDurationSV.value = totalDuration
  }, [totalDuration, totalDurationSV])

  // 同步 currentTime 到 SharedValue
  const currentTime = useVideoPlayerStoreV2((state) => state.currentTime)
  useEffect(() => {
    currentTimeSV.value = currentTime
  }, [currentTime, currentTimeSV])

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
  } = useVideoPlayerV2({
    player,
    onLoad: (duration) => {
      if (duration > 0) {
        useVideoPlayerStoreV2.getState().setTotalDuration(duration)
      }
    },
    onError: (error) => {
      showError('视频播放失败')
      console.error('Video error:', error)
    },
    onProgressUpdate: (currentTime, totalDuration) => {
      updateVideoProgress(currentTime, totalDuration)
      // 检查是否完成
      if (totalDuration > 0 && currentTime >= totalDuration - 1) {
        useVideoPlayerStoreV2.getState().setIsCompleted(true)
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
      useVideoPlayerStoreV2.getState().setTotalDuration(total)
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
    const currentTime = useVideoPlayerStoreV2.getState().currentTime
    if (currentTime > 0 && pointId) {
      saveStudyProgress({
        video_code: pointId,
        record: formatTime(currentTime),
        educational_system: params.educational_system || '六三',
        grade_stage: params.grade_stage || '小学',
      }).catch(() => {
        // 静默处理错误
      })
    }
  }, [pointId, params.educational_system, params.grade_stage])

  // 自动播放
  useEffect(() => {
    const isVideoReady = useVideoPlayerStoreV2.getState().isVideoReady
    if (videoUrl && !loading && player && isVideoReady && !hasAutoPlayedRef.current) {
      hasAutoPlayedRef.current = true
      console.log('🚀 触发自动播放 (V2)')
      
      const timer = setTimeout(() => {
        console.log('⏯️ 执行自动播放 (V2)，lastSavedTime:', lastSavedTime)
        autoPlay(lastSavedTime)
      }, 500)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [videoUrl, loading, player, lastSavedTime, autoPlay])

  // 监听锁屏状态，锁屏时暂停播放
  useEffect(() => {
    if (locked && isPlaying) {
      console.log('🔒 检测到锁屏，暂停视频播放')
      pause()
    }
  }, [locked, isPlaying, pause])

  // 监听视频完成
  useEffect(() => {
    let prevIsCompleted = useVideoPlayerStoreV2.getState().isCompleted
    
    // 使用 selector 只订阅 isCompleted 的变化，避免监听所有状态变化
    const unsubscribe = useVideoPlayerStoreV2.subscribe((state) => {
      const currentIsCompleted = state.isCompleted
      
      // 只在 isCompleted 从 false 变为 true 时触发，避免重复调用
      if (currentIsCompleted && !prevIsCompleted && !hasShownCompleteTipRef.current) {
        // 检查是否已经显示过提示，防止重复设置
        const currentShowTip = state.showCompleteTip
        if (!currentShowTip) {
          hasShownCompleteTipRef.current = true
        setShowCompleteTip(true)
        saveProgress()
      }
      } else if (!currentIsCompleted) {
        // 当 isCompleted 变为 false 时，重置标记（用于继续观看后重新完成）
        hasShownCompleteTipRef.current = false
      }
      
      prevIsCompleted = currentIsCompleted
    })
    return unsubscribe
  }, [saveProgress, setShowCompleteTip])

  // 定时自动保存进度（每30秒）
  useEffect(() => {
    if (pointId && videoUrl) {
      progressSaveTimerRef.current = setInterval(() => {
        saveProgress()
      }, 30000) // 每30秒保存一次
    }
    
    return () => {
      if (progressSaveTimerRef.current) {
        clearInterval(progressSaveTimerRef.current)
        progressSaveTimerRef.current = null
      }
    }
  }, [pointId, videoUrl, saveProgress])

  // 配置页面焦点
  useFocusEffect(
    useCallback(() => {
      console.log('🎵 视频页面获得焦点 (V2)')
      RNStatusBar.setHidden(true, 'none')
      globalImmersive.forceRestore()

      return () => {
        // 清理
      }
    }, [])
  )

  // 视频点击事件
  const handleVideoClick = useCallback((area?: 'left' | 'right' | 'middle' | 'TouchableOpacity') => {
    // 防止重复调用（100ms 内的重复调用会被忽略）
    if (handleVideoClickLockRef.current) {
      console.log('🚫 handleVideoClick 被阻止（重复调用）:', {
        area: area || 'TouchableOpacity',
        timestamp: Date.now()
      })
      return
    }
    
    handleVideoClickLockRef.current = true
    setTimeout(() => {
      handleVideoClickLockRef.current = false
    }, 100)
    
    const currentValue = showControlsRef.current
    const newValue = !currentValue
    console.log('🎯 handleVideoClick 被调用:', {
      area: area || 'TouchableOpacity',
      currentValue,
      newValue,
      timestamp: Date.now()
    })
    
    // 清除之前的定时器
    clearAutoHideTimer()
    
    // 切换控制栏显示状态
    // useEffect 会自动检测到状态变化并启动新的定时器
    console.log('📱 setShowControls 调用前:', { area: area || 'TouchableOpacity', currentValue, newValue })
    setShowControls(newValue)
    console.log('📱 setShowControls 调用后:', { area: area || 'TouchableOpacity' })
  }, [setShowControls, clearAutoHideTimer])

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
        duration: useVideoPlayerStoreV2.getState().totalDuration || undefined,
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
    hasShownCompleteTipRef.current = false // 重置标记，允许再次显示完成提示
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
  // 优化：合并状态更新，减少重渲染次数
  const updateSeekDisplay = useCallback((delta: number, startTime: number) => {
    const deltaValue = Math.floor(delta)
    const deltaText = deltaValue > 0
      ? `+${deltaValue}秒`
      : deltaValue < 0
      ? `${deltaValue}秒`
      : '0秒'
    const iconName = deltaValue >= 0 ? 'play-forward' : 'play-back' as 'play-forward' | 'play-back'

    const totalDurationValue = totalDurationSV.value
    const previewTime = Math.max(0, Math.min(totalDurationValue, startTime + delta))
    const previewText = `${formatTime(previewTime)} / ${formatTime(totalDurationValue)}`
    
    // 合并状态更新，减少重渲染次数
    setSeekDeltaText(deltaText)
    setSeekIconName(iconName)
    setSeekPreviewTime(previewText)
  }, [totalDurationSV])

  // 初始化快进快退（完整版本，包含 UI 更新）
  // 注意：现在只在 onChange 中真正滑动时才调用 updateSeekDisplay
  const initializeSeek = useCallback(() => {
    const currentTime = useVideoPlayerStoreV2.getState().currentTime
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
  // 优化：添加节流，减少系统 API 调用频率
  // 注意：节流逻辑在 worklet 中处理，这里直接设置
  const setSystemBrightness = useCallback((val: number) => {
    Brightness.setSystemBrightnessAsync(val).catch((err) => {
      console.warn('设置亮度失败:', err)
    })
  }, [])

  // ==================== 音量控制函数 ====================
  // 优化：添加节流，减少原生模块调用频率
  // 注意：节流逻辑在 worklet 中处理，这里直接设置
  const setAppVolume = useCallback((val: number) => {
    if (player) {
      player.volume = val
    }
  }, [player])

  // ==================== 手势处理器 ====================
  const canDragVideoValue = useSharedValue(canDragVideo)
  useEffect(() => {
    canDragVideoValue.value = canDragVideo
  }, [canDragVideo, canDragVideoValue])

  // 统一手势处理：根据触摸位置和滑动方向智能识别
  const unifiedGesture = useMemo(
    () =>
      Gesture.Pan()
        .minDistance(15) // 增加最小距离，减少误触
        .onStart((event) => {
          'worklet'
          const x = event.x
          const isLeftArea = x < LEFT_AREA_WIDTH
          const isRightArea = x > screenWidth - RIGHT_AREA_WIDTH
          
          // 根据区域初始化对应的手势（统一处理：只操作 SharedValue，不触发 setState）
          if (isLeftArea) {
            brightnessStartProgress.value = brightnessProgress.value
            brightnessIndicatorOpacity.value = withTiming(1, { duration: 200 })
            volumeIndicatorOpacity.value = withTiming(0, { duration: 200 })
          } else if (isRightArea) {
            volumeStartProgress.value = volumeProgress.value
            volumeIndicatorOpacity.value = withTiming(1, { duration: 200 })
            brightnessIndicatorOpacity.value = withTiming(0, { duration: 200 })
          } else if (canDragVideoValue.value) {
            // 只操作 SharedValue，不调用 runOnJS，避免触发 setState 和重新渲染
            seekStartTime.value = currentTimeSV.value
            seekTimeDelta.value = 0
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
          const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
          const isLeftArea = x < LEFT_AREA_WIDTH
          const isRightArea = x > screenWidth - RIGHT_AREA_WIDTH
          const isHorizontal = Math.abs(dx) > Math.abs(dy)
          
          // 只有移动距离足够大时才执行手势操作
          if (distance > 15) {
            // 中间区域：水平滑动 = 快进快退
            if (!isLeftArea && !isRightArea && isHorizontal && canDragVideoValue.value) {
              const delta = Math.round(dx / 5)
              seekTimeDelta.value = delta
              
              // 节流：只在时间间隔足够时才更新 UI（减少 runOnJS 调用）
              const now = Date.now()
              if (now - lastSeekDisplayUpdate.value >= SEEK_DISPLAY_THROTTLE) {
                lastSeekDisplayUpdate.value = now
                runOnJS(updateSeekDisplay)(delta, seekStartTime.value)
              }
            }
            // 左侧区域：垂直滑动 = 亮度
            else if (isLeftArea && !isHorizontal) {
              const diff = -dy
              let next = brightnessStartProgress.value + diff / EFFECTIVE_HEIGHT
              next = Math.max(0, Math.min(1, next))
              
              // 直接更新 SharedValue（不触发重渲染），性能更好
              brightnessProgress.value = next
              brightnessIndicatorOpacity.value = 1
              volumeIndicatorOpacity.value = 0
              
              // 节流：只在时间间隔足够且值变化超过阈值时才更新系统亮度
              const now = Date.now()
              const valueDiff = Math.abs(next - lastBrightnessValue.value)
              if (now - lastBrightnessUpdate.value >= BRIGHTNESS_THROTTLE && valueDiff >= BRIGHTNESS_THRESHOLD) {
                lastBrightnessUpdate.value = now
                lastBrightnessValue.value = next
                runOnJS(setSystemBrightness)(next)
              }
            }
            // 右侧区域：垂直滑动 = 音量
            else if (isRightArea && !isHorizontal) {
              const diff = -dy
              let next = volumeStartProgress.value + diff / EFFECTIVE_HEIGHT
              next = Math.max(0, Math.min(1, next))
              
              // 直接更新 SharedValue（不触发重渲染），性能更好
              volumeProgress.value = next
              volumeIndicatorOpacity.value = 1
              brightnessIndicatorOpacity.value = 0
              
              // 节流：只在时间间隔足够且值变化超过阈值时才更新音量
              const now = Date.now()
              const valueDiff = Math.abs(next - lastVolumeValue.value)
              if (now - lastVolumeUpdate.value >= VOLUME_THROTTLE && valueDiff >= VOLUME_THRESHOLD) {
                lastVolumeUpdate.value = now
                lastVolumeValue.value = next
                runOnJS(setAppVolume)(next)
              }
            }
          }
        })
        .onEnd((event) => {
          'worklet'
          const x = event.x
          const dx = event.translationX
          const dy = event.translationY
          const distance = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
          const isLeftArea = x < LEFT_AREA_WIDTH
          const isRightArea = x > screenWidth - RIGHT_AREA_WIDTH
          const isHorizontal = Math.abs(dx) > Math.abs(dy)
          
          // 只有移动距离足够大时才执行手势操作，否则认为是点击
          if (distance > 15) {
            // 中间区域：水平滑动 = 快进快退
            if (!isLeftArea && !isRightArea && isHorizontal && canDragVideoValue.value) {
              const finalTime = seekStartTime.value + seekTimeDelta.value
              // 最后一次更新 UI 显示
              runOnJS(updateSeekDisplay)(seekTimeDelta.value, seekStartTime.value)
              runOnJS(finalizeSeek)(finalTime)
              seekIndicatorOpacity.value = withTiming(0, { duration: 300 })
            }
            // 左侧区域：垂直滑动 = 亮度
            else if (isLeftArea && !isHorizontal) {
              const finalValue = brightnessProgress.value
              // 确保最终值被设置（更新节流值，然后设置）
              lastBrightnessValue.value = finalValue
              runOnJS(setSystemBrightness)(finalValue)
              brightnessIndicatorOpacity.value = withTiming(0, { duration: 300 })
            }
            // 右侧区域：垂直滑动 = 音量
            else if (isRightArea && !isHorizontal) {
              const finalValue = volumeProgress.value
              // 确保最终值被设置（更新节流值，然后设置）
              lastVolumeValue.value = finalValue
              runOnJS(setAppVolume)(finalValue)
              volumeIndicatorOpacity.value = withTiming(0, { duration: 300 })
            }
          }
        })
        .onFinalize((event, success) => {
          'worklet'
          const x = event.x
          const isLeftArea = x < LEFT_AREA_WIDTH
          const isRightArea = x > screenWidth - RIGHT_AREA_WIDTH
          const isMiddleArea = !isLeftArea && !isRightArea
          
          // 手势完成后的清理工作
          seekIndicatorOpacity.value = withTiming(0, { duration: 200 })
          brightnessIndicatorOpacity.value = withTiming(0, { duration: 200 })
          volumeIndicatorOpacity.value = withTiming(0, { duration: 200 })

          // 检测是否是点击事件（移动距离很小）
          const distance = Math.sqrt(
            Math.pow(event.translationX, 2) + Math.pow(event.translationY, 2)
          )
          if (distance < 15) {
            // 移动距离很小，认为是点击，触发点击处理
            runOnJS(handleVideoClick)(isLeftArea ? 'left' : isRightArea ? 'right' : 'middle')
          }
        }),
    [
      canDragVideoValue,
      updateSeekDisplay,
      finalizeSeek,
      setSystemBrightness,
      setAppVolume,
      screenWidth,
      handleVideoClick,
      currentTimeSV,
    ]
  )

  // ==================== 动画样式 ====================
  const seekIndicatorStyle = useAnimatedStyle(() => ({
    opacity: seekIndicatorOpacity.value,
  }))

  // 优化：移除 onChange 中的 withTiming，直接更新值，性能更好
  // 只在 onEnd 时使用 withTiming 做平滑过渡
  const seekProgressFillStyle = useAnimatedStyle(() => {
    const previewTime = seekStartTime.value + seekTimeDelta.value
    const maxDuration = Math.max(totalDurationSV.value, 1)
    const width = interpolate(
      previewTime,
      [0, maxDuration],
      [0, seekProgressBarWidth.value],
      'clamp'
    )
    // 直接返回计算值，不使用 withTiming（在滑动过程中性能更好）
    return {
      width: width,
    }
  })

  // 优化：直接更新值，不使用 withTiming（在滑动过程中性能更好）
  const brightnessBarFillStyle = useAnimatedStyle(() => ({
    width: `${brightnessProgress.value * 100}%`,
  }))

  const brightnessIndicatorStyle = useAnimatedStyle(() => ({
    opacity: brightnessIndicatorOpacity.value,
  }))

  // 优化：直接更新值，不使用 withTiming（在滑动过程中性能更好）
  const volumeBarFillStyle = useAnimatedStyle(() => ({
    width: `${volumeProgress.value * 100}%`,
  }))

  const volumeIndicatorStyle = useAnimatedStyle(() => ({
    opacity: volumeIndicatorOpacity.value,
  }))

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      clearAutoHideTimer()
      if (progressSaveTimerRef.current) {
        clearInterval(progressSaveTimerRef.current)
        progressSaveTimerRef.current = null
      }
      // 组件卸载时保存最后一次进度
      saveProgress()
      reset()
    }
  }, [reset, clearAutoHideTimer, saveProgress])

  return (
    <View style={styles.container}>
      {/* 视频头部 */}
      {!loading && (showControls || !isPlaying) && (
        <VideoHeaderV2 title={lessonTitle} onBack={handleBack} />
      )}

      {/* 视频区域 */}
      <View style={styles.videoMain}>
        {videoUrl && !loading ? (
          <GestureDetector gesture={unifiedGesture}>
            <View style={styles.videoContainer}>
              <TouchableOpacity
                style={styles.videoTouchable}
                onPress={() => handleVideoClick('TouchableOpacity')}
                activeOpacity={1}
                delayPressIn={0}
                delayPressOut={0}
              />
              <VideoView
                player={player}
                style={styles.video}
                nativeControls={false}
                contentFit="contain"
                allowsFullscreen={false}
                allowsPictureInPicture={false}
                requiresLinearPlayback={true}
                pointerEvents="none"
              />

              {/* 加载中提示 */}
              {useVideoPlayerStoreV2.getState().isLoading && (
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
            </View>
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
          <VideoBottomBarV2
            onPlayPause={togglePlay}
            onSeek={handleSeek}
            canDrag={canDragVideo}
            onDragDisabled={() => showError('当前设备禁止拖拽视频进度')}
            onDragStart={clearAutoHideTimer}
            onDragEnd={startAutoHideTimer}
          />
        )}

        {/* 侧边栏倍速菜单 (始终在顶层) */}
        <SpeedMenuV2 onSpeedChange={setPlaybackRate} />
      </View>

      {/* 完成提示 */}
      <CompleteTipV2
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
  videoTouchable: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 0, // 降低 zIndex，确保指示器在上层显示
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
    zIndex: 1000, // 提高 zIndex，确保在 TouchableOpacity 之上
    alignItems: 'center' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 1000, // Android 需要 elevation，提高以确保在上层显示
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

