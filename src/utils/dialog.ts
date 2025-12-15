import { useDialogStore } from "../stores/dialogStore"

/**
 * Dialog 工具函数
 * 提供类似 Alert.alert 的 API
 */

/**
 * 显示确认对话框
 * @example
 * showConfirm("提示", "确认删除吗？", () => { console.log("确认") })
 */
export const showConfirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
) => {
  useDialogStore.getState().showDialog(title, message, [
    {
      text: "取消",
      style: "cancel",
      onPress: onCancel,
    },
    {
      text: "确定",
      onPress: onConfirm,
    },
  ])
}

/**
 * 显示警告对话框（带取消和确定按钮）
 */
export const showAlert = (
  title: string,
  message: string,
  buttons?: Array<{
    text: string
    onPress?: () => void
    style?: "default" | "cancel" | "destructive"
  }>,
) => {
  useDialogStore.getState().showDialog(
    title,
    message,
    buttons || [{ text: "确定" }],
  )
}

/**
 * 显示简单提示（只有确定按钮）
 */
export const showMessage = (title: string, message: string, onPress?: () => void) => {
  useDialogStore.getState().showDialog(title, message, [
    {
      text: "确定",
      onPress,
    },
  ])
}

/**
 * 显示危险操作确认（确定按钮为红色）
 */
export const showDanger = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
) => {
  useDialogStore.getState().showDialog(title, message, [
    {
      text: "取消",
      style: "cancel",
      onPress: onCancel,
    },
    {
      text: "确定",
      style: "destructive",
      onPress: onConfirm,
    },
  ])
}

/**
 * 隐藏对话框
 */
export const hideDialog = () => {
  useDialogStore.getState().hideDialog()
}



