import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

/**
 * 网络工具
 * 处理网络状态检测和变化监听
 */

/**
 * 检查当前网络连接状态
 * @returns Promise<boolean> 是否连接网络
 */
export const checkNetworkConnection = async (): Promise<boolean> => {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected ?? false;
  } catch (error) {
    console.error('检查网络连接失败:', error);
    return false;
  }
};

/**
 * 添加网络状态变化监听器
 * @param listener 监听器回调函数
 * @returns 取消监听函数
 */
export const addNetworkListener = (
  listener: (state: NetInfoState) => void
): (() => void) => {
  return NetInfo.addEventListener(listener);
};

/**
 * 网络类型枚举
 */
export enum NetworkType {
  NONE = 'none',
  WIFI = 'wifi',
  CELLULAR = 'cellular',
  ETHERNET = 'ethernet',
  UNKNOWN = 'unknown',
}

/**
 * 获取当前网络类型
 * @returns Promise<NetworkType> 网络类型
 */
export const getNetworkType = async (): Promise<NetworkType> => {
  try {
    const state = await NetInfo.fetch();
    
    if (!state.isConnected) {
      return NetworkType.NONE;
    }
    
    switch (state.type) {
      case 'wifi':
        return NetworkType.WIFI;
      case 'cellular':
        return NetworkType.CELLULAR;
      case 'ethernet':
        return NetworkType.ETHERNET;
      default:
        return NetworkType.UNKNOWN;
    }
  } catch (error) {
    console.error('获取网络类型失败:', error);
    return NetworkType.UNKNOWN;
  }
};

/**
 * 打开系统网络设置
 * 仅支持Android平台
 */
export const openNetworkSettings = (): void => {
  try {
    NetInfo.openSettings();
  } catch (error) {
    console.error('打开网络设置失败:', error);
  }
};

export default {
  checkNetworkConnection,
  addNetworkListener,
  getNetworkType,
  NetworkType,
  openNetworkSettings,
};
