/**
 * 导航工具函数（兼容 Taro 风格）
 */
export { getCurrentPages, navigateBack, reLaunch } from './navigation';
import { getCurrentPages } from './navigation';
import { Buffer } from 'buffer';
global.Buffer = global.Buffer || Buffer;
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
/**
 * Toast / Loading 工具（兼容 Taro.showToast / showLoading / hideLoading）
 */
export { showToast, showLoading, hideLoading } from './toast';
import { showToast as innerShowToast } from './toast';
export type {
  GetLocationOptions,
  GetLocationResult,
  LocationCoordinateType,
} from './location';
export {
  getCurrentLocation,
  getLocation,
  initAMapGeolocation,
  requestHarmonyLocationPermission,
  startLocationUpdates,
} from './location';

import {
  DeviceEventEmitter,
  Platform,
  Linking,
  NativeModules,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import Config from 'react-native-config';
import { cacheGet } from './cache';
import { storageUtil } from './storage';
import appPush from './push';
import { updateRegId } from '@/services/common';

// 按平台懒加载仅在 Android / iOS 存在的原生库，避免在 Harmony 等平台导入时报 NativeModule 为 null
const isNativeMobile = Platform.OS === 'android' || Platform.OS === 'ios';

let IntentLauncher: any = null;
let NetInfo: any = null;
let BleManagerClass: any = null;
let AMapSdk: any = null;
const isHarmonyPlatform = Platform.OS !== 'ios' && Platform.OS !== 'android';
let HarmonyAmapModule: any = null;

if (isHarmonyPlatform) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    HarmonyAmapModule = require('@/harmony/harmony-amap').default;
  } catch (e) {
    console.warn('[Harmony] harmony-amap module not available:', e);
  }
}

if (isNativeMobile) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    IntentLauncher = require('react-native-intent-launcher');
  } catch (e) {
    console.warn('IntentLauncher module not available:', e);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    NetInfo = require('@react-native-community/netinfo').default;
  } catch (e) {
    console.warn('@react-native-community/netinfo module not available:', e);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    BleManagerClass = require('react-native-ble-plx').BleManager;
  } catch (e) {
    console.warn('react-native-ble-plx module not available:', e);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    AMapSdk = require('react-native-amap3d').AMapSdk;
  } catch (e) {
    console.warn('react-native-amap3d module not available:', e);
  }
}

// 金额/数字输入保留两位小数
export const inputFixedTwo = (inputVal: string | number) => {
  const val = String(inputVal ?? '');
  if (!val) return val;
  const match = val.match(/\d*(\.)?(\d{1,2})?/);
  return match ? match[0] : val;
};

// 手机号正则校验
export const mobileExp = (mobile: string) => {
  const mobileReg = /^1[3456789]\d{9}$/;
  return mobileReg.test(mobile);
};

export const idCardExp = (idCard: string) => {
  const idCardReg =
    /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X)$/;
  return idCardReg.test(idCard);
};

export const isDecimal = (number: any) => {
  return Number.isFinite(number) && !Number.isInteger(number);
};

export function cdnDomain(cosPath: string) {
  return cosPath.replace(
    'sbqfc-1307862547.cos.ap-shanghai.myqcloud.com',
    'https://g.18qjz.cn',
  );
}

export function cdnToCosDomain(cosPath: string) {
  return cosPath.replace(
    'https://g.18qjz.cn',
    'https://sbqfc-1307862547.cos.ap-shanghai.myqcloud.com',
  );
}

// 生成指定区间的随机整数（含 min/max）
export function randomNum(min: number, max: number): number {
  const low = Math.ceil(min);
  const high = Math.floor(max);
  return Math.floor(Math.random() * (high - low + 1)) + low;
}

