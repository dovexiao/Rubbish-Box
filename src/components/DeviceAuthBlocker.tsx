import React from "react"
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useDeviceAuthStore } from "../stores/deviceAuthStore"

/**
 * 设备授权阻止组件
 * 当设备未授权时，显示全屏遮罩阻止用户操作
 */
export const DeviceAuthBlocker: React.FC = () => {
  const isBlocked = useDeviceAuthStore((state) => state.isBlocked)
  const deviceUUID = useDeviceAuthStore((state) => state.deviceUUID)

  if (!isBlocked) {
    return null
  }

  return (
    <Modal
      visible={isBlocked}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        // 不允许关闭
      }}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={64} color="#FF3B30" />
          </View>
          
          <Text style={styles.title}>设备未授权</Text>
          
          <Text style={styles.message}>
            当前设备未通过授权验证，无法使用此应用。
            {"\n\n"}
            请联系管理员进行设备授权。
          </Text>
          
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#666" />
            <Text style={styles.infoText}>
              设备序列号: {deviceUUID || "未获取"}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  content: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 32,
    width: 500,
    maxWidth: 500,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 24,
  },
  iconContainer: {
    marginBottom: 24,
    backgroundColor: "#FFEBEE",
    borderRadius: 64,
    width: 128,
    height: 128,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 24,
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
  },
})

