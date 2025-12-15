import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { createStyles, rpx } from "../utils/rpxStyleSheet"
import { AuthService } from "../services/authService"
import { showSuccess, showError, showWarning } from "../utils/toast"

interface SetPasswordModalProps {
  visible: boolean
  onSuccess?: () => void
  onCancel?: () => void
}

/**
 * 设置密码弹窗组件
 * 100%还原设置密码UI
 */
export const SetPasswordModal = React.memo(function SetPasswordModal({
  visible,
  onSuccess,
  onCancel,
}: SetPasswordModalProps) {
  const [firstPassword, setFirstPassword] = useState("")
  const [secondPassword, setSecondPassword] = useState("")
  const [showFirstPassword, setShowFirstPassword] = useState(false)
  const [showSecondPassword, setShowSecondPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  // 验证密码格式
  const validatePassword = (password: string): boolean => {
    // 至少8个字符，不能全是字母或数字
    if (password.length < 8) {
      showWarning("密码至少需要8个字符")
      return false
    }
    
    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    
    if (!hasLetter || !hasNumber) {
      showWarning("密码不能全是字母或数字")
      return false
    }
    
    return true
  }

  // 提交密码
  const handleSubmit = async () => {
    if (!firstPassword || !secondPassword) {
      showWarning("请输入密码")
      return
    }

    if (!validatePassword(firstPassword)) {
      return
    }

    if (firstPassword !== secondPassword) {
      showWarning("两次输入的密码不一致")
      return
    }

    try {
      setLoading(true)
      await AuthService.setPassword(firstPassword, secondPassword)
      showSuccess("密码设置成功")
      
      // 清空表单
      setFirstPassword("")
      setSecondPassword("")
      
      // 延迟调用成功回调
      setTimeout(() => {
        onSuccess?.()
      }, 500)
    } catch (error: any) {
      showError(error.message || "设置密码失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <View style={styles.scrollContent}>
            <LinearGradient
              colors={["#D3E5FF", "#F0F8FF", "#FFFFFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.modalContainer}
            >
              {/* 标题 */}
              <Text style={styles.title}>设置密码</Text>
              
              {/* 说明文字 */}
              <Text style={styles.description}>
                登录密码用于小褐同学系统登录，至少8个字符，{"\n"}
                不能全是字母或数字
              </Text>

              {/* 输入密码 */}
              <View style={styles.inputSection}>
                <Text style={styles.label}>输入密码</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="请输入密码"
                    placeholderTextColor="#CCCCCC"
                    value={firstPassword}
                    onChangeText={setFirstPassword}
                    secureTextEntry={!showFirstPassword}
                    maxLength={20}
                  />
                  <TouchableOpacity
                    onPress={() => setShowFirstPassword(!showFirstPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showFirstPassword ? "eye-outline" : "eye-off-outline"}
                      size={rpx(15)}
                      color="#999"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* 确认密码 */}
              <View style={styles.inputSection}>
                <Text style={styles.label}>确认密码</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="请再次输入密码"
                    placeholderTextColor="#CCCCCC"
                    value={secondPassword}
                    onChangeText={setSecondPassword}
                    secureTextEntry={!showSecondPassword}
                    maxLength={20}
                  />
                  <TouchableOpacity
                    onPress={() => setShowSecondPassword(!showSecondPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons
                      name={showSecondPassword ? "eye-outline" : "eye-off-outline"}
                      size={rpx(15)}
                      color="#999"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* 确定按钮 */}
              <TouchableOpacity
                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#4A90FF", "#357CE5"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.submitButtonGradient}
                >
                  <Text style={styles.submitButtonText}>
                    {loading ? "设置中..." : "确定"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
})

const styles = createStyles({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingHorizontal: 40,
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center" as const,
    width: "100%" as any,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  modalContainer: {
    width: 320.3125,
    borderRadius: 11.71857,
    paddingHorizontal: 25,
    paddingTop: 25,
    paddingBottom: 25,
    alignItems: "center" as const,
  },
  title: {
    fontSize: 13.671875,
    fontWeight: "600" as const,
    color: "#4891FF",
    marginBottom: 7.8125,
  },
  description: {
    fontSize: 9.375,
    color: "#666666",
    textAlign: "center" as const,
    lineHeight: 14,
    marginBottom: 15.625,
  },
  inputSection: {
    width: "100%",
    marginBottom: 10,
  },
  label: {
    fontSize: 10.9375,
    color: "#333333",
    marginBottom: 6.25,
    fontWeight: "500" as const,
  },
  inputWrapper: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#eaf3f7d9",
    borderRadius: 11.71875,
    paddingHorizontal: 15.625,
    height: 35.15625,
  },
  input: {
    flex: 1,
    fontSize: 12.5,
    color: "#333333",
  },
  eyeButton: {
    padding: 3,
  },
  submitButton: {
    width: "100%",
    height: 35.15625,
    borderRadius: 17.578125,
    overflow: "hidden" as const,
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  submitButtonText: {
    fontSize: 12.5,
    color: "#FFFFFF",
    fontWeight: "600" as const,
  },
})

