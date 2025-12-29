import React, { useCallback, useEffect, useRef } from "react"
import { View, StyleSheet, Dimensions, Text } from "react-native"
import { Gesture, GestureDetector } from "react-native-gesture-handler"
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from "react-native-reanimated"
import { Video } from "expo-av"
import { createStyles, rpx } from "@/utils/rpxStyleSheet"

const SCREEN_HEIGHT = Dimensions.get("window").height
const EFFECTIVE_HEIGHT = rpx(156.25) // 400

export interface VolumeControlProps {
    /** 作用于最外层 100% 容器的样式 */
    style?: any
    /** Video 组件的引用，用于控制视频音量 */
    videoRef?: React.RefObject<Video>
    /** 手势未激活时的回调（移动距离 < 5px） */
    onGestureNotActivated?: () => void
}

/**
 * 垂直音量调节器（Reanimated + GestureHandler 版）
 * - 外层容器默认宽高 100%，内部一个垂直条在中间
 * - 从下往上高亮，控制应用内音量（0~1）
 */
export const VolumeControl: React.FC<VolumeControlProps> = ({ style, videoRef, onGestureNotActivated }) => {
    // 0~1 当前音量比例
    const progress = useSharedValue(0.5)
    // 手势开始时的进度
    const startProgress = useSharedValue(0.5)
    // 手势开始时的 Y 坐标
    const startY = useSharedValue(0)
    // barWrapper 的透明度控制（0~1）
    const barWrapperOpacity = useSharedValue(0)
    // container 的透明度控制（0~1）
    const containerOpacity = useSharedValue(1)

    // 初始化：读取当前音量（expo-av 没有直接获取音量的 API，使用默认值 0.5）
    useEffect(() => {
        // expo-av 的 Audio API 主要用于播放音频，没有直接获取系统音量的方法
        // 这里使用默认值 0.5，实际音量由系统控制
        progress.value = 0.5
    }, [progress])

    const setAppVolume = useCallback((val: number) => {
        // 使用 expo-av 的 Video.setVolumeAsync 设置视频音量
        if (videoRef?.current) {
            videoRef.current.setVolumeAsync(val).catch((err: any) => {
                console.warn("设置音量失败:", err)
            })
        }
    }, [videoRef])

    // 手势逻辑：垂直拖动控制 progress（使用400计算）
    const panGesture = Gesture.Pan()
        .minDistance(rpx(19.53125)) // 50
        .onStart((event) => {
            'worklet'
            startY.value = event.y // 记录初始 Y 坐标
            startProgress.value = progress.value
            // 手势开始时，barWrapper 在 300ms 内渐变为 1
            barWrapperOpacity.value = withTiming(1, { duration: 300 })
        })
        .onChange((event) => {
            'worklet'
            // 使用屏幕高度的1/4计算进度变化
            const diff = -event.translationY // 向上为正
            let next = startProgress.value + diff / EFFECTIVE_HEIGHT
            next = Math.max(0, Math.min(1, next))
            progress.value = next
            runOnJS(setAppVolume)(next)
        })
        .onEnd(() => {
            'worklet'
            const finalValue = progress.value
            runOnJS(setAppVolume)(finalValue)
            // 手势结束后，barWrapper 在 500ms 内渐变为 0
            barWrapperOpacity.value = withTiming(0, { duration: 500 })
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
                barWrapperOpacity.value = withTiming(0, { duration: 300 })
            }
        })

    const barFillStyle = useAnimatedStyle(() => ({
        height: withTiming(`${progress.value * 100}%`, { duration: 80 }),
    }))

    const containerStyle = useAnimatedStyle(() => ({
        opacity: barWrapperOpacity.value,
    }))

    // barWrapper 的透明度动画样式
    const barWrapperStyle = useAnimatedStyle(() => ({
        opacity: barWrapperOpacity.value,
    }))

    return (
        <GestureDetector gesture={panGesture}>
            <View style={[styles.container, style, containerStyle]}>
                <Animated.View style={[styles.barWrapper, barWrapperStyle]}>
                    {/* 标题 */}
                    <View style={styles.titleContainer}>
                        <Text style={styles.titleText}>音量</Text>
                    </View>

                    {/* 上方文本：100 */}
                    <Text style={styles.labelText}>100</Text>

                    <Animated.View style={styles.barBackground}>
                        <Animated.View style={[styles.barFill, barFillStyle]} />
                    </Animated.View>

                    {/* 下方文本：0 */}
                    <Text style={styles.labelText}>0</Text>
                </Animated.View>
            </View>
        </GestureDetector >
    )
}

const styles = createStyles({
    container: {
        flex: 1,
        justifyContent: "center" as const,
        alignItems: "center" as const,
    },
    barWrapper: {
        justifyContent: "center" as const,
        alignItems: "center" as const,
        gap: 3.125, // 8
    },
    barBackground: {
        width: 17.1875, // 44
        height: 156.25, // 400
        borderRadius: 7.8125, //  20
        backgroundColor: "rgba(255,255,255,0.25)",
        overflow: "hidden" as const,
        justifyContent: "flex-end" as const,
        alignItems: "stretch" as const,
    },
    barFill: {
        width: "100%" as const,
        backgroundColor: "#FFFFFF" as const,
    },
    titleContainer: {
        marginBottom: 7.8125, // 20
    },
    titleText: {
        fontSize: 10.9375, // 28
        color: "#FFFFFF" as const,
        fontWeight: "500" as const,
    },
    labelText: {
        fontSize: 10.9375, // 28
        color: "#FFFFFF" as const,
        fontWeight: "500" as const,
    },
})

export default VolumeControl


