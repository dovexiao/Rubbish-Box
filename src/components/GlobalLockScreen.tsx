import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { StyleSheet, View, Text, Image, Modal, TouchableNativeFeedback, TouchableOpacity } from "react-native"
import { createStyles, rpx } from "../utils/rpxStyleSheet"
import { Images } from "../constants/Assets"
import { useLockScreenStore } from "../stores/lockScreenStore"
import StatusBar from "./StatusBar"
import { Toast } from "./Toast"

type GlobalLockScreenProps = {
  /**
   * 关闭锁屏的回调
   */
  onUnlock?: () => void
  /**
   * 自定义解锁按钮文案
   */
  unlockText?: string
}
/**
 * 全局锁屏组件
 */
const GlobalLockScreen: React.FC<GlobalLockScreenProps> = ({
  onUnlock,
  unlockText = "解锁",
}) => {
  const locked = useLockScreenStore((state) => state.locked)
  const setLocked = useLockScreenStore.getState().setLocked;
  const [now, setNow] = useState<Date>(new Date()) // 当前时间
  const [showToast, setShowToast] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 自动锁屏：未锁定状态下 10 秒后自动锁屏
  // useEffect(() => {
  //   if (!locked) {
  //     timerRef.current && clearTimeout(timerRef.current)
  //     timerRef.current = setTimeout(() => {
  //       setLocked(true)
  //     }, 5000)
  //   } else if (timerRef.current) {
  //     clearTimeout(timerRef.current)
  //     timerRef.current = null
  //   }
  //   return () => {
  //     if (timerRef.current) {
  //       clearTimeout(timerRef.current)
  //       timerRef.current = null
  //     }
  //   }
  // }, [locked])

  // 原始图片数据
  const originalWallpapers = useMemo(() => [
    { id: '0', source: Images.lockScreenWallpaper1 },
  ], [])

  // 解锁回调
  const handleUnlock = useCallback(() => {
    // setLocked(false)
    // onUnlock?.()
    setShowToast(true)
  }, [onUnlock])

  // 实时时间更新（每秒）
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, [])

  return (
    <Modal
      visible={locked}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleUnlock}
    >
      {/* 解锁点击区域 */}
      <TouchableOpacity
        activeOpacity={1}
        style={[StyleSheet.absoluteFillObject, { zIndex: 2 }]}
        onPress={handleUnlock}
      />

      {/* 特殊的消息反馈 */}
      <Toast
        visible={showToast}
        type="error"
        message="当前设备不可用，请到小程序家长端查看"
        duration={3000}
        onClose={() => setShowToast(false)}
      />

      <View style={styles.modalContent}>
        {/* 背景图片 */}
        <View key={originalWallpapers[0].id} style={styles.container}>
          <Image
            source={originalWallpapers[0].source}
            style={styles.lockBackgroundImage}
            resizeMode="cover"
          />
        </View>

        {/* 时间视图 */}
        <View style={styles.timeContainer}>
          <Text style={styles.timeDateText}>
            {`${now.getMonth() + 1}月${now.getDate()}日 周${["日", "一", "二", "三", "四", "五", "六"][now.getDay()]}`}
          </Text>
          <View style={styles.timeClockContainer}>
            <Text style={styles.timeClockText}>
              {`${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`}
            </Text>
          </View>
        </View>

        {/* 锁屏指示器 */}
        <View style={styles.lockIndicatorContainer}>
          <View style={styles.lockOuterCircle}>
            <View style={styles.lockInnerCircle} />
          </View>
          <Text style={styles.lockHintText}>{unlockText || "点击屏幕解锁"}</Text>
        </View>
      </View>
    </Modal>
  )
}

const styles = createStyles({
  container: {
    width: 750, // 设计稿宽度，经过 createStyles 会转换为屏幕宽度
    height: "100%" as const,
  },
  modalContent: {
    width: "100%" as const,
    height: "100%" as const,
  },
  lockBackgroundImage: {
    width: "100%" as const,
    height: "100%" as const,
  },
  timeContainer: {
    position: "absolute" as const,
    top: 29.6875,
    alignSelf: "center" as const,
    alignItems: "center" as const,
    zIndex: 1,
  },
  timeDateText: {
    fontWeight: "500" as const,
    fontSize: 15.625,
    color: "#FFFFFF99",
  },
  timeClockContainer: {
    height: 65.625, // 168
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  timeClockText: {
    fontWeight: "600" as const,
    fontSize: 46.875,
    color: "#FFFFFF99",
  },
  lockIndicatorContainer: {
    position: "absolute" as const,
    top: 324.6094, // 831
    alignItems: "center" as const,
    alignSelf: "center" as const,
    zIndex: 1,
  },
  lockOuterCircle: {
    width: 26.5625, // 68
    height: 26.5625, // 68
    borderRadius: 13.2813, // 34
    backgroundColor: "#FFFFFF4D",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  lockInnerCircle: {
    width: 17.1875, // 44
    height: 17.1875, // 44
    borderRadius: 8.5938, // 22
    backgroundColor: "#FFFFFF66",
  },
  lockHintText: {
    marginTop: 6.25, // 16
    fontSize: 10.1563, // 26
    color: "#FFFFFF",
    fontWeight: "300" as const,
  },
})

export default GlobalLockScreen


