import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { StatusBar } from "../components/StatusBar"
import { Ionicons } from "@expo/vector-icons"
import { createStyles, rpx } from "../utils/rpxStyleSheet"
import { Images } from "../constants/Assets"
import { router } from "expo-router"
import { AuthService } from "../services/authService"
import { useUserStore } from "../stores/userStore"

type LoginMode = "sms" | "password"

/**
 * 登录页面
 * 支持短信验证码登录和账号密码登录
 */
export default function LoginScreen() {
  const userStore = useUserStore()
  const [loginMode, setLoginMode] = useState<LoginMode>("sms")
  const [phone, setPhone] = useState("")
  const [smsCode, setSmsCode] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
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
      const result = await AuthService.sendSMS(phone)
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

  // 短信登录
  const handleSMSLogin = async () => {
    if (!phone || !smsCode) {
      Alert.alert("提示", "请输入手机号和验证码")
      return
    }

    if (!agreeTerms) {
      setShowPrivacyModal(true)
      return
    }

    try {
      setLoading(true)
      const result = await AuthService.loginWithSMS(phone, smsCode)

      // 保存用户信息
      userStore.setUserInfo({
        token: result.access_token,
        refreshToken: result.refresh_token,
        userInfo: result.user_info,
      })

      Alert.alert("成功", "登录成功", [
        {
          text: "确定",
          onPress: () => router.replace("/(tabs)"),
        },
      ])
    } catch (error: any) {
      Alert.alert("错误", error.message || "登录失败")
    } finally {
      setLoading(false)
    }
  }

  // 密码登录
  const handlePasswordLogin = async () => {
    if (!phone || !password) {
      Alert.alert("提示", "请输入手机号和密码")
      return
    }

    if (!agreeTerms) {
      setShowPrivacyModal(true)
      return
    }

    try {
      setLoading(true)
      const result = await AuthService.loginWithPassword(phone, password)

      // 保存用户信息
      userStore.setUserInfo({
        token: result.access_token,
        refreshToken: result.refresh_token,
        userInfo: result.user_info,
      })

      Alert.alert("成功", "登录成功", [
        {
          text: "确定",
          onPress: () => router.replace("/(tabs)"),
        },
      ])
    } catch (error: any) {
      Alert.alert("错误", error.message || "登录失败")
    } finally {
      setLoading(false)
    }
  }

  // 调试用：打印组件信息（仅在开发环境且状态变化显著时记录）
  useEffect(() => {
    // 判断是否为开发环境
    if (__DEV__) {
      // 只有在登录模式变化或加载状态变化时才记录日志
      if (loginMode === "sms" || loading) {
        console.log("=== 登录页面状态变化 ===")
        console.log("当前登录模式:", loginMode)
        console.log("加载状态:", loading)
      }
    }
  }, [loginMode, loading])

  // 忘记密码
  const handleForgotPassword = () => {
    router.push("/forgot-password")
  }

  const renderSMSLogin = () => (
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

      {/* 登录按钮 */}
      <TouchableOpacity style={styles.loginButton} onPress={handleSMSLogin}>
        <Text style={styles.loginButtonText}>登录</Text>
      </TouchableOpacity>

      {/* 底部链接 */}
      <View style={styles.bottomLinks}>
        <TouchableOpacity onPress={() => setLoginMode("password")}>
          <Text style={styles.linkText}>账号密码登录</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.linkText}>忘记密码?</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  const renderPasswordLogin = () => (
    <View style={styles.formContainer}>
      {/* 手机号输入 */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.fullInput}
          placeholder="请输入手机号"
          placeholderTextColor="#999"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          maxLength={11}
        />
      </View>

      {/* 密码输入 */}
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.passwordInput}
          placeholder="请输入密码"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? "eye" : "eye-off"} size={rpx(20)} color="#999" />
        </TouchableOpacity>
      </View>

      {/* 登录按钮 */}
      <TouchableOpacity style={styles.loginButton} onPress={handlePasswordLogin}>
        <Text style={styles.loginButtonText}>登录</Text>
      </TouchableOpacity>

      {/* 底部链接 */}
      <View style={styles.bottomLinks}>
        <TouchableOpacity onPress={() => setLoginMode("sms")}>
          <Text style={styles.linkText}>短信验证登录</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.linkText}>忘记密码?</Text>
        </TouchableOpacity>
      </View>
    </View>
  )

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
          <View style={styles.loginCard}>
            <LinearGradient
              colors={["#92DEFF", "#FFFFFF"]} // 上面蓝色，下面白色
              locations={[0, 0.3515]} // 0%到55.15%的位置
              start={{ x: 0.5, y: 0 }} // 从顶部中心开始
              end={{ x: 0.5, y: 1 }} // 到底部中心结束（垂直渐变）
              style={styles.cardGradient}
            >
              {/* Logo和标题 */}
              <View style={styles.header}>
                <View style={styles.logoContainer}>
                  <Image source={Images.loginLogo} style={styles.logo} resizeMode="contain" />
                </View>
                <Text style={styles.title}>Hello！欢迎使用小橘同学智能学习桌</Text>
              </View>

              {/* 登录表单 */}
              {loginMode === "sms" ? renderSMSLogin() : renderPasswordLogin()}

              {/* 隐私协议 */}
              <View style={styles.agreementContainer}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() => setAgreeTerms(!agreeTerms)}
                >
                  <View style={[styles.checkboxInner, agreeTerms && styles.checkboxChecked]}>
                    {agreeTerms && <Ionicons name="checkmark" size={rpx(12)} color="#fff" />}
                  </View>
                </TouchableOpacity>
                <View style={styles.agreementTextContainer}>
                  <Text style={styles.agreementText}>
                    阅读并同意{" "}
                    <Text style={styles.linkText} onPress={() => router.push("/user-agreement")}>
                      《用户协议》
                    </Text>{" "}
                    和{" "}
                    <Text style={styles.linkText} onPress={() => router.push("/privacy-policy")}>
                      《隐私条款》
                    </Text>
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 隐私政策弹窗 */}
      {showPrivacyModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>温馨提醒</Text>
            <Text style={styles.modalText}>
              为了更好的保障你的权益，请阅读并同意
              {"\n"}《用户协议》和《隐私条款》
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowPrivacyModal(false)}
              >
                <Text style={styles.modalButtonText}>放弃并继续</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => {
                  setAgreeTerms(true)
                  setShowPrivacyModal(false)
                }}
              >
                <Text style={[styles.modalButtonText, styles.modalButtonTextPrimary]}>
                  同意并继续
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  loginCard: {
    // 使用UniApp的渐变背景
    position: "relative", // 相对定位，为绝对定位的渐变提供参考
    backgroundColor: "transparent", // 改为透明，让LinearGradient显示
    borderRadius: 11.71857, // 11.71857px转rpx (UniApp原值)
    marginHorizontal: 15.625, // 20px转rpx
    width: 320.3125, // 820rpx转750rpx = 320.3125rpx (UniApp原值)
    height: 320, // 增加高度，确保内容完全包含
    alignSelf: "center",
    // UniApp的box-shadow: 0px 0px 36.5px 0px #0000000D 转换为RN
    // shadowColor: "#000000", // 阴影颜色
    // shadowOffset: { width: 0, height: 0 }, // 0px 0px
    // shadowOpacity: 0.05, // #0000000D = 13/255 ≈ 0.05
    // shadowRadius: 28.515625, // 36.5px转rpx = 36.5 * 750 / 1920 = 14.2578125，但需要更大的值来匹配效果
    // elevation: 15, // Android阴影，增大以匹配效果
    overflow: "hidden", // 确保圆角正确显示
  },
  cardGradient: {
    position: "absolute", // 绝对定位确保完全覆盖
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 25, // 内边距移到渐变层
    justifyContent: "center",
    borderRadius: 11.71857, // 确保渐变也有圆角
  },
  header: {
    alignItems: "center",
    marginBottom: 18.75, // 24px转rpx，调整为适合的间距
  },
  logoContainer: {
    width: 46.875, // 46.875rpx (UniApp原值)
    height: 46.875, // 46.875rpx (UniApp原值)
    marginBottom: 7.8125, // 7.8125rpx (UniApp原值)
  },
  logo: {
    width: "100%",
    height: "100%",
  },
  title: {
    fontSize: 13.671875, // 13.671875rpx (UniApp原值)
    fontWeight: "600",
    color: "#4891FF",
    textAlign: "center",
  },
  formContainer: {
    marginBottom: 16.25, // 16.25rpx，调整间距
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
  fullInput: {
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
  loginButton: {
    backgroundColor: "#4891FF",
    borderRadius: 11.71875, // 11.71875rpx (UniApp原值)
    height: 35.15625, // 35.15625rpx (UniApp原值)
    width: 243.75, // 243.75rpx (UniApp原值)
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6.25, // 减少下边距，为底部链接留出空间
    marginTop: 6.25, // 增加上边距
  },
  loginButtonText: {
    fontSize: 10.9375, // 10.9375rpx (UniApp原值)
    fontWeight: "600",
    color: "#fff",
  },
  bottomLinks: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6.25, // 8px转rpx，增加与登录按钮的间距
    paddingLeft: 16,
    paddingRight: 16,
  },
  linkText: {
    fontSize: 10.9375, // 14px转rpx
    color: "#4891FF",
  },
  agreementContainer: {
    flexDirection: "row",
    alignItems: "flex-start", // 改为顶部对齐，确保复选框和文本在同一行
    justifyContent: "center",
    paddingHorizontal: 12.5, // 添加左右内边距
  },
  agreementTextContainer: {
    flex: 1, // 占据剩余空间
    marginLeft: 6.25, // 与复选框的间距
  },
  checkbox: {
    marginTop: 1.5625, // 微调位置，使复选框与文字垂直居中
  },
  checkboxInner: {
    width: 12.5, // 16px转rpx
    height: 12.5, // 16px转rpx
    borderRadius: 6.25, // 8px转rpx
    borderWidth: 0.78125, // 1px转rpx
    borderColor: "#ddd",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#4891FF",
    borderColor: "#4891FF",
  },
  agreementText: {
    fontSize: 9.375, // 12px转rpx
    color: "#666",
    lineHeight: 14.0625, // 添加行高，确保文本垂直居中
    textAlign: "left", // 左对齐
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 9.375, // 12px转rpx
    padding: 18.75, // 24px转rpx
    marginHorizontal: 25, // 32px转rpx
    maxWidth: 250, // 320px转rpx
    width: "100%",
  },
  modalTitle: {
    fontSize: 14.0625, // 18px转rpx
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
    marginBottom: 12.5, // 16px转rpx
  },
  modalText: {
    fontSize: 10.9375, // 14px转rpx
    color: "#666",
    textAlign: "center",
    lineHeight: 15.625, // 20px转rpx
    marginBottom: 18.75, // 24px转rpx
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 9.375, // 12px转rpx
  },
  modalButton: {
    flex: 1,
    height: 31.25, // 40px转rpx
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15.625, // 20px转rpx
    backgroundColor: "#f8f9fa",
  },
  modalButtonPrimary: {
    backgroundColor: "#4891FF",
  },
  modalButtonText: {
    fontSize: 10.9375, // 14px转rpx
    color: "#666",
  },
  modalButtonTextPrimary: {
    color: "#fff",
  },
})
