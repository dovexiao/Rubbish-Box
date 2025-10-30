import { useState, useEffect, useRef, useCallback } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar as RNStatusBar,
  Dimensions,
  PanResponder,
} from "react-native"
import { Video, ResizeMode } from "expo-av"
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

interface VideoParams {
  videoCode?: string
  title?: string
  Duration?: string
  totalDuration?: string
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

  // 音量和亮度控制
  const [volume, setVolume] = useState(1.0) // 0.0 - 1.0
  const [brightness, setBrightness] = useState(1.0) // 0.0 - 1.0
  const [showVolumeIndicator, setShowVolumeIndicator] = useState(false)
  const [showBrightnessIndicator, setShowBrightnessIndicator] = useState(false)
  const volumeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const brightnessTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 初始化亮度
  useEffect(() => {
    const initBrightness = async () => {
      try {
        const currentBrightness = await Brightness.getBrightnessAsync()
        setBrightness(currentBrightness)
      } catch (error) {
        console.log("获取亮度失败:", error)
      }
    }
    initBrightness()
  }, [])

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

  // 页面获得焦点时恢复沉浸式模式
  useFocusEffect(
    useCallback(() => {
      console.log("视频页面获得焦点，恢复沉浸式模式")

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
      fetchVideoInfo()
      getGeneratePracticeQuestions()
    }
  }, [pointId, videoUrl, fetchVideoInfo, getGeneratePracticeQuestions])

