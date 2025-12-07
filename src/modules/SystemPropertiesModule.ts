/**
 * 系统属性模块
 * 用于读取 Android ro 属性，无需权限
 */
import { NativeModules, Platform } from 'react-native'

interface SystemPropertiesModuleType {
  getSerialNumber(): Promise<string>
  getProperty(key: string): Promise<string>
  getAllDeviceIdentifiers(): Promise<Record<string, string>>
}

const { SystemPropertiesModule } = NativeModules

const SystemProperties: SystemPropertiesModuleType | null = 
  Platform.OS === 'android' ? SystemPropertiesModule : null

/**
 * 获取设备序列号（从 ro.serialno，无需权限）
 */
export async function getSerialNumber(): Promise<string> {
  if (!SystemProperties) {
    console.warn('⚠️ SystemPropertiesModule 仅支持 Android')
    return ''
  }

  try {
    const serialNumber = await SystemProperties.getSerialNumber()
    console.log('✅ 从系统属性读取到序列号:', serialNumber || '(空)')
    return serialNumber || ''
  } catch (error) {
    console.error('❌ 读取序列号失败:', error)
    return ''
  }
}

/**
 * 读取指定的系统属性
 */
export async function getSystemProperty(key: string): Promise<string> {
  if (!SystemProperties) {
    console.warn('⚠️ SystemPropertiesModule 仅支持 Android')
    return ''
  }

  try {
    const value = await SystemProperties.getProperty(key)
    return value || ''
  } catch (error) {
    console.error(`❌ 读取系统属性 ${key} 失败:`, error)
    return ''
  }
}

/**
 * 获取所有设备标识信息
 */
export async function getAllDeviceIdentifiers(): Promise<Record<string, string>> {
  if (!SystemProperties) {
    console.warn('⚠️ SystemPropertiesModule 仅支持 Android')
    return {}
  }

  try {
    const identifiers = await SystemProperties.getAllDeviceIdentifiers()
    console.log('✅ 设备标识信息:', identifiers)
    return identifiers || {}
  } catch (error) {
    console.error('❌ 读取设备标识失败:', error)
    return {}
  }
}

export default SystemProperties

