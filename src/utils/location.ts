import {
  NativeModules,
  PermissionsAndroid,
  Platform,
  TurboModuleRegistry,
} from 'react-native';
import Config from 'react-native-config';
import {
  runInPermissionQueue,
  showPermissionPromptIfNeeded,
} from '@/utils/permissions';

/**
 * 跨端定位能力封装（Android / iOS / Harmony）。
 *
 * 目标：
 * - 对齐 Taro.getLocation 的调用形态（options.type / 高精度 / 超时等）
 * - 在三端返回一致的数据结构，并支持 wgs84/gcj02 坐标系输出
 *
 * 依赖：
 * - Android/iOS：react-native-amap-geolocation
 * - Harmony：HarmonyLocation TurboModule（通过 TurboModuleRegistry / NativeModules 兜底解析）
 */
const isNativeMobile = Platform.OS === 'android' || Platform.OS === 'ios';
const isHarmonyPlatform = Platform.OS !== 'ios' && Platform.OS !== 'android';

let initAMapGeolocationLib: any = null;
let Geolocation: any = null;

if (isNativeMobile) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const geo = require('react-native-amap-geolocation');
    initAMapGeolocationLib = geo.init;
    Geolocation = geo.Geolocation;
  } catch (e) {
    console.warn('react-native-amap-geolocation module not available:', e);
  }
}

type HarmonyLocationPayload = {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  speed?: number;
  bearing?: number;
  time?: number;
};

type HarmonyLocationBridge = {
  getCurrentLocation?: (options?: {
    enableHighAccuracy?: boolean;
    timeoutMs?: number;
  }) => Promise<HarmonyLocationPayload | null>;
  isLocationEnabled?: () => Promise<boolean>;
};

let HarmonyLocationModule: HarmonyLocationBridge | null = null;

const harmonyLocationModuleNames = [
  'HarmonyLocation',
  'HarmonyLocationTurboModule',
];

const getHarmonyLocationFromTurboRegistry =
  (): HarmonyLocationBridge | null => {
    const turboGet = (
      TurboModuleRegistry as {
        get?: <T>(name: string) => T | null | undefined;
      }
    )?.get;
    if (typeof turboGet !== 'function') {
      return null;
    }
    for (const name of harmonyLocationModuleNames) {
      try {
        const candidate = turboGet<HarmonyLocationBridge | null>(name);
        if (candidate) {
          return candidate;
        }
      } catch {}
    }
    return null;
  };

const resolveHarmonyLocationModule = (): HarmonyLocationBridge | null => {
  if (HarmonyLocationModule) {
    return HarmonyLocationModule;
  }
  const turboModule = getHarmonyLocationFromTurboRegistry();
  if (turboModule) {
    HarmonyLocationModule = turboModule;
    return HarmonyLocationModule;
  }
  if (!NativeModules) {
    return null;
  }
  const nativeModuleBucket = NativeModules as Record<string, unknown>;
  for (const name of harmonyLocationModuleNames) {
    const candidate = nativeModuleBucket[name];
    if (candidate) {
      HarmonyLocationModule = candidate as HarmonyLocationBridge;
      return HarmonyLocationModule;
    }
  }
  return null;
};

if (isHarmonyPlatform) {
  HarmonyLocationModule = resolveHarmonyLocationModule();
}

/**
 * 坐标系类型：
 * - wgs84：GPS 标准坐标系
 * - gcj02：国测局坐标系（高德/腾讯国内地图常用）
 */
export type LocationCoordinateType = 'wgs84' | 'gcj02';

/**
 * 获取定位参数（兼容 Taro.getLocation 风格）。
 */
export type GetLocationOptions = {
  type?: LocationCoordinateType;
  altitude?: boolean;
  isHighAccuracy?: boolean;
  highAccuracyExpireTime?: number;
  timeout?: number;
};

/**
 * 获取定位返回结构（兼容 Taro.getLocation 风格）。
 */
export type GetLocationResult = {
  latitude: number;
  longitude: number;
  speed?: number;
  accuracy?: number;
  altitude?: number;
  verticalAccuracy?: number;
  horizontalAccuracy?: number;
};

const GCJ_A = 6378245.0;
const GCJ_EE = 0.00669342162296594323;

function outOfChina(lat: number, lon: number): boolean {
  return lon < 72.004 || lon > 137.8347 || lat < 0.8293 || lat > 55.8271;
}

