import { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from "react-native"
import { useRouter } from "expo-router"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"

import { StatusBar } from "../components/StatusBar"
import { createStyles, rpx } from "../utils/rpxStyleSheet"
import { getBindQRCode, checkBindStatus, type BindDeviceResponse } from "../services/bind"
import { showError, showSuccess } from "../utils/toast"

/**
 * 绑定家长端小程序页面
 */
export default function BindParentScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [bindData, setBindData] = useState<BindDeviceResponse | null>(null)
  const [countdown, setCountdown] = useState(300) // 5分钟倒计时
  const [checking, setChecking] = useState(false)
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 获取绑定二维码
  const fetchBindQRCode = async () => {
    try {
      setLoading(true)
      const data = await getBindQRCode()
      setBindData(data)
      setCountdown(data.expiresIn || 300)
      
      // 开始轮询检查绑定状态
      startCheckingBindStatus(data.bindCode)
      
      // 开始倒计时
      startCountdown()
    } catch (error: any) {
      console.error("❌ fetchBindQRCode error", {
        message: error?.message,
        status: error?.status,
        data: error?.data,
        stack: error?.stack,
      })
      showError(error.message || "获取二维码失败")
      // 失败后返回上一页
      // setTimeout(() => {
      //   router.back()
      // }, 1500)
    } finally {
      setLoading(false)
    }
  }

  // 开始轮询检查绑定状态
  const startCheckingBindStatus = (bindCode: string) => {
    // 清除旧的轮询
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current)
    }

    // 每3秒检查一次
    checkIntervalRef.current = setInterval(async () => {
      try {
        setChecking(true)
        const result = await checkBindStatus(bindCode)
        
        if (result.success && result.bound) {
          // 绑定成功
          stopChecking()
          showSuccess("绑定成功")
          
          // 延迟跳转到首页
          setTimeout(() => {
            router.replace("/(tabs)")
          }, 1500)
        }
      } catch (error: any) {
        console.error("❌ checkBindStatus poll error", {
          message: error?.message,
          status: error?.status,
          data: error?.data,
          stack: error?.stack,
        })
      } finally {
        setChecking(false)
      }
    }, 3000)
  }

  // 开始倒计时
  const startCountdown = () => {
    // 清除旧的倒计时
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
    }

    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // 倒计时结束，停止检查
          stopChecking()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // 停止检查
  const stopChecking = () => {
    if (checkIntervalRef.current) {
      clearInterval(checkIntervalRef.current)
      checkIntervalRef.current = null
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
  }

  // 刷新二维码
  const handleRefresh = () => {
    stopChecking()
    fetchBindQRCode()
  }

  // 跳过绑定，直接进入首页
  const handleSkip = () => {
    stopChecking()
    router.replace("/(tabs)")
  }

  // 返回首页
  const handleBack = () => {
    stopChecking()
    router.replace("/(tabs)")
  }

  // 格式化倒计时
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  // 组件挂载时获取二维码
  useEffect(() => {
    fetchBindQRCode()

    // 组件卸载时清理
    return () => {
      stopChecking()
    }
  }, [])

  return (
    <LinearGradient
      colors={["#93ABFF", "#E4F4FF", "#CDEDFF", "#FFFFFF"]}
      locations={[-0.1128, 0.1494, 0.8474, 1.0586]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar theme="dark" />

      {/* 标题栏 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Ionicons name="home" size={rpx(20)} color="#4891FF" />
        </TouchableOpacity>
        <Text style={styles.title}>绑定家长端</Text>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.7}
        >
          <Text style={styles.skipText}>跳过</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4891FF" />
            <Text style={styles.loadingText}>正在生成二维码...</Text>
          </View>
        ) : (
          <View style={styles.content}>
            {/* 小程序码占位 - 固定图片 */}
            <View style={styles.miniProgramSection}>
              <Text style={styles.stepNumber}>01</Text>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>
                  打开微信"扫一扫"登录"小褐同学家长端"小程序
                </Text>
                <Text style={styles.stepSubtitle}>进入小程序手机号进行验证登录~</Text>
              </View>
              <View style={styles.qrCodeWrapper}>
                {/* 这里放一个占位的小程序码图片 */}
                <View style={styles.qrCodePlaceholder}>
                  <Ionicons name="qr-code" size={rpx(80)} color="#4891FF" />
                  <Text style={styles.placeholderText}>小程序码</Text>
                </View>
              </View>
            </View>

            {/* 绑定二维码 */}
            <View style={styles.bindSection}>
              <Text style={styles.stepNumber}>02</Text>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>登录后扫描下方二维码进行绑定</Text>
                <Text style={styles.stepSubtitle}>
                  小程序点击主页「绑定设备」按钮，扫描下方二维码完成设备绑定
                </Text>
              </View>
              
              {bindData && (
                <View style={styles.qrCodeSection}>
                  <View style={styles.qrCodeCard}>
                    {countdown > 0 ? (
                      <>
                        <Image
                          source={{ uri: bindData.qrCode }}
                          style={styles.qrCodeImage}
                          resizeMode="contain"
                        />
                        <View style={styles.qrCodeInfo}>
                          <View style={styles.deviceInfo}>
                            <Text style={styles.deviceTypeText}>
                              {bindData.deviceTypeName}
                            </Text>
                            <Text style={styles.bindCodeText}>
                              绑定码：{bindData.bindCode}
                            </Text>
                          </View>
                          <View style={styles.countdownContainer}>
                            <Ionicons name="time-outline" size={rpx(14)} color="#666" />
                            <Text style={styles.countdownText}>
                              有效期：{formatCountdown(countdown)}
                            </Text>
                          </View>
                        </View>
                        {checking && (
                          <View style={styles.checkingOverlay}>
                            <ActivityIndicator size="small" color="#4891FF" />
                            <Text style={styles.checkingText}>检查绑定状态...</Text>
                          </View>
                        )}
                      </>
                    ) : (
                      <View style={styles.expiredContainer}>
                        <Ionicons name="alert-circle-outline" size={rpx(40)} color="#999" />
                        <Text style={styles.expiredText}>二维码已过期</Text>
                        <TouchableOpacity
                          style={styles.refreshButton}
                          onPress={handleRefresh}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="refresh" size={rpx(16)} color="#fff" />
                          <Text style={styles.refreshButtonText}>刷新二维码</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>

            {/* 提示信息 */}
            <View style={styles.tipsContainer}>
              <View style={styles.tipRow}>
                <Ionicons name="information-circle" size={rpx(14)} color="#4891FF" />
                <Text style={styles.tipText}>
                  绑定后，家长可通过小程序查看孩子的学习数据
                </Text>
              </View>
              <View style={styles.tipRow}>
                <Ionicons name="information-circle" size={rpx(14)} color="#4891FF" />
                <Text style={styles.tipText}>
                  一个设备可以绑定多个家长账号
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  )
}

const styles = createStyles({
  container: {
    flex: 1,
    width: "100%" as const,
    minWidth: 750,
  },
  header: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 29,
    paddingTop: 38.625,
    paddingBottom: 15.625,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: "#333",
  },
  skipButton: {
    paddingHorizontal: 15.625,
    paddingVertical: 7.8125,
  },
  skipText: {
    fontSize: 14,
    color: "#4891FF",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 29,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 15.625,
    fontSize: 14,
    color: "#666",
  },
  content: {
    gap: 31.25,
  },
  // 小程序码部分
  miniProgramSection: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 15.625,
    padding: 23.4375,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#4891FF",
    backgroundColor: "rgba(72, 145, 255, 0.1)",
    width: 35,
    height: 35,
    lineHeight: 35,
    textAlign: "center" as const,
    borderRadius: 17.5,
    marginBottom: 15.625,
  },
  stepContent: {
    marginBottom: 23.4375,
  },
  stepTitle: {
    fontSize: 15.625,
    fontWeight: "bold" as const,
    color: "#333",
    marginBottom: 7.8125,
  },
  stepSubtitle: {
    fontSize: 12.5,
    color: "#666",
    lineHeight: 20,
  },
  qrCodeWrapper: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 23.4375,
  },
  qrCodePlaceholder: {
    width: 100,
    height: 100,
    backgroundColor: "#fff",
    borderRadius: 15.625,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 2,
    borderColor: "#E5E5E5",
    borderStyle: "dashed" as const,
  },
  placeholderText: {
    marginTop: 11.71875,
    fontSize: 14,
    color: "#999",
  },
  // 绑定二维码部分
  bindSection: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderRadius: 15.625,
    padding: 23.4375,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
  },
  qrCodeSection: {
    alignItems: "center" as const,
  },
  qrCodeCard: {
    backgroundColor: "#fff",
    borderRadius: 15.625,
    padding: 23.4375,
    alignItems: "center" as const,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3.90625 },
    shadowOpacity: 0.1,
    shadowRadius: 7.8125,
    elevation: 3,
    minHeight: 300,
    justifyContent: "center" as const,
  },
  qrCodeImage: {
    width: 150,
    height: 150,
  },
  qrCodeInfo: {
    marginTop: 15.625,
    width: "100%" as const,
    gap: 11.71875,
  },
  deviceInfo: {
    alignItems: "center" as const,
    gap: 7.8125,
  },
  deviceTypeText: {
    fontSize: 14,
    fontWeight: "bold" as const,
    color: "#333",
  },
  bindCodeText: {
    fontSize: 12,
    color: "#666",
    fontFamily: "monospace" as const,
  },
  countdownContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 5.859375,
  },
  countdownText: {
    fontSize: 12,
    color: "#666",
  },
  checkingOverlay: {
    position: "absolute" as const,
    bottom: 15.625,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 7.8125,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    paddingHorizontal: 15.625,
    paddingVertical: 7.8125,
    borderRadius: 15.625,
  },
  checkingText: {
    fontSize: 12,
    color: "#4891FF",
  },
  expiredContainer: {
    alignItems: "center" as const,
    gap: 15.625,
    paddingVertical: 40,
  },
  expiredText: {
    fontSize: 14,
    color: "#999",
  },
  refreshButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 7.8125,
    backgroundColor: "#4891FF",
    paddingHorizontal: 23.4375,
    paddingVertical: 11.71875,
    borderRadius: 23.4375,
  },
  refreshButtonText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold" as const,
  },
  // 提示信息
  tipsContainer: {
    backgroundColor: "rgba(72, 145, 255, 0.05)",
    borderRadius: 11.71875,
    padding: 15.625,
    gap: 11.71875,
  },
  tipRow: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 7.8125,
  },
  tipText: {
    flex: 1,
    fontSize: 12.5,
    color: "#666",
    lineHeight: 20,
  },
})

