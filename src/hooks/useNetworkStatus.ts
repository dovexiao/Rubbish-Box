import { useEffect, useState, useCallback } from "react"
import NetInfo, { NetInfoState } from "@react-native-community/netinfo"
import { Alert, Platform, Linking } from "react-native"

interface NetworkDetails {
  strength?: number | null // WiFi信号强度 (0-100)
  cellularGeneration?: "2g" | "3g" | "4g" | "5g" | null // 蜂窝网络代数
  ssid?: string | null // WiFi名称
  frequency?: number | null // WiFi频率
}

interface NetworkStatusCallbacks {
  onNetworkConnected?: () => void | Promise<void>
  onNetworkDisconnected?: () => void | Promise<void>
  onNetworkChange?: (isConnected: boolean, networkType: string) => void | Promise<void>
}

/**
 * 网络状态监控Hook
 * 迁移自UniApp App.vue的网络监控逻辑
 * 
 * 支持检测：
 * 1. 网络连接状态（连接/断开）
 * 2. 网络类型（WiFi/蜂窝/无）
 * 3. 信号强度（WiFi: 0-100, 蜂窝: 2g/3g/4g/5g）
 */
export const useNetworkStatus = (callbacks?: NetworkStatusCallbacks) => {
  const [isConnected, setIsConnected] = useState<boolean>(true)
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(null)
  const [networkType, setNetworkType] = useState<string>("unknown")
  const [networkDetails, setNetworkDetails] = useState<NetworkDetails>({})
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

  // 获取网络详细信息
  const getNetworkDetails = useCallback((state: NetInfoState): NetworkDetails => {
    const details: NetworkDetails = {}
    
    if (state.type === "wifi" && state.details) {
      // WiFi 信号强度（0-100）
      details.strength = (state.details as any).strength ?? null
      details.ssid = (state.details as any).ssid ?? null
      details.frequency = (state.details as any).frequency ?? null
    } else if (state.type === "cellular" && state.details) {
      // 蜂窝网络代数
      details.cellularGeneration = (state.details as any).cellularGeneration ?? null
    }
    
    return details
  }, [])

  // 检查网络连接状态
  const checkNetworkConnection = useCallback(() => {
    NetInfo.fetch().then((state: NetInfoState) => {
      console.log("📡 网络状态检测:")
      console.log("  - 网络类型:", state.type)
      console.log("  - 已连接:", state.isConnected)
      console.log("  - 互联网可达:", state.isInternetReachable)
      
      // 判断网络状态
      if (state.isConnected && state.isInternetReachable === true) {
        console.log("  - ✅ 网络正常：已连接且可访问互联网")
      } else if (state.isConnected && state.isInternetReachable === null) {
        console.log("  - 🔍 检测中：正在验证互联网可达性...")
      } else {
        console.log("  - ❌ 未连接网络")
      }
      
      // 获取详细信息
      const details = getNetworkDetails(state)
      if (details.strength !== undefined && details.strength !== null) {
        console.log("  - WiFi信号强度:", `${details.strength}%`)
      }
      if (details.cellularGeneration) {
        console.log("  - 蜂窝网络代数:", details.cellularGeneration.toUpperCase())
      }

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
  }, [openSystemWifiSettings, getNetworkDetails])
  // 处理网络状态变化
  const handleNetworkChange = useCallback(
    (state: NetInfoState) => {
      const connected = state.isConnected ?? false
      const internetReachable = state.isInternetReachable ?? null
      const type = state.type || "unknown"
      const details = getNetworkDetails(state)

      // 检测状态变化
      const connectionChanged = connected !== isConnected
      const internetReachableChanged = internetReachable !== isInternetReachable
      const typeChanged = type !== networkType

      if (connectionChanged || typeChanged || internetReachableChanged) {
        console.log("📡 网络状态变化:", {
          连接状态: connected,
          互联网可达: internetReachable,
          网络类型: type,
          信号详情: details,
        })
        
        // 详细状态说明
        if (connected && internetReachable === true) {
          console.log("  🟢 状态: 网络正常")
        } else if (connected && internetReachable === null) {
          console.log("  🟡 状态: 检测中...")
        } else {
          console.log("  ⚫ 状态: 未连接")
        }
      }

      // 只有在初始化后才触发回调，避免首次加载时的误触发
      if (isInitialized) {

        if (!isConnected && connected) {
          // 网络从断开到连接
          console.log("✅ 网络已连接")
          callbacks?.onNetworkConnected?.()
        } else if (isConnected && !connected) {
          // 网络从连接到断开
          console.log("❌ 网络已断开")
          callbacks?.onNetworkDisconnected?.()
          // 网络断开时，检查并提示用户
          checkNetworkConnection()
        }

        // 只有在连接状态或类型发生变化时才触发回调
        if (connectionChanged || typeChanged) {
          callbacks?.onNetworkChange?.(connected, type)
        }
      }

      // 更新所有状态（只在实际变化时更新，避免不必要的 re-render）
      if (connectionChanged) {
        setIsConnected(connected)
      }

      if (internetReachableChanged) {
        setIsInternetReachable(internetReachable)
      }

      if (typeChanged) {
        setNetworkType(type)
      }

      // 信号详情变化时才更新（避免频繁更新相同的对象）
      const detailsChanged = 
        JSON.stringify(details) !== JSON.stringify(networkDetails)
      
      if (detailsChanged) {
        setNetworkDetails(details)
      }

      if (!isInitialized) {
        setIsInitialized(true)
      }
    },
    [isConnected, isInternetReachable, networkType, networkDetails, isInitialized, callbacks, checkNetworkConnection, getNetworkDetails],
  )

  useEffect(() => {
    console.log("开始监听网络状态")

    // 配置 NetInfo 的可达性检测
    // NetInfo 会在网络变化时自动检测，无需手动轮询
    // 注释原因：频繁的网络可达性检测会产生大量并发请求，导致服务器数据库连接池耗尽
    // NetInfo.configure({
    //   reachabilityUrl: "https://www.baidu.com",
    //   reachabilityTest: async (response) => {
    //     const isReachable = response.status === 200 // 百度返回200，Google返回204
    //     console.log("🌐 互联网可达性检测:", {
    //       url: "https://www.baidu.com",
    //       status: response.status,
    //       可达: isReachable,
    //       响应时间: new Date().toLocaleTimeString(),
    //     })
    //     return isReachable
    //   },
    //   reachabilityLongTimeout: 60 * 1000, // 15秒 - 网络稳定时的检测间隔
    //   reachabilityShortTimeout: 30 * 1000, // 5秒 - 网络不稳定时的检测间隔
    //   reachabilityRequestTimeout: 10 * 1000, // 10秒 - 单次请求超时
    //   shouldFetchWiFiSSID: true, // Android: 需要位置权限
    //   reachabilityShouldRun: () => true, // 始终检测互联网可达性
    //   useNativeReachability: false, // 使用 HTTP 检测而非系统 API
    // })

    // 获取初始网络状态
    console.log("🔍 获取初始网络状态...")
    NetInfo.fetch().then(handleNetworkChange)

    // 监听网络状态变化 - NetInfo 会在以下情况自动触发：
    // 1. WiFi 连接/断开
    // 2. 移动网络连接/断开
    // 3. 定期的可达性检测（根据 reachabilityTimeout 配置）
    console.log("👂 开始监听网络状态变化（自动触发，无需轮询）")
    const unsubscribe = NetInfo.addEventListener(handleNetworkChange)

    return () => {
      console.log("🛑 停止监听网络状态")
      unsubscribe()
    }
  }, [handleNetworkChange])

  return {
    isConnected,
    isInternetReachable,
    networkType,
    networkDetails,
    checkNetworkConnection,
    openSystemWifiSettings,
  }
}
