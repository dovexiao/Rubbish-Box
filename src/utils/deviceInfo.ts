/**
 * 设备信息工具类
 * 对应UniApp项目中的设备码获取功能
 */

import DeviceInfo from 'react-native-device-info'
import { Platform } from 'react-native'
import { MMKV } from 'react-native-mmkv'

// 创建存储实例
const storage = new MMKV()

/**
 * 存储键名
 */
const DEVICE_CODE_KEY = 'device_code'

/**
 * 设备信息接口
 */
export interface DeviceInfoData {
  deviceCode: string        // 设备唯一标识
  deviceId: string         // 设备ID
  deviceName: string       // 设备名称
  systemName: string       // 系统名称
  systemVersion: string    // 系统版本
  appVersion: string       // 应用版本
  buildNumber: string      // 构建号
  bundleId: string         // 包名
  brand: string           // 设备品牌
  model: string           // 设备型号
  platform: string        // 平台
  isEmulator: boolean     // 是否模拟器
}

/**
 * 生成设备唯一标识码
 * 参考UniApp的device_code实现
 */
const generateDeviceCode = async (): Promise<string> => {
  try {
    // 优先使用设备唯一ID
    let deviceCode = await DeviceInfo.getUniqueId()
    
    // 如果获取失败，使用其他方式生成
    if (!deviceCode) {
      const deviceId = await DeviceInfo.getDeviceId()
      const brand = await DeviceInfo.getBrand()
      const model = await DeviceInfo.getModel()
      const timestamp = Date.now().toString()
      
      // 组合生成唯一标识
      deviceCode = `${Platform.OS}_${brand}_${model}_${deviceId}_${timestamp}`
    }
    
    return deviceCode
  } catch (error) {
    console.error('生成设备码失败:', error)
    // 兜底方案：使用时间戳和随机数
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2, 15)
    return `${Platform.OS}_${timestamp}_${random}`
  }
}

/**
 * 获取设备码
 * 如果本地存储中有，直接返回；否则生成新的并存储
 */
export const getDeviceCode = async (): Promise<string> => {
  try {
    // 先从本地存储获取
    let deviceCode = storage.getString(DEVICE_CODE_KEY)
    
    if (!deviceCode) {
      // 生成新的设备码
      deviceCode = await generateDeviceCode()
      // 存储到本地
      storage.set(DEVICE_CODE_KEY, deviceCode)
      console.log('生成新设备码:', deviceCode)
    }
    
    return deviceCode
  } catch (error) {
    console.error('获取设备码失败:', error)
    // 返回默认设备码
    return `${Platform.OS}_default_${Date.now()}`
  }
}

/**
 * 获取完整的设备信息
 * 对应UniApp中的设备信息获取
 */
export const getDeviceInfo = async (): Promise<DeviceInfoData> => {
  try {
    const [
      deviceCode,
      deviceId,
      deviceName,
      systemName,
      systemVersion,
      appVersion,
      buildNumber,
      bundleId,
      brand,
      model,
      isEmulator
    ] = await Promise.all([
      getDeviceCode(),
      DeviceInfo.getDeviceId(),
      DeviceInfo.getDeviceName(),
      DeviceInfo.getSystemName(),
      DeviceInfo.getSystemVersion(),
      DeviceInfo.getVersion(),
      DeviceInfo.getBuildNumber(),
      DeviceInfo.getBundleId(),
      DeviceInfo.getBrand(),
      DeviceInfo.getModel(),
      DeviceInfo.isEmulator()
    ])

    const deviceInfo: DeviceInfoData = {
      deviceCode,
      deviceId,
      deviceName,
      systemName,
      systemVersion,
      appVersion,
      buildNumber,
      bundleId,
      brand,
      model,
      platform: Platform.OS,
      isEmulator
    }

    console.log('设备信息:', deviceInfo)
    return deviceInfo
  } catch (error) {
    console.error('获取设备信息失败:', error)
    
    // 返回默认设备信息
    return {
      deviceCode: await getDeviceCode() == 'unknown' ? 'sadajsg123' : await getDeviceCode(),
      deviceId: 'unknown',
      deviceName: 'unknown',
      systemName: Platform.OS,
      systemVersion: 'unknown',
      appVersion: '0.0.1',
      buildNumber: '1',
      bundleId: 'com.xhtx.app',
      brand: 'unknown',
      model: 'unknown',
      platform: Platform.OS,
      isEmulator: false
    }
  }
}

/**
 * 重置设备码
 * 清除本地存储的设备码，下次获取时会重新生成
 */
export const resetDeviceCode = (): void => {
  try {
    storage.delete(DEVICE_CODE_KEY)
    console.log('设备码已重置')
  } catch (error) {
    console.error('重置设备码失败:', error)
  }
}

/**
 * 获取设备基础信息（用于API请求）
 * 对应UniApp中请求时携带的设备信息
 */
export const getDeviceInfoForAPI = async () => {
  const deviceInfo = await getDeviceInfo()
  
  return {
    device_code: deviceInfo.deviceCode,
    device_id: deviceInfo.deviceId,
    device_name: deviceInfo.deviceName,
    system_name: deviceInfo.systemName,
    system_version: deviceInfo.systemVersion,
    app_version: deviceInfo.appVersion,
    platform: deviceInfo.platform,
    brand: deviceInfo.brand,
    model: deviceInfo.model,
    is_emulator: deviceInfo.isEmulator
  }
}

export default {
  getDeviceCode,
  getDeviceInfo,
  getDeviceInfoForAPI,
  resetDeviceCode
}
