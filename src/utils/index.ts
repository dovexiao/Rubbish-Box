/**
 * 导航工具函数（兼容 Taro 风格）
 */
export {
  getCurrentPages,
  navigateBack,
  reLaunch,
} from './navigation';

/**
 * 缓存工具函数
 */
export {
  cacheGet,
  cacheGetSync,
  cacheSet,
  cacheSetSync,
  cacheRemove,
  cacheRemoveSync,
} from './cache';

export const inputFixedTwo = (inputVal: any) => {
  return inputVal ? inputVal.match(/\d*(\.)?(\d{1,2})?/)[0] : inputVal
}

export const mobileExp = (mobile: string) => {
  const mobileReg = /^1[3456789]\d{9}$/
  return mobileReg.test(mobile)
}

export const idCardExp = (idCard: string) => {
  const idCardReg =
    /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/
  return idCardReg.test(idCard)
}

export const isDecimal = (number: any) => {
  return Number.isFinite(number) && !Number.isInteger(number)
}

export function cdnDomain(cosPath: string) {
  return cosPath.replace('sbqfc-1307862547.cos.ap-shanghai.myqcloud.com', 'https://g.18qjz.cn')
}

export function cdnToCosDomain(cosPath: string) {
  return cosPath.replace(
    'https://g.18qjz.cn',
    'https://sbqfc-1307862547.cos.ap-shanghai.myqcloud.com',
  )
}

import { DeviceEventEmitter, Platform, Linking, NativeModules } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import IntentLauncher from 'react-native-intent-launcher';
import NetInfo from '@react-native-community/netinfo';
import { BleManager } from 'react-native-ble-plx';
import { init as initAMapGeolocationLib, Geolocation } from 'react-native-amap-geolocation';
import { AMapSdk } from 'react-native-amap3d';
import Config from 'react-native-config';
import wechat from 'react-native-wechat-lib';
import { cacheGet } from './cache';
import { storageUtil } from './storage';
import appPush from './push';
import { updateRegId } from '@/services/common';
import { Toast } from '@ant-design/react-native';

/**
 * 获取存储数据（兼容 Taro 风格的 API）
 * @param options 配置对象，包含 key
 * @returns Promise<T | null>
 */
export async function getStorage<T = any>(options: { key: string }): Promise<T | null> {
  return storageUtil.getItem<T>(options.key);
}

/**
 * 设置存储数据（兼容 Taro 风格的 API）
 * @param options 配置对象，包含 key 和 data
 */
export async function setStorage<T = any>(options: { key: string; data: T }): Promise<void> {
  return storageUtil.setItem(options.key, options.data);
}

/**
 * 删除存储数据（兼容 Taro 风格的 API）
 * @param options 配置对象，包含 key
 */
export async function removeStorage(options: { key: string }): Promise<void> {
  return storageUtil.removeItem(options.key);
}

/**
 * 获取系统信息（兼容 Taro 风格）
 */
async function getSystemInfo(): Promise<{
  platform: string;
  brand?: string;
  model?: string;
  system?: string;
  version?: string;
}> {
  try {
    const brand = DeviceInfo.getBrand();
    const model = DeviceInfo.getModel();
    const system = DeviceInfo.getSystemName();
    const version = DeviceInfo.getSystemVersion();

    return {
      platform: Platform.OS,
      brand,
      model,
      system,
      version,
    };
  } catch (error) {
    console.error('Failed to get system info:', error);
    return {
      platform: Platform.OS,
    };
  }
}

