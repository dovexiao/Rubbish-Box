/**
 * 设备信息工具类
 * 对应UniApp项目中的设备码获取功能
 */

import DeviceInfo from 'react-native-device-info'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

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
 * 生成设备唯一标识码（已废弃，仅保留用于向后兼容）
 * 现在统一使用 useDeviceAuth 中的真实设备序列号
 */
const generateDeviceCode = async (): Promise<string> => {
  console.warn('generateDeviceCode() 已废弃，应使用 useDeviceAuth 获取真实序列号')
  return '' // 返回空字符串
}

/**
 * 获取设备码
 * 仅使用 useDeviceAuth 中缓存的真实设备序列号，获取不到返回空字符串
 */
export const getDeviceCode = async (): Promise<string> => {
  try {
    // 从 AsyncStorage 获取真实设备序列号（由 useDeviceAuth 设置）
    const deviceCode = await AsyncStorage.getItem('deviceUUID')
    
    // 返回序列号或空字符串
    return deviceCode || ''
  } catch (error) {
    console.error('获取设备码失败:', error)
    return '' // 返回空字符串
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
      deviceCode: await getDeviceCode(),
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
 * 清除本地存储的设备码，下次获取时会重新请求权限并获取真实序列号
 */
export const resetDeviceCode = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('deviceUUID')
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
    device_code: deviceInfo.deviceCode || 'ujyy78',
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

/**
 * 判断是否为平板设备（非学习桌）
 * 学习桌支持同时使用两个相机，平板不支持
 * 
 * 判断规则：
 * - brand === 'rockchip' → 学习桌（支持双相机）
 * - brand !== 'rockchip' → 平板（需要暂停坐姿检测）
 */
export const isTabletDevice = async (): Promise<boolean> => {
  try {
    const brand = await DeviceInfo.getBrand()
    const model = await DeviceInfo.getModel()
    const deviceName = await DeviceInfo.getDeviceName()
    
    console.log('📱 检测设备类型:', { brand, model, deviceName })
    
    // 根据 brand 字段判断
    // brand === 'rockchip' → 学习桌（支持双相机）
    const isLearningDesk = brand.toLowerCase() === 'rockchip'
    const isTablet = !isLearningDesk
    
    console.log('📱 设备判断结果:', isTablet ? '平板（单相机限制）' : '学习桌（支持双相机，brand=rockchip）')
    
    return isTablet
  } catch (error) {
    console.error('检测设备类型失败:', error)
    // 出错时默认认为是平板，更安全
    return true
  }
}

export default {
  getDeviceCode,
  getDeviceInfo,
  getDeviceInfoForAPI,
  resetDeviceCode,
  isTabletDevice
}
