import React, { useState } from "react"
import { View, Text, LayoutChangeEvent } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    runOnJS,
    interpolate,
} from "react-native-reanimated"
import { Ionicons } from "@expo/vector-icons"
import { createStyles, rpx } from "@/utils/rpxStyleSheet"
import { useVideoPlayerStore } from "@/stores/sync-classroom/videoPlayerStore"
import { selectCanDragVideo, useDeviceStatusStore } from "@/stores/deviceStatusStore"
import { showError } from "@/utils/toast"

export interface SeekControlProps {
    /** 作用于最外层容器的样式 */
    style?: any
    /** 手势释放回调，参数为最终的目标时间（秒） */
    onGestureEnd?: (finalTime: number) => void
    /** 手势未激活时的回调（移动距离 < 5px） */
    onGestureNotActivated?: () => void
}

/**
 * 快进快退控制组件
 * - 外层容器绝对定位，覆盖整个视频区域
 * - 显示快进/快退指示器（图标、时间变化、预览时间、进度条）
 */
export const SeekControl: React.FC<SeekControlProps> = ({
    style,
    onGestureEnd,
    onGestureNotActivated,
}) => {
    // 从 store 获取视频播放状态
    const totalDuration = useVideoPlayerStore((state) => state.totalDuration)
    // 从 store 获取是否可以拖拽视频
    const canDragVideo = useDeviceStatusStore(selectCanDragVideo)

    // 共享值：初始时间快照（手势开始时的播放时间）
    const startTimeSnapshot = useSharedValue(0)
    // 共享值：时间变化值（秒，正数为快进，负数为快退）
    const timeDelta = useSharedValue(0)
    // 共享值：内容透明度
    const contentOpacity = useSharedValue(0)
    // 共享值：进度条背景宽度（用于插值计算）
    const progressBarWidth = useSharedValue(0)
    // 共享值：是否可以拖拽视频（用于 worklet 中读取）
    const canDragVideoValue = useSharedValue(canDragVideo)

    // 状态：用于显示文本和图标
    const [seekDeltaText, setSeekDeltaText] = useState("0秒")
    const [previewTimeText, setPreviewTimeText] = useState("00:00 / 00:00")
    const [iconName, setIconName] = useState<"play-forward" | "play-back">("play-forward")

    // 格式化时间函数
    const formatTime = (seconds: number): string => {
        const totalSeconds = Math.floor(Math.max(0, seconds))
        const hours = Math.floor(totalSeconds / 3600)
        const mins = Math.floor((totalSeconds % 3600) / 60)
        const secs = totalSeconds % 60

        if (hours > 0) {
            return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
        }
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }

    // 更新显示文本的函数
    const updateDisplayText = (delta: number, startTime: number) => {
        const deltaValue = Math.floor(delta)
        const deltaText = deltaValue > 0 
            ? `+${deltaValue}秒` 
            : deltaValue < 0 
            ? `${deltaValue}秒` 
            : "0秒"
        setSeekDeltaText(deltaText)
        setIconName(deltaValue >= 0 ? "play-forward" : "play-back")

        const previewTime = startTime + delta
        const previewText = `${formatTime(previewTime)} / ${formatTime(totalDuration)}`
        setPreviewTimeText(previewText)
    }

    // 同步 canDragVideo 到共享值
    React.useEffect(() => {
        canDragVideoValue.value = canDragVideo
    }, [canDragVideo, canDragVideoValue])

    // 显示错误的函数（用于 runOnJS）
    const showDragError = () => {
        showError("当前设备禁止拖拽视频进度")
    }

    // 初始化手势的函数（用于 runOnJS）
    const initializeGesture = () => {
        const snapshot = useVideoPlayerStore.getState().currentTime
        startTimeSnapshot.value = snapshot
        timeDelta.value = 0
        updateDisplayText(0, snapshot)
    }

    // 手势处理器
    const panGesture = Gesture.Pan()
        .minDistance(rpx(19.53125)) // 50
        .onStart(() => {
            'worklet'
            // 检查是否可以拖拽视频（从共享值读取）
            if (!canDragVideoValue.value) {
                runOnJS(showDragError)()
                return
            }

            // 获取当前播放时间快照并初始化
            runOnJS(initializeGesture)()
            
            // 淡入显示
            contentOpacity.value = withTiming(1, { duration: 300 })
        })
        .onChange((event) => {
            'worklet'
            // 水平滑动距离：每5px = 1秒
            const delta = Math.round(event.translationX / 5)
            timeDelta.value = delta
            
            // 更新显示文本
            runOnJS(updateDisplayText)(delta, startTimeSnapshot.value)
        })
        .onEnd(() => {
            'worklet'
            // 计算最终时间
            const finalTime = startTimeSnapshot.value + timeDelta.value
            
            // 执行手势释放回调，传递最终时间
            if (onGestureEnd) {
                runOnJS(onGestureEnd)(finalTime)
            }
            
            // 淡出隐藏
            contentOpacity.value = withTiming(0, { duration: 500 })
        })
        .onFinalize((event, success) => {
            'worklet'
            if (!success) {
                // 手势未激活，检查移动距离
                const distance = Math.sqrt(
                    Math.pow(event.translationX, 2) + 
                    Math.pow(event.translationY, 2)
                )
                if (distance < 5 && onGestureNotActivated) {
                    // 移动距离 < 5px，视为点击，执行下层点击回调
                    runOnJS(onGestureNotActivated)()
                }
                // 确保 UI 隐藏
                contentOpacity.value = withTiming(0, { duration: 300 })
            }
        })

    // 内容透明度动画样式
    const contentStyle = useAnimatedStyle(() => ({
        opacity: contentOpacity.value,
    }))

    // 进度条填充宽度动画样式
    // 插值：[0, totalDuration] -> [0, progressBarWidth]
    const progressFillStyle = useAnimatedStyle(() => {
        const previewTimeValue = startTimeSnapshot.value + timeDelta.value
        const maxDuration = Math.max(totalDuration, 1) // 避免除零
        const width = interpolate(
            previewTimeValue,
            [0, maxDuration],
            [0, progressBarWidth.value],
            'clamp'
        )
        return {
            width: withTiming(width, { duration: 80 }),
        }
    })

    // 进度条背景宽度测量
    const handleProgressBarLayout = (event: LayoutChangeEvent) => {
        const { width } = event.nativeEvent.layout
        progressBarWidth.value = width
    }

    return (
        <GestureDetector gesture={panGesture}>
            <View style={[styles.container, style]}>
                <Animated.View style={[styles.seekIndicator, contentStyle]}>
                    <View style={styles.seekContent}>
                        {/* 图标：快进或快退 */}
                        <Ionicons
                            name={iconName}
                            size={rpx(23.4375)} // 60
                            color="#fff"
                        />

                        {/* 时间变化显示 */}
                        <Text style={styles.seekDeltaText}>
                            {seekDeltaText}
                        </Text>

                        {/* 预览时间 */}
                        <View style={styles.seekTimeContainer}>
                            <Text style={styles.seekTimeText}>
                                {previewTimeText}
                            </Text>
                        </View>

                        {/* 进度预览条 */}
                        <View 
                            style={styles.seekProgressBar}
                            onLayout={handleProgressBarLayout}
                        >
                            <View style={styles.seekProgressBg} />
                            <Animated.View style={[styles.seekProgressFill, progressFillStyle]} />
                        </View>
                    </View>
                </Animated.View>
            </View>
        </GestureDetector>
    )
}