// 简单版本号比较：返回 true 表示 current < target
export function isVersionBefore(current: string, target: string): boolean {
  if (!current || !target) return false;
  const curParts = current.split('.').map(v => parseInt(v, 10) || 0);
  const tarParts = target.split('.').map(v => parseInt(v, 10) || 0);
  const len = Math.max(curParts.length, tarParts.length);
  for (let i = 0; i < len; i++) {
    const c = curParts[i] ?? 0;
    const t = tarParts[i] ?? 0;
    if (c < t) return true;
    if (c > t) return false;
  }
  return false;
}

// 兼容旧项目 compareVersion(current).isBefore(target) 的用法
export function compareVersion(current: string) {
  return {
    isBefore(target: string) {
      return isVersionBefore(current, target);
    },
  };
}

/**
 * 拨打电话（兼容 Taro.makePhoneCall）
 * 示例：makePhoneCall({ phoneNumber: '13800000000' })
 */
export async function makePhoneCall(options: {
  phoneNumber: string;
}): Promise<void> {
  const phone = (options?.phoneNumber || '').trim();
  if (!phone) {
    innerShowToast({ title: '手机号为空', icon: 'none' });
    return;
  }

  const url = `tel:${phone}`;
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      innerShowToast({ title: '无法发起拨号', icon: 'error' });
      return;
    }
    await Linking.openURL(url);
  } catch (e) {
    innerShowToast({ title: '无法发起拨号', icon: 'error' });
  }
}

/**
 * 获取存储数据（兼容 Taro 风格的 API）
 * @param options 配置对象，包含 key
 * @returns Promise<T | null>
 */
export async function getStorage<T = any>(options: {
  key: string;
}): Promise<T | null> {
  return storageUtil.getItem<T>(options.key);
}

/**
 * 设置存储数据（兼容 Taro 风格的 API）
 * @param options 配置对象，包含 key 和 data
 */
export async function setStorage<T = any>(options: {
  key: string;
  data: T;
}): Promise<void> {
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
export async function getSystemInfo(): Promise<{
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
      getStorage({ key: 'pushEnabled' }).catch(
        () => ({ data: undefined } as any),
      ),
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
  };

  // 1. 获取 deviceToken
  try {
    const token = await appPush.getDeviceToken();
    if (token) info.deviceToken = token;
  } catch (e) {
    console.warn('getDeviceToken error:', e);
  }

  // 2. 获取 registrationId（MOBPush 最重要）,两秒没拿到就默认赋值为空
  const timeoutPromise = new Promise<boolean>(resolve =>
    setTimeout(() => resolve(false), 2000),
  );

  try {
    const rid = await Promise.race([
      appPush.getRegistrationID(),
      timeoutPromise,
    ]);
    info.registrationId = rid || '';
  } catch (e) {
    console.warn('getRegistrationID error:', e);
  }

  setStorage({
    key: 'deviceInfo',
    data: info,
  });

  // 如果此时已经拿到有效的 registrationId，直接上报一次，避免仅依赖异步回调
  if (info.registrationId) {
    console.log('进来', info.registrationId, '这是MOB平台回调');
    try {
      await updateRegId({ ...info });
    } catch (e) {
      console.warn('updateRegId in getMobPushDeviceInfo error:', e);
    }
  }

  // 4️⃣ 补充：监听异步更新
  DeviceEventEmitter.addListener('registrationId', async rid => {
    console.log(rid, '这是MOB平台回调');
    if (!rid) return;

    // 再次兜底校验：仅在同意隐私 + 已登录 + 用户开启通知服务时处理 registrationId
    try {
      const [agree, token, pushRes]: any[] = await Promise.all([
        cacheGet({ key: 'agreePrivacy' }).catch(() => false),
        cacheGet({ key: 'token' }).catch(() => undefined),
        getStorage({ key: 'pushEnabled' }).catch(
          () => ({ data: undefined } as any),
        ),
      ]);
      const enabled = pushRes?.data === true;
      const loggedIn = !!token;
      if (!agree || !enabled || !loggedIn) {
        return;
      }
    } catch {
      // 发生异常时不继续上报，避免在未授权场景处理 registrationId
      return;
    }

    let stored: any = {};
    try {
      const res = await getStorage({ key: 'deviceInfo' });
      stored = res?.data || {};
    } catch {
      stored = {};
    }
    stored.registrationId = rid;
    try {
      await setStorage({ key: 'deviceInfo', data: stored });
    } catch {}

    // 可以在这里调用接口上传 rid
    try {
      await updateRegId({ ...stored, registrationId: rid });
    } catch (e) {
      console.warn('updateRegId error:', e);
    }
  });

  return info;
};

