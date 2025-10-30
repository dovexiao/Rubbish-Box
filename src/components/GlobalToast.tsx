import { useEffect } from "react"
import { Toast, ToastType } from "./Toast"
import { useToastStore } from "../stores/toastStore"

/**
 * 全局 Toast 组件
 * 集成到应用的根布局中，全局显示提示
 */
export function GlobalToast() {
  const { visible, type, message, duration, hideToast } = useToastStore()

  return (
    <Toast visible={visible} type={type} message={message} duration={duration} onClose={hideToast} />
  )
}