  // 视频加载完成后自动播放
  useEffect(() => {
    if (videoUrl && !loading && videoRef.current && totalDuration > 0) {
      console.log("视频准备完成，自动播放")
      // 延迟一下确保video组件已渲染
      const timer = setTimeout(() => {
        videoRef.current
          ?.playAsync()
          .then(() => {
            setIsPlaying(true)
            // 如果有上次播放位置，跳转过去
            if (lastSavedTime > 0 && lastSavedTime < totalDuration) {
              videoRef.current?.setPositionAsync(lastSavedTime * 1000)
            }
          })
          .catch((err) => {
            console.log("自动播放失败:", err)
          })
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [videoUrl, loading, totalDuration, lastSavedTime])

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
    } catch (error) {
      console.error("获取视频信息失败:", error)
      showError("视频加载失败")

      // 降级处理：使用模拟数据
      console.log("使用降级模拟数据")
      setVideoInfo({
        video_code: pointId,
        album_code: "",
        course_name: lessonTitle,
        video_url: "/static/video/sample-lesson.mp4",
        Referer_video: "",
        Referer_img: "",
        details_list: [],
      })
      _setTitle(lessonTitle)
      setVideoUrl("/static/video/sample-lesson.mp4")
      setLoading(false)
    }
  }, [pointId, lessonTitle])

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
      setIsPlaying(status.isPlaying)
      const currentSeconds = Math.floor((status.positionMillis || 0) / 1000)
      const durationSeconds = Math.floor((status.durationMillis || 0) / 1000)

      setCurrentTime(currentSeconds)
      setTotalDuration(durationSeconds)

      if (durationSeconds > 0) {
        setProgressPercent((currentSeconds / durationSeconds) * 100)
      }

      // 检查是否播放结束
      if (status.didJustFinish) {
        setIsPlaying(false)
        setShowControls(true)
        setProgressPercent(100)
        setCurrentTime(durationSeconds)
        setShowCompleteTip(true)
        setIsCompleted(true)
      }

      // 监听全屏状态变化
      if (status.fullscreenUpdate !== undefined) {
        const isInFullscreen =
          status.fullscreenUpdate === 1 || // FULLSCREEN_UPDATE_PLAYER_WILL_PRESENT
          status.fullscreenUpdate === 2 // FULLSCREEN_UPDATE_PLAYER_DID_PRESENT

        const isExitingFullscreen =
          status.fullscreenUpdate === 3 || // FULLSCREEN_UPDATE_PLAYER_WILL_DISMISS
          status.fullscreenUpdate === 4 // FULLSCREEN_UPDATE_PLAYER_DID_DISMISS

        if (isInFullscreen) {
          setIsFullscreen(true)
          // 全屏状态变化后恢复沉浸式模式
          setTimeout(() => {
            RNStatusBar.setHidden(true, "none")
            globalImmersive.forceRestore()
          }, 100)
        } else if (isExitingFullscreen) {
          setIsFullscreen(false)
          // 退出全屏状态变化后恢复沉浸式模式
          setTimeout(() => {
            RNStatusBar.setHidden(true, "none")
            globalImmersive.forceRestore()
          }, 100)
        }
      }
    }
  }

  // 播放/暂停切换
  const togglePlay = async () => {
    try {
      if (isPlaying) {
        await videoRef.current?.pauseAsync()
      } else {
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
          await videoRef.current.presentFullscreenPlayer()
          setIsFullscreen(true)

          // 全屏后立即恢复沉浸式模式
          setTimeout(() => {
            RNStatusBar.setHidden(true, "none")
            globalImmersive.forceRestore()
          }, 100)
        } else {
          // 退出全屏
          await videoRef.current.dismissFullscreenPlayer()
          setIsFullscreen(false)

          // 退出全屏后立即恢复沉浸式模式
          setTimeout(() => {
            RNStatusBar.setHidden(true, "none")
            globalImmersive.forceRestore()
          }, 100)
        }
      }
    } catch (error) {
      console.log("全屏操作失败:", error)
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
      }).catch((error) => {
        console.error("保存学习进度失败:", error)
      })
    }

    router.back()
  }

  const continueWatch = async () => {
    setShowCompleteTip(false)
    // 跳转到开头重新播放
    try {
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
      pathname: "/ai/camera",
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
    if (isFullscreen) return
    setShowControls(!showControls)
  }

  // 手势控制
  const screenWidth = Dimensions.get("window").width
  const screenHeight = Dimensions.get("window").height

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false, // 不拦截开始触摸
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // 只有垂直滑动距离 > 10px 时才认为是滑动手势
        return Math.abs(gestureState.dy) > 10
      },
      onPanResponderGrant: (evt) => {
        const locationX = evt.nativeEvent.locationX || evt.nativeEvent.pageX
        // 判断控制类型
        ;(panResponder as any).gestureType =
          locationX < screenWidth / 2 ? "brightness" : "volume"
        ;(panResponder as any).initialBrightness = brightness
        ;(panResponder as any).initialVolume = volume
        console.log("手势开始:", (panResponder as any).gestureType, "位置:", locationX)
      },
      onPanResponderMove: (evt, gestureState) => {
        const { dy } = gestureState

        // 灵敏度：滑动150px = 100%变化
        const delta = -dy / 150

        if ((panResponder as any).gestureType === "brightness") {
          // 左侧：控制亮度
          const newBrightness = Math.max(
            0,
            Math.min(1, (panResponder as any).initialBrightness + delta),
          )
          setBrightness(newBrightness)
          setShowBrightnessIndicator(true)

          Brightness.setBrightnessAsync(newBrightness).catch((error) => {
            console.log("设置亮度失败:", error)
          })
        } else {
          // 右侧：控制音量
          const newVolume = Math.max(0, Math.min(1, (panResponder as any).initialVolume + delta))
          setVolume(newVolume)
          setShowVolumeIndicator(true)

          if (videoRef.current) {
            videoRef.current.setVolumeAsync(newVolume).catch((error) => {
              console.log("设置音量失败:", error)
            })
          }
        }
      },
      onPanResponderRelease: () => {
        console.log("手势结束")
        // 延迟隐藏指示器
        if ((panResponder as any).gestureType === "brightness") {
          if (brightnessTimerRef.current) {
            clearTimeout(brightnessTimerRef.current as any)
          }
          brightnessTimerRef.current = setTimeout(() => {
            setShowBrightnessIndicator(false)
          }, 1000) as any
        } else if ((panResponder as any).gestureType === "volume") {
          if (volumeTimerRef.current) {
            clearTimeout(volumeTimerRef.current as any)
          }
          volumeTimerRef.current = setTimeout(() => {
            setShowVolumeIndicator(false)
          }, 1000) as any
        }

        ;(panResponder as any).gestureType = null
      },
    }),
  ).current

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
                shouldPlay={isPlaying}
                isLooping={false}
                onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                onError={(error) => {
                  console.error("视频播放错误:", error)
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

          {/* 亮度指示器 - 屏幕中间 */}
          {showBrightnessIndicator && (
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
          )}

          {/* 音量指示器 - 屏幕中间 */}
          {showVolumeIndicator && (
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
  // 亮度指示器 - 屏幕中间
  brightnessIndicator: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: [{ translateX: -100 }, { translateY: -30 }],
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    minWidth: 200,
    zIndex: 900,
  },
  // 音量指示器 - 屏幕中间
  volumeIndicator: {
    position: "absolute",
    left: "50%",
    top: "50%",
    transform: [{ translateX: -100 }, { translateY: -30 }],
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
    minWidth: 200,
    zIndex: 900,
  },
  // 指示器头部
  indicatorHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 0,
    marginBottom: 10,
  },
  // 横向进度条
  indicatorBarHorizontal: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 3,
    position: "relative",
    overflow: "hidden",
  },
  indicatorBgHorizontal: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  indicatorFillHorizontal: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#4891FF",
    borderRadius: 3,
  },
  indicatorText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold" as const,
    minWidth: 40,
  },
})
