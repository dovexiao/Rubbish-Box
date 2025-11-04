import { useCallback } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { useDeviceAuthStore } from "../stores/deviceAuthStore"
import DeviceInfo from "react-native-device-info"
import { Platform, PermissionsAndroid } from "react-native"

/**
 * 设备授权验证Hook
 * 100%还原UniApp App.vue中的设备授权逻辑
 */
export const useDeviceAuth = () => {
  const deviceAuthStore = useDeviceAuthStore()

  // 获取并缓存设备UUID（仅使用真实设备序列号）
  const getAndCacheDeviceUUID = useCallback(async (): Promise<string> => {
    try {
      // 先尝试从缓存获取
      let deviceUUID = await AsyncStorage.getItem("deviceUUID")

      if (deviceUUID === null) {
        // 只获取真实的硬件序列号，获取不到就返回空字符串
        deviceUUID = '' // 默认为空
        
        if (Platform.OS === 'android') {
          try {
            // 请求权限
            const granted = await PermissionsAndroid.request(
              PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
              {
                title: "设备信息权限",
                message: "应用需要获取设备序列号用于设备授权验证",
                buttonNeutral: "稍后询问",
                buttonNegative: "拒绝",
                buttonPositive: "允许",
              }
            )
            
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              const serialNumber = await DeviceInfo.getSerialNumber()
              
              // 验证是否是有效的序列号（不是"unknown"也不是空字符串）
              if (serialNumber && 
                  serialNumber !== 'unknown' && 
                  serialNumber.trim().length > 0) {
                deviceUUID = serialNumber.trim()
                console.log("✅ 获取到设备序列号(SN):", deviceUUID)
              } else {
                console.warn("⚠️ 未获取到有效的设备序列号，device_code 将为空")
              }
            } else {
              console.warn("⚠️ 用户拒绝授权，无法获取设备序列号")
            }
          } catch (error) {
            console.error("❌ 获取设备序列号失败:", error)
          }
        } else if (Platform.OS === 'ios') {
          // iOS: 使用 identifierForVendor
          try {
            const iosId = await DeviceInfo.getUniqueId()
            if (iosId && iosId !== 'unknown') {
              deviceUUID = iosId
              console.log("✅ 获取到iOS设备标识:", deviceUUID)
            } else {
              console.warn("⚠️ 未获取到有效的iOS设备标识")
            }
          } catch (error) {
            console.error("❌ 获取iOS设备标识失败:", error)
          }
        }
        
        // 缓存设备UUID（即使是空字符串也缓存，避免重复请求权限）
        await AsyncStorage.setItem("deviceUUID", deviceUUID)
        console.log("设备UUID已缓存:", deviceUUID || '(空)')
      } else {
        console.log("使用缓存的设备UUID:", deviceUUID || '(空)')
      }

      return deviceUUID
    } catch (error) {
      console.error("获取设备UUID失败:", error)
      return '' // 返回空字符串
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
      console.log("✅ 设备UUID已清除，下次启动将重新获取")
    } catch (error) {
      console.error("清除设备UUID失败:", error)
    }
  }, [])

  // 获取设备详细信息（用于调试或上报）
  const getDeviceInfo = useCallback(async () => {
    try {
      return {
        deviceId: await getAndCacheDeviceUUID(),
        brand: DeviceInfo.getBrand(),
        model: DeviceInfo.getModel(),
        systemName: DeviceInfo.getSystemName(),
        systemVersion: DeviceInfo.getSystemVersion(),
        deviceName: await DeviceInfo.getDeviceName(),
        // Android 特有
        ...(Platform.OS === 'android' && {
          androidId: await DeviceInfo.getAndroidId(),
          serialNumber: await DeviceInfo.getSerialNumber().catch(() => 'unavailable'),
        }),
        // iOS 特有
        ...(Platform.OS === 'ios' && {
          identifierForVendor: await DeviceInfo.getUniqueId(),
        }),
      }
    } catch (error) {
      console.error("获取设备信息失败:", error)
      return null
    }
  }, [getAndCacheDeviceUUID])

  return {
    getAndCacheDeviceUUID,
    reverifyDeviceAuthorization,
    ensureDeviceAuth,
    clearDeviceUUID,
    getDeviceInfo,
    // 从store中暴露状态
    isAuthorized: deviceAuthStore.isAuthorized,
    isBlocked: deviceAuthStore.isBlocked,
  }
}
