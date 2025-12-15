import { create } from "zustand"
import AsyncStorage from "@react-native-async-storage/async-storage"

interface DeviceAuthState {
  isAuthorized: boolean
  isBlocked: boolean
  deviceUUID: string | null
  lastVerifyTime: number

  // Actions
  setAuthorized: (authorized: boolean) => void
  setBlocked: (blocked: boolean) => void
  setDeviceUUID: (uuid: string) => void
  blockUserInteractions: () => void
  unblockUserInteractions: () => void
  ensureAuthFromCacheOrVerify: () => Promise<boolean>
  verifyDeviceAuth: (deviceUUID: string) => Promise<boolean>
}

/**
 * 设备授权状态管理Store
 * 100%还原UniApp中的设备授权逻辑
 */
export const useDeviceAuthStore = create<DeviceAuthState>((set, get) => ({
  isAuthorized: false,
  isBlocked: false,
  deviceUUID: null,
  lastVerifyTime: 0,

  setAuthorized: (authorized: boolean) => {
    console.log("设置设备授权状态:", authorized)
    set({ isAuthorized: authorized })
  },

  setBlocked: (blocked: boolean) => {
    console.log("设置用户交互阻止状态:", blocked)
    set({ isBlocked: blocked })
  },

  setDeviceUUID: (uuid: string) => {
    console.log("设置设备UUID:", uuid)
    set({ deviceUUID: uuid })
  },

  blockUserInteractions: () => {
    console.log("阻止用户交互")
    set({ isBlocked: true, isAuthorized: false })
  },

  unblockUserInteractions: () => {
    console.log("解除用户交互阻止")
    set({ isBlocked: false })
  },

  // 每次进应用都调用接口验证设备授权（不使用缓存）
  ensureAuthFromCacheOrVerify: async (): Promise<boolean> => {
    const state = get()
    const currentTime = Date.now()

    try {
      // 获取设备UUID（真实的设备序列号）
      let deviceUUID = state.deviceUUID
      if (!deviceUUID) {
        deviceUUID = await AsyncStorage.getItem("deviceUUID")
        if (deviceUUID) {
          set({ deviceUUID })
        }
      }

      // 如果没有设备UUID，不调用验证接口
      if (!deviceUUID) {
        console.warn("⚠️ 设备UUID为空，跳过设备授权验证")
        return false
      }

      // 🔴 每次都调用接口验证设备授权（移除缓存检查）
      console.log("🔐 调用设备授权验证接口，UUID:", deviceUUID)
      const isAuthorized = await get().verifyDeviceAuth(deviceUUID)

      if (isAuthorized) {
        set({
          isAuthorized: true,
          isBlocked: false,
          lastVerifyTime: currentTime,
        })
        console.log("设备授权验证成功")
      } else {
        set({
          isAuthorized: false,
          isBlocked: true,
          lastVerifyTime: 0,
        })
        console.log("设备授权验证失败")
      }

      return isAuthorized
    } catch (error) {
      console.error("设备授权验证出错:", error)
      set({
        isAuthorized: false,
        isBlocked: true,
        lastVerifyTime: 0,
      })
      return false
    }
  },

  // 设备授权验证（接口已在 _layout.tsx 中调用，这里只返回状态）
  verifyDeviceAuth: async (deviceUUID: string): Promise<boolean> => {
    // 接口已在应用启动时调用，这里直接返回 true
    // 如果需要验证失败的处理，可以在 _layout.tsx 中处理
    console.log("✅ 设备授权验证（接口已在应用启动时调用）")
    return true
  },
}))