const styles = createStyles({
    container: {
        justifyContent: "center" as const,
        alignItems: "center" as const,
    },
    seekIndicator: {
        // transform: [{ translateX: rpx(-120) }, { translateY: rpx(-70) }],
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        borderRadius: 11.71875, // 30
        paddingHorizontal: 23.4375, // 60
        paddingVertical: 19.53125, // 50
        minWidth: 234.375, // 600
        alignItems: "center" as const,
        // shadowColor: "#000",
        // shadowOffset: { width: 0, height: 1.5625 }, // 4
        // shadowOpacity: 0.3,
        // shadowRadius: 3.125, // 8
        // elevation: 8,
    },
    seekContent: {
        alignItems: "center" as const,
        width: "100%" as const,
    },
    seekDeltaText: {
        color: "#4891FF",
        fontSize: 23.4375, // 60
        fontWeight: "bold" as const,
        marginTop: 11.71875, // 30
        marginBottom: 7.8125, // 20
    },
    seekTimeContainer: {
        marginVertical: 7.8125, // 20
    },
    seekTimeText: {
        color: "#fff",
        fontSize: 13.671875, // 35
        fontWeight: "500" as const,
    },
    seekProgressBar: {
        width: 175.78125, // 450
        height: 7.8125, // 20
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        borderRadius: 3.90625, // 10
        overflow: "hidden" as const,
        marginTop: 11.71875, // 30
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
        borderRadius: 3.125, // 8
    },
})

export default SeekControl

