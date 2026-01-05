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
  verifyDeviceAuth: (deviceUUID: string) => Promise<boolean | null>
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
      const authResult = await get().verifyDeviceAuth(deviceUUID)

      // 只有明确返回 false (exists === false) 时才阻止用户操作
      if (authResult === false) {
        set({
          isAuthorized: false,
          isBlocked: true,
          lastVerifyTime: 0,
        })
        console.log("设备授权验证失败，阻止用户操作")
        return false
      } else if (authResult === true) {
        set({
          isAuthorized: true,
          isBlocked: false,
          lastVerifyTime: currentTime,
        })
        console.log("设备授权验证成功")
        return true
      } else {
        // authResult === null，接口报错，不阻止用户操作
        console.log("⚠️ 设备授权验证接口调用失败，不阻止用户操作")
        set({
          isAuthorized: false,
          isBlocked: false,
          lastVerifyTime: 0,
        })
        return false
      }
    } catch (error) {
      console.error("设备授权验证出错:", error)
      // 异常情况也不阻止用户操作，只有明确 exists === false 时才阻止
      set({
        isAuthorized: false,
        isBlocked: false,
        lastVerifyTime: 0,
      })
      return false
    }
  },

  // 设备授权验证接口调用
  verifyDeviceAuth: async (deviceUUID: string): Promise<boolean | null> => {
    try {
      const { post } = require("../services/api")
      console.log("🔐 调用设备授权验证接口，UUID:", deviceUUID)
      
      const response = await post("/AppStart/verify-device-code/", {
        device_code: deviceUUID,
      })
      
      console.log("📡 设备授权接口响应:", response)
      
      // 根据接口响应处理授权状态
      if (response && typeof response === 'object' && 'exists' in response) {
        if (response.exists === false) {
          console.log("❌ 设备未授权 (exists: false)")
          return false
        } else {
          console.log("✅ 设备已授权 (exists: true)")
          return true
        }
      }
      
      // 如果响应格式不符合预期，默认返回 true（向后兼容）
      console.log("⚠️ 设备授权接口响应格式不符合预期，默认返回已授权")
      return true
    } catch (error) {
      console.error("❌ 设备授权验证接口调用失败:", error)
      // 接口调用失败时返回 null，表示未知状态，不阻止用户操作
      return null
    }
  },
}))
