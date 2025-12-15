import { useState } from "react"
import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { createStyles, rpx } from "../utils/rpxStyleSheet"

interface DeviceAuthModalProps {
  visible: boolean
  deviceCode: string
  onAuth: (code: string) => Promise<void>
  onCancel: () => void
}

/**
 * 设备认证弹窗组件
 * 100%还原UniApp项目 /src/components/DeviceAuthModal.vue
 */
export function DeviceAuthModal({ visible, deviceCode, onAuth, onCancel }: DeviceAuthModalProps) {
  const [authCode, setAuthCode] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAuth = async () => {
    if (!authCode.trim()) {
      return
    }

    setLoading(true)
    try {
      await onAuth(authCode)
      setAuthCode("")
    } catch (error) {
      console.error("认证失败:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={rpx(48)} color="#4891FF" />
            <Text style={styles.title}>设备认证</Text>
          </View>

          <View style={styles.content}>
            <Text style={styles.description}>请输入设备授权码以激活此设备</Text>

            <View style={styles.deviceInfo}>
              <Text style={styles.deviceLabel}>设备码：</Text>
              <Text style={styles.deviceCode}>{deviceCode}</Text>
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="key" size={rpx(16)} color="#999" />
              <TextInput
                style={styles.input}
                value={authCode}
                onChangeText={setAuthCode}
                placeholder="请输入授权码"
                placeholderTextColor="#999"
                autoCapitalize="characters"
                maxLength={16}
              />
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={loading}>
              <Text style={styles.cancelBtnText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.authBtn} onPress={handleAuth} disabled={loading || !authCode.trim()}>
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.authBtnText}>认证</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = createStyles({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  modal: {
    width: 320,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
  },
  header: {
    alignItems: "center",
    paddingTop: 32,
    paddingBottom: 16,
    backgroundColor: "#F5F8FF",
  },
  title: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
    marginTop: 12,
  },
  content: {
    padding: 20,
  },
  description: {
    fontSize: 10,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  deviceInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginBottom: 16,
  },
  deviceLabel: {
    fontSize: 10,
    color: "#999",
  },
  deviceCode: {
    fontSize: 11,
    color: "#333",
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  input: {
    flex: 1,
    fontSize: 11,
    color: "#333",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 11,
    color: "#666",
  },
  authBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#4891FF",
    borderRadius: 8,
    alignItems: "center",
  },
  authBtnText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "bold",
  },
})