export const getMobPushDeviceInfo = async () => {
  // 兜底校验：仅在同意隐私 + 已登录 + 用户开启通知服务时才真正拉取 deviceToken / registrationId
  try {
    const [agree, token, pushRes]: any[] = await Promise.all([
      cacheGet({ key: 'agreePrivacy' }).catch(() => false),
      cacheGet({ key: 'token' }).catch(() => undefined),
      getStorage({ key: 'pushEnabled' }).catch(() => ({ data: undefined }) as any),
    ]);
    const enabled = pushRes?.data === true;
    const loggedIn = !!token;
    if (!agree || !enabled || !loggedIn) {
      return;
    }
  } catch {
    // 发生异常时不继续，避免在未授权或未登录场景下触发 MobPush
    return;
  }
  const sys = await getSystemInfo();
  const isIOS = sys.platform === 'ios';

  const info: any = {
    platform: isIOS ? 'ios' : 'android',
    brand: sys.brand?.toLowerCase() || '',
  }

  // 1. 获取 deviceToken
  try {
    const token = await appPush.getDeviceToken()
    if (token) info.deviceToken = token
  } catch (e) {
    console.warn('getDeviceToken error:', e)
  }

  // 2. 获取 registrationId（MOBPush 最重要）,两秒没拿到就默认赋值为空
  const timeoutPromise = new Promise<boolean>(resolve => setTimeout(() => resolve(false), 2000))

  try {
    const rid = await Promise.race([appPush.getRegistrationID(), timeoutPromise])
    info.registrationId = rid || ''
  } catch (e) {
    console.warn('getRegistrationID error:', e)
  }

  setStorage({
    key: 'deviceInfo',
    data: info,
  })

  // 如果此时已经拿到有效的 registrationId，直接上报一次，避免仅依赖异步回调
  if (info.registrationId) {
    console.log('进来', info.registrationId, '这是MOB平台回调')
    try {
      await updateRegId({ ...info })
    } catch (e) {
      console.warn('updateRegId in getMobPushDeviceInfo error:', e)
    }
  }

  // 4️⃣ 补充：监听异步更新
  DeviceEventEmitter.addListener('registrationId', async rid => {
    console.log(rid, '这是MOB平台回调')
    if (!rid) return

    // 再次兜底校验：仅在同意隐私 + 已登录 + 用户开启通知服务时处理 registrationId
    try {
      const [agree, token, pushRes]: any[] = await Promise.all([
        cacheGet({ key: 'agreePrivacy' }).catch(() => false),
        cacheGet({ key: 'token' }).catch(() => undefined),
        getStorage({ key: 'pushEnabled' }).catch(() => ({ data: undefined }) as any),
      ])
      const enabled = pushRes?.data === true
      const loggedIn = !!token
      if (!agree || !enabled || !loggedIn) {
        return
      }
    } catch {
      // 发生异常时不继续上报，避免在未授权场景处理 registrationId
      return
    }

    let stored: any = {}
    try {
      const res = await getStorage({ key: 'deviceInfo' })
      stored = res?.data || {}
    } catch {
      stored = {}
    }
    stored.registrationId = rid
    try {
      await setStorage({ key: 'deviceInfo', data: stored })
    } catch { }

    // 可以在这里调用接口上传 rid
    try {
      await updateRegId({ ...stored, registrationId: rid })
    } catch (e) {
      console.warn('updateRegId error:', e)
    }
  })

  return info
}

/**
 * 打开系统设置页面
 */
export const openSettings = async (): Promise<void> => {
  try {
    if (Platform.OS === 'android') {
      const bundleId = await DeviceInfo.getBundleId();

      await IntentLauncher.startActivity({
        action: 'android.settings.APPLICATION_DETAILS_SETTINGS',
        data: `package:${bundleId}`,
      });
    } else {
      // iOS
      await Linking.openSettings();
    }
  } catch (error) {
    console.error('打开设置页面失败:', error);
  }
};

/**
 * 请求蓝牙权限
 */
export const requestBluetoothPermissions = async (): Promise<{
  granted: boolean;
  message?: string;
  canOpenSettings?: boolean; // 是否可以打开设置页面（权限被永久拒绝时）
}> => {
  try {
    if (Platform.OS === 'android') {
      // Android 12+ (API 31+) 需要 BLUETOOTH_CONNECT 权限
      // Android < 12 需要 BLUETOOTH 和 BLUETOOTH_ADMIN 权限
      const androidVersion = Platform.Version as number;

      if (androidVersion >= 31) {
        // Android 12+
        const permission = PERMISSIONS.ANDROID.BLUETOOTH_CONNECT;
        const checkResult = await check(permission);

        if (checkResult === RESULTS.GRANTED) {
          return { granted: true };
        }

        if (checkResult === RESULTS.DENIED) {
          const requestResult = await request(permission);
          if (requestResult === RESULTS.GRANTED) {
            return { granted: true };
          } else {
            return { granted: false, message: '蓝牙连接权限被拒绝' };
          }
        }

        if (checkResult === RESULTS.BLOCKED) {
          return {
            granted: false,
            message: '蓝牙连接权限已被永久拒绝，请在设置中开启',
            canOpenSettings: true,
          };
        }

        return { granted: false, message: '蓝牙连接权限状态未知' };
      } else {
        // Android < 12
        // 旧版本 Android 蓝牙权限在安装时自动授予
        return { granted: true };
      }
    } else {
      // iOS
      // iOS 13+ 使用 BLUETOOTH
      // iOS 13 之前蓝牙权限在 Info.plist 中配置，系统会自动处理
      try {
        const permission = PERMISSIONS.IOS.BLUETOOTH;
        const checkResult = await check(permission);

        if (checkResult === RESULTS.GRANTED) {
          return { granted: true };
        }

        if (checkResult === RESULTS.DENIED) {
          const requestResult = await request(permission);
          if (requestResult === RESULTS.GRANTED) {
            return { granted: true };
          } else {
            return { granted: false, message: '蓝牙权限被拒绝' };
          }
        }

        if (checkResult === RESULTS.BLOCKED) {
          return {
            granted: false,
            message: '蓝牙权限已被永久拒绝，请在设置中开启',
            canOpenSettings: true,
          };
        }

        if (checkResult === RESULTS.UNAVAILABLE) {
          // iOS 13 之前的设备，权限在 Info.plist 中配置，系统会自动处理
          return { granted: true };
        }

        return { granted: false, message: '蓝牙权限状态未知' };
      } catch (error) {
        // 如果权限检查失败（可能是 iOS 版本不支持），返回已授权
        // 因为旧版本 iOS 蓝牙权限在 Info.plist 中配置
        console.warn('iOS 蓝牙权限检查失败，使用默认授权:', error);
        return { granted: true };
      }
    }
  } catch (error) {
    console.error('请求蓝牙权限失败:', error);
    return { granted: false, message: '请求蓝牙权限时发生错误' };
  }
};

