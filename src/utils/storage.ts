/**
 * 数据存储工具
 * 基于 @react-native-async-storage/async-storage
 * 提供统一的存储接口，自动处理 JSON 序列化/反序列化
 * AsyncStorage 使用异步 API，兼容性更好
 */

import { Platform } from 'react-native';

type AsyncStorageLike = {
  setItem: (key: string, value: string) => Promise<void>;
  getItem: (key: string) => Promise<string | null>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  getAllKeys: () => Promise<string[]>;
  multiGet?: (keys: string[]) => Promise<[string, string | null][]>;
  multiSet?: (entries: [string, string][]) => Promise<void>;
  multiRemove?: (keys: string[]) => Promise<void>;
  mergeItem?: (key: string, value: string) => Promise<void>;
  multiMerge?: (entries: [string, string][]) => Promise<void>;
};

let nativeAsyncStorage: AsyncStorageLike | null = null;
const isNativeMobilePlatform =
  Platform.OS === 'android' || Platform.OS === 'ios';
if (isNativeMobilePlatform) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    nativeAsyncStorage =
      require('@react-native-async-storage/async-storage').default;
  } catch (e) {
    console.warn(
      `AsyncStorage native module not available on ${Platform.OS}:`,
      e,
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
const harmonyAsyncStorageShim: AsyncStorageLike =
  require('../harmony/async-storage-shim').default;

let resolvedBackend: AsyncStorageLike | null = null;
let resolvedBackendName: 'native' | 'harmony-shim' | null = null;
let backendResolvingPromise: Promise<AsyncStorageLike> | null = null;
let backendResolutionLogged = false;

const getHarmonyShimBackendNameSafe = (): string | null => {
  if (isNativeMobilePlatform) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const mod = require('../harmony/async-storage-shim');
    const getter = mod?.getAsyncStorageShimBackendName;
    if (typeof getter === 'function') {
      return String(getter());
    }
    return null;
  } catch {
    return null;
  }
};

const getHarmonyShimDebugInfoSafe = (): Record<string, any> | null => {
  if (isNativeMobilePlatform) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const mod = require('../harmony/async-storage-shim');
    const getter = mod?.getAsyncStorageShimDebugInfo;
    if (typeof getter === 'function') {
      const info = getter();
      return info && typeof info === 'object' ? info : null;
    }
    return null;
  } catch {
    return null;
  }
};

const debugStorageLog = (
  phase: 'set' | 'get',
  key: string,
  payload: Record<string, any>,
) => {
  if (!__DEV__) return;
  try {
    const shimBackend = getHarmonyShimBackendNameSafe();
    // 取消本地存储的频繁打印，避免终端刷屏
    // console.log(`[storage:${phase}]`, {
    //   platform: Platform.OS,
    //   backend: resolvedBackendName || 'unresolved',
    //   ...(shimBackend ? { shimBackend } : null),
    //   key,
    //   ...payload,
    // });
  } catch {}
};

const probeStorage = async (storage: AsyncStorageLike): Promise<boolean> => {
  const probeKey = '__storage_probe__';
  const probeValue = `${Date.now()}`;

  try {
    await storage.setItem(probeKey, probeValue);
    const value = await storage.getItem(probeKey);
    await storage.removeItem(probeKey);
    return value === probeValue;
  } catch {
    return false;
  }
};

const resolveStorageBackend = async (): Promise<AsyncStorageLike> => {
  if (resolvedBackend) {
    return resolvedBackend;
  }

  if (backendResolvingPromise) {
    return backendResolvingPromise;
  }

  backendResolvingPromise = (async () => {
    if (nativeAsyncStorage) {
      const nativeOk = await probeStorage(nativeAsyncStorage);
      if (nativeOk) {
        resolvedBackend = nativeAsyncStorage;
        resolvedBackendName = 'native';
        return resolvedBackend;
      }

      console.warn(
        `[storage] Native AsyncStorage probe failed on ${Platform.OS}, fallback to harmony-shim`,
      );
    }

    resolvedBackend = harmonyAsyncStorageShim;
    resolvedBackendName = 'harmony-shim';

    if (__DEV__ && !backendResolutionLogged) {
      backendResolutionLogged = true;
      try {
        const shimInfo = getHarmonyShimDebugInfoSafe();
        console.log('[storage:resolve]', {
          platform: Platform.OS,
          backend: resolvedBackendName,
          shimInfo,
        });
      } catch {}
    }

    return resolvedBackend;
  })();

  return backendResolvingPromise;
};

export const getStorageBackendName = (): string => {
  return resolvedBackendName || 'unresolved';
};

/**
 * 存储键名常量
 */
export const StorageKeys = {
  // 用户相关
  USER_TOKEN: 'token',
  USER_TOKEN_LEGACY: 'user_token',
  USER_INFO: 'user_info',
  USER_ID: 'user_id',

  // 应用设置
  APP_SETTINGS: 'app_settings',
  THEME: 'theme',
  LANGUAGE: 'language',

  // 其他
  LAST_LOGIN_TIME: 'last_login_time',
  CACHE_VERSION: 'cache_version',
} as const;

