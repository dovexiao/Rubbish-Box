import { useToastStore } from "../stores/toastStore"

/**
 * Toast 工具函数
 * 提供便捷的 API 来显示各种类型的提示
 */

/**
 * 显示成功提示
 */
export const showSuccess = (message: string, duration?: number) => {
  useToastStore.getState().showToast("success", message, duration)
}

/**
 * 显示错误提示
 */
export const showError = (message: string, duration?: number) => {
  if (typeof message !== "string") {
    message = JSON.stringify(message)
  }
  useToastStore.getState().showToast("error", message, duration)
}

/**
 * 显示警告提示
 */
export const showWarning = (message: string, duration?: number) => {
  useToastStore.getState().showToast("warning", message, duration)
}

/**
 * 显示信息提示
 */
export const showInfo = (message: string, duration?: number) => {
  useToastStore.getState().showToast("info", message, duration)
}

/**
 * 通用显示方法
 */
export const showToast = (
  type: "success" | "error" | "warning" | "info",
  message: string,
  duration?: number,
) => {
  useToastStore.getState().showToast(type, message, duration)
}

/**
 * 隐藏 Toast
 */
export const hideToast = () => {
  useToastStore.getState().hideToast()
}



