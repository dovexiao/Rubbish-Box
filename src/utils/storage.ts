import { MMKV } from 'react-native-mmkv';

/**
 * 存储工具
 * 使用MMKV进行本地数据存储
 */
const storage = new MMKV();

/**
 * 存储键名前缀
 */
const KEY_PREFIX = 'xhtx_';

/**
 * 获取完整的键名
 * @param key 键名
 */
const getFullKey = (key: string): string => {
  return `${KEY_PREFIX}${key}`;
};

/**
 * 存储字符串
 * @param key 键名
 * @param value 值
 */
export const setString = (key: string, value: string): void => {
  storage.set(getFullKey(key), value);
};

/**
 * 获取字符串
 * @param key 键名
 * @param defaultValue 默认值
 */
export const getString = (key: string, defaultValue?: string): string | undefined => {
  return storage.getString(getFullKey(key)) || defaultValue;
};

/**
 * 存储布尔值
 * @param key 键名
 * @param value 值
 */
export const setBool = (key: string, value: boolean): void => {
  storage.set(getFullKey(key), value);
};

/**
 * 获取布尔值
 * @param key 键名
 * @param defaultValue 默认值
 */
export const getBool = (key: string, defaultValue?: boolean): boolean | undefined => {
  return storage.getBoolean(getFullKey(key)) ?? defaultValue;
};

/**
 * 存储数字
 * @param key 键名
 * @param value 值
 */
export const setNumber = (key: string, value: number): void => {
  storage.set(getFullKey(key), value);
};

/**
 * 获取数字
 * @param key 键名
 * @param defaultValue 默认值
 */
export const getNumber = (key: string, defaultValue?: number): number | undefined => {
  return storage.getNumber(getFullKey(key)) ?? defaultValue;
};

/**
 * 存储对象
 * @param key 键名
 * @param value 值
 */
export const setObject = <T extends object>(key: string, value: T): void => {
  storage.set(getFullKey(key), JSON.stringify(value));
};

/**
 * 获取对象
 * @param key 键名
 * @param defaultValue 默认值
 */
export const getObject = <T extends object>(key: string, defaultValue?: T): T | undefined => {
  const json = storage.getString(getFullKey(key));
  if (!json) return defaultValue;
  
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.error(`解析存储的JSON失败: ${key}`, error);
    return defaultValue;
  }
};

/**
 * 删除存储项
 * @param key 键名
 */
export const removeItem = (key: string): void => {
  storage.delete(getFullKey(key));
};

/**
 * 清除所有存储
 */
export const clearAll = (): void => {
  storage.clearAll();
};

/**
 * 存储键名常量
 */
export const STORAGE_KEYS = {
  TOKEN: 'token',
  USER_INFO: 'user_info',
  SETTINGS: 'settings',
  LAST_UPDATE_CHECK: 'last_update_check',
};

export default {
  setString,
  getString,
  setBool,
  getBool,
  setNumber,
  getNumber,
  setObject,
  getObject,
  removeItem,
  clearAll,
  STORAGE_KEYS,
};
