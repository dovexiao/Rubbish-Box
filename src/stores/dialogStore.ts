import { create } from "zustand"

interface DialogButton {
  text: string
  onPress?: () => void
  style?: "default" | "cancel" | "destructive"
}

interface DialogState {
  visible: boolean
  title: string
  message: string
  buttons: DialogButton[]
  showDialog: (title: string, message: string, buttons?: DialogButton[]) => void
  hideDialog: () => void
}

/**
 * Dialog 状态管理
 * 全局对话框状态
 */
export const useDialogStore = create<DialogState>((set) => ({
  visible: false,
  title: "",
  message: "",
  buttons: [],

  showDialog: (title: string, message: string, buttons = [{ text: "确定" }]) => {
    set({
      visible: true,
      title,
      message,
      buttons,
    })
  },

  hideDialog: () => {
    set({ visible: false })
  },
}))



