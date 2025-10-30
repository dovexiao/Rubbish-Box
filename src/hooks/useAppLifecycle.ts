/*
 * @Author: zdb zhiubo_1@163.com
 * @Date: 2025-10-14 10:53:52
 * @LastEditors: zdb zhiubo_1@163.com
 * @LastEditTime: 2025-10-14 14:10:03
 * @FilePath: /xhtx/src/hooks/useAppLifecycle.ts
 * @Description:
 */
import { useEffect, useRef } from "react"
import { AppState, AppStateStatus } from "react-native"

interface AppLifecycleCallbacks {
  onAppLaunch?: () => void | Promise<void>
  onAppShow?: () => void | Promise<void>
  onAppHide?: () => void | Promise<void>
  onAppExit?: () => void | Promise<void>
}

/**
 * 应用生命周期管理Hook
 * 迁移自UniApp App.vue的生命周期逻辑
 */
export const useAppLifecycle = (callbacks: AppLifecycleCallbacks) => {
  const appState = useRef(AppState.currentState)
  const isFirstLaunch = useRef(true)
  const callbacksRef = useRef(callbacks)

  // 更新 callbacks ref
  useEffect(() => {
    callbacksRef.current = callbacks
  }, [callbacks])

  useEffect(() => {
    // 应用首次启动时调用onAppLaunch
    if (isFirstLaunch.current && callbacksRef.current.onAppLaunch) {
      console.log("App Launch - 应用启动")
      callbacksRef.current.onAppLaunch()
      isFirstLaunch.current = false
    }

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      console.log("App状态变化:", appState.current, "->", nextAppState)

      if (appState.current.match(/inactive|background/) && nextAppState === "active") {
        // 应用从后台进入前台
        console.log("应用进入前台")
        if (callbacksRef.current.onAppShow) {
          callbacksRef.current.onAppShow()
        }
      } else if (appState.current === "active" && nextAppState.match(/inactive|background/)) {
        // 应用从前台进入后台
        console.log("应用进入后台")
        if (callbacksRef.current.onAppHide) {
          callbacksRef.current.onAppHide()
        }
      }

      appState.current = nextAppState
    }

    // 监听应用状态变化
    const subscription = AppState.addEventListener("change", handleAppStateChange)

    // 清理函数 - 只在组件卸载时调用
    return () => {
      console.log("应用生命周期清理")
      if (callbacksRef.current.onAppExit) {
        callbacksRef.current.onAppExit()
      }
      subscription?.remove()
    }
  }, [])

  return {
    currentAppState: appState.current,
    isFirstLaunch: isFirstLaunch.current,
  }
}
