import { create } from "zustand"
import NetInfo, { NetInfoState } from "@react-native-community/netinfo"
import { useEffect } from "react"

interface NetworkDetails {
  strength?: number | null // WiFi信号强度 (0-100)
  cellularGeneration?: "2g" | "3g" | "4g" | "5g" | null // 蜂窝网络代数
  ssid?: string | null // WiFi名称
  frequency?: number | null // WiFi频率
}

interface NetworkStore {
  isConnected: boolean
  isInternetReachable: boolean | null
  networkType: string
  networkDetails: NetworkDetails
  isInitialized: boolean
  showNetworkModal: boolean // 网络弹窗显示状态
  
  // Actions
  updateNetworkState: (state: NetInfoState) => void
  initialize: () => void
  setShowNetworkModal: (show: boolean) => void
  refreshNetworkInfo: () => Promise<void>
}

// 全局单例 - 确保整个应用只有一个网络监听实例
let isNetInfoConfigured = false
let netInfoUnsubscribe: (() => void) | null = null

// 额外网络可达性检测函数
const performExtraReachabilityCheck = async (): Promise<boolean> => {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5秒超时

    const response = await fetch('https://xiaohetx.cn/AppStart/', {
      method: 'HEAD', // 只获取头部信息，减少数据传输
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    const isReachable = response.status === 200

    console.log("🌐 额外HTTP检测:", {
      url: "https://xiaohetx.cn/AppStart/",
      status: response.status,
      可达: isReachable,
      响应时间: new Date().toLocaleTimeString(),
    })

    return isReachable
  } catch (error) {
    console.log("❌ 额外HTTP检测失败:", error)
    return false
  }
}

export const useNetworkStore = create<NetworkStore>((set, get) => ({
  isConnected: true,
  isInternetReachable: null,
  networkType: "unknown",
  networkDetails: {},
  isInitialized: false,
  showNetworkModal: false,

  updateNetworkState: (state: NetInfoState) => {
    const connected = state.isConnected ?? false
    let internetReachable = state.isInternetReachable ?? null
    const type = state.type || "unknown"

    // 获取网络详细信息
    const details: NetworkDetails = {}
    if (state.type === "wifi" && state.details) {
      details.strength = (state.details as any).strength ?? null
      details.ssid = (state.details as any).ssid ?? null
      details.frequency = (state.details as any).frequency ?? null
    } else if (state.type === "cellular" && state.details) {
      details.cellularGeneration = (state.details as any).cellularGeneration ?? null
    }

    // 当系统检测返回 false 时，进行额外 HTTP 检测
    if (connected && internetReachable === false) {
      console.log("⚠️ 系统检测到网络不可达，执行额外 HTTP 检测...")
      // 异步执行额外检测，不阻塞主流程
      performExtraReachabilityCheck().then((extraResult) => {
        if (extraResult !== internetReachable) {
          console.log(`🔄 HTTP检测结果: ${extraResult} (系统检测: ${internetReachable})`)
          // 如果HTTP检测结果不同，直接更新状态
          set({
            isInternetReachable: extraResult,
          })
        }
      }).catch((error) => {
        console.log("❌ 额外HTTP检测失败:", error)
      })
    }

    // 检测状态变化
    const currentState = get()
    const connectionChanged = connected !== currentState.isConnected
    const internetReachableChanged = internetReachable !== currentState.isInternetReachable
    const typeChanged = type !== currentState.networkType

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

    // 更新状态
    set({
      isConnected: connected,
      isInternetReachable: internetReachable,
      networkType: type,
      networkDetails: details,
      isInitialized: true,
    })
  },

  initialize: () => {
    // 防止重复初始化
    if (isNetInfoConfigured) {
      console.log("⚠️ NetInfo 已配置，跳过重复初始化")
      return
    }

    console.log("🌐 初始化网络监听（全局单例）")
    isNetInfoConfigured = true

    // 配置 NetInfo 的可达性检测（全局只配置一次）
    NetInfo.configure({
      shouldFetchWiFiSSID: true,
      useNativeReachability: true,
    })

    // 获取初始网络状态
    console.log("🔍 获取初始网络状态...")
    NetInfo.fetch().then(get().updateNetworkState)

    // 监听网络状态变化（全局只监听一次）
    console.log("👂 开始监听网络状态变化（全局单例）")
    netInfoUnsubscribe = NetInfo.addEventListener(get().updateNetworkState)
  },

  setShowNetworkModal: (show: boolean) => {
    set({ showNetworkModal: show })
  },

  refreshNetworkInfo: async () => {
    console.log("🔄 强制刷新网络信息")
    try {
      const networkState = await NetInfo.fetch()
      get().updateNetworkState(networkState)
      console.log("✅ 网络信息刷新完成")
    } catch (error) {
      console.error("❌ 刷新网络信息失败:", error)
    }
  },
}))

/**
 * 网络监听初始化 Hook
 * 在应用根组件调用一次即可
 */
export const useNetworkMonitor = () => {
  const initialize = useNetworkStore((state) => state.initialize)

  useEffect(() => {
    initialize()

    // 清理函数
    return () => {
      if (netInfoUnsubscribe) {
        console.log("🛑 停止监听网络状态")
        netInfoUnsubscribe()
        netInfoUnsubscribe = null
        isNetInfoConfigured = false
      }
    }
  }, [initialize])
}

/**
 * 获取网络状态 Hook
 * 在任意组件中调用，共享同一个网络状态
 * 按照 Zustand 官方文档建议，不使用 shallow 比较
 * 
 * 使用方法（按照官方文档）：
 * const isConnected = useNetworkStore((state) => state.isConnected)
 * const networkType = useNetworkStore((state) => state.networkType)
 */
export const useNetwork = () => {
  // 每个状态使用单独的 selector（官方推荐方式）
  const isConnected = useNetworkStore((state) => state.isConnected)
  const isInternetReachable = useNetworkStore((state) => state.isInternetReachable)
  const networkType = useNetworkStore((state) => state.networkType)
  const networkDetails = useNetworkStore((state) => state.networkDetails)
  const isInitialized = useNetworkStore((state) => state.isInitialized)
  
  return {
    isConnected,
    isInternetReachable,
    networkType,
    networkDetails,
    isInitialized,
  }
}

