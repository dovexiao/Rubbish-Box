import { create } from "zustand"
import DeviceInfo from "react-native-device-info"
import { useEffect } from "react"
import { devError, devLog } from "@/services/WebSocketManager"

interface BatteryStore {
    batteryLevel: number | null // 电池电量 (0-1)
    isCharging: boolean | null // 是否正在充电
    isInitialized: boolean // 是否已初始化
    lastUpdatedAt: number | null // 最后更新时间

    // Actions
    updateBatteryState: (level: number | null, charging: boolean | null) => void
    updateChargingState: (charging: boolean | null) => void
    initialize: () => void
}

// 全局单例 - 确保整个应用只有一个电池监听实例
let isBatteryMonitorInitialized = false
let batteryUpdateInterval: ReturnType<typeof setInterval> | null = null
let chargingUpdateInterval: ReturnType<typeof setInterval> | null = null

export const useBatteryStore = create<BatteryStore>((set, get) => ({
    batteryLevel: null,
    isCharging: null,
    isInitialized: false,
    lastUpdatedAt: null,

    updateBatteryState: (level, charging) => {
        const currentState = get()
        const levelChanged = level !== currentState.batteryLevel
        const chargingChanged = charging !== currentState.isCharging

        if (levelChanged || chargingChanged) {
            devLog("🔋 电池状态变化:", {
                电量: level !== null ? `${Math.round(level * 100)}%` : "未知",
                充电中: charging,
            })
        }

        set({
            batteryLevel: level,
            isCharging: charging,
            isInitialized: true,
            lastUpdatedAt: Date.now(),
        })
    },

    updateChargingState: (charging) => {
        const currentState = get()
        const chargingChanged = charging !== currentState.isCharging

        if (chargingChanged) {
            devLog("🔋 充电状态变化:", {
                充电中: charging,
            })
        }

        set({
            isCharging: charging,
            isInitialized: true,
            lastUpdatedAt: Date.now(),
        })
    },

    initialize: () => {
        // 防止重复初始化
        if (isBatteryMonitorInitialized) {
            devLog("⚠️ 电池监听已初始化，跳过重复初始化")
            return
        }

        console.log("🔋 初始化电池监听（全局单例）")
        isBatteryMonitorInitialized = true

        // 获取初始电池状态
        const fetchBatteryState = async () => {
            try {
                const [level, charging] = await Promise.all([
                    DeviceInfo.getBatteryLevel(),
                    DeviceInfo.isBatteryCharging(),
                ])
                devLog("🔋 获取电池状态:", {
                    电量: level,
                    充电中: charging,
                })
                get().updateBatteryState(level, charging)
            } catch (error) {
                devError("🔋 获取电池状态失败:", error)
                get().updateBatteryState(null, null)
            }
        }

        // 立即获取一次
        fetchBatteryState()

        // 定期更新电池状态（每30秒更新一次，同时更新电量和充电状态）
        batteryUpdateInterval = setInterval(() => {
            devLog("🔋 定期更新电池状态（每30秒更新一次）")
            fetchBatteryState()
        }, 30 * 1000)

        // 快速更新充电状态（每5秒更新一次，只更新充电状态）
        const fetchChargingState = async () => {
            try {
                const charging = await DeviceInfo.isBatteryCharging()
                devLog("🔋 快速更新充电状态:", {
                    充电中: charging,
                })
                get().updateChargingState(charging)
            } catch (error) {
                devError("🔋 获取充电状态失败:", error)
                get().updateChargingState(null)
            }
        }

        chargingUpdateInterval = setInterval(() => {
            fetchChargingState()
        }, 10 * 1000) // 每5秒更新一次充电状态
    },
}))

/**
 * 电池监听初始化 Hook
 * 在应用根组件调用一次即可
 */
export const useBatteryMonitor = () => {
    const initialize = useBatteryStore((state) => state.initialize)

    useEffect(() => {
        initialize()

        // 清理函数
        return () => {
            if (batteryUpdateInterval) {
                console.log("🛑 停止电池状态监听")
                clearInterval(batteryUpdateInterval)
                batteryUpdateInterval = null
            }
            if (chargingUpdateInterval) {
                console.log("🛑 停止充电状态监听")
                clearInterval(chargingUpdateInterval)
                chargingUpdateInterval = null
            }
            isBatteryMonitorInitialized = false
        }
    }, [initialize])
}

/**
 * 获取电池状态 Hook
 * 在任意组件中调用，共享同一个电池状态
 */
export const useBattery = () => {
    const batteryLevel = useBatteryStore((state) => state.batteryLevel)
    const isCharging = useBatteryStore((state) => state.isCharging)
    const isInitialized = useBatteryStore((state) => state.isInitialized)

    return {
        batteryLevel,
        isCharging,
        isInitialized,
    }
}

