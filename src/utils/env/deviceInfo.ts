import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

/**
 * 获取设备信息 仅app可获取
 * @returns 设备信息对象，包含系统、版本、型号等信息
 */
export const getDeviceInfo = async () => {
  try {
    return {
      // 设备型号
      deviceModel: await DeviceInfo.getModel(),
      // 设备名称
      deviceName: await DeviceInfo.getDeviceName(),
      // 操作系统版本
      osVersion: await DeviceInfo.getSystemVersion(),
      // 操作系统名称
      osName: Platform.OS === 'ios' ? 'iOS' : (Platform.OS === 'android' ? 'Android' : 'HarmonyOS'),
      // 应用版本号
      appVersion: await DeviceInfo.getVersion(),
      // 应用构建号
      buildNumber: await DeviceInfo.getBuildNumber(),
      // 设备唯一标识符
      uniqueId: await DeviceInfo.getUniqueId(),
      // 制造商
      manufacturer: await DeviceInfo.getManufacturer(),
      // 品牌
      brand: await DeviceInfo.getBrand(),
      // 系统类型
      systemType: Platform.OS,
    };
  } catch (error) {
    console.error('获取设备信息失败:', error);
    // 返回基础信息作为兜底
    return {
      deviceModel: '',
      deviceName: '',
      osVersion: '',
      osName: Platform.OS === 'ios' ? 'iOS' : (Platform.OS === 'android' ? 'Android' : 'HarmonyOS'),
      appVersion: '',
      buildNumber: '',
      uniqueId: '',
      manufacturer: '',
      brand: '',
      systemType: Platform.OS,
    };
  }
};
