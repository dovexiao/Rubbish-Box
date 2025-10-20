import { useEffect, useRef, useCallback } from "react"
import { UpdateManager } from "../services/updateManager"

/**
 * 应用更新管理Hook
 * 100%还原UniApp App.vue中的更新管理逻辑
 */
export const useUpdateManager = () => {
  const updateManagerRef = useRef<UpdateManager | null>(null)
  const didInitUpdate = useRef(false)

  // 初始化更新管理器
  const initUpdateManager = useCallback(async () => {
    try {
      console.log("开始初始化更新管理器")

      const updateManager = new UpdateManager()
      await updateManager.initialize()

      updateManagerRef.current = updateManager
      console.log("更新管理器初始化完成")

      // 延迟3秒后进行首次更新检测（避免影响启动速度）
      setTimeout(() => {
        performInitialUpdateCheck()
      }, 3000)
    } catch (error) {
      console.error("更新管理器初始化失败:", error)
    }
  }, [])

  // 执行初始更新检测
  const performInitialUpdateCheck = useCallback(async () => {
    try {
      const updateManager = updateManagerRef.current
      if (!updateManager) return

      console.log("执行初始更新检测")

      // 静默检测更新
      await updateManager.checkForUpdates({
        silent: true,
        source: "launch",
      })
    } catch (error) {
      console.error("初始更新检测失败:", error)
    }
  }, [])

  // 应用进入前台时检查更新
  const checkForUpdatesOnShow = useCallback(async () => {
    try {
      const updateManager = updateManagerRef.current
      if (!updateManager) return

      console.log("应用进入前台，检查更新")
      await updateManager.checkForUpdatesOnShow()
    } catch (error) {
      console.error("前台更新检测失败:", error)
    }
  }, [])

  // 手动检查更新
  const manualCheckForUpdates = useCallback(async () => {
    try {
      const updateManager = updateManagerRef.current
      if (!updateManager) {
        console.log("更新管理器未初始化")
        return
      }

      console.log("手动检查更新")
      await updateManager.manualCheckForUpdates()
    } catch (error) {
      console.error("手动更新检测失败:", error)
    }
  }, [])

  // 应用启动时初始化（仅一次）
  useEffect(() => {
    if (!didInitUpdate.current) {
      // 冷启动后延迟初始化更新管理器（仅一次）
      setTimeout(() => {
        initUpdateManager()
      }, 1200)

      didInitUpdate.current = true
    }
  }, [initUpdateManager])

  return {
    initUpdateManager,
    checkForUpdatesOnShow,
    manualCheckForUpdates,
    updateManager: updateManagerRef.current,
  }
}
