import { Portal, Dialog, Button, Text } from "react-native-paper"
import { Dimensions } from "react-native"
import { createStyles } from "../utils/rpxStyleSheet"

const SCREEN_WIDTH = Dimensions.get("window").width

interface ConfirmDialogProps {
  visible: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
}

/**
 * 确认对话框组件
 * 替代 Alert.alert，符合项目风格的美观确认对话框
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = "确定",
  cancelText = "取消",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const handleCancel = () => {
    onCancel?.()
  }

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <Portal>
      <Dialog 
        visible={visible} 
        onDismiss={handleCancel} 
        style={[
          styles.dialog,
          { 
            width: SCREEN_WIDTH * 0.5, 
            maxWidth: SCREEN_WIDTH * 0.5,
            alignSelf: "center" as const,
          }
        ]}
      >
        <Dialog.Title style={styles.title}>{title}</Dialog.Title>
        <Dialog.Content style={styles.content}>
          <Text style={styles.message}>{message}</Text>
        </Dialog.Content>
        <Dialog.Actions style={styles.actions}>
          {onCancel && (
            <Button 
              onPress={handleCancel} 
              textColor="#666"
              labelStyle={styles.buttonLabel}
            >
              {cancelText}
            </Button>
          )}
          <Button 
            onPress={handleConfirm} 
            textColor="#4891FF"
            labelStyle={styles.buttonLabel}
          >
            {confirmText}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}

const styles = createStyles({
  dialog: {
    backgroundColor: "#fff",
    borderRadius: 12,
    zIndex: 9999, // 确保在其他组件之上
    elevation: 24, // Android 阴影层级
  },
  title: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#333",
    lineHeight: 22,
    paddingBottom: 8,
  },
  content: {
    paddingVertical: 8,
    paddingHorizontal: 24,
    minHeight: 0,
  },
  message: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },
  actions: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 0,
  },
  buttonLabel: {
    fontSize: 14,
    lineHeight: 22,
    marginVertical: 0,
  },
})



