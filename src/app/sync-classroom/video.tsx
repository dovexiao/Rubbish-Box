import { useState, useEffect, useRef, useCallback } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar as RNStatusBar,
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
import { useDeviceStatusStore, selectCanDragVideo } from "../../stores/deviceStatusStore"
import { useVideoPlayerStore } from "../../stores/sync-classroom/videoPlayerStore"
import { globalImmersive } from "../../utils/globalImmersive"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import { showError } from "../../utils/toast"
import { useActivityTracking } from "../../hooks/useActivityTracking"
import { BrightnessControl, SeekControl, VolumeControl } from "../../components/video"

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
  const canDragVideo = useDeviceStatusStore(selectCanDragVideo)
  const videoRef = useRef<Video>(null)

  // 视频播放器 Store
  const { setCurrentTime: setStoreCurrentTime, setTotalDuration: setStoreTotalDuration } = useVideoPlayerStore()

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

  const currentTimeRef = useRef(0) // ✅ 用 ref 存储最新的 currentTime，避免闭包陷阱
  const totalDurationRef = useRef(0) // ✅ 用 ref 存储最新的 totalDuration
  const canDragVideoRef = useRef(canDragVideo) // ✅ 用 ref 存储 canDragVideo，避免闭包陷阱

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

  // 监听 canDragVideo 状态变化，更新 ref
  useEffect(() => {
    canDragVideoRef.current = canDragVideo
    console.log("🔄 canDragVideo 状态更新:", canDragVideo)
  }, [canDragVideo])

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
      // 更新 store 中的总时长
      setStoreTotalDuration(total)
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
        // 更新 store 中的当前播放时间
        setStoreCurrentTime(currentSeconds)
        console.log(`⏱️ 视频时间更新: ${currentSeconds}秒 / ${durationSeconds}秒`)

        // 📊 更新视频播放进度（已内置3秒节流）
        if (status.isPlaying && durationSeconds > 0) {
          updateVideoProgress(currentSeconds, durationSeconds)
        }
      }

      if (durationSeconds > 0 && durationSeconds !== totalDuration) {
        setTotalDuration(durationSeconds)
        // 更新 store 中的总时长
        setStoreTotalDuration(durationSeconds)
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
        // 更新 store 中的当前播放时间
        setStoreCurrentTime(durationSeconds)
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
          // 更新 store 中的当前播放时间
          setStoreCurrentTime(0)
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
    // 如果当前设备不允许拖拽视频进度，则直接返回，不处理点击
    if (!canDragVideo) {
      console.log("⚠️ 当前设备禁止拖拽视频进度，忽略进度条点击")
      showError("当前设备禁止拖拽视频进度")
      return
    }

    if (!totalDuration || !videoRef.current || !progressBarWidth) return

    const { locationX } = event.nativeEvent
    const clickX = Math.max(0, Math.min(progressBarWidth, locationX))
    const percent = clickX / progressBarWidth
    const newTime = percent * totalDuration
    const seekTime = Math.floor(Math.max(0, Math.min(totalDuration, newTime))) // 允许跳到最后

    try {
      videoRef.current.setPositionAsync(seekTime * 1000)
      setCurrentTime(seekTime)
      // 更新 store 中的当前播放时间
      setStoreCurrentTime(seekTime)
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
        // 更新 store 中的当前播放时间
        setStoreCurrentTime(0)
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


  // ==================== SeekControl 手势释放回调 ====================
  const handleSeekGestureEnd = useCallback(async (finalTime: number) => {
    // 如果禁止拖拽视频，则直接返回
    if (!canDragVideoRef.current) {
      console.log("⚠️ 当前设备禁止拖拽视频进度，忽略手势")
      showError("当前设备禁止拖拽视频进度")
      return
    }

    const totalDurationValue = totalDurationRef.current

    console.log("🎬 SeekControl 快进快退手势结束，跳转到:", finalTime, "秒")
    console.log(`🔍 检查条件: videoRef.current=${!!videoRef.current}, totalDuration=${totalDurationValue}, finalTime=${finalTime}`)

    // 限制最终时间在有效范围内
    const clampedTime = Math.max(0, Math.min(totalDurationValue, finalTime))

    // 真正跳转到目标时间
    if (videoRef.current && totalDurationValue > 0) {
      try {
        console.log(`🎯 开始执行跳转: ${clampedTime * 1000}ms`)
        await videoRef.current.setPositionAsync(clampedTime * 1000)
        setCurrentTime(clampedTime)
        currentTimeRef.current = clampedTime // ✅ 同步更新
        // 更新 store 中的当前播放时间
        setStoreCurrentTime(clampedTime)
        setProgressPercent((clampedTime / totalDurationValue) * 100)
        console.log(`✅ 视频已跳转到: ${clampedTime}秒`)
      } catch (error) {
        console.error("❌ 跳转失败:", error)
      }
    } else {
      console.warn(`⚠️ 跳转条件不满足: videoRef=${!!videoRef.current}, totalDuration=${totalDurationValue}`)
    }
  }, [setStoreCurrentTime])

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
        <View style={styles.videoContainer}>
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

        {/* 音量调节器 */}
        <VolumeControl 
          style={styles.volumeControl} 
          videoRef={videoRef as any} 
          onGestureNotActivated={handleVideoClick}
        />

        {/* 亮度调节器 */}
        <BrightnessControl 
          style={styles.brightnessControl} 
          onGestureNotActivated={handleVideoClick}
        />

        {/* 快进快退控制器 */}  
        <SeekControl 
          style={styles.seekControl} 
          onGestureEnd={handleSeekGestureEnd}
          onGestureNotActivated={handleVideoClick}
        />
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
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  videoContainer: {
    width: "100%" as const,
    height: 312.5,
    backgroundColor: "#000",
    position: "relative" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  videoTouchArea: {
    width: "100%" as const,
    height: "100%" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  video: {
    width: "100%" as const,
    height: "100%" as const,
  },
  loading: {
    position: "absolute" as const,
    top: "50%" as const,
    left: "50%" as const,
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  loadingText: {
    color: "#fff",
    fontSize: 14,
  },
  videoHeader: {
    position: "absolute" as const,
    top: 0,
    left: 0 as const,
    right: 0 as const,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    zIndex: 1001,
    paddingHorizontal: 12.6,
    paddingTop: 10,
    paddingBottom: 10,
  },
  headerBack: {
    padding: 4,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  backText: {
    fontSize: 24,
    color: "#fff",
  },
  videoTitle: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#fff",
    flex: 1,
    marginLeft: 12,
  },
  centerPlayBtn: {
    position: "absolute" as const,
    top: 'auto' as const,
    left: 'auto' as const,
    // transform: [{ translateX: '-50%' }, { translateY: '-50%' }],
    zIndex: 500,
  },
  videoControls: {
    position: "absolute" as const,
    bottom: 0,
    left: 0 as const,
    right: 0 as const,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 12,
    zIndex: 800,
  },
  progressContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
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
    position: "relative" as const,
    justifyContent: "center" as const,
  },
  progressBg: {
    width: "100%" as const,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
  },
  progressFill: {
    position: "absolute" as const,
    top: "50%" as const,
    left: 0 as const,
    height: 4,
    backgroundColor: "#4891FF",
    borderRadius: 2,
    transform: [{ translateY: -2 }],
  },
  progressHandle: {
    position: "absolute" as const,
    top: "50%" as const,
    width: 12,
    height: 12,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#4891FF",
    borderRadius: 6,
    transform: [{ translateX: -6 }, { translateY: -6 }],
  },
  controlsBar: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
  },
  controlsLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
  },
  controlsRight: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 20,
  },
  playBtn: {
    padding: 4,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  controlItem: {
    position: "relative" as const,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    flexDirection: "row" as const,
    alignItems: "center" as const,
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
    position: "absolute" as const,
    bottom: "100%" as const,
    right: 0 as const,
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
    alignItems: "center" as const,
  },
  speedOptionActive: {
    backgroundColor: "#4891FF",
  },
  speedOptionText: {
    fontSize: 12,
    color: "#fff",
    textAlign: "center" as const,
  },
  completeTip: {
    position: "absolute" as const,
    top: 0,
    left: 0 as const,
    right: 0 as const,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    zIndex: 99999,
  },
  tipContent: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 16,
    paddingHorizontal: 30,
    paddingVertical: 40,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    maxWidth: 400,
  },
  completeIcon: {
    marginBottom: 12,
    alignItems: "center" as const,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4891FF",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  iconText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold" as const,
  },
  completeTitle: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold" as const,
    marginBottom: 20,
    lineHeight: 22.4,
    textAlign: "center" as const,
  },
  completeActions: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
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
  volumeControl: {
    position: "absolute" as const,
    top: "auto" as const,
    bottom: "auto" as const,
    left: 0,
    width: 93.75, // 240
    height: 312.5, // 800
    zIndex: 1,
  },
  brightnessControl: {
    position: "absolute" as const,
    top: "auto" as const,
    bottom: "auto" as const,
    right: 0,
    width: 93.75, // 240
    height: 312.5, // 800
    zIndex: 1,
  },
  seekControl: {
    position: "absolute" as const,
    top: "auto" as const,
    bottom: "auto" as const,
    left: "auto" as const,
    right: "auto" as const,
    width: 562.5, // 1440
    height: 312.5, // 800
  },
})
