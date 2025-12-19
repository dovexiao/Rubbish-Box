import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { createStyles } from "../utils/rpxStyleSheet"
import { Images } from "../constants/Assets"
import { AuthService } from "../services/authService"
import { useUserStore } from "../stores/userStore"
import { UserAgreementModal } from "./UserAgreementModal"
import { PrivacyPolicyModal } from "./PrivacyPolicyModal"
import { SetPasswordModal } from "./SetPasswordModal"
import { showSuccess, showError, showWarning } from "../utils/toast"
import { showConfirm } from "../utils/dialog"
import { getBindQRCode } from "@/services/bind"


type LoginMode = "sms" | "password"

interface LoginModalProps {
  visible: boolean
  onSuccess?: () => void
  onCancel?: () => void
  onShowForgotPassword?: () => void
}

/**
 * 登录弹窗组件
 * 原封不动地把登录页面的内容块放到弹窗里
 */
export const LoginModal = React.memo(function LoginModal({
  visible,
  onSuccess,
  onCancel,
  onShowForgotPassword,
}: LoginModalProps) {
  const userStore = useUserStore()
  const [loginMode, setLoginMode] = useState<LoginMode>("sms")
  const [phone, setPhone] = useState("")
  const [smsCode, setSmsCode] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showPrivacyModal, setShowPrivacyModal] = useState(false)
  const [showUserAgreementModal, setShowUserAgreementModal] = useState(false)
  const [showPrivacyPolicyModal, setShowPrivacyPolicyModal] = useState(false)
  const [showSetPasswordModal, setShowSetPasswordModal] = useState(false)
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
      const result = await AuthService.sendSMS(phone)
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

  // 清理表单数据
  const clearFormData = () => {
    setPhone("")
    setSmsCode("")
    setPassword("")
    setAgreeTerms(false)
    setCountdown(0)
    setShowPassword(false)
  }

  // 短信登录
  const handleSMSLogin = async () => {
    console.log("🚀 LoginModal - handleSMSLogin 被调用")
    console.log("📱 输入信息:", { phone, smsCode, agreeTerms })

    if (!phone || !smsCode) {
      console.log("❌ 手机号或验证码为空")
      showWarning("请输入手机号和验证码")
      return
    }

    if (!agreeTerms) {
      console.log("❌ 未同意用户协议")
      setShowPrivacyModal(true)
      return
    }

    console.log("✅ 所有条件检查通过，开始登录")

    try {
      setLoading(true)
      const result = await AuthService.loginWithSMS(phone, smsCode)

      console.log("🔍 LoginModal - AuthService 返回结果:", result)
      console.log("🔍 LoginModal - result.access_token:", result.access_token)
      console.log("🔍 LoginModal - result.refresh_token:", result.refresh_token)
      console.log("🔍 LoginModal - result.user_info:", result.user_info)

      // 保存用户信息
      userStore.setUserInfo({
        token: result.access_token,
        refreshToken: result.refresh_token,
        userInfo: result.user_info,
      })

      // 清理表单数据
      clearFormData()

      showSuccess("登录成功")

      // 检查登录后的状态
      console.log("🔍 LoginModal - 登录成功后的用户信息:", result.user_info)
      console.log("🔍 LoginModal - password_exists 值:", result.user_info?.password_exists)
      console.log("🔍 LoginModal - password_exists 类型:", typeof result.user_info?.password_exists)
      console.log("🔍 LoginModal - password_exists === false:", result.user_info?.password_exists === false)
      console.log("🔍 LoginModal - username_exists 值:", result.user_info?.username_exists)
      console.log("🔍 LoginModal - username_exists 类型:", typeof result.user_info?.username_exists)
      console.log("🔍 LoginModal - username_exists === false:", result.user_info?.username_exists === false)

      const response = await getBindQRCode({ phone: phone })
      console.log("🔍 LoginModal - getBindQRCode response:", response)

      setTimeout(() => {
        // 优先判断是否设置密码
        console.log("⚡ 开始判断逻辑...")
        if (result.user_info?.password_exists === false) {
          console.log("🔐 LoginModal - password_exists === false，需要设置密码")
          // 不要关闭登录弹窗，直接显示设置密码弹窗
          setShowSetPasswordModal(true)
          return
        }
        console.log("✓ password_exists 检查通过，继续判断 username_exists")

        // 然后判断是否完善信息
        if (result.user_info?.username_exists === false) {
          console.log("📝 LoginModal - username_exists === false，跳转到完善信息页面")
          onSuccess?.() // 先关闭弹窗
          router.replace("/complete-info")
        }
        else {
          console.log("🏠 LoginModal - 所有检查通过，跳转到主页")
          onSuccess?.()
        }
        
        // if (response.bound === false) {
        //   console.log("🔐 LoginModal - bound === false，跳转到绑定家长端页面")
        //   onSuccess?.() // 先关闭弹窗
        //   router.replace("/bind-parent")
        // } else {
        //   console.log("🏠 LoginModal - 所有检查通过，跳转到主页")
        //   onSuccess?.()
        // }
      }, 500)
    } catch (error: any) {
      showError(error.message || "登录失败")
    } finally {
      setLoading(false)
    }
  }

  // 密码登录
  const handlePasswordLogin = async () => {
    if (!phone || !password) {
      showWarning("请输入手机号和密码")
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

      // 清理表单数据
      clearFormData()

      showSuccess("登录成功")

      // 检查登录后的状态
      console.log("🔍 LoginModal - 密码登录成功后的用户信息:", result.user_info)
      console.log("🔍 LoginModal - password_exists 值:", result.user_info?.password_exists)
      console.log("🔍 LoginModal - password_exists === false:", result.user_info?.password_exists === false)
      console.log("🔍 LoginModal - username_exists 值:", result.user_info?.username_exists)
      console.log("🔍 LoginModal - username_exists === false:", result.user_info?.username_exists === false)

      setTimeout(() => {
        // 优先判断是否设置密码（密码登录一般不会出现这种情况，但保持一致）
        console.log("⚡ 开始判断逻辑（密码登录）...")
        if (result.user_info?.password_exists === false) {
          console.log("🔐 LoginModal - password_exists === false，需要设置密码")
          // 不要关闭登录弹窗，直接显示设置密码弹窗
          setShowSetPasswordModal(true)
          return
        }
        console.log("✓ password_exists 检查通过，继续判断 username_exists")

        // 然后判断是否完善信息
        if (result.user_info?.username_exists === false) {
          console.log("📝 LoginModal - username_exists === false，跳转到完善信息页面")
          onSuccess?.() // 先关闭弹窗
          router.replace("/complete-info")
        } else {
          console.log("🏠 LoginModal - 所有检查通过，跳转到主页")
          onSuccess?.()
        }
      }, 500)
    } catch (error: any) {
      showError(error.message || "登录失败")
    } finally {
      setLoading(false)
    }
  }

  // 忘记密码
  const handleForgotPassword = () => {
    onShowForgotPassword?.()
  }

  // 显示用户协议
  const handleShowUserAgreement = () => {
    setShowUserAgreementModal(true)
  }

  // 显示隐私政策
  const handleShowPrivacyPolicy = () => {
    setShowPrivacyPolicyModal(true)
  }

  // 弹窗关闭时清理表单数据
  useEffect(() => {
    if (!visible) {
      clearFormData()
    }
  }, [visible])

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
      <View style={styles.bottomLinksCode}>
        <TouchableOpacity onPress={() => setLoginMode("password")}>
          <Text style={styles.linkText}>账号密码登录</Text>
        </TouchableOpacity>
        {/* <TouchableOpacity onPress={handleForgotPassword}>
          <Text style={styles.linkText}>忘记密码?</Text>
        </TouchableOpacity> */}
      </View>
    </View>
  )

  const renderPasswordLogin = () => (
    <View style={styles.formContainer}>
      {/* 手机号输入 */}
      <View style={styles.inputWrapper}>
        <Text style={styles.countryCode}>+86</Text>
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
          <Ionicons name={showPassword ? "eye" : "eye-off"} size={20} color="#999" />
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
    <>
      <Modal
        visible={visible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => {
          console.log("🔐 LoginModal: onRequestClose 被调用")
          onCancel?.()
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            console.log("🔐 LoginModal: 点击蒙版，关闭弹窗")
            onCancel?.()
          }}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.keyboardView}>
              <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
              >
                <ScrollView
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                >
                  {/* 关闭按钮 */}
                  {/* <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity> */}

                  {/* 原封不动的登录内容块 - 使用 TouchableWithoutFeedback 阻止点击穿透 */}
                  <TouchableWithoutFeedback onPress={() => {
                    console.log("🔐 LoginModal: 点击内容卡片，不关闭弹窗")
                    // 什么都不做，阻止事件传递到外层
                  }}>
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
                          <Text style={styles.title}>Hello！欢迎使用小褐同学智能学习桌</Text>
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
                              {agreeTerms && <Ionicons name="checkmark" size={12} color="#fff" />}
                            </View>
                          </TouchableOpacity>
                          <View style={styles.agreementTextContainer}>
                            <Text style={styles.agreementText}>
                              阅读并同意{" "}
                              <Text style={styles.linkText} onPress={handleShowUserAgreement}>
                                《用户协议》
                              </Text>{" "}
                              和{" "}
                              <Text style={styles.linkText} onPress={handleShowPrivacyPolicy}>
                                《隐私条款》
                              </Text>
                            </Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </View>
                  </TouchableWithoutFeedback>

                  {/* 隐私政策弹窗 */}
                  {showPrivacyModal && (
                    <View style={styles.privacyModalOverlay}>
                      <View style={styles.privacyModalContent}>
                        <Text style={styles.privacyModalTitle}>温馨提醒</Text>
                        <Text style={styles.privacyModalText}>
                          为了更好的保障你的权益，请阅读并同意
                          {"\n"}《用户协议》和《隐私条款》
                        </Text>
                        <View style={styles.privacyModalButtons}>
                          <TouchableOpacity
                            style={styles.privacyModalButton}
                            onPress={() => setShowPrivacyModal(false)}
                          >
                            <Text style={styles.privacyModalButtonText}>放弃并继续</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.privacyModalButton, styles.privacyModalButtonPrimary]}
                            onPress={() => {
                              setAgreeTerms(true)
                              setShowPrivacyModal(false)
                            }}
                          >
                            <Text style={[styles.privacyModalButtonText, styles.privacyModalButtonTextPrimary]}>
                              同意并继续
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  )}
                </ScrollView>
              </KeyboardAvoidingView>
            </View>
          </View>
        </TouchableWithoutFeedback>

        {/* 用户协议弹窗 */}
        <UserAgreementModal
          visible={showUserAgreementModal}
          onCancel={() => setShowUserAgreementModal(false)}
        />

        {/* 隐私政策弹窗 */}
        <PrivacyPolicyModal
          visible={showPrivacyPolicyModal}
          onCancel={() => setShowPrivacyPolicyModal(false)}
        />

      </Modal>

      {/* 设置密码弹窗 - 独立的 Modal，不嵌套在 LoginModal 内 */}
      <SetPasswordModal
        visible={showSetPasswordModal}
        onSuccess={() => {
          console.log("🔐 设置密码成功")
          setShowSetPasswordModal(false)

          // 设置密码成功后，跳转到绑定家长端页面
          console.log("📱 设置密码成功 - 跳转到绑定家长端页面")
          onSuccess?.() // 关闭登录弹窗
          // router.replace("/bind-parent")
        }}
        onCancel={() => {
          console.log("❌ 取消设置密码")
          setShowSetPasswordModal(false)
        }}
      />
    </>
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
  // 原封不动的登录页面样式
  loginCard: {
    position: "relative" as const,
    backgroundColor: "transparent",
    borderRadius: 11.71857,
    marginHorizontal: 15.625,
    width: 320.3125,
    height: 320,
    alignSelf: "center" as const,
    overflow: "hidden" as const,
  },
  cardGradient: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 25,
    justifyContent: "center" as const,
    borderRadius: 11.71857,
  },
  header: {
    alignItems: "center" as const,
    marginBottom: 18.75,
  },
  logoContainer: {
    width: 46.875,
    height: 46.875,
    marginBottom: 7.8125,
  },
  logo: {
    width: "100%" as any,
    height: "100%" as any,
  },
  title: {
    fontSize: 13.671875,
    fontWeight: "600" as const,
    color: "#4891FF",
    textAlign: "center" as const,
  },
  formContainer: {
    marginBottom: 16.25,
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
  fullInput: {
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
  loginButton: {
    backgroundColor: "#4891FF",
    borderRadius: 11.71875,
    height: 35.15625,
    width: 243.75,
    alignSelf: "center" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 6.25,
    marginTop: 6.25,
  },
  loginButtonText: {
    fontSize: 10.9375,
    fontWeight: "600" as const,
    color: "#fff",
  },
  bottomLinksCode: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginTop: 6.25,
    paddingLeft: 16,
    paddingRight: 16,
  },
  bottomLinks: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginTop: 6.25,
    paddingLeft: 16,
    paddingRight: 16,
  },
  linkText: {
    fontSize: 10.9375,
    color: "#4891FF",
  },
  agreementContainer: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    justifyContent: "center" as const,
    paddingHorizontal: 12.5,
  },
  agreementTextContainer: {
    flex: 1,
    marginLeft: 6.25,
  },
  checkbox: {
    marginTop: 1.5625,
  },
  checkboxInner: {
    width: 12.5,
    height: 12.5,
    borderRadius: 6.25,
    borderWidth: 0.78125,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  checkboxChecked: {
    backgroundColor: "#4891FF",
    borderColor: "#4891FF",
  },
  agreementText: {
    fontSize: 9.375,
    color: "#666",
    lineHeight: 14.0625,
    textAlign: "left" as const,
  },
  privacyModalOverlay: {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  privacyModalContent: {
    backgroundColor: "#fff",
    borderRadius: 9.375,
    padding: 18.75,
    marginHorizontal: 25,
    maxWidth: 250,
    width: "100%" as any,
  },
  privacyModalTitle: {
    fontSize: 14.0625,
    fontWeight: "600" as const,
    color: "#333",
    textAlign: "center" as const,
    marginBottom: 12.5,
  },
  privacyModalText: {
    fontSize: 10.9375,
    color: "#666",
    textAlign: "center" as const,
    lineHeight: 15.625,
    marginBottom: 18.75,
  },
  privacyModalButtons: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    gap: 9.375,
  },
  privacyModalButton: {
    flex: 1,
    height: 31.25,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderRadius: 15.625,
    backgroundColor: "#f8f9fa",
  },
  privacyModalButtonPrimary: {
    backgroundColor: "#4891FF",
  },
  privacyModalButtonText: {
    fontSize: 10.9375,
    color: "#666",
  },
  privacyModalButtonTextPrimary: {
    color: "#fff",
  },
})