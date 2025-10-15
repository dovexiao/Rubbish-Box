import { useState } from "react"
import { View, Text, TouchableOpacity, Modal, TextInput, ActivityIndicator } from "react-native"
import { Ionicons } from "@expo/vector-icons"

import { createStyles, rpx } from "../utils/rpxStyleSheet"

interface LoginPopupProps {
  visible: boolean
  onLogin: (username: string, password: string) => Promise<void>
  onCancel: () => void
}

/**
 * 登录弹窗组件
 * 100%还原UniApp项目 /src/components/LoginPopup.vue
 */
export function LoginPopup({ visible, onLogin, onCancel }: LoginPopupProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      return
    }

    setLoading(true)
    try {
      await onLogin(username, password)
      setUsername("")
      setPassword("")
    } catch (error) {
      console.error("登录失败:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Ionicons name="log-in" size={rpx(48)} color="#4891FF" />
            <Text style={styles.title}>登录账号</Text>
          </View>

          <View style={styles.content}>
            {/* 用户名输入 */}
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={rpx(16)} color="#999" />
              <TextInput
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                placeholder="请输入用户名"
                placeholderTextColor="#999"
                autoCapitalize="none"
              />
            </View>

            {/* 密码输入 */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={rpx(16)} color="#999" />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="请输入密码"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={rpx(16)}
                  color="#999"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onCancel} disabled={loading}>
              <Text style={styles.cancelBtnText}>取消</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLogin}
              disabled={loading || !username.trim() || !password.trim()}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.loginBtnText}>登录</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.6",
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
    gap: 12,
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
  loginBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#4891FF",
    borderRadius: 8,
    alignItems: "center",
  },
  loginBtnText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "bold",
  },
})
