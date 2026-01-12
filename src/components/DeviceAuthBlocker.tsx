import React from "react"
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image } from "react-native"
import { BlurView } from "expo-blur"
import { Ionicons } from "@expo/vector-icons"
import { useDeviceAuthStore } from "../stores/deviceAuthStore"
import { useLockScreenStore } from "@/stores/lockScreenStore"
import { useNetworkStore } from "../stores/networkStore"
import { Images } from "../constants/Assets"

/**
 * 设备授权阻止组件
 * 当设备未授权时，显示全屏遮罩阻止用户操作
 * 🔴 只有在网络已连接且明确验证失败（exists: false）时才显示弹窗
 */
export const DeviceAuthBlocker: React.FC = () => {
  const isBlocked = useDeviceAuthStore((state) => state.isBlocked)
  const deviceUUID = useDeviceAuthStore((state) => state.deviceUUID)
  const locked = useLockScreenStore((state) => state.locked)
  const isConnected = useNetworkStore((state) => state.isConnected)

  // 🔴 只有明确验证失败（exists: false）时才显示弹窗
  // 🔴 如果网络未连接，不显示授权弹窗（应该显示网络弹窗）
  const shouldShow = isBlocked && !locked && isConnected

  if (!shouldShow) {
    return null
  }

  return (
    <Modal
      visible={shouldShow}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        // 不允许关闭
      }}
    >
      <BlurView intensity={100} style={styles.overlay} experimentalBlurMethod="dimezisBlurView">
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={64} color="#FF3B30" />
          </View>
          
          <Text style={styles.title}>设备未授权</Text>
          
          <Text style={styles.message}>
            当前设备未通过授权验证，无法使用此应用。
            {/* {"\n"}
            请联系客服进行设备授权。 */}
          </Text>
          
          {/* 客服微信二维码 */}
          <Image
            source={Images.customerServiceWeChat}
            style={styles.wechatQrCode}
            resizeMode="contain"
          />
          
          <View style={styles.infoContainer}>
            <Ionicons name="information-circle-outline" size={20} color="#666" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              设备序列号: {deviceUUID || "未获取"}
            </Text>
          </View>
        </View>
      </BlurView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // 降低不透明度，让模糊效果更明显
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
    marginBottom: 14,
    backgroundColor: "#FFEBEE",
    borderRadius: 64,
    width: 108,
    height: 108,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 4,
  },
  wechatQrCode: {
    width: 200,
    height: 200,
    marginBottom: 4,
    borderRadius: 8,
  },
  infoContainer: {
    flexDirection: "row",
    // alignItems: "center",
    // justifyContent: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    // width: "100%",
  },
  infoIcon: {
    // alignSelf: "center",
    // marginTop: 4
  },
  infoText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 8,
    includeFontPadding: false,
    textAlignVertical: "center",
  },
})

