/*
 * @Author: zdb zhiubo_1@163.com
 * @Date: 2025-10-11 09:49:54
 * @LastEditors: zdb zhiubo_1@163.com
 * @LastEditTime: 2025-10-11 09:55:28
 * @FilePath: /xhtx-app/xhtx/src/components/LoadingOverlay.tsx
 * @Description:
 */
import { View, ActivityIndicator, Modal } from "react-native"

import { Text } from "./Themed"
import { createStyles } from "../utils/rpxStyleSheet"

interface Props {
  visible: boolean
  text?: string
  size?: "small" | "large"
  color?: string
}

/**
 * 全屏遮罩Loading组件
 * 用于上传、提交等需要阻塞用户操作的场景
 */
export function LoadingOverlay({
  visible,
  text = "加载中...",
  size = "large",
  color = "#4891FF",
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <ActivityIndicator size={size} color={color} />
          {text && <Text style={styles.text}>{text}</Text>}
        </View>
      </View>
    </Modal>
  )
}

const styles = createStyles({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingVertical: 23.4375, // 30px转rpx
    paddingHorizontal: 31.25, // 40px转rpx
    alignItems: "center",
  },
  text: {
    marginTop: 12.5, // 16px转rpx
    fontSize: 10.9375, // 14px转rpx
    color: "#fff", // 透明背景下使用白色文字
    textAlign: "center",
    lineHeight: 15.625, // 20px转rpx
  },
})

export default LoadingOverlay
