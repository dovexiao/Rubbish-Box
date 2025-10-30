import { Portal, Dialog, Button, Text } from "react-native-paper"
import { createStyles } from "../utils/rpxStyleSheet"

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
      <Dialog visible={visible} onDismiss={handleCancel} style={styles.dialog}>
        <Dialog.Title style={styles.title}>{title}</Dialog.Title>
        <Dialog.Content>
          <Text style={styles.message}>{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          {onCancel && (
            <Button onPress={handleCancel} textColor="#666">
              {cancelText}
            </Button>
          )}
          <Button onPress={handleConfirm} textColor="#4891FF">
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
  },
  title: {
    fontSize: 16,
    fontWeight: "bold" as const,
    color: "#333",
  },
  message: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
})



