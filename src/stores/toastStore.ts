import { create } from "zustand"
import { ToastType } from "../components/Toast"

interface ToastState {
  visible: boolean
  type: ToastType
  message: string
  duration: number
  showToast: (type: ToastType, message: string, duration?: number) => void
  hideToast: () => void
}

/**
 * Toast 状态管理
 */
export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  type: "info",
  message: "",
  duration: 3000,

  showToast: (type: ToastType, message: string, duration = 3000) => {
    set({
      visible: true,
      type,
      message,
      duration,
    })
  },

  hideToast: () => {
    set({ visible: false })
  },
}))