/**
 * 获取当前应用包名（Android 为 applicationId，iOS 为 Bundle Identifier）
 */
export const getAppPackageName = (): Promise<string> =>
  Promise.resolve(DeviceInfo.getBundleId());

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
 * 获取系统已连接的蓝牙设备（实现见 @/utils/api，此处统一导出）
 */
export { getSystemConnectedDevices } from './api';

/**
 * 检查两个 MAC 地址是否相同（忽略大小写和分隔符）
 * 兼容 bleNo 等为 MAC 字节反序的格式（如 2384FAC8E8FC 与 FC:E8:C8:FA:84:23 视为同一设备）
 */
export const isSameMac = (mac1?: string, mac2?: string): boolean => {
  if (!mac1 || !mac2) return false;
  const normalize = (mac: string) => mac.replace(/[:-]/g, '').toLowerCase();
  const reverseBytes = (hex: string) => {
    const s = hex.replace(/[:-]/g, '').toLowerCase();
    if (s.length !== 12) return s;
    return (s.match(/.{2}/g) || []).reverse().join('');
  };
  const a = normalize(mac1);
  const b = normalize(mac2);
  return a === b || reverseBytes(a) === b;
};

// 打开蓝牙设置（RN 端会在跳转前记录当前路由，便于从系统设置返回时恢复）
export function openBluetoothSettings(value?: any): any {
  return new Promise(async (resolve, reject) => {
    try {
      // 在 RN 端，某些机型从系统设置返回会重启 APP，这里提前记录当前路由信息
      if (value) {
        try {
          const pages = getCurrentPages();
          const current = pages[pages.length - 1];
          const path = current?.routeName;
          const params = current?.params;
          if (path) {
            await setStorage({
              key: 'rnReLaunchPath',
              data: { path, params, value },
            });
          }
        } catch (e) {
          console.error('[openBluetoothSettings] 记录重启路径失败:', e);
        }
      }
      if (Platform.OS === 'ios') {
        await Linking.openURL('App-Prefs:root=General');
      } else {
        if (
          IntentLauncher &&
          typeof IntentLauncher.startActivity === 'function'
        ) {
          await IntentLauncher.startActivity({
            action: 'android.settings.BLUETOOTH_SETTINGS',
          });
        } else {
          // 兜底：IntentLauncher 不可用时，使用系统设置入口
          Linking.sendIntent('android.settings.BLUETOOTH_SETTINGS');
        }
      }
      resolve(true);
    } catch (error) {
      console.error('打开系统设置失败', error);
      reject(error);
    }
  });
}

// 获取本地存储的设备信息
export function getSavedDeviceInfo(): Promise<any> {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await getStorage({ key: 'bluetoothDeviceInfo' });
      resolve(result?.data);
    } catch (error: any) {
      // 缺省键未找到时不视为错误，返回 undefined，避免无意义的异常上报
      if (error?.errMsg && String(error.errMsg).includes('data not found')) {
        resolve(undefined);
      } else {
        reject(error);
      }
    }
  });
}