function transformLat(x: number, y: number): number {
  let ret =
    -100.0 +
    2.0 * x +
    3.0 * y +
    0.2 * y * y +
    0.1 * x * y +
    0.2 * Math.sqrt(Math.abs(x));
  ret +=
    ((20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) *
      2.0) /
    3.0;
  ret +=
    ((20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin((y / 3.0) * Math.PI)) *
      2.0) /
    3.0;
  ret +=
    ((160.0 * Math.sin((y / 12.0) * Math.PI) +
      320 * Math.sin((y * Math.PI) / 30.0)) *
      2.0) /
    3.0;
  return ret;
}

function transformLon(x: number, y: number): number {
  let ret =
    300.0 +
    x +
    2.0 * y +
    0.1 * x * x +
    0.1 * x * y +
    0.1 * Math.sqrt(Math.abs(x));
  ret +=
    ((20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) *
      2.0) /
    3.0;
  ret +=
    ((20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin((x / 3.0) * Math.PI)) *
      2.0) /
    3.0;
  ret +=
    ((150.0 * Math.sin((x / 12.0) * Math.PI) +
      300.0 * Math.sin((x / 30.0) * Math.PI)) *
      2.0) /
    3.0;
  return ret;
}

function wgs84ToGcj02(lat: number, lon: number): { lat: number; lon: number } {
  if (outOfChina(lat, lon)) {
    return { lat, lon };
  }
  const dLat = transformLat(lon - 105.0, lat - 35.0);
  const dLon = transformLon(lon - 105.0, lat - 35.0);
  const radLat = (lat / 180.0) * Math.PI;
  let magic = Math.sin(radLat);
  magic = 1 - GCJ_EE * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  const mgLat =
    lat +
    (dLat * 180.0) / (((GCJ_A * (1 - GCJ_EE)) / (magic * sqrtMagic)) * Math.PI);
  const mgLon =
    lon + (dLon * 180.0) / ((GCJ_A / sqrtMagic) * Math.cos(radLat) * Math.PI);
  return { lat: mgLat, lon: mgLon };
}

function gcj02ToWgs84(lat: number, lon: number): { lat: number; lon: number } {
  if (outOfChina(lat, lon)) {
    return { lat, lon };
  }
  const { lat: mgLat, lon: mgLon } = wgs84ToGcj02(lat, lon);
  return { lat: lat * 2 - mgLat, lon: lon * 2 - mgLon };
}

function normalizeCoordinate(
  payload: { latitude: number; longitude: number },
  sourceType: LocationCoordinateType,
  targetType: LocationCoordinateType,
): { latitude: number; longitude: number } {
  if (sourceType === targetType) {
    return payload;
  }
  if (sourceType === 'wgs84' && targetType === 'gcj02') {
    const { lat, lon } = wgs84ToGcj02(payload.latitude, payload.longitude);
    return { latitude: lat, longitude: lon };
  }
  if (sourceType === 'gcj02' && targetType === 'wgs84') {
    const { lat, lon } = gcj02ToWgs84(payload.latitude, payload.longitude);
    return { latitude: lat, longitude: lon };
  }
  return payload;
}

/**
 * 初始化高德定位服务（Android/iOS）或预热 HarmonyLocation（Harmony）。
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
      } catch (error) {
        console.warn('[Harmony] HarmonyLocation 模块初始化失败:', error);
      }
      return;
    }

    if (
      !initAMapGeolocationLib ||
      typeof initAMapGeolocationLib !== 'function'
    ) {
      console.warn('高德定位模块未正确加载，可能是原生模块未链接');
      return;
    }

    const androidKey =
      apiKey || Config.MAP_KEY_ANDROID || '65e063bf30af1d5cb5d2bf648243bff1';
    const iosKey =
      apiKey || Config.MAP_KEY_IOS || '4d3d8b30420bb15896f580757451268d';

    await initAMapGeolocationLib({
      android: androidKey,
      ios: iosKey,
    });
  } catch (error) {
    console.error('高德定位服务初始化失败:', error);
  }
};

/**
 * 获取当前位置（返回为“原始坐标系”，不做 type 输出转换）。
 *
 * - Android/iOS：返回 AMap 的 coords（通常是 gcj02）
 * - Harmony：返回 TurboModule payload（当前按 wgs84 处理）
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
    if (isHarmonyPlatform) {
      const harmonyLocation = resolveHarmonyLocationModule();
      if (!harmonyLocation?.getCurrentLocation) {
        console.warn(
          '[Harmony] HarmonyLocation TurboModule 不可用，无法获取定位',
        );
        return null;
      }
      const result = await harmonyLocation.getCurrentLocation({
        enableHighAccuracy: true,
        timeoutMs: 10000,
      });
      if (!result) {
        return null;
      }
      return {
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
    }

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
 * Harmony 平台主动触发定位权限弹窗/状态检查。
 *
 * 返回：
 * - true：已授权或已触发授权流程
 * - false：模块不可用或授权失败
 */
