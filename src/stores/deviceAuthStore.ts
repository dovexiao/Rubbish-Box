import { create } from "zustand"
import AsyncStorage from "@react-native-async-storage/async-storage"
import axios from "axios"
import { API_BASE_URL, API_TIMEOUT, DEFAULT_HEADERS } from "../config/api"

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

  // 优先使用缓存进行设备授权校验，命中则不调接口
  ensureAuthFromCacheOrVerify: async (): Promise<boolean> => {
    const state = get()
    const currentTime = Date.now()
    const cacheValidTime = 24 * 60 * 60 * 1000 // 24小时缓存有效期

    try {
      // 检查缓存是否有效
      if (
        state.isAuthorized &&
        state.lastVerifyTime > 0 &&
        currentTime - state.lastVerifyTime < cacheValidTime
      ) {
        console.log("使用缓存的设备授权状态")
        return true
      }

      // 获取设备UUID
      let deviceUUID = state.deviceUUID
      if (!deviceUUID) {
        deviceUUID = await AsyncStorage.getItem("deviceUUID")
        if (deviceUUID) {
          set({ deviceUUID })
        }
      }

      if (!deviceUUID) {
        console.log("设备UUID不存在，生成新的UUID")
        deviceUUID = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        await AsyncStorage.setItem("deviceUUID", deviceUUID)
        set({ deviceUUID })
      }

      // 调用接口验证设备授权
      console.log("开始验证设备授权，UUID:", deviceUUID)
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

  // 调用设备授权验证接口
  verifyDeviceAuth: async (deviceUUID: string): Promise<boolean> => {
    try {
      console.log("调用设备授权验证接口")

      // 创建一个独立的axios实例，避免循环依赖
      const authAxios = axios.create({
        baseURL: API_BASE_URL,
        timeout: API_TIMEOUT,
        headers: DEFAULT_HEADERS,
      })

      // 这里需要根据实际的设备授权接口来实现
      const response = await authAxios.post("/AppStart/device/verify/", {
        device_uuid: deviceUUID,
        platform: "react-native",
      })

      if (response.data && response.data.success) {
        console.log("设备授权接口调用成功")
        return true
      } else {
        console.log("设备授权接口返回失败:", response.data)
        return false
      }
    } catch (error) {
      console.error("设备授权接口调用失败:", error)

      // 网络错误时，如果之前有授权记录，可以临时允许
      const state = get()
      if (state.lastVerifyTime > 0) {
        console.log("网络错误，使用之前的授权状态")
        return state.isAuthorized
      }

      return false
    }
  },
}))
