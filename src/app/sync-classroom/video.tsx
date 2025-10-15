import { useState, useEffect, useRef, useCallback } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StatusBar as RNStatusBar,
  Dimensions,
} from "react-native"
import { Video, ResizeMode } from "expo-av"
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router"
import { Ionicons } from "@expo/vector-icons"

import {
  getVideoBasicInfo,
  saveStudyProgress,
  generatePracticeQuestions,
  type CourseVideoInfoResponse,
} from "../../services/classroom"
import { useUserStore } from "../../stores/userStore"
import { globalImmersive } from "../../utils/globalImmersive"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"

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

  // 视频页面强制隐藏状态栏和三大金刚 - 使用原生StatusBar API
  useEffect(() => {
    console.log("视频页面：强制隐藏状态栏和三大金刚")

    // 立即隐藏
    RNStatusBar.setHidden(true, "none")
    globalImmersive.forceRestore()

    // 持续隐藏 - 使用定时器确保（对抗Video组件的干扰）
    const interval = setInterval(() => {
      RNStatusBar.setHidden(true, "none")
      globalImmersive.forceRestore()
    }, 500)

    return () => {
      clearInterval(interval)
    }
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
      Alert.alert("错误", "视频加载失败")

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
    if (!totalDuration || !videoRef.current) return

    const { locationX } = event.nativeEvent
    const progressBarWidth = Dimensions.get("window").width - 40 // 减去左右边距
    const clickX = Math.max(0, Math.min(progressBarWidth, locationX))
    const percent = clickX / progressBarWidth
    const newTime = percent * totalDuration
    const seekTime = Math.floor(Math.max(0, Math.min(totalDuration - 1, newTime)))

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

  const continueWatch = () => {
    setShowCompleteTip(false)
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
      _setControlsTimer(timer)
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
        <TouchableOpacity
          style={styles.videoContainer}
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
                Alert.alert("错误", "视频播放失败")
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

        {/* 视频控制栏 */}
        {!loading && !isFullscreen && showControls && (
          <View style={styles.videoControls}>
            {/* 进度条 */}
            <View style={styles.progressContainer}>
              <Text style={styles.timeDisplay}>{formatTime(currentTime)}</Text>
              <TouchableOpacity
                style={styles.progressBar}
                onPress={onProgressClick}
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
    height: 4,
    position: "relative",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
  },
  progressBg: {
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    borderRadius: 2,
  },
  progressFill: {
    position: "absolute",
    top: 0,
    left: 0,
    height: "100%",
    backgroundColor: "#4891FF",
    borderRadius: 2,
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
})