export const requestHarmonyLocationPermission = async (): Promise<boolean> => {
  if (!isHarmonyPlatform) return true;
  const harmonyLocation = resolveHarmonyLocationModule();
  if (!harmonyLocation) {
    console.warn('[Harmony] HarmonyLocation 模块未加载，无法请求权限');
    return false;
  }
  try {
    const enabled = await harmonyLocation.isLocationEnabled?.();
    if (enabled) {
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
 * 持续定位监听（仅 Android/iOS）。
 *
 * Harmony 当前版本不启用持续定位（返回空的 stop 函数）。
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
      return () => {};
    }
    if (!Geolocation || typeof Geolocation.watchPosition !== 'function') {
      console.warn('高德定位模块未正确加载，可能是原生模块未链接');
      return () => {};
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
    return () => {};
  }
};

/**
 * 获取定位（统一对外 API）。
 *
 * 行为：
 * - Android/iOS：会申请定位权限（Android）、初始化 AMap 定位、读取当前位置
 * - Harmony：会触发定位授权检查、读取当前位置
 * - 支持通过 options.type 指定返回坐标系（wgs84/gcj02）
 */
export async function getLocation(
  options: GetLocationOptions = {},
): Promise<GetLocationResult> {
  return runInPermissionQueue(async () => {
    const hasLocationPermission = await showPermissionPromptIfNeeded(
      'location',
    );
    if (!hasLocationPermission) {
      throw new Error('LOCATION_PERMISSION_DENIED');
    }

    const targetType: LocationCoordinateType = options.type ?? 'wgs84';
    const timeoutMs =
      options.timeout ?? options.highAccuracyExpireTime ?? 10000;
    const enableHighAccuracy = options.isHighAccuracy ?? true;

    if (isHarmonyPlatform) {
      const granted = await requestHarmonyLocationPermission();
      if (!granted) {
        throw new Error('LOCATION_PERMISSION_DENIED');
      }
      await initAMapGeolocation();
      const harmonyLocation = resolveHarmonyLocationModule();
      const result = await harmonyLocation?.getCurrentLocation?.({
        enableHighAccuracy,
        timeoutMs,
      });
      if (!result) {
        throw new Error('LOCATION_UNAVAILABLE');
      }
      const normalized = normalizeCoordinate(
        { latitude: result.latitude, longitude: result.longitude },
        'wgs84',
        targetType,
      );
      return {
        latitude: normalized.latitude,
        longitude: normalized.longitude,
        accuracy: result.accuracy,
        altitude: options.altitude ? result.altitude : undefined,
        speed: result.speed,
        horizontalAccuracy: result.accuracy,
        verticalAccuracy: undefined,
      };
    }

    if (Platform.OS === 'android') {
      try {
        await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ]);
      } catch (error) {
        console.warn('定位权限请求失败:', error);
      }
    }

    await initAMapGeolocation();
    if (!Geolocation || typeof Geolocation.getCurrentPosition !== 'function') {
      throw new Error('LOCATION_MODULE_UNAVAILABLE');
    }

    const raw = await new Promise<GetLocationResult>((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position: any) => {
          const coords = position?.coords ?? {};
          resolve({
            latitude: Number(coords.latitude),
            longitude: Number(coords.longitude),
            speed:
              typeof coords.speed === 'number' ? coords.speed : position?.speed,
            accuracy:
              typeof coords.accuracy === 'number'
                ? coords.accuracy
                : position?.accuracy,
            altitude:
              options.altitude && typeof coords.altitude === 'number'
                ? coords.altitude
                : undefined,
            verticalAccuracy:
              typeof coords.verticalAccuracy === 'number'
                ? coords.verticalAccuracy
                : undefined,
            horizontalAccuracy:
              typeof coords.horizontalAccuracy === 'number'
                ? coords.horizontalAccuracy
                : typeof coords.accuracy === 'number'
                ? coords.accuracy
                : undefined,
          });
        },
        (error: any) => {
          reject(error);
        },
        {
          enableHighAccuracy,
          timeout: timeoutMs,
          maximumAge: options.highAccuracyExpireTime ?? 0,
        },
      );
    });

    if (!Number.isFinite(raw.latitude) || !Number.isFinite(raw.longitude)) {
      throw new Error('LOCATION_INVALID');
    }

    const normalized = normalizeCoordinate(
      { latitude: raw.latitude, longitude: raw.longitude },
      'gcj02',
      targetType,
    );

    return {
      ...raw,
      latitude: normalized.latitude,
      longitude: normalized.longitude,
    };
  });
}
