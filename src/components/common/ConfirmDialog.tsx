import React from "react"
import { View, Text, TouchableOpacity, Modal, StyleProp, ViewStyle, Image } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { createStyles, rpx } from "../../utils/rpxStyleSheet"
import { Images } from "../../constants/Assets"

interface ConfirmDialogProps {
  visible: boolean
  title: string
  content?: string
  cancelText?: string
  confirmText?: string
  onCancel?: () => void
  onConfirm: () => void
  onClose?: () => void
}

/**
 * 确认弹窗组件
 */
const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  visible,
  title,
  content = "",
  cancelText = "取消",
  confirmText = "确认",
  onCancel,
  onConfirm,
  onClose,
}) => {
  const handleCancel = () => {
    onCancel?.()
    onClose?.()
  }

  const handleConfirm = () => {
    onConfirm()
    onClose?.()
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <LinearGradient
            colors={["#F0F7FF", "#3EA3FF"]}
            start={{ x: 0, y: 0.4 }}
            end={{ x: 0, y: 0 }}
            style={styles.gradientContainer}
          >
            {/* 第一行：标题 */}
            <Text style={styles.title}>{title}</Text>

            {/* 第二行：内容文本 */}
            {content && <Text style={styles.content}>{content}</Text>}

            {/* 第三行：按钮 */}
            <View style={styles.buttonRow}>
              {/* 取消按钮 */}
              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.8}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>

              {/* 确认按钮 */}
              <TouchableOpacity
                style={styles.confirmButtonWrapper}
                activeOpacity={0.8}
                onPress={handleConfirm}
              >
                <LinearGradient
                  colors={["#AFDCFF", "#4BB1FF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.confirmButton}
                >
                  <Text style={styles.confirmButtonText}>{confirmText}</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
          <Image source={Images.pointsMallBoy} style={styles.boyImage} resizeMode="contain" />
        </View>
      </View>
    </Modal>
  )
}

const styles = createStyles({
  overlay: {
    width: '100%' as const,
    height: '100%' as const,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  container: {
    width: 301.5625, // 773 * 750 / 1920
    // height: 118.75, // 304 * 750 / 1920
  },
  gradientContainer: {
    width: "100%" as const,
    // height: "100%" as const,
    borderRadius: 11.71875, // 30 * 750 / 1920
    paddingTop: 15.625, // 40 * 750 / 1920
    paddingRight: 31.25, // 80 * 750 / 1920
    paddingBottom: 15.625, // 40 * 750 / 1920
    paddingLeft: 31.25, // 80 * 750 / 1920
    gap: 12.5, // 32 * 750 / 1920
    justifyContent: "flex-start" as const,
    alignItems: "center" as const,
  },
  title: {
    fontFamily: "kingnam_bobo",
    fontWeight: "400" as const,
    fontSize: 12.5, // 32 * 750 / 1920
    color: "#1571FC",
    textAlign: "center" as const,
  },
  content: {
    fontFamily: "PingFang SC",
    fontWeight: "400" as const,
    fontSize: 10.9375, // 28 * 750 / 1920
    color: "#00000099",
    textAlign: "center" as const,
  },
  buttonRow: {
    width: "100%" as const,
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    gap: 12.5, // 32 * 750 / 1920
    marginTop: 3.125, // 8 * 750 / 1920
  },
  cancelButton: {
    width: 121.875, // 312 * 750 / 1920
    height: 30.859375, // 79 * 750 / 1920
    borderRadius: 15.625, // 40 * 750 / 1920
    borderWidth: 1.171875, // 3 * 750 / 1920
    backgroundColor: "#FFFFFF66",
    borderColor: "#4BB1FF80",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  cancelButtonText: {
    fontFamily: "PingFang SC",
    fontWeight: "400" as const,
    fontSize: 10.9375, // 28 * 750 / 1920
    color: "#4BB1FF",
  },
  confirmButtonWrapper: {
    width: 121.875, // 312 * 750 / 1920
    height: 30.859375, // 79 * 750 / 1920
    borderRadius: 15.625, // 40 * 750 / 1920
    borderWidth: 1.171875, // 3 * 750 / 1920
    borderColor: "#FFFFFF73",
    overflow: "hidden" as const,
    shadowColor: "#3B8DF182",
    shadowOffset: { width: 0, height: 2.34375 }, // 6 * 750 / 1920
    shadowRadius: 3.125, // 8 * 750 / 1920
    shadowOpacity: 1,
    elevation: 8,
  },
  confirmButton: {
    width: "100%" as const,
    height: "100%" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  confirmButtonText: {
    fontFamily: "PingFang SC" as const,
    fontWeight: "500" as const,
    fontSize: 10.9375, // 28 * 750 / 1920
    color: "#FFFFFF",
  },
  boyImage: {
    width: 93.75, // 240
    height: 72.6563, // 186
    position: "absolute" as const,
    top: -55.6641, // 142.5
    left: 19.5313, // 50
  },
})

export default ConfirmDialog