// 解析蓝牙设备数据微信小程序
export function parseMacFromAdvertisData(
  advertisData?: ArrayBuffer,
): string | null {
  if (!advertisData) return null;
  const bytes = new Uint8Array(advertisData);
  if (bytes.length < 6) return null;
  const macBytes = bytes.slice(bytes.length - 6);
  return Array.from(macBytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
}

export const remenberPath = async (options?: {
  path?: string;
  params?: any;
  value?: any;
}) => {
  try {
    const path = options?.path;
    const params = options?.params;
    const value = options?.value;
    if (path) {
      await setStorage({
        key: 'rnReLaunchPath',
        data: { path, params, value },
      });
    }
  } catch (e) {
    console.error('[openBluetoothSettings] 记录重启路径失败:', e);
  }
};

/**
 * 获取蓝牙设备信息
 */
export const getBluetoothDeviceInfo = async (): Promise<
  Record<string, any>
> => {
  try {
    const info = await getStorage({ key: 'bluetoothDeviceInfoList' });
    return (info as any) || {};
  } catch {
    return {};
  }
};

/**
 * 从缓存中移除指定 deviceId 的蓝牙设备信息
 */
export const removeBluetoothDeviceInfo = async (
  deviceId: string,
): Promise<void> => {
  try {
    const cached = await getBluetoothDeviceInfo();
    let updated = false;
    const next: Record<string, any> = {};
    for (const [key, val] of Object.entries(cached)) {
      if (val?.deviceId !== deviceId) {
        next[key] = val;
      } else {
        updated = true;
      }
    }
    if (updated) {
      await setStorage({ key: 'bluetoothDeviceInfoList', data: next });
    }
  } catch (e) {
    console.error('[removeBluetoothDeviceInfo]', e);
  }
};

/**
 * 从 Base64 制造商数据中解析 MAC 地址（取后 6 字节）
 */
export function parseMacFromBase64(base64Str: string): string | null {
  if (!base64Str) return null;
  try {
    const g = typeof globalThis !== 'undefined' ? globalThis : {};
    const B = (g as any).Buffer;
    const bytes = B ? new Uint8Array(B.from(base64Str, 'base64')) : null;
    if (!bytes || bytes.length < 6) return null;
    const macBytes = bytes.slice(bytes.length - 6);
    return Array.from(macBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
  } catch {
    return null;
  }
}

/**
 * 获取网络状态
 */
export const getNetworkState = async (): Promise<{
  isConnected: boolean;
  type: string;
  isInternetReachable?: boolean;
}> => {
  try {
    if (!NetInfo) {
      // 在不支持 NetInfo 的平台上，返回一个兜底的离线状态，避免抛错
      return {
        isConnected: true,
        type: 'unknown',
      };
    }

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
  callback: (state: {
    isConnected: boolean;
    type: string;
    isInternetReachable?: boolean;
  }) => void,
): (() => void) => {
  try {
    if (!NetInfo) {
      console.warn('NetInfo is not available on this platform');
      return () => {};
    }

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
    return () => {}; // 返回空函数，避免调用时出错
  }
};

/**
 * 初始化 BLE Manager（react-native-ble-plx）
 */
export const initBLEManager = () => {
  try {
    if (!BleManagerClass) {
      console.warn('BLE Manager is not available on this platform');
      return null;
    }

    const manager = new BleManagerClass();

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
    if (isHarmonyPlatform) {
      const harmonyLocation = resolveHarmonyLocationModule();
      if (!harmonyLocation) {
        console.warn(
          '[Harmony] HarmonyLocation TurboModule 未找到，无法初始化定位',
        );
        return;
      }
      try {
        await harmonyLocation.isLocationEnabled?.();
        if (__DEV__) {
          console.log('[Harmony] HarmonyLocation 模块初始化完成');
        }
      } catch (error) {
        console.warn('[Harmony] HarmonyLocation 模块初始化失败:', error);
      }
      return;
    }
    // 检查模块是否正确加载
    if (
      !initAMapGeolocationLib ||
      typeof initAMapGeolocationLib !== 'function'
    ) {
      console.warn('高德定位模块未正确加载，可能是原生模块未链接');
      return;
    }

    // 如果没有传入 apiKey，则从环境变量读取
    const androidKey =
      Config.MAP_KEY_ANDROID || '65e063bf30af1d5cb5d2bf648243bff1';
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
let _cachedLocation: any = null;
let _cachedLocationTime = 0;

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
    if (isHarmonyPlatform) {
      const harmonyLocation = resolveHarmonyLocationModule();
      if (!harmonyLocation?.getCurrentLocation) {
        console.warn(
          '[Harmony] HarmonyLocation TurboModule 不可用，无法获取定位',
        );
        return null;
      }
      if (_cachedLocation && Date.now() - _cachedLocationTime < 30 * 1000) {
        console.log('[Harmony] getCurrentLocation use cache');
        return _cachedLocation;
      }
      console.log('[Harmony] getCurrentLocation start');
      const result = await harmonyLocation.getCurrentLocation({
        enableHighAccuracy: true,
        timeoutMs: 10000,
      });
      if (!result) {
        return null;
      }
      console.log('[Harmony] getCurrentLocation success', result);
      const loc = {
        latitude: result.latitude,
        longitude: result.longitude,
        accuracy: result.accuracy,
        address: undefined,
        province: undefined,
        city: undefined,
        district: undefined,
        street: undefined,
        streetNumber: undefined,
      };
      _cachedLocation = loc;
      _cachedLocationTime = Date.now();
      return loc;
    }
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
          // console.error('获取位置失败:', error);
          reject(error);
        },
      );
    });
  } catch (error) {
    console.error('获取当前位置失败:', error);
    return null;
  }
};

