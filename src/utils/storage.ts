/**
 * 数据存储工具
 * 基于 @react-native-async-storage/async-storage
 * 提供统一的存储接口，自动处理 JSON 序列化/反序列化
 * AsyncStorage 使用异步 API，兼容性更好
 */

import { Platform } from 'react-native';

// Harmony 等非原生移动平台上，使用 JS 实现的 AsyncStorage shim，避免 NativeModule 为空报错
let AsyncStorage: any = null;
if (Platform.OS === 'android' || Platform.OS === 'ios') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    AsyncStorage = require('@react-native-async-storage/async-storage').default;
  } catch (e) {
    console.warn('AsyncStorage native module not available:', e);
    // 兜底使用内存实现，保证基本功能可用
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    AsyncStorage = require('../harmony/async-storage-shim').default;
  }
} else {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  AsyncStorage = require('../harmony/async-storage-shim').default;
}

/**
 * 存储键名常量
 */
export const StorageKeys = {
  // 用户相关
  USER_TOKEN: 'user_token',
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
      if (typeof value === 'string') {
        // 字符串直接存储（如 TOKEN）
        await AsyncStorage.setItem(key, value);
      } else {
        // 其他类型序列化为 JSON
        await AsyncStorage.setItem(key, JSON.stringify(value));
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
      const value = await AsyncStorage.getItem(key);
      if (value === null) {
        return null;
      }

      // 尝试解析 JSON，如果失败则返回原始字符串
      try {
        return JSON.parse(value) as T;
      } catch {
        // 如果不是 JSON，返回原始字符串
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
      await AsyncStorage.removeItem(key);
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
      await AsyncStorage.clear();
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
      const keys = await AsyncStorage.getAllKeys();
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
      const value = await AsyncStorage.getItem(key);
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
      const keys = await AsyncStorage.getAllKeys();
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
    return await storageUtil.getItem<string>(StorageKeys.USER_TOKEN);
  },
  remove: async (): Promise<void> => {
    await storageUtil.removeItem(StorageKeys.USER_TOKEN);
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
