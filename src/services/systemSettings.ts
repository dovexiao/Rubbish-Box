import { NativeModules, Platform } from 'react-native'

const { SystemSettingsModule } = NativeModules

/**
 * 系统设置服务
 * 使用原生模块打开系统设置，确保每次都能成功打开
 */

/**
 * 打开 WiFi 设置
 */
export const openWifiSettings = async (): Promise<void> => {
  if (Platform.OS !== 'android') {
    throw new Error('仅支持 Android 平台')
  }

  if (!SystemSettingsModule) {
    throw new Error('SystemSettingsModule 不可用')
  }

  try {
    await SystemSettingsModule.openWifiSettings()
  } catch (error) {
    console.error('打开 WiFi 设置失败:', error)
    throw error
  }
}

/**
 * 打开蓝牙设置
 */
export const openBluetoothSettings = async (): Promise<void> => {
  if (Platform.OS !== 'android') {
    throw new Error('仅支持 Android 平台')
  }

  if (!SystemSettingsModule) {
    throw new Error('SystemSettingsModule 不可用')
  }

  try {
    await SystemSettingsModule.openBluetoothSettings()
  } catch (error) {
    console.error('打开蓝牙设置失败:', error)
    throw error
  }
}

/**
 * 打开声音设置
 */
export const openSoundSettings = async (): Promise<void> => {
  if (Platform.OS !== 'android') {
    throw new Error('仅支持 Android 平台')
  }

  if (!SystemSettingsModule) {
    throw new Error('SystemSettingsModule 不可用')
  }

  try {
    await SystemSettingsModule.openSoundSettings()
  } catch (error) {
    console.error('打开声音设置失败:', error)
    throw error
  }
}