// Harmony 平台的显式权限触发，供 UI 在调用定位前手动触发一次
export const requestHarmonyLocationPermission = async (): Promise<boolean> => {
  if (!isHarmonyPlatform) return true;
  const harmonyLocation = resolveHarmonyLocationModule();
  if (!harmonyLocation) {
    console.warn('[Harmony] HarmonyLocation 模块未加载，无法请求权限');
    return false;
  }
  try {
    // 调用 isLocationEnabled 读取当前状态；必要时调用 getCurrentLocation 以触发权限弹框
    const enabled = await harmonyLocation.isLocationEnabled?.();
    if (enabled) {
      console.log('[Harmony] 定位已授权');
      return true;
    }
    await harmonyLocation.getCurrentLocation?.({ enableHighAccuracy: false });
    return true;
  } catch (error) {
    console.warn('[Harmony] 请求定位权限失败:', error);
    return false;
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
    if (isHarmonyPlatform) {
      console.info('[Harmony] 当前版本未启用持续定位监听');
      return () => {};
    }
    // 检查模块是否正确加载
    if (!Geolocation || typeof Geolocation.watchPosition !== 'function') {
      console.warn('高德定位模块未正确加载，可能是原生模块未链接');
      return () => {}; // 返回空函数，避免调用时出错
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
    return () => {}; // 返回空函数，避免调用时出错
  }
};

/**
 * 初始化高德地图 SDK（用于 react-native-amap3d）
 * @param androidKey Android 平台的高德地图 API Key（可选，如果未提供则从环境变量读取）
 * @param iosKey iOS 平台的高德地图 API Key（可选，如果未提供则从环境变量读取）
 */
const DEFAULT_AMAP_KEY = '91cd78bf8fd5555e2431651d676f134f';
let amapInitialized = false;
export const initAMapSdk = (
  androidKey?: string,
  iosKey?: string,
): string | undefined => {
  if (amapInitialized) {
    if (isHarmonyPlatform) {
      return HarmonyAmapModule?.AMapSdk?.getCurrentKey?.();
    }
    return undefined;
  }

  if (isHarmonyPlatform) {
    try {
      if (!HarmonyAmapModule?.AMapSdk?.init) {
        console.warn(
          '[Harmony] harmony-amap 模块未暴露 AMapSdk.init，无法设置密钥',
        );
        return undefined;
      }
      const configBag = Config as unknown as Record<string, string | undefined>;
      const harmonyKey =
        androidKey ||
        configBag.MAP_KEY_HARMONY ||
        configBag.MAP_KEY_OHOS ||
        Config.MAP_KEY_ANDROID ||
        DEFAULT_AMAP_KEY;
      if (__DEV__ && !configBag.MAP_KEY_HARMONY && !configBag.MAP_KEY_OHOS) {
        console.warn(
          '[Harmony] 当前未配置 MAP_KEY_HARMONY/MAP_KEY_OHOS，正在回退使用 MAP_KEY_ANDROID，可能导致鉴权失败',
        );
      }
      HarmonyAmapModule.AMapSdk.init(harmonyKey);
      amapInitialized = true;
      if (__DEV__) {
        console.log('[Harmony] 高德地图 SDK 初始化成功');
      }
      return harmonyKey;
    } catch (error) {
      console.error('[Harmony] 高德地图 SDK 初始化失败:', error);
    }
    return undefined;
  }

  try {
    // 检查模块是否正确加载
    if (!AMapSdk || typeof AMapSdk.init !== 'function') {
      console.warn('高德地图 SDK 模块未正确加载，可能是原生模块未链接');
      return undefined;
    }

    const apiKey = Platform.select({
      android: androidKey || Config.MAP_KEY_ANDROID || DEFAULT_AMAP_KEY,
      ios: iosKey || Config.MAP_KEY_IOS || DEFAULT_AMAP_KEY,
    });

    if (apiKey) {
      AMapSdk.init(apiKey);
      amapInitialized = true;

      if (__DEV__) {
        console.log('高德地图 SDK 初始化成功');
      }
      return apiKey;
    }
  } catch (error) {
    console.error('高德地图 SDK 初始化失败:', error);
  }
  return undefined;
};

export function myNextTick(fn: any) {
  setTimeout(() => {
    fn();
  }, 0);
}

export { default as eventCenter } from './eventCenter';

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
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
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
export function getSign(
  data: Record<string, any>,
  nonce: string,
  secret?: string,
): string {
  const crypto = require('crypto-js');
  const keys = Object.keys(data).sort();
  const params: string[] = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i] as string;
    const value = data[key];

    if (value !== null && value !== undefined && value !== '') {
      if (
        Array.isArray(value) ||
        (typeof value === 'object' && value !== null)
      ) {
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
      resolve: (res: CreateFetchResponse<any> & { index?: number }) => void,
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

/**
 * 轮询控制器接口
 */
export interface LoopController {
  /** 开始轮询 */
  start: () => void;
  /** 停止轮询 */
  stop: () => void;
}

/**
 * 通用轮询工具函数
 *
 * @param func 轮询执行的任务函数
 *             返回 Promise<boolean>
 *             - resolve(true): 继续轮询
 *             - resolve(false): 停止轮询
 * @param interval 轮询间隔时间（毫秒），默认 1000ms
 * @param maxTimes 最大轮询次数，0 为无限次数，默认 0
 * @returns 轮询控制器 { start, stop }
 *
 * @example
 * ```ts
 * const poller = loopFunc(async () => {
 *   const status = await checkStatus();
 *   return status !== 'completed';
 * }, 2000);
 *
 * poller.start();
 * // ...
 * poller.stop();
 * ```
 */
export function loopFunc(
  func: () => Promise<boolean>,
  interval = 1000,
  maxTimes = 0,
): LoopController {
  let isStopped = true;
  let count = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;

  const stop = () => {
    isStopped = true;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const start = () => {
    // 如果已经在运行，则不重复启动
    if (!isStopped) return;

    isStopped = false;
    count = 0;

    const run = async () => {
      // 停止检查
      if (isStopped) return;

      // 次数检查
      if (maxTimes > 0 && count >= maxTimes) {
        stop();
        return;
      }

      try {
        count++;
        // 执行任务
        const shouldContinue = await func();

        // 任务返回 false 或已被外部停止，则结束
        if (!shouldContinue || isStopped) {
          stop();
          return;
        }

        // 调度下一次执行
        if (!isStopped) {
          timer = setTimeout(run, interval);
        }
      } catch (error) {
        console.warn('Loop function execution failed:', error);
        stop();
      }
    };

    run();
  };

  return { start, stop };
}

export function arrayBufferToBase64(arrayBuffer: any): string {
  return Buffer.from(arrayBuffer).toString('base64');
}
