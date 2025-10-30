import { Portal, Dialog, Button, Text } from "react-native-paper"
import { Dimensions } from "react-native"
import { useDialogStore } from "../stores/dialogStore"
import { createStyles } from "../utils/rpxStyleSheet"

const SCREEN_WIDTH = Dimensions.get("window").width

/**
 * 全局 Dialog 组件
 * 集成到应用的根布局中，全局显示对话框
 */
export function GlobalDialog() {
  const { visible, title, message, buttons, hideDialog } = useDialogStore()

  const handleButtonPress = (buttonIndex: number) => {
    const button = buttons[buttonIndex]
    hideDialog()
    button.onPress?.()
  }

  return (
    <Portal>
      <Dialog 
        visible={visible} 
        onDismiss={hideDialog} 
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
          {buttons.map((button, index) => (
            <Button
              key={index}
              onPress={() => handleButtonPress(index)}
              textColor={
                button.style === "destructive" ? "#FF4D4F" : 
                button.style === "cancel" ? "#666" : 
                "#4891FF"
              }
              labelStyle={styles.buttonLabel}
            >
              {button.text}
            </Button>
          ))}
        </Dialog.Actions>
      </Dialog>
    </Portal>
  )
}

const styles = createStyles({
  dialog: {
    backgroundColor: "#fff",
    borderRadius: 12,
    zIndex: 9999, // 确保在登录框之上
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