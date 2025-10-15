import { useCallback } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useDeviceAuthStore } from "../stores/deviceAuthStore"

/**
 * 设备授权验证Hook
 * 100%还原UniApp App.vue中的设备授权逻辑
 */
export const useDeviceAuth = () => {
  const deviceAuthStore = useDeviceAuthStore()

  // 获取并缓存设备UUID（还原UniApp逻辑）
  const getAndCacheDeviceUUID = useCallback(async (): Promise<string> => {
    try {
      // 先尝试从缓存获取
      let deviceUUID = await AsyncStorage.getItem("deviceUUID")

      if (!deviceUUID) {
        // 生成新的UUID（简化版本，实际可能需要使用设备唯一标识）
        deviceUUID = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        await AsyncStorage.setItem("deviceUUID", deviceUUID)
        console.log("生成新的设备UUID:", deviceUUID)
      }

      return deviceUUID
    } catch (error) {
      console.error("获取设备UUID失败:", error)
      // 生成临时UUID
      return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }, [])

  // 网络恢复后触发一次设备授权复验（缓存优先）
  const reverifyDeviceAuthorization = useCallback(async () => {
    try {
      console.log("网络恢复后设备授权复验开始")
      const ok = await deviceAuthStore.ensureAuthFromCacheOrVerify()
      console.log("网络恢复后设备授权结果:", ok)
      return ok
    } catch (e) {
      console.error("网络恢复后设备授权复验出错:", e)
      return false
    }
  }, [deviceAuthStore])

  // 确保设备授权（优先使用缓存）
  const ensureDeviceAuth = useCallback(async (): Promise<boolean> => {
    try {
      console.log("开始设备授权验证")
      const isVerified = await deviceAuthStore.ensureAuthFromCacheOrVerify()

      if (!isVerified) {
        console.log("设备未授权，阻止用户交互")
        deviceAuthStore.blockUserInteractions()
        return false
      }

      console.log("设备授权验证通过")
      return true
    } catch (error) {
      console.error("设备授权验证失败:", error)
      return false
    }
  }, [deviceAuthStore])

  // 清除设备UUID（用于测试或重置）
  const clearDeviceUUID = useCallback(async () => {
    try {
      await AsyncStorage.removeItem("deviceUUID")
      console.log("设备UUID已清除")
    } catch (error) {
      console.error("清除设备UUID失败:", error)
    }
  }, [])

  return {
    getAndCacheDeviceUUID,
    reverifyDeviceAuthorization,
    ensureDeviceAuth,
    clearDeviceUUID,
    // 从store中暴露状态
    isAuthorized: deviceAuthStore.isAuthorized,
    isBlocked: deviceAuthStore.isBlocked,
  }
}
