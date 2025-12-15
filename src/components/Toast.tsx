import { useEffect, useState } from "react"
import { View, Text, Animated, TouchableOpacity, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { createStyles, rpx } from "../utils/rpxStyleSheet"

export type ToastType = "success" | "error" | "warning" | "info"

interface ToastProps {
  visible: boolean
  type: ToastType
  message: string
  duration?: number
  onClose?: () => void
}

/**
 * Toast 提示组件
 * 符合项目设计规范的美观提示
 */
export function Toast({ visible, type, message, duration = 3000, onClose }: ToastProps) {
  const [fadeAnim] = useState(new Animated.Value(0))
  const [translateY] = useState(new Animated.Value(-50))

  useEffect(() => {
    if (visible) {
      // 显示动画
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start()

      // 自动关闭
      const timer = setTimeout(() => {
        closeToast()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [visible])

  const closeToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.()
    })
  }

  const getIconName = () => {
    switch (type) {
      case "success":
        return "checkmark-circle"
      case "error":
        return "close-circle"
      case "warning":
        return "warning"
      case "info":
        return "information-circle"
      default:
        return "information-circle"
    }
  }

  const getColors = () => {
    switch (type) {
      case "success":
        return {
          background: "#52C41A",
          icon: "#fff",
        }
      case "error":
        return {
          background: "#FF4D4F",
          icon: "#fff",
        }
      case "warning":
        return {
          background: "#FAAD14",
          icon: "#fff",
        }
      case "info":
        return {
          background: "#4891FF",
          icon: "#fff",
        }
      default:
        return {
          background: "#4891FF",
          icon: "#fff",
        }
    }
  }

  const colors = getColors()

  if (!visible) return null

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
      <View style={styles.overlay} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.toastContainer,
            {
              backgroundColor: colors.background,
              opacity: fadeAnim,
              transform: [{ translateY }],
            },
          ]}
        >
          <Ionicons name={getIconName() as any} size={rpx(20)} color={colors.icon} />
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
          <TouchableOpacity onPress={closeToast} style={styles.closeButton} activeOpacity={0.8}>
            <Ionicons name="close" size={rpx(16)} color={colors.icon} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = createStyles({
  overlay: {
    flex: 1,
    justifyContent: "flex-start" as const,
    alignItems: "center" as const,
    paddingTop: 60,
  },
  toastContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    minWidth: 300,
    maxWidth: 500,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: "#fff",
    marginLeft: 12,
    marginRight: 8,
    fontWeight: "500" as const,
  },
  closeButton: {
    padding: 4,
  },
})