/**
 * 初始化推送服务
 */
export const initAppPush = async () => {
  try {
    // 提交隐私协议同意结果
    appPush.submitPolicyGrantResult?.(true);

    // 启动推送服务
    appPush.restartPush?.();

    if (__DEV__) {
      console.log('推送服务初始化完成');
    }
  } catch (error) {
    console.error('推送服务初始化失败:', error);
  }
};

/**
 * 跳转到指定页面（深链接处理）
 */
export const jumpToPage = async (): Promise<{ remove?: () => void }> => {
  try {
    // 监听推送消息点击
    const handleNotificationOpened = (result: any) => {
      console.log('推送消息被点击:', result);
      // 这里可以根据推送内容跳转到相应页面
      // 例如：navigation.navigate('DeviceDetail', { deviceId: result.deviceId });
    };

    // 监听推送消息打开事件
    appPush.onNotifyMessageOpenedReceive?.(handleNotificationOpened);

    // 返回移除监听器的函数
    return {
      remove: () => {
        appPush.offNotifyMessageOpenedReceive?.(handleNotificationOpened);
      },
    };
  } catch (error) {
    console.error('跳转页面监听设置失败:', error);
    return {};
  }
};

/**
 * 获取系统已连接的蓝牙设备
 */
export const getSystemConnectedDevices = async (): Promise<{
  code: string;
  data?: any[];
  message?: string;
}> => {
  try {
    const { BluetoothManager } = NativeModules;
    if (!BluetoothManager) {
      return { code: 'ERROR', message: '蓝牙模块不可用' };
    }

    return new Promise((resolve) => {
      BluetoothManager.getConnectedDevices((result: any) => {
        if (result.error) {
          resolve({ code: 'ERROR', message: result.error });
        } else {
          resolve({ code: '200', data: result.devices || [] });
        }
      });
    });
  } catch (error) {
    console.error('获取已连接设备失败:', error);
    return { code: 'ERROR', message: '获取设备列表失败' };
  }
};

/**
 * 检查两个 MAC 地址是否相同（忽略大小写和分隔符）
 */
export const isSameMac = (mac1?: string, mac2?: string): boolean => {
  if (!mac1 || !mac2) return false;
  const normalize = (mac: string) => mac.replace(/[:-]/g, '').toLowerCase();
  return normalize(mac1) === normalize(mac2);
};

/**
 * 获取蓝牙设备信息
 */
export const getBluetoothDeviceInfo = async (): Promise<Record<string, any>> => {
  try {
    const info = await getStorage({ key: 'bluetoothDeviceInfoList' });
    return (info as any)?.data || {};
  } catch {
    return {};
  }
};

/**
 * 获取网络状态
 */
export const getNetworkState = async (): Promise<{
  isConnected: boolean;
  type: string;
  isInternetReachable?: boolean;
}> => {
  try {
    const state = await NetInfo.fetch();

    return {
      isConnected: state.isConnected ?? false,
      type: state.type || 'unknown',
      isInternetReachable: state.isInternetReachable ?? undefined,
    };
  } catch (error) {
    console.error('获取网络状态失败:', error);
    return {
      isConnected: false,
      type: 'unknown',
    };
  }
};

/**
 * 监听网络状态变化
 */
export const addNetworkStateListener = (
  callback: (state: { isConnected: boolean; type: string; isInternetReachable?: boolean }) => void,
): (() => void) => {
  try {
    const unsubscribe = NetInfo.addEventListener((state: any) => {
      callback({
        isConnected: state.isConnected ?? false,
        type: state.type || 'unknown',
        isInternetReachable: state.isInternetReachable,
      });
    });

    return unsubscribe;
  } catch (error) {
    console.error('添加网络状态监听失败:', error);
    return () => { }; // 返回空函数，避免调用时出错
  }
};

