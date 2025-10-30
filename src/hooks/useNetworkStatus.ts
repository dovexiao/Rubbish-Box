import { useEffect, useState, useCallback } from "react"
import NetInfo, { NetInfoState } from "@react-native-community/netinfo"
import { Alert, Platform, Linking } from "react-native"

interface NetworkStatusCallbacks {
  onNetworkConnected?: () => void | Promise<void>
  onNetworkDisconnected?: () => void | Promise<void>
  onNetworkChange?: (isConnected: boolean, networkType: string) => void | Promise<void>
}

/**
 * 网络状态监控Hook
 * 迁移自UniApp App.vue的网络监控逻辑
 */
export const useNetworkStatus = (callbacks?: NetworkStatusCallbacks) => {
  const [isConnected, setIsConnected] = useState<boolean>(true)
  const [networkType, setNetworkType] = useState<string>("unknown")
  const [isInitialized, setIsInitialized] = useState<boolean>(false)

  // 打开系统WiFi设置
  const openSystemWifiSettings = useCallback(() => {
    if (Platform.OS === "android") {
      try {
        // 在React Native中，我们使用Linking来打开系统设置
        Linking.openSettings()
        console.log("已打开系统设置")
      } catch (error) {
        console.error("打开系统设置失败:", error)
        Alert.alert("提示", "无法打开系统设置")
      }
    } else if (Platform.OS === "ios") {
      // iOS可以打开WiFi设置页面
      Linking.openURL("App-Prefs:WIFI").catch(() => {
        // 如果无法打开WiFi设置，则打开通用设置
        Linking.openSettings()
      })
    }
  }, [])

  // 检查网络连接状态
  const checkNetworkConnection = useCallback(() => {
    NetInfo.fetch().then((state: NetInfoState) => {
      console.log("当前网络类型:", state.type)
      console.log("网络连接状态:", state.isConnected)

      // 注释掉这里的弹窗，统一使用 _layout.tsx 中的 GlobalDialog
      // 这样可以保证弹窗显示在登录框上方，并且样式更统一
      // if (!state.isConnected) {
      //   setTimeout(() => {
      //     Alert.alert("网络提示", "您未连接网络，是否去设置？", [
      //       { text: "取消", style: "cancel" },
      //       { text: "去设置", onPress: openSystemWifiSettings },
      //     ])
      //   }, 300)
      // }
    })
  }, [openSystemWifiSettings])
  // 处理网络状态变化
  const handleNetworkChange = useCallback(
    (state: NetInfoState) => {
      const connected = state.isConnected ?? false
      const type = state.type || "unknown"

      // 只有在连接状态实际发生变化时才记录日志和更新状态
      const connectionChanged = connected !== isConnected
      const typeChanged = type !== networkType

      if (connectionChanged || typeChanged) {
        console.log("网络状态变化:", {
          isConnected: connected,
          networkType: type,
        })
      }

      // 只有在初始化后才触发回调，避免首次加载时的误触发
      if (isInitialized) {
        if (!isConnected && connected) {
          // 网络从断开到连接
          console.log("网络已连接")
          callbacks?.onNetworkConnected?.()
        } else if (isConnected && !connected) {
          // 网络从连接到断开
          console.log("网络已断开")
          callbacks?.onNetworkDisconnected?.()
          // 网络断开时，检查并提示用户
          checkNetworkConnection()
        }

        // 只有在连接状态或类型发生变化时才触发回调
        if (connectionChanged || typeChanged) {
          callbacks?.onNetworkChange?.(connected, type)
        }
      }

      // 只有在状态实际发生变化时才更新状态
      if (connectionChanged) {
        setIsConnected(connected)
      }

      if (typeChanged) {
        setNetworkType(type)
      }

      if (!isInitialized) {
        setIsInitialized(true)
      }
    },
    [isConnected, networkType, isInitialized, callbacks, checkNetworkConnection],
  )

  useEffect(() => {
    console.log("开始监听网络状态")

    // 获取初始网络状态
    NetInfo.fetch().then(handleNetworkChange)

    // 监听网络状态变化
    const unsubscribe = NetInfo.addEventListener(handleNetworkChange)

    return () => {
      console.log("停止监听网络状态")
      unsubscribe()
    }
  }, [handleNetworkChange])

  return {
    isConnected,
    networkType,
    checkNetworkConnection,
    openSystemWifiSettings,
  }
}
