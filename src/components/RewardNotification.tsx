import { useEffect, useState } from "react"
import { View, Text, Modal, Animated } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { createStyles, rpx } from "../utils/rpxStyleSheet"

interface RewardNotificationProps {
  visible: boolean
  type: "points" | "badge" | "achievement"
  title: string
  message: string
  value?: string
  icon?: string
  onClose?: () => void
}

/**
 * 奖励通知组件
 * 100%还原UniApp项目 /src/components/RewardNotification.vue
 */
export function RewardNotification({
  visible,
  type,
  title,
  message,
  value,
  icon = "gift",
  onClose,
}: RewardNotificationProps) {
  const [fadeAnim] = useState(new Animated.Value(0))
  const [scaleAnim] = useState(new Animated.Value(0.8))

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start()

      // 3秒后自动关闭
      const timer = setTimeout(() => {
        closeNotification()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [visible])

  const closeNotification = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose?.()
    })
  }

  const getIconColor = () => {
    switch (type) {
      case "points":
        return "#FFA940"
      case "badge":
        return "#4891FF"
      case "achievement":
        return "#52C41A"
      default:
        return "#4891FF"
    }
  }

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={closeNotification}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.notification, { transform: [{ scale: scaleAnim }] }]}>
          <View style={[styles.iconContainer, { backgroundColor: `${getIconColor()}20` }]}>
            <Ionicons name={icon as any} size={rpx(32)} color={getIconColor()} />
          </View>
          <Text style={styles.title}>{title}</Text>
          {value && <Text style={styles.value}>{value}</Text>}
          <Text style={styles.message}>{message}</Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  )
}

const styles = createStyles({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5",
    alignItems: "center",
    justifyContent: "center",
  },
  notification: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    color: "#333",
    fontWeight: "bold",
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    color: "#4891FF",
    fontWeight: "bold",
    marginBottom: 8,
  },
  message: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
    lineHeight: 16,
  },
})