/**
 * 初始化 BLE Manager（react-native-ble-plx）
 */
export const initBLEManager = () => {
  try {
    const manager = new BleManager();

    if (__DEV__) {
      console.log('BLE Manager 初始化成功');
    }

    return manager;
  } catch (error) {
    console.error('BLE Manager 初始化失败:', error);
    return null;
  }
};

/**
 * 检查蓝牙是否开启（使用 react-native-ble-plx）
 */
export const checkBluetoothEnabled = async (manager: any): Promise<boolean> => {
  try {
    if (!manager) {
      return false;
    }

    const state = await manager.state();
    return state === 'PoweredOn';
  } catch (error) {
    console.error('检查蓝牙状态失败:', error);
    return false;
  }
};

/**
 * 初始化高德定位服务
 * @param apiKey 高德地图 API Key（可选，如果未提供则从环境变量读取）
 */
export const initAMapGeolocation = async (apiKey?: string): Promise<void> => {
  try {
    // 检查模块是否正确加载
    if (!initAMapGeolocationLib || typeof initAMapGeolocationLib !== 'function') {
      console.warn('高德定位模块未正确加载，可能是原生模块未链接');
      return;
    }

    // 如果没有传入 apiKey，则从环境变量读取
    const androidKey = Config.MAP_KEY_ANDROID || '65e063bf30af1d5cb5d2bf648243bff1';
    const iosKey = Config.MAP_KEY_IOS || '4d3d8b30420bb15896f580757451268d';

    // 使用 init 函数初始化（传入平台特定的 key）
    await initAMapGeolocationLib({
      android: androidKey,
      ios: iosKey,
    });

    if (__DEV__) {
      console.log('高德定位服务初始化成功');
    }
  } catch (error) {
    console.error('高德定位服务初始化失败:', error);
  }
};

/**
 * 获取当前位置（高德定位）
 */
export const getCurrentLocation = async (): Promise<{
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  province?: string;
  city?: string;
  district?: string;
  street?: string;
  streetNumber?: string;
} | null> => {
  try {
    // 检查模块是否正确加载
    if (!Geolocation || typeof Geolocation.getCurrentPosition !== 'function') {
      console.warn('高德定位模块未正确加载，可能是原生模块未链接');
      return null;
    }

    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position: any) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            address: position.address,
            province: position.province,
            city: position.city,
            district: position.district,
            street: position.street,
            streetNumber: position.streetNumber,
          });
        },
        (error: any) => {
          console.error('获取位置失败:', error);
          reject(error);
        },
      );
    });
  } catch (error) {
    console.error('获取当前位置失败:', error);
    return null;
  }
};

/**
 * 开始定位监听（高德定位）
 */
export const startLocationUpdates = (
  callback: (position: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    address?: string;
  }) => void,
): (() => void) => {
  try {
    // 检查模块是否正确加载
    if (!Geolocation || typeof Geolocation.watchPosition !== 'function') {
      console.warn('高德定位模块未正确加载，可能是原生模块未链接');
      return () => { }; // 返回空函数，避免调用时出错
    }

    const watchId = Geolocation.watchPosition(
      (position: any) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          address: position.address,
        });
      },
      (error: any) => {
        console.error('定位监听错误:', error);
      },
    );

    return () => {
      Geolocation.clearWatch(watchId);
    };
  } catch (error) {
    console.error('开始定位监听失败:', error);
    return () => { }; // 返回空函数，避免调用时出错
  }
};

/**
 * 初始化高德地图 SDK（用于 react-native-amap3d）
 * @param androidKey Android 平台的高德地图 API Key（可选，如果未提供则从环境变量读取）
 * @param iosKey iOS 平台的高德地图 API Key（可选，如果未提供则从环境变量读取）
 */
let amapInitialized = false;
export const initAMapSdk = (androidKey?: string, iosKey?: string): void => {
  if (amapInitialized) {
    return;
  }

  try {
    // 检查模块是否正确加载
    if (!AMapSdk || typeof AMapSdk.init !== 'function') {
      console.warn('高德地图 SDK 模块未正确加载，可能是原生模块未链接');
      return;
    }

    const apiKey = Platform.select({
      android: androidKey || Config.MAP_KEY_ANDROID || '65e063bf30af1d5cb5d2bf648243bff1',
      ios: iosKey || Config.MAP_KEY_IOS || '4d3d8b30420bb15896f580757451268d',
    });

    if (apiKey) {
      AMapSdk.init(apiKey);
      amapInitialized = true;

      if (__DEV__) {
        console.log('高德地图 SDK 初始化成功');
      }
    }
  } catch (error) {
    console.error('高德地图 SDK 初始化失败:', error);
  }
};







