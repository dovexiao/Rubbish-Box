import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar as RNStatusBar,
  Dimensions,
  PanResponder,
  AppState,
} from "react-native"
import { Video, ResizeMode, Audio } from "expo-av"
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router"
import { Ionicons } from "@expo/vector-icons"
import * as Brightness from "expo-brightness"

import {
  getVideoBasicInfo,
  saveStudyProgress,
  generatePracticeQuestions,
  type CourseVideoInfoResponse,
} from "../../services/classroom"
import { useUserStore } from "../../stores/userStore"
import { globalImmersive } from "../../utils/globalImmersive"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import { showError } from "../../utils/toast"
import { useActivityTracking } from "../../hooks/useActivityTracking"

interface VideoParams {
  videoCode?: string
  title?: string
  Duration?: string
  totalDuration?: string
  educational_system?: string
  grade_stage?: string
}

/**
 * 视频播放页面
 * 100%还原UniApp项目 /src/pages/sync-classroom/video.vue
 */
export default function VideoPlayerScreen() {
  const router = useRouter()
  const params = useLocalSearchParams() as VideoParams
  const userStore = useUserStore()
  const videoRef = useRef<Video>(null)
  
  // 活动追踪 - 追踪视频观看行为
  const { startVideo, updateVideoProgress, endVideo } = useActivityTracking({
    throttleDelay: 3000, // 视频进度更新节流3秒
    autoExitOnUnmount: true, // 组件卸载时自动发送退出通知
  })

  // 页面参数
  const [pointId, setPointId] = useState("")
  const [lessonTitle, setLessonTitle] = useState("")
  const [_lessonDuration, _setLessonDuration] = useState(0)
  const [totalDuration, setTotalDuration] = useState(0)
  const [lastSavedTime, setLastSavedTime] = useState(0)

  // 视频信息状态
  const [videoInfo, setVideoInfo] = useState<CourseVideoInfoResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [videoUrl, setVideoUrl] = useState("")
  const [_title, _setTitle] = useState("")

  // 视频播放状态
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [progressPercent, setProgressPercent] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // 学习进度相关
  const [_studyProgress, _setStudyProgress] = useState(0)
  const [_isCompleted, setIsCompleted] = useState(false)
  const [showCompleteTip, setShowCompleteTip] = useState(false)

  // 控制栏状态
  const [showControls, setShowControls] = useState(true)
  const [_controlsTimer, _setControlsTimer] = useState<NodeJS.Timeout | null>(null)

  // 播放速度
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const speedOptions = [0.5, 0.8, 1.0, 1.25, 1.5]

  // 拖拽状态
  const [_isDragging, _setIsDragging] = useState(false)
  
  // 进度条宽度
  const [progressBarWidth, setProgressBarWidth] = useState(0)

  // 自动播放标记 - 防止重复触发
  const hasAutoPlayedRef = useRef(false)
  // 是否已设置初始位置
  const hasSetInitialPositionRef = useRef(false)

  // ==================== 音量和亮度控制（已注释，改为快进快退）====================
  // const [volume, setVolume] = useState(1.0) // 0.0 - 1.0
  // const [brightness, setBrightness] = useState(1.0) // 0.0 - 1.0
  // const [showVolumeIndicator, setShowVolumeIndicator] = useState(false)
  // const [showBrightnessIndicator, setShowBrightnessIndicator] = useState(false)
  // const volumeTimerRef = useRef<NodeJS.Timeout | null>(null)
  // const brightnessTimerRef = useRef<NodeJS.Timeout | null>(null)

  // // 初始化亮度
  // useEffect(() => {
  //   const initBrightness = async () => {
  //     try {
  //       const currentBrightness = await Brightness.getBrightnessAsync()
  //       setBrightness(currentBrightness)
  //     } catch (error) {
  //       console.log("获取亮度失败:", error)
  //     }
  //   }
  //   initBrightness()
  // }, [])
  
  // ==================== 快进快退控制 ====================
  const [showSeekIndicator, setShowSeekIndicator] = useState(false)
  const [seekDelta, setSeekDelta] = useState(0) // 快进/快退的秒数（正数为快进，负数为快退）
  const [previewTime, setPreviewTime] = useState(0) // 预览时间位置
  const seekTimerRef = useRef<NodeJS.Timeout | null>(null)
  const seekStartTimeRef = useRef(0) // 滑动开始时的时间位置
  const previewTimeRef = useRef(0) // ✅ 用 ref 存储最新的 previewTime
  const currentTimeRef = useRef(0) // ✅ 用 ref 存储最新的 currentTime，避免闭包陷阱
  const totalDurationRef = useRef(0) // ✅ 用 ref 存储最新的 totalDuration

  // 视频页面强制隐藏状态栏和三大金刚 - 使用原生StatusBar API
  useEffect(() => {
    console.log("视频页面：强制隐藏状态栏和三大金刚")

    // 立即隐藏
    RNStatusBar.setHidden(true, "none")
    globalImmersive.forceRestore()

    // 持续隐藏 - 使用定时器确保（对抗Video组件的干扰）
    // const interval = setInterval(() => {
    //   RNStatusBar.setHidden(true, "none")
    //   globalImmersive.forceRestore()
    // }, 500)

    // return () => {
    //   clearInterval(interval)
    // }
  }, [])

  // 页面获得焦点时恢复沉浸式模式并配置音频
  useFocusEffect(
    useCallback(() => {
      console.log("视频页面获得焦点，恢复沉浸式模式并配置音频")

      // 🔊 立即配置音频模式，确保视频能获取音频焦点
      Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      }).then(() => {
        console.log("✅ 页面音频模式已配置")
      }).catch((err) => {
        console.error("❌ 配置音频模式失败:", err)
      })

      RNStatusBar.setHidden(true, "none")
      globalImmersive.forceRestore()

      // 使用短延迟确保生效
      const timer = setTimeout(() => {
        RNStatusBar.setHidden(true, "none")
        globalImmersive.forceRestore()
      }, 300)

      return () => clearTimeout(timer)
    }, []),
  )

  // 初始化页面参数
  useEffect(() => {
    if (params.videoCode && !pointId) {
      const videoCode = params.videoCode
      const title = decodeURIComponent(params.title || "")
      const duration = parseTimeToSeconds(params.Duration || "00:00:00")
      const total = parseTimeToSeconds(params.totalDuration || "00:00:00")

      setPointId(videoCode)
      setLessonTitle(title)
      _setLessonDuration(duration)
      setTotalDuration(total)
      setLastSavedTime(duration)

      console.log("接收到video_id:", videoCode)
    }
  }, [params.videoCode, params.title, params.Duration, params.totalDuration, pointId])

  // 加载视频信息和生成练习题
  useEffect(() => {
    if (pointId && !videoUrl) {
      console.log("🎬 开始加载视频信息和生成练习题...")
      fetchVideoInfo()
      getGeneratePracticeQuestions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointId])

  // 视频加载完成后自动播放
  useEffect(() => {
    // 只有在视频URL存在、未加载中、且还没有尝试过自动播放时才执行
    if (videoUrl && !loading && videoRef.current && !hasAutoPlayedRef.current) {
      console.log("视频准备完成，开始自动播放流程")
      hasAutoPlayedRef.current = true // 标记已尝试自动播放
      
      // 延迟一下确保video组件已渲染并等待应用完全进入前台
      const timer = setTimeout(async () => {
        try {
          // 检查应用是否在前台
          const currentState = AppState.currentState
          console.log("📱 当前应用状态:", currentState)
          
          if (currentState !== 'active') {
            console.log("⚠️ 应用不在前台，延迟自动播放")
            hasAutoPlayedRef.current = false // 允许重试
            return
          }
          
          // 🔊 配置音频模式 - 强制获取音频焦点
          console.log("🔊 配置视频音频模式...")
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: false, // 不允许混音，强制获取焦点
            playThroughEarpieceAndroid: false,
            staysActiveInBackground: true,
          })
          console.log("✅ 音频模式配置完成")
          
          // 关键：先设置播放位置，再播放
          if (lastSavedTime > 0) {
            console.log(`⏩ 设置播放位置到历史记录: ${lastSavedTime}秒`)
            await videoRef.current?.setPositionAsync(lastSavedTime * 1000)
            hasSetInitialPositionRef.current = true
          } else {
            console.log("📍 没有历史记录，从0秒开始播放")
          }
          
          console.log("▶️ 开始播放...")
          await videoRef.current?.playAsync()
          console.log("✅ 自动播放成功")
          setIsPlaying(true)
        } catch (err) {
          console.error("❌ 自动播放失败:", err)
          hasAutoPlayedRef.current = false // 失败后允许重试
        }
      }, 2000) // 增加延迟到2000ms，确保坐姿检测音频焦点完全释放
      
      return () => clearTimeout(timer)
    }
    return undefined
  }, [videoUrl, loading, lastSavedTime])

  // 格式化时间为 HH:MM:SS
  const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return "00:00:00"

    const totalSeconds = Math.floor(seconds)
    const hours = Math.floor(totalSeconds / 3600)
    const mins = Math.floor((totalSeconds % 3600) / 60)
    const secs = totalSeconds % 60

    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // 将时间格式"HH:MM:SS"转换为秒数
  const parseTimeToSeconds = (timeStr: string): number => {
    if (!/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) return 0

    const [hours, minutes, seconds] = timeStr.split(":").map(Number)

    if (isNaN(hours) || isNaN(minutes) || isNaN(seconds) || minutes >= 60 || seconds >= 60) return 0

    return Math.floor(hours * 3600 + minutes * 60 + seconds)
  }

  // 获取视频信息
  const fetchVideoInfo = useCallback(async () => {
    try {
      setLoading(true)

      const response = await getVideoBasicInfo(pointId)
      console.log("✅ 视频信息获取成功:", response.course_name)

      setVideoInfo(response)
      _setTitle(response.course_name)
      setVideoUrl(response.video_url)
      setLoading(false)
      
      // 📊 启动视频观看追踪
      console.log("📊 [活动追踪] 启动视频观看追踪")
      startVideo({
        videoId: response.video_code,
        videoName: response.course_name,
        progress: lastSavedTime, // 当前播放位置
        duration: totalDuration > 0 ? totalDuration : undefined,
        courseId: response.album_code,
        courseName: params.title ? decodeURIComponent(params.title) : response.course_name,
      })
    } catch (error) {
      console.error("获取视频信息失败:", error)
      showError("视频加载失败")

      // 降级处理：使用模拟数据
      console.log("使用降级模拟数据")
      const fallbackInfo = {
        video_code: pointId,
        album_code: "",
        course_name: lessonTitle,
        video_url: "/static/video/sample-lesson.mp4",
        Referer_video: "",
        Referer_img: "",
        details_list: [],
      }
      setVideoInfo(fallbackInfo)
      _setTitle(lessonTitle)
      setVideoUrl("/static/video/sample-lesson.mp4")
      setLoading(false)
      
      // 📊 降级情况下也启动追踪
      console.log("📊 [活动追踪] 启动视频观看追踪（降级模式）")
      startVideo({
        videoId: pointId,
        videoName: lessonTitle,
        progress: lastSavedTime,
        duration: totalDuration > 0 ? totalDuration : undefined,
      })
    }
  }, [pointId, lessonTitle, lastSavedTime, totalDuration, startVideo, params.title])

  // 生成练习题
  const getGeneratePracticeQuestions = useCallback(async () => {
    try {
      await generatePracticeQuestions({
        video_code: pointId,
      })
    } catch (error) {
      console.error("生成练习题失败:", error)
    }
  }, [pointId])

  // 视频状态更新
  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      const currentSeconds = Math.floor((status.positionMillis || 0) / 1000)
      const durationSeconds = Math.floor((status.durationMillis || 0) / 1000)

      // ✅ 无论如何都要更新 ref，避免闭包陷阱
      currentTimeRef.current = currentSeconds
      if (durationSeconds > 0) {
        totalDurationRef.current = durationSeconds
      }

      // 只在状态真正改变时更新，避免频繁触发重新渲染
      if (status.isPlaying !== isPlaying) {
        setIsPlaying(status.isPlaying)
        console.log(`📹 视频播放状态: ${status.isPlaying ? "播放中" : "暂停"}`)
      }
      
      if (currentSeconds !== currentTime) {
        setCurrentTime(currentSeconds)
        console.log(`⏱️ 视频时间更新: ${currentSeconds}秒 / ${durationSeconds}秒`)
        
        // 📊 更新视频播放进度（已内置3秒节流）
        if (status.isPlaying && durationSeconds > 0) {
          updateVideoProgress(currentSeconds, durationSeconds)
        }
      }
      
      if (durationSeconds > 0 && durationSeconds !== totalDuration) {
        setTotalDuration(durationSeconds)
        console.log(`📏 视频总时长: ${durationSeconds}秒`)
      }

      if (durationSeconds > 0) {
        const newPercent = (currentSeconds / durationSeconds) * 100
        if (Math.abs(newPercent - progressPercent) > 0.1) {
          setProgressPercent(newPercent)
        }
      }

      // 检查是否播放结束
      if (status.didJustFinish) {
        setIsPlaying(false)
        setShowControls(true)
        setProgressPercent(100)
        setCurrentTime(durationSeconds)
        setShowCompleteTip(true)
        setIsCompleted(true)
        
        // 📊 视频播放结束，发送最终进度
        console.log("📊 [活动追踪] 视频播放结束")
        updateVideoProgress(durationSeconds, durationSeconds)
      }
    }
  }

  // 播放/暂停切换
  const togglePlay = async () => {
    try {
      if (isPlaying) {
        await videoRef.current?.pauseAsync()
      } else {
        // 检查应用是否在前台
        const currentState = AppState.currentState
        if (currentState !== 'active') {
          console.log("⚠️ 应用不在前台，无法播放")
          return
        }
        
        // 🔊 配置音频模式
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
          staysActiveInBackground: true,
        })
        
        // 如果视频已播放完成，从头开始播放
        if (currentTime >= totalDuration && totalDuration > 0) {
          await videoRef.current?.setPositionAsync(0)
          setCurrentTime(0)
          setProgressPercent(0)
          setIsCompleted(false)
          setShowCompleteTip(false)
        }
        await videoRef.current?.playAsync()
      }
      setShowControls(true)
    } catch (error) {
      console.error("播放控制失败:", error)
    }
  }

  // 播放速度控制
  const handleSetPlaybackRate = async (rate: number) => {
    setPlaybackRate(rate)
    setShowSpeedMenu(false)

    try {
      if (videoRef.current) {
        await videoRef.current.setRateAsync(rate, true)
      }
    } catch (error) {
      console.log("设置播放速度失败:", error)
    }
  }

  // 全屏控制
  const toggleFullscreen = async () => {
    try {
      if (videoRef.current) {
        if (!isFullscreen) {
          // 进入全屏
          console.log("📺 进入全屏模式")
          await videoRef.current.presentFullscreenPlayer()
          setIsFullscreen(true)

          // 全屏后立即恢复沉浸式模式
          setTimeout(() => {
            RNStatusBar.setHidden(true, "none")
            globalImmersive.forceRestore()
          }, 100)
        } else {
          // 退出全屏
          console.log("📺 退出全屏模式")
          await videoRef.current.dismissFullscreenPlayer()
          setIsFullscreen(false)
          setShowControls(true) // 退出全屏后强制显示控制器

          // 退出全屏后立即恢复沉浸式模式
          setTimeout(() => {
            RNStatusBar.setHidden(true, "none")
            globalImmersive.forceRestore()
          }, 100)
        }
      }
    } catch (error) {
      console.error("❌ 全屏操作失败:", error)
      // 如果操作失败，确保状态正确
      setIsFullscreen(false)
      setShowControls(true)
    }
  }

  // 进度条点击处理
  const onProgressClick = (event: any) => {
    if (!totalDuration || !videoRef.current || !progressBarWidth) return

    const { locationX } = event.nativeEvent
    const clickX = Math.max(0, Math.min(progressBarWidth, locationX))
    const percent = clickX / progressBarWidth
    const newTime = percent * totalDuration
    const seekTime = Math.floor(Math.max(0, Math.min(totalDuration, newTime))) // 允许跳到最后

    try {
      videoRef.current.setPositionAsync(seekTime * 1000)
      setCurrentTime(seekTime)
      setProgressPercent((seekTime / totalDuration) * 100)
    } catch (error) {
      console.error("跳转失败:", error)
    }
  }

  // 页面操作
  const goBack = () => {
    // 保存当前进度（不等待完成，直接返回）
    if (currentTime > 0 && totalDuration > 0) {
      saveStudyProgress({
        video_code: pointId,
        record: formatTime(currentTime),
        educational_system: params.educational_system || "六三",
        grade_stage: params.grade_stage || "小学",
      }).catch((error) => {
        console.error("保存学习进度失败:", error)
      })
    }
    
    // 📊 手动退出（虽然组件卸载时会自动调用，但这里提前调用确保发送）
    console.log("📊 [活动追踪] 手动退出视频观看")
    endVideo()

    router.back()
  }

  const continueWatch = async () => {
    setShowCompleteTip(false)
    // 跳转到开头重新播放
    try {
      // 检查应用是否在前台
      const currentState = AppState.currentState
      if (currentState !== 'active') {
        console.log("⚠️ 应用不在前台，无法播放")
        return
      }
      
      // 🔊 配置音频模式
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      })
      
      if (videoRef.current) {
        await videoRef.current.setPositionAsync(0)
        await videoRef.current.playAsync()
        setCurrentTime(0)
        setProgressPercent(0)
        setIsCompleted(false)
      }
    } catch (error) {
      console.error("重新播放失败:", error)
    }
  }

  const startPractice = () => {
    router.push({
      pathname: "/ai/error-book/practice",
      params: {
        mode: "multiple",
        type: "course",
        videoCode: pointId,
      },
    })
  }

  // 控制栏自动隐藏
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null
    if (showControls && !isFullscreen) {
      timer = setTimeout(() => {
        setShowControls(false)
      }, 3000)
      _setControlsTimer(timer as any)
    }
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [showControls, isFullscreen])

  // 视频点击事件
  const handleVideoClick = () => {
    console.log(`🖱️ 视频点击 - 当前全屏状态: ${isFullscreen}, 控制器显示: ${showControls}`)
    if (isFullscreen) {
      console.log("⚠️ 全屏模式下不切换控制器")
      return
    }
    const newShowControls = !showControls
    console.log(`🎮 切换控制器显示: ${showControls} -> ${newShowControls}`)
    setShowControls(newShowControls)
  }

  // ==================== 手势控制 - 快进快退 ====================
  const screenWidth = Dimensions.get("window").width
  const screenHeight = Dimensions.get("window").height

  const panResponder = useMemo(() => PanResponder.create({
      onStartShouldSetPanResponder: () => true, // ✅ 改为 true，优先捕获触摸
      onStartShouldSetPanResponderCapture: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // 只有水平滑动距离 > 10px 时才认为是快进快退手势
        const shouldHandle = Math.abs(gestureState.dx) > 10
        console.log(`🎬 手势检测: dx=${gestureState.dx.toFixed(0)}, dy=${gestureState.dy.toFixed(0)}, shouldHandle=${shouldHandle}`)
        return shouldHandle
      },
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        // 水平滑动优先于垂直滑动
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 10
      },
      onPanResponderGrant: () => {
        // 记录滑动开始时的时间位置
        const currentTimeValue = currentTimeRef.current // ✅ 从 ref 读取最新值
        seekStartTimeRef.current = currentTimeValue
        setPreviewTime(currentTimeValue) // 初始化预览时间为当前时间
        previewTimeRef.current = currentTimeValue // ✅ 同步更新 ref
        setSeekDelta(0) // 重置偏移量
        setShowSeekIndicator(true)
        console.log("🎬 快进快退手势开始，当前时间:", currentTimeValue, "秒，总时长:", totalDurationRef.current, "秒")
      },
      onPanResponderMove: (_, gestureState) => {
        const { dx } = gestureState
        const totalDurationValue = totalDurationRef.current // ✅ 从 ref 读取最新值

        // 灵敏度：滑动100px = 10秒
        // 正数为快进（向右滑），负数为快退（向左滑）
        const delta = Math.round((dx / 100) * 10)
        
        // 计算预览时间（限制在0到总时长之间）
        const newTime = Math.max(0, Math.min(totalDurationValue, seekStartTimeRef.current + delta))
        
        console.log(`🎬 滑动: dx=${dx.toFixed(0)}px, delta=${delta}秒, 开始时间=${seekStartTimeRef.current}秒, 预览时间=${newTime}秒, 总时长=${totalDurationValue}秒, 进度=${totalDurationValue > 0 ? ((newTime / totalDurationValue) * 100).toFixed(1) : 0}%`)
        
        setSeekDelta(delta)
        setPreviewTime(newTime)
        previewTimeRef.current = newTime // ✅ 同步更新 ref
      },
      onPanResponderRelease: async () => {
        const finalTime = previewTimeRef.current // ✅ 从 ref 读取最新值
        const totalDurationValue = totalDurationRef.current
        
        console.log("🎬 快进快退手势结束，跳转到:", finalTime, "秒")
        console.log(`🔍 检查条件: videoRef.current=${!!videoRef.current}, totalDuration=${totalDurationValue}, finalTime=${finalTime}`)
        
        // 真正跳转到目标时间
        if (videoRef.current && totalDurationValue > 0) {
          try {
            console.log(`🎯 开始执行跳转: ${finalTime * 1000}ms`)
            await videoRef.current.setPositionAsync(finalTime * 1000)
            setCurrentTime(finalTime)
            currentTimeRef.current = finalTime // ✅ 同步更新
            setProgressPercent((finalTime / totalDurationValue) * 100)
            console.log(`✅ 视频已跳转到: ${finalTime}秒`)
          } catch (error) {
            console.error("❌ 跳转失败:", error)
          }
        } else {
          console.warn(`⚠️ 跳转条件不满足: videoRef=${!!videoRef.current}, totalDuration=${totalDurationValue}`)
        }

        // 延迟隐藏指示器
        if (seekTimerRef.current) {
          clearTimeout(seekTimerRef.current)
        }
        seekTimerRef.current = setTimeout(() => {
          setShowSeekIndicator(false)
          setSeekDelta(0)
        }, 500) as any
      },
    }), [])

  return (
    <View style={styles.container}>
      {/* 标题和返回按钮 - 固定在顶部 */}
      {!loading && (
        <View style={styles.videoHeader}>
          <TouchableOpacity style={styles.headerBack} onPress={goBack}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.videoTitle} numberOfLines={1}>
            {lessonTitle}
          </Text>
        </View>
      )}

      {/* 视频区域 */}
      <View style={styles.videoMain}>
        {/* 视频容器 */}
        <View
          style={styles.videoContainer}
          {...panResponder.panHandlers}
        >
          <TouchableOpacity
            style={styles.videoTouchArea}
            activeOpacity={1}
            onPress={handleVideoClick}
          >
            {videoUrl && !loading ? (
              <Video
                ref={videoRef}
                style={styles.video}
                source={{
                  uri: videoUrl,
                  headers: {
                    Authorization: `Bearer ${(userStore as any).userInfo?.token || ""}`,
                    Referer: videoInfo?.Referer_video || "",
                  },
                }}
                resizeMode={ResizeMode.CONTAIN}
                shouldPlay={false}
                isLooping={false}
                onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                onFullscreenUpdate={(event) => {
                  const { fullscreenUpdate } = event
                  console.log(`📺 [onFullscreenUpdate] 全屏状态更新: ${fullscreenUpdate}`)
                  
                  // 进入全屏: 0 = WILL_PRESENT, 1 = DID_PRESENT
                  if (fullscreenUpdate === 0 || fullscreenUpdate === 1) {
                    console.log("✅ [onFullscreenUpdate] 进入全屏")
                    setIsFullscreen(true)
                  }
                  // 退出全屏: 2 = WILL_DISMISS, 3 = DID_DISMISS
                  else if (fullscreenUpdate === 2 || fullscreenUpdate === 3) {
                    console.log("✅ [onFullscreenUpdate] 退出全屏")
                    setIsFullscreen(false)
                    setShowControls(true)
                    
                    // 恢复沉浸式模式
                    setTimeout(() => {
                      RNStatusBar.setHidden(true, "none")
                      globalImmersive.forceRestore()
                    }, 100)
                  }
                }}
                onLoad={() => {
                  console.log("✅ 视频加载完成，准备播放")
                }}
                onReadyForDisplay={() => {
                  console.log("✅ 视频准备好显示")
                }}
                onError={(error) => {
                  console.error("❌ 视频播放错误:", error)
                  showError("视频播放失败")
                }}
              />
            ) : loading ? (
              <View style={styles.loading}>
                <Text style={styles.loadingText}>正在加载视频信息...</Text>
              </View>
            ) : (
              <View style={styles.loading}>
                <Text style={styles.loadingText}>视频加载失败</Text>
              </View>
            )}

            {/* 中央播放按钮 */}
            {!isPlaying && !isFullscreen && !loading && videoUrl && (
              <TouchableOpacity style={styles.centerPlayBtn} onPress={togglePlay}>
                <Ionicons name="play" size={rpx(48)} color="#fff" />
              </TouchableOpacity>
            )}
          </TouchableOpacity>

          {/* ==================== 音量和亮度指示器（已注释）==================== */}
          {/* {showBrightnessIndicator && (
            <View style={styles.brightnessIndicator}>
              <View style={styles.indicatorHeader}>
                <Ionicons name="sunny" size={rpx(20)} color="#fff" />
                <Text style={styles.indicatorText}>{Math.round(brightness * 100)}%</Text>
              </View>
              <View style={styles.indicatorBarHorizontal}>
                <View style={styles.indicatorBgHorizontal} />
                <View
                  style={[styles.indicatorFillHorizontal, { width: `${brightness * 100}%` }]}
                />
              </View>
            </View>
          )} */}

          {/* {showVolumeIndicator && (
            <View style={styles.volumeIndicator}>
              <View style={styles.indicatorHeader}>
                <Ionicons
                  name={volume === 0 ? "volume-mute" : volume < 0.5 ? "volume-low" : "volume-high"}
                  size={rpx(20)}
                  color="#fff"
                />
                <Text style={styles.indicatorText}>{Math.round(volume * 100)}%</Text>
              </View>
              <View style={styles.indicatorBarHorizontal}>
                <View style={styles.indicatorBgHorizontal} />
                <View style={[styles.indicatorFillHorizontal, { width: `${volume * 100}%` }]} />
              </View>
            </View>
          )} */}

          {/* 快进快退指示器 - 屏幕中间 */}
          {showSeekIndicator && (
            <View style={styles.seekIndicator}>
              <View style={styles.seekContent}>
                {/* 图标：快进或快退 */}
                <Ionicons
                  name={seekDelta >= 0 ? "play-forward" : "play-back"}
                  size={rpx(32)}
                  color="#fff"
                />
                
                {/* 时间变化显示 */}
                <Text style={styles.seekDeltaText}>
                  {seekDelta > 0 ? `+${seekDelta}秒` : seekDelta < 0 ? `${seekDelta}秒` : '0秒'}
                </Text>
                
                {/* 预览时间 */}
                <View style={styles.seekTimeContainer}>
                  <Text style={styles.seekTimeText}>
                    {formatTime(previewTime)} / {formatTime(totalDuration)}
                  </Text>
                </View>
                
                {/* 进度预览条 */}
                <View style={styles.seekProgressBar}>
                  <View style={styles.seekProgressBg} />
                  <View
                    style={[
                      styles.seekProgressFill,
                      { width: `${totalDuration > 0 ? (previewTime / totalDuration) * 100 : 0}%` }
                    ]}
                  />
                </View>
              </View>
            </View>
          )}
        </View>

        {/* 视频控制栏 */}
        {!loading && !isFullscreen && showControls && (
          <View style={styles.videoControls}>
            {/* 进度条 */}
            <View style={styles.progressContainer}>
              <Text style={styles.timeDisplay}>{formatTime(currentTime)}</Text>
              <TouchableOpacity
                style={styles.progressBar}
                onPress={onProgressClick}
                onLayout={(event) => {
                  const { width } = event.nativeEvent.layout
                  setProgressBarWidth(width)
                }}
                activeOpacity={1}
              >
                <View style={styles.progressBg} />
                <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
                <View style={[styles.progressHandle, { left: `${progressPercent}%` }]} />
              </TouchableOpacity>
              <Text style={styles.timeDisplay}>{formatTime(totalDuration)}</Text>
            </View>

            {/* 控制按钮栏 */}
            <View style={styles.controlsBar}>
              {/* 左侧：播放/暂停 */}
              <View style={styles.controlsLeft}>
                <TouchableOpacity style={styles.playBtn} onPress={togglePlay}>
                  <Ionicons name={isPlaying ? "pause" : "play"} size={rpx(20)} color="#fff" />
                </TouchableOpacity>
              </View>

              {/* 右侧：控制按钮 */}
              <View style={styles.controlsRight}>
                {/* 倍速选择 */}
                <View style={styles.controlItem}>
                  <TouchableOpacity
                    style={styles.speedSelector}
                    onPress={() => setShowSpeedMenu(!showSpeedMenu)}
                  >
                    <Text style={styles.controlText}>倍速</Text>
                  </TouchableOpacity>

                  {/* 倍速菜单 */}
                  {showSpeedMenu && (
                    <View style={styles.speedMenu}>
                      {speedOptions.map((speed) => (
                        <TouchableOpacity
                          key={speed}
                          style={[
                            styles.speedOption,
                            playbackRate === speed && styles.speedOptionActive,
                          ]}
                          onPress={() => handleSetPlaybackRate(speed)}
                        >
                          <Text style={styles.speedOptionText}>{speed}x</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>

                {/* 画质选择 */}
                <View style={styles.controlItem}>
                  <Text style={styles.controlText}>准高清</Text>
                </View>

                {/* 全屏按钮 */}
                <TouchableOpacity style={styles.controlItem} onPress={toggleFullscreen}>
                  <Ionicons name="expand" size={rpx(18)} color="#fff" />
                  <Text style={styles.controlText}>全屏</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* 学习完成提示 */}
        {showCompleteTip && (
          <View style={styles.completeTip}>
            <View style={styles.tipContent}>
              <View style={styles.completeIcon}>
                <View style={styles.iconCircle}>
                  <Text style={styles.iconText}>✓</Text>
                </View>
              </View>
              <Text style={styles.completeTitle}>本课学习完啦！一起来做题回顾下吧！</Text>
              <View style={styles.completeActions}>
                <TouchableOpacity style={styles.actionBtnSecondary} onPress={continueWatch}>
                  <Text style={styles.btnText}>继续观看</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtnPrimary} onPress={startPractice}>
                  <Text style={styles.btnText}>开始练习</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = createStyles({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  videoMain: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  videoContainer: {
    width: "100%",
    height: 312.5,
    backgroundColor: "#000",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  videoTouchArea: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  loading: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#fff",
    fontSize: 14,
  },
  videoHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 1001,
    paddingHorizontal: 12.6,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerBack: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    fontSize: 24,
    color: "#fff",
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    marginLeft: 12,
  },
  centerPlayBtn: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -50 }, { translateY: -50 }],
    zIndex: 500,
  },
  videoControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 12,
    zIndex: 800,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  timeDisplay: {
    fontSize: 10.9375,
    color: "#C3C3C3",
    minWidth: 70,
  },
  progressBar: {
    flex: 1,
    height: 20,
    position: "relative",
    justifyContent: "center",
  },
  progressBg: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
  },
  progressFill: {
    position: "absolute",
    top: "50%",
    left: 0,
    height: 4,
    backgroundColor: "#4891FF",
    borderRadius: 2,
    transform: [{ translateY: -2 }],
  },
  progressHandle: {
    position: "absolute",
    top: "50%",
    width: 12,
    height: 12,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#4891FF",
    borderRadius: 6,
    transform: [{ translateX: -6 }, { translateY: -6 }],
  },
  controlsBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  controlsLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  controlsRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  playBtn: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  controlItem: {
    position: "relative",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  controlText: {
    color: "#fff",
    fontSize: 12,
  },
  speedSelector: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  speedMenu: {
    position: "absolute",
    bottom: "100%",
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    borderRadius: 6,
    paddingVertical: 6,
    marginBottom: 8,
    minWidth: 80,
    zIndex: 1000,
  },
  speedOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: "center",
  },
  speedOptionActive: {
    backgroundColor: "#4891FF",
  },
  speedOptionText: {
    fontSize: 12,
    color: "#fff",
    textAlign: "center",
  },
  completeTip: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 99999,
  },
  tipContent: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    paddingHorizontal: 30,
    paddingVertical: 40,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    maxWidth: 400,
  },
  completeIcon: {
    marginBottom: 12,
    alignItems: "center",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4891FF",
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  completeTitle: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
    lineHeight: 22.4,
    textAlign: "center",
  },
  completeActions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  actionBtnSecondary: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  actionBtnPrimary: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#4891FF",
  },
  btnText: {
    color: "#fff",
    fontSize: 10,
  },
  // ==================== 音量和亮度指示器样式（已注释）====================
  // brightnessIndicator: {
  //   position: "absolute",
  //   left: "50%",
  //   top: "50%",
  //   transform: [{ translateX: -100 }, { translateY: -30 }],
  //   backgroundColor: "rgba(0, 0, 0, 0.8)",
  //   borderRadius: 10,
  //   paddingHorizontal: 20,
  //   paddingVertical: 15,
  //   minWidth: 200,
  //   zIndex: 900,
  // },
  // volumeIndicator: {
  //   position: "absolute",
  //   left: "50%",
  //   top: "50%",
  //   transform: [{ translateX: -100 }, { translateY: -30 }],
  //   backgroundColor: "rgba(0, 0, 0, 0.8)",
  //   borderRadius: 10,
  //   paddingHorizontal: 20,
  //   paddingVertical: 15,
  //   minWidth: 200,
  //   zIndex: 900,
  // },
  // indicatorHeader: {
  //   flexDirection: "row",
  //   alignItems: "center",
  //   gap: 0,
  //   marginBottom: 10,
  // },
  // indicatorBarHorizontal: {
  //   width: "100%",
  //   height: 6,
  //   backgroundColor: "rgba(255, 255, 255, 0.3)",
  //   borderRadius: 3,
  //   position: "relative",
  //   overflow: "hidden",
  // },
  // indicatorBgHorizontal: {
  //   position: "absolute",
  //   left: 0,
  //   right: 0,
  //   top: 0,
  //   bottom: 0,
  //   backgroundColor: "rgba(255, 255, 255, 0.3)",
  // },
  // indicatorFillHorizontal: {
  //   position: "absolute",
  //   left: 0,
  //   top: 0,
  //   bottom: 0,
  //   backgroundColor: "#4891FF",
  //   borderRadius: 3,
  // },
  // indicatorText: {
  //   color: "#fff",
  //   fontSize: 14,
  //   fontWeight: "bold" as const,
  //   minWidth: 40,
  // },
  
  // ==================== 快进快退指示器样式 ====================
  seekIndicator: {
    position: "absolute" as const,
    left: "50%",
    top: "50%",
    transform: [{ translateX: -120 }, { translateY: -70 }],
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 20,
    minWidth: 240,
    zIndex: 900,
    alignItems: "center" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  seekContent: {
    alignItems: "center" as const,
    width: "100%",
  },
  seekDeltaText: {
    color: "#4891FF",
    fontSize: 24,
    fontWeight: "bold" as const,
    marginTop: 12,
    marginBottom: 8,
  },
  seekTimeContainer: {
    marginVertical: 8,
  },
  seekTimeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500" as const,
  },
  seekProgressBar: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
    position: "relative" as const,
    overflow: "hidden" as const,
    marginTop: 12,
  },
  seekProgressBg: {
    position: "absolute" as const,
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  seekProgressFill: {
    position: "absolute" as const,
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#4891FF",
    borderRadius: 2,
  },
})
