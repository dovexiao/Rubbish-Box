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
      let updateManager = updateManagerRef.current

      // 如果更新管理器还没有初始化，先初始化它
      if (!updateManager) {
        console.log("更新管理器未初始化，正在初始化...")
        updateManager = new UpdateManager()
        await updateManager.initialize()
        updateManagerRef.current = updateManager
        console.log("✅ 更新管理器初始化完成")
      }

      console.log("应用进入前台，检查更新")
      await updateManager.checkForUpdatesOnShow()
    } catch (error) {
      console.error("前台更新检测失败:", error)
    }
  }, [])

  // 手动检查更新
  const manualCheckForUpdates = useCallback(async () => {
    try {
      let updateManager = updateManagerRef.current

      // 如果更新管理器还没有初始化，先初始化它
      if (!updateManager) {
        console.log("更新管理器未初始化，正在初始化...")
        updateManager = new UpdateManager()
        await updateManager.initialize()
        updateManagerRef.current = updateManager
        console.log("✅ 更新管理器初始化完成")
      }

      console.log("手动检查更新")
      await updateManager.manualCheckForUpdates()
    } catch (error) {
      console.error("手动更新检测失败:", error)
    }
  }, [])

  // 🔴 检查整包更新：如果没有整包更新返回true，有整包更新显示弹窗并返回false
  const checkBundleUpdateOnly = useCallback(async (): Promise<boolean> => {
    try {
      let updateManager = updateManagerRef.current

      // 如果更新管理器还没有初始化，先初始化它
      if (!updateManager) {
        console.log("更新管理器未初始化，正在初始化...")
        updateManager = new UpdateManager()
        await updateManager.initialize()
        updateManagerRef.current = updateManager
        console.log("✅ 更新管理器初始化完成")
      }

      console.log("开始检查整包更新")
      // 调用UpdateManager的新方法
      const hasBundleUpdate = await updateManager.checkBundleUpdateWithDialog()
      return hasBundleUpdate

    } catch (error) {
      console.error("整包更新检查失败:", error)
      // 检查失败时假设没有更新，继续流程
      return true
    }
  }, [])

  // 🔴 移除自动初始化，由外部performAppInitialization控制
  // 应用启动时不再自动检查更新，避免在网络检查前执行
  // useEffect(() => {
  //   if (!didInitUpdate.current) {
  //     // 冷启动后延迟初始化更新管理器（仅一次）
  //     setTimeout(() => {
  //       initUpdateManager()
  //     }, 1200)
  //
  //     didInitUpdate.current = true
  //   }
  // }, [initUpdateManager])

  return {
    initUpdateManager,
    checkForUpdatesOnShow,
    manualCheckForUpdates,
    checkBundleUpdateOnly, // 🔴 新增：只检查整包更新的方法
    updateManager: updateManagerRef.current,
  }
}
