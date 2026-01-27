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
import IntentLauncher from 'react-native-intent-launcher';
import NetInfo from '@react-native-community/netinfo';
import { BleManager } from 'react-native-ble-plx';
import { init as initAMapGeolocationLib, Geolocation } from 'react-native-amap-geolocation';
import { AMapSdk } from 'react-native-amap3d';
import Config from 'react-native-config';
import { cacheGet } from './cache';
import { storageUtil } from './storage';
import appPush from './push';
import { updateRegId } from '@/services/common';

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
 * 请求蓝牙权限（已迁移到 @/utils/permissions，保留此导出以保持向后兼容）
 * @deprecated 请使用 @/utils/permissions 中的 checkBluetoothPermission 或 checkAndRequestBluetoothPermission
 */
export { checkBluetoothPermission as requestBluetoothPermissions } from './permissions';

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

export function myNextTick(fn: any) {
  setTimeout(() => {
    fn()
  }, 0)
}

/**
 * 事件中心（兼容 Taro 风格）
 */
class EventCenter {
  private events: Map<string, Set<Function>> = new Map();

  /**
   * 监听事件
   * @param eventName 事件名称
   * @param callback 回调函数
   */
  on(eventName: string, callback: Function) {
    if (!this.events.has(eventName)) {
      this.events.set(eventName, new Set());
    }
    this.events.get(eventName)!.add(callback);
  }

  /**
   * 移除事件监听
   * @param eventName 事件名称
   * @param callback 回调函数（可选，不传则移除该事件的所有监听）
   */
  off(eventName: string, callback?: Function) {
    if (!this.events.has(eventName)) {
      return;
    }

    if (callback) {
      // 移除指定的回调
      this.events.get(eventName)!.delete(callback);
      // 如果该事件没有监听者了，删除事件
      if (this.events.get(eventName)!.size === 0) {
        this.events.delete(eventName);
      }
    } else {
      // 移除该事件的所有监听
      this.events.delete(eventName);
    }
  }

  /**
   * 触发事件
   * @param eventName 事件名称
   * @param args 传递给回调函数的参数
   */
  trigger(eventName: string, ...args: any[]) {
    if (!this.events.has(eventName)) {
      return;
    }

    const callbacks = this.events.get(eventName)!;
    callbacks.forEach((callback) => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`EventCenter: Error executing callback for event "${eventName}":`, error);
      }
    });
  }

  /**
   * 检查是否有监听者
   * @param eventName 事件名称
   */
  has(eventName: string): boolean {
    return this.events.has(eventName) && this.events.get(eventName)!.size > 0;
  }

  /**
   * 清除所有事件监听
   */
  clear() {
    this.events.clear();
  }
}

// 导出单例实例
export const eventCenter = new EventCenter();

/**
 * 过滤对象中的 undefined 和 null 值（递归处理）
 */
export function filterUndefinedAndNull(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  const result: any = {};
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value !== undefined && value !== null) {
      result[key] = filterUndefinedAndNull(value);
    }
  });
  return result;
}

/**
 * 生成随机字符串
 * @param length 字符串长度
 * @returns 随机字符串
 */
export function randomStr(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 生成签名
 * @param data 数据对象
 * @param nonce 随机字符串
 * @param secret 密钥（可选，从缓存获取）
 * @returns 签名字符串
 */
export function getSign(data: Record<string, any>, nonce: string, secret?: string): string {
  const crypto = require('crypto-js');
  const keys = Object.keys(data).sort();
  const params: string[] = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i] as string;
    const value = data[key];

    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
        // 对象和数组暂时不参与签名（与 Taro 项目保持一致）
      } else {
        params.push(key + '=' + encodeURIComponent(value));
      }
    }
  }

  params.push('nonce=' + nonce);

  const signStr = params.join('&') + (secret || '');
  const sign = crypto.HmacSHA256(signStr, 'jdtz').toString(crypto.enc.Hex);

  return sign;
}

/**
 * 腾讯云 COS 上传工具
 */
import _tencentUpload from './tencentUpload';
import type { CreateFetchResponse } from './http';

export function tencentUpload(options: {
  file: any;
  filename: string;
  index: number;
  randomFileName?: boolean;
  appointName?: string;
  folderName?: string;
}): Promise<CreateFetchResponse<any> & { index?: number }> {
  return new Promise(
    (
      resolve: (
        res: CreateFetchResponse<any> & { index?: number },
      ) => void,
      reject: (res: CreateFetchResponse<any> & { index?: number }) => void,
    ) => {
      _tencentUpload(options).then(res => {
        if (res.code !== 200) {
          // 可以在这里添加监控逻辑
          reject(res);
        } else {
          resolve(res);
        }
      });
    },
  );
}





