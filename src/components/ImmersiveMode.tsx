import { useEffect } from "react"

import { globalImmersive } from "../utils/globalImmersive"

interface ImmersiveModeProps {
  enabled?: boolean
}

/**
 * 全局沉浸式模式组件
 * 用于隐藏状态栏和三大金刚键
 */
export function ImmersiveWrapper({ enabled = true }: ImmersiveModeProps) {
  useEffect(() => {
    if (enabled) {
      // 启用全局沉浸式模式
      globalImmersive.enable()
    } else {
      // 禁用全局沉浸式模式
      globalImmersive.disable()
    }

    // 组件卸载时保持沉浸式模式
    return () => {
      console.log("ImmersiveWrapper卸载，保持沉浸式模式")
    }
  }, [enabled])

  // 这个组件不渲染任何内容，只处理沉浸式模式
  return null
}

export default ImmersiveWrapper