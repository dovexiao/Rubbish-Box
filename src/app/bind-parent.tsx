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
import { getBindQRCode, type BindDeviceResponse } from "../services/bind"
import { showError, showSuccess } from "../utils/toast"
import { NavBar } from "../components/NavBar"
import { ConfirmDialog } from "../components/ConfirmDialog"
import { useDeviceStatusStore } from "../stores/deviceStatusStore"
import { Images } from "../constants/Assets"

/**
 * 绑定家长端小程序页面
 */
export default function BindParentScreen() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [bindData, setBindData] = useState<BindDeviceResponse | null>(null)
  const [countdown, setCountdown] = useState(300) // 5分钟倒计时
  
  // 弹窗状态
  const [dialogVisible, setDialogVisible] = useState(false)
  const [dialogMessage, setDialogMessage] = useState("")

  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const hasNavigatedRef = useRef(false) // 防止重复跳转
  
  // 订阅 WebSocket 推送的绑定状态
  const isBound = useDeviceStatusStore((state) => state.status?.bound ?? false)



  // 获取绑定二维码
  const fetchBindQRCode = async () => {
    try {
      setLoading(true)
      const response = await getBindQRCode()
      
      // 如果已经绑定过了，弹窗提示并返回上一页
      if (response.bound === true) {
        setDialogMessage("该设备已经绑定过了")
        setDialogVisible(true)
        return
      }
      
      setBindData(response.data)
      setCountdown(response.data.expiresIn || 300)
      
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
    } finally {
      setLoading(false)
    }
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
          // 倒计时结束
          stopCountdown()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // 停止倒计时
  const stopCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current)
      countdownIntervalRef.current = null
    }
  }

  // 确认弹窗处理
  const handleConfirmDialog = () => {
    setDialogVisible(false)
    router.back()
  }

  // 刷新二维码
  const handleRefresh = () => {
    stopCountdown()
    fetchBindQRCode()
  }

  // 返回首页
  const handleBack = () => {
    stopCountdown()
    if (router.canGoBack()) {
      router.back()
    } else {
      router.replace("/(tabs)")
    }
  }

  // 监听 WebSocket 推送的绑定状态
  useEffect(() => {
    if (isBound && !hasNavigatedRef.current && !loading) {
      console.log("🎉 检测到设备已绑定，准备跳转...")
      hasNavigatedRef.current = true // 防止重复跳转
      
      // 停止倒计时
      stopCountdown()
      
      // 显示成功提示
      showSuccess("绑定成功")
      
      // 延迟跳转到首页
      setTimeout(() => {
        router.replace("/(tabs)")
      }, 1500)
    }
  }, [isBound, loading])

  // 组件挂载时获取二维码
  useEffect(() => {
    fetchBindQRCode()

    // 组件卸载时清理
    return () => {
      stopCountdown()
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
      <NavBar 
        title="扫码绑定" 
        leftArrow={true} 
        onBackPress={handleBack} 
      />

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
             {/* 大卡片容器 */}
             <View style={styles.bigCard}>
                {/* 步骤一 */}
                <View style={styles.stepRow}>
                  <View style={styles.stepInfo}>
                    <View style={styles.stepHeader}>
                      <Text style={styles.stepNumber}>01</Text>
                      <Text style={styles.stepTitle}>
                        打开微信“扫一扫”登录“小褐同学家长端”小程序
                      </Text>
                    </View>
                    <Text style={styles.stepSubtitle1}>
进入小程序后，请使用与学习账号相同的手机号进行验证登录</Text>
                  </View>
                  <View style={styles.qrCodeWrapper}>
                    {/* 小程序码占位 */}
                    <View style={styles.qrCodePlaceholder}>
                        <Image
                              source={Images.appletQrCode as any}
                              style={styles.qrCodeImage}
                              resizeMode="contain"
                            />
                        {/* <Text style={styles.placeholderText}>小程序码</Text> */}
                    </View>
                  </View>
                </View>

                {/* 步骤二 */}
                <View style={[styles.stepRow, styles.stepRowMargin]}>
                  <View style={styles.stepInfo}>
                    <View style={styles.stepHeader}>
                      <Text style={styles.stepNumber}>02</Text>
                      <Text style={styles.stepTitle}>登录后扫描下方二维码进行绑定</Text>
                    </View>
                    <Text style={styles.stepSubtitle}>
                      小程序点击主页「绑定设备」按钮，扫描下方二维码完成设备绑定
                    </Text>
                  </View>
                  
                  <View style={styles.qrCodeWrapper}>
                    {bindData ? (
                      <View style={styles.qrCodeContainer}>
                         {countdown > 0 ? (
                            <Image
                              source={{ uri: bindData.qrCode }}
                              style={styles.qrCodeImage}
                              resizeMode="contain"
                            />
                         ) : (
                            <TouchableOpacity onPress={handleRefresh} style={styles.expiredOverlay}>
                               <Ionicons name="refresh" size={rpx(24)} color="#fff" />
                               <Text style={styles.expiredText}>点击刷新</Text>
                            </TouchableOpacity>
                         )}
                      </View>
                    ) : (
                      <View style={styles.qrCodePlaceholder}>
                        <ActivityIndicator size="small" color="#999" />
                      </View>
                    )}
                  </View>
                </View>
             </View>
          </View>
        )}
      </ScrollView>

      {/* 确认弹窗 */}
      <ConfirmDialog
        visible={dialogVisible}
        title="提示"
        message={dialogMessage}
        confirmText="确定"
        cancelText="" // 隐藏取消按钮
        onConfirm={handleConfirmDialog}
        onCancel={() => {}} // 空函数，实际上不会显示取消按钮
      />
    </LinearGradient>
  )
}

