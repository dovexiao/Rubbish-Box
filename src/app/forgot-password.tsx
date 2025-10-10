import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { StatusBar } from "../components/StatusBar"
import { Ionicons } from "@expo/vector-icons"
import { createStyles, rpx } from "../utils/rpxStyleSheet"
import { router } from "expo-router"
import { AuthService } from "../services/authService"

/**
 * 忘记密码页面
 * 通过手机号和验证码重置密码
 */
export default function ForgotPasswordScreen() {
  const [phone, setPhone] = useState("")
  const [smsCode, setSmsCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)

  // 发送验证码
  const handleSendSMS = async () => {
    if (!phone) {
      Alert.alert("提示", "请输入手机号")
      return
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      Alert.alert("提示", "请输入正确的手机号")
      return
    }

    try {
      setLoading(true)
      await AuthService.sendSMS(phone)
      Alert.alert("提示", "验证码已发送")

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
      Alert.alert("错误", error.message || "发送验证码失败")
    } finally {
      setLoading(false)
    }
  }

  // 重置密码
  const handleResetPassword = async () => {
    if (!phone || !smsCode || !newPassword) {
      Alert.alert("提示", "请填写完整信息")
      return
    }

    if (newPassword.length < 8) {
      Alert.alert("提示", "密码至少8个字符，不能全是字母或数字")
      return
    }

    try {
      setLoading(true)
      await AuthService.resetPassword(phone, smsCode, newPassword)
      Alert.alert("成功", "密码重置成功", [
        {
          text: "确定",
          onPress: () => router.back(),
        },
      ])
    } catch (error: any) {
      Alert.alert("错误", error.message || "密码重置失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <LinearGradient
      colors={["#93abff", "#e4f4ff", "#cdedff", "#ffffff"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar theme="dark" backgroundColor="transparent" translucent={true} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                  <Ionicons name="chevron-back" size={rpx(24)} color="#4891FF" />
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
                    <Ionicons name={showPassword ? "eye" : "eye-off"} size={rpx(20)} color="#999" />
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
    </LinearGradient>
  )
}

const styles = createStyles({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 15.625, // 20px转rpx
  },
  resetCard: {
    position: "relative", // 相对定位，为绝对定位的渐变提供参考
    backgroundColor: "transparent", // 改为透明，让LinearGradient显示
    borderRadius: 11.71857, // 11.71857px转rpx (UniApp原值)
    marginHorizontal: 15.625, // 20px转rpx
    width: 320.3125, // 820rpx转750rpx = 320.3125rpx (UniApp原值)
    height: 300, // 增加高度，确保内容完全包含
    alignSelf: "center",
    shadowColor: "#000",
    // shadowOffset: { width: 0, height: 3.125 }, // 4px转rpx
    // shadowOpacity: 0.1,
    // shadowRadius: 9.375, // 12px转rpx
    // elevation: 8,
    overflow: "hidden", // 确保圆角正确显示
  },
  cardGradient: {
    position: "absolute", // 绝对定位确保完全覆盖
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 15.625, // 内边距移到渐变层
    justifyContent: "flex-start",
    borderRadius: 11.71857, // 确保渐变也有圆角
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4.625, // 减少间距
    marginTop: 0, // 增加顶部间距
  },
  backButton: {
    padding: 3.125, // 4px转rpx
    marginRight: 6.25, // 8px转rpx
  },
  title: {
    fontSize: 14.0625, // 18px转rpx
    fontWeight: "600",
    color: "#4891FF",
  },
  description: {
    fontSize: 10.9375, // 14px转rpx
    color: "#666",
    lineHeight: 15.625, // 20px转rpx
    marginLeft: 14.5, // 增加顶部间距
    marginBottom: 18.75, // 减少间距
    textAlign: "left", // 居中对齐
  },
  formContainer: {
    marginBottom: 12.5, // 减少底部间距
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eaf3f7d9", // 使用UniApp的背景色
    borderRadius: 11.71875, // 11.71875rpx (UniApp原值)
    marginBottom: 6.25, // 6.25rpx，减小间距
    paddingHorizontal: 15.625, // 20rpx转rpx
    height: 35.15625, // 35.15625rpx (UniApp原值)
    width: 243.75, // 243.75rpx (UniApp原值)
    alignSelf: "center",
  },
  countryCode: {
    fontSize: 12.5, // 16px转rpx
    color: "#333",
    marginRight: 6.25, // 8px转rpx
  },
  phoneInput: {
    flex: 1,
    fontSize: 12.5, // 16px转rpx
    color: "#333",
  },
  codeInput: {
    flex: 1,
    fontSize: 12.5, // 16px转rpx
    color: "#333",
  },
  passwordInput: {
    flex: 1,
    fontSize: 12.5, // 16px转rpx
    color: "#333",
  },
  sendButton: {
    paddingHorizontal: 9.375, // 12px转rpx
    paddingVertical: 4.6875, // 6px转rpx
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    fontSize: 10.9375, // 14px转rpx
    color: "#4891FF",
  },
  eyeButton: {
    padding: 6.25, // 8px转rpx
  },
  confirmButton: {
    backgroundColor: "#4891FF",
    borderRadius: 11.71875, // 11.71875rpx (UniApp原值)
    height: 35.15625, // 35.15625rpx (UniApp原值)
    width: 243.75, // 243.75rpx (UniApp原值)
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 9.375, // 减少顶部间距
  },
  confirmButtonText: {
    fontSize: 10.9375, // 10.9375rpx (UniApp原值)
    fontWeight: "600",
    color: "#fff",
  },
})