/**
 * 存储工具类
 */
class StorageUtil {
  /**
   * 设置存储项
   * 自动处理 JSON 序列化（对象自动序列化，字符串直接存储）
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const backend = await resolveStorageBackend();
      const requestedValue = value;
      if (typeof value === 'string') {
        // 字符串直接存储（如 TOKEN）
        await backend.setItem(key, value);
      } else {
        // 其他类型序列化为 JSON
        await backend.setItem(key, JSON.stringify(value));
      }

      // 调试：写入后立即回读，确认是否真正持久化成功
      try {
        const verifyRaw = await backend.getItem(key);
        let verifyParsed: any = verifyRaw;
        if (verifyRaw !== null) {
          try {
            verifyParsed = JSON.parse(verifyRaw);
          } catch {}
        }
        debugStorageLog('set', key, {
          writeValue: requestedValue,
          readBackRawValue: verifyRaw,
          readBackParsedValue: verifyParsed,
        });
      } catch (verifyError) {
        debugStorageLog('set', key, {
          writeValue: requestedValue,
          verifyError,
        });
      }
    } catch (error) {
      console.error(`Failed to set item for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 获取存储项
   * 自动处理 JSON 反序列化
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const backend = await resolveStorageBackend();
      const value = await backend.getItem(key);
      if (value === null) {
        debugStorageLog('get', key, {
          readRawValue: null,
          readParsedValue: null,
        });
        return null;
      }

      // 尝试解析 JSON，如果失败则返回原始字符串
      try {
        const parsed = JSON.parse(value) as T;
        debugStorageLog('get', key, {
          readRawValue: value,
          readParsedValue: parsed,
        });
        return parsed;
      } catch {
        // 如果不是 JSON，返回原始字符串
        debugStorageLog('get', key, {
          readRawValue: value,
          readParsedValue: value,
        });
        return value as T;
      }
    } catch (error) {
      console.error(`Failed to get item for key ${key}:`, error);
      return null;
    }
  }

  /**
   * 删除存储项
   */
  async removeItem(key: string): Promise<void> {
    try {
      const backend = await resolveStorageBackend();
      await backend.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove item for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * 清空所有存储
   */
  async clear(): Promise<void> {
    try {
      const backend = await resolveStorageBackend();
      await backend.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }

  /**
   * 获取所有键名
   */
  async getAllKeys(): Promise<string[]> {
    try {
      const backend = await resolveStorageBackend();
      const keys = await backend.getAllKeys();
      return [...keys]; // 转换为可变数组
    } catch (error) {
      console.error('Failed to get all keys:', error);
      return [];
    }
  }

  /**
   * 检查键是否存在
   */
  async contains(key: string): Promise<boolean> {
    try {
      const backend = await resolveStorageBackend();
      const value = await backend.getItem(key);
      return value !== null;
    } catch {
      return false;
    }
  }

  /**
   * 获取存储大小（字节）
   * 注意：AsyncStorage 不直接提供大小信息，这里返回键的数量作为近似值
   */
  async getSize(): Promise<number> {
    try {
      const backend = await resolveStorageBackend();
      const keys = await backend.getAllKeys();
      return keys.length;
    } catch {
      return 0;
    }
  }
}

// 导出单例
export const storageUtil = new StorageUtil();

/**
 * Token 存储工具（便捷方法）
 */
export const tokenStorage = {
  set: async (token: string): Promise<void> => {
    await storageUtil.setItem(StorageKeys.USER_TOKEN, token);
  },
  get: async (): Promise<string | null> => {
    const token = await storageUtil.getItem<string>(StorageKeys.USER_TOKEN);
    if (token) {
      return token;
    }

    const legacyToken = await storageUtil.getItem<string>(
      StorageKeys.USER_TOKEN_LEGACY,
    );
    if (legacyToken) {
      try {
        await storageUtil.setItem(StorageKeys.USER_TOKEN, legacyToken);
        await storageUtil.removeItem(StorageKeys.USER_TOKEN_LEGACY);
      } catch {}
      return legacyToken;
    }

    return null;
  },
  remove: async (): Promise<void> => {
    await storageUtil.removeItem(StorageKeys.USER_TOKEN);
    await storageUtil
      .removeItem(StorageKeys.USER_TOKEN_LEGACY)
      .catch(() => undefined);
  },
  has: async (): Promise<boolean> => {
    return await storageUtil.contains(StorageKeys.USER_TOKEN);
  },
};

/**
 * 用户信息存储工具（便捷方法）
 */
export const userStorage = {
  set: async <T>(userInfo: T): Promise<void> => {
    await storageUtil.setItem(StorageKeys.USER_INFO, userInfo);
  },
  get: async <T>(): Promise<T | null> => {
    return await storageUtil.getItem<T>(StorageKeys.USER_INFO);
  },
  remove: async (): Promise<void> => {
    await storageUtil.removeItem(StorageKeys.USER_INFO);
  },
  has: async (): Promise<boolean> => {
    return await storageUtil.contains(StorageKeys.USER_INFO);
  },
};