const styles = createStyles({
  container: {
    flex: 1,
    width: "100%" as const,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 100,
    paddingTop: 10,
    paddingBottom: 40,
    alignItems: 'center' as const,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 5.625,
    fontSize: 9.375,
    color: "#666",
  },
  content: {
    width: '100%' as const,
    maxWidth: 600,
    alignItems: 'center' as const,
  },
  bigCard: {
    backgroundColor: "rgba(215, 236, 255, 0.6)",
    borderRadius: 20,
    padding: 10,
    width: '100%' as const,
  },
  stepRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    minHeight: 120,
  },
  stepRowMargin: {
    marginTop: 0,
  },
  stepInfo: {
    flex: 1,
    paddingRight: 20,
    justifyContent: 'center' as const,
  },
  stepHeader: {
    flexDirection: 'row' as const,
    alignItems: 'flex-start' as const,
    marginBottom: 0,
  },
  stepNumber: {
    backgroundColor: '#4891FF',
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold' as const,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
    overflow: 'hidden' as const,
    marginTop: 2, // 微调垂直对齐
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: "#333",
    flex: 1,
    lineHeight: 24,
  },
  stepSubtitle: {
    fontSize: 12,
    color: '#666',
    lineHeight: 12,
    // marginTop: 5,
    paddingLeft: 45, // 对齐到标题下方
  },
  stepSubtitle1: {
    fontSize: 12,
    color: '#2271fc',
    lineHeight: 12,
    // marginTop: 5,
    paddingLeft: 45, // 对齐到标题下方


  },
  qrCodeWrapper: {
    width: 100,
    height: 100,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 12,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  qrCodeContainer: {
    width: '100%' as const,
    height: '100%' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderRadius: 8,
    overflow: 'hidden' as const,
  },
  qrCodePlaceholder: {
    width: '100%' as const,
    height: '100%' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  qrCodeImage: {
    width: '100%' as const,
    height: '100%' as const,
  },
  placeholderText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  expiredOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  expiredText: {
    color: '#fff',
    fontSize: 10,
    marginTop: 4,
  },
})
