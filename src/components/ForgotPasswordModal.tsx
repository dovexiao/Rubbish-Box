import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { createStyles } from "../utils/rpxStyleSheet"
import { AuthService } from "../services/authService"
import { showSuccess, showError, showWarning } from "../utils/toast"

interface ForgotPasswordModalProps {
  visible: boolean
  onSuccess?: () => void
  onCancel?: () => void
  onBack?: () => void
}

/**
 * 忘记密码弹窗组件
 * 原封不动地把忘记密码页面的内容块放到弹窗里
 */
export const ForgotPasswordModal = React.memo(function ForgotPasswordModal({
  visible,
  onSuccess,
  onCancel,
  onBack,
}: ForgotPasswordModalProps) {
  const [phone, setPhone] = useState("")
  const [smsCode, setSmsCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)

  // 发送验证码
  const handleSendSMS = async () => {
    if (!phone) {
      showWarning("请输入手机号")
      return
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      showWarning("请输入正确的手机号")
      return
    }

    try {
      setLoading(true)
      await AuthService.sendSMS(phone)
      // showSuccess("验证码已发送")

      // 开始倒计时
      setCountdown(60)
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error: any) {
      showError(error.message || "发送验证码失败")
    } finally {
      setLoading(false)
    }
  }

  // 重置密码
  const handleResetPassword = async () => {
    if (!phone || !smsCode || !newPassword) {
      showWarning("请填写完整信息")
      return
    }

    if (newPassword.length < 8) {
      showWarning("密码至少8个字符，不能全是字母或数字")
      return
    }

    try {
      setLoading(true)
      await AuthService.resetPassword(phone, smsCode, newPassword)
      showSuccess("密码重置成功")
      setTimeout(() => {
        onSuccess?.()
      }, 500)
    } catch (error: any) {
      showError(error.message || "密码重置失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 关闭按钮 */}
            {/* <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity> */}

            {/* 原封不动的忘记密码内容块 */}
            <View style={styles.resetCard}>
              <LinearGradient
                colors={["#92DEFF", "#FFFFFF"]} // 上面蓝色，下面白色
                locations={[0, 0.3515]} // 0%到55.15%的位置
                start={{ x: 0.5, y: 0 }} // 从顶部中心开始
                end={{ x: 0.5, y: 1 }} // 到底部中心结束（垂直渐变）
                style={styles.cardGradient}
              >
                {/* 头部导航 */}
                <View style={styles.header}>
                  <TouchableOpacity style={styles.backButton} onPress={onBack}>
                    <Ionicons name="chevron-back" size={24} color="#4891FF" />
                  </TouchableOpacity>
                  <Text style={styles.title}>忘记密码</Text>
                </View>

                {/* 说明文字 */}
                <Text style={styles.description}>
                  登录密码用于小褐同学系统登录，至少8个字符，
                  {"\n"}不能全是字母或数字
                </Text>

                {/* 表单 */}
                <View style={styles.formContainer}>
                  {/* 手机号输入 */}
                  <View style={styles.inputWrapper}>
                    <Text style={styles.countryCode}>+86</Text>
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="请输入手机号"
                      placeholderTextColor="#999"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      maxLength={11}
                    />
                  </View>

                  {/* 验证码输入 */}
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.codeInput}
                      placeholder="验证码"
                      placeholderTextColor="#999"
                      value={smsCode}
                      onChangeText={setSmsCode}
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                    <TouchableOpacity
                      style={[styles.sendButton, countdown > 0 && styles.sendButtonDisabled]}
                      onPress={handleSendSMS}
                      disabled={countdown > 0}
                    >
                      <Text style={styles.sendButtonText}>
                        {countdown > 0 ? `${countdown}s后重新获取` : "获取验证码"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* 新密码输入 */}
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="输入新密码"
                      placeholderTextColor="#999"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      style={styles.eyeButton}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#999" />
                    </TouchableOpacity>
                  </View>

                  {/* 确定按钮 */}
                  <TouchableOpacity style={styles.confirmButton} onPress={handleResetPassword}>
                    <Text style={styles.confirmButtonText}>确定</Text>
                  </TouchableOpacity>
                </View>
              </LinearGradient>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  )
})

const styles = createStyles({
  modalOverlay: {
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
  closeButton: {
    position: "absolute" as const,
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    zIndex: 10,
  },
  // 原封不动的忘记密码页面样式
  resetCard: {
    position: "relative" as const,
    backgroundColor: "transparent",
    borderRadius: 11.71857,
    marginHorizontal: 15.625,
    width: 320.3125,
    height: 320,
    alignSelf: "center" as const,
    shadowColor: "#000",
    overflow: "hidden" as const,
  },
  cardGradient: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 15.625,
    justifyContent: "flex-start" as const,
    borderRadius: 11.71857,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 4.625,
    marginTop: 0,
  },
  backButton: {
    padding: 3.125,
    marginRight: 6.25,
  },
  title: {
    fontSize: 14.0625,
    fontWeight: "600" as const,
    color: "#4891FF",
  },
  description: {
    fontSize: 10.9375,
    color: "#666",
    lineHeight: 15.625,
    marginLeft: 14.5,
    marginBottom: 18.75,
    textAlign: "left" as const,
  },
  formContainer: {
    marginBottom: 12.5,
  },
  inputWrapper: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#eaf3f7d9",
    borderRadius: 11.71875,
    marginBottom: 6.25,
    paddingHorizontal: 15.625,
    height: 35.15625,
    width: 243.75,
    alignSelf: "center" as const,
  },
  countryCode: {
    fontSize: 12.5,
    color: "#333",
    marginRight: 6.25,
  },
  phoneInput: {
    flex: 1,
    fontSize: 12.5,
    color: "#333",
  },
  codeInput: {
    flex: 1,
    fontSize: 12.5,
    color: "#333",
  },
  passwordInput: {
    flex: 1,
    fontSize: 12.5,
    color: "#333",
  },
  sendButton: {
    paddingHorizontal: 9.375,
    paddingVertical: 4.6875,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 10.9375,
    color: "#4891FF",
  },
  eyeButton: {
    padding: 6.25,
  },
  confirmButton: {
    backgroundColor: "#4891FF",
    borderRadius: 11.71875,
    height: 35.15625,
    width: 243.75,
    alignSelf: "center" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginTop: 9.375,
  },
  confirmButtonText: {
    fontSize: 10.9375,
    fontWeight: "600" as const,
    color: "#fff",
  },
})
