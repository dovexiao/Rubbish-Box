/**
 * Harmony 平台下的 AsyncStorage 简易 shim。
 *
 * 使用内存实现最基础的 KV 存储接口，
 * 以避免 @react-native-async-storage/async-storage 因 NativeModule 为空而抛错。
 *
 * 注意：
 * - 数据在应用重启后不会持久化，仅作为功能兜底。
 * - Android / iOS 不会走到这里，不影响原生实现。
 */

type Store = Record<string, string>;

const memoryStore: Store = {};

async function setItem(key: string, value: string): Promise<void> {
  memoryStore[key] = value;
}

async function getItem(key: string): Promise<string | null> {
  return Object.prototype.hasOwnProperty.call(memoryStore, key)
    ? memoryStore[key]
    : null;
}

async function removeItem(key: string): Promise<void> {
  delete memoryStore[key];
}

async function clear(): Promise<void> {
  Object.keys(memoryStore).forEach(k => delete memoryStore[k]);
}

async function getAllKeys(): Promise<string[]> {
  return Object.keys(memoryStore);
}

async function multiGet(keys: string[]): Promise<[string, string | null][]> {
  const results: [string, string | null][] = [];
  for (const key of keys) {
    // eslint-disable-next-line no-await-in-loop
    const value = await getItem(key);
    results.push([key, value]);
  }
  return results;
}

async function multiSet(entries: [string, string][]): Promise<void> {
  entries.forEach(([key, value]) => {
    memoryStore[key] = value;
  });
}

async function multiRemove(keys: string[]): Promise<void> {
  keys.forEach(key => {
    delete memoryStore[key];
  });
}

// 一个最小可用的 AsyncStorage 兼容实现
const AsyncStorage = {
  setItem,
  getItem,
  removeItem,
  clear,
  getAllKeys,
  multiGet,
  multiSet,
  multiRemove,
};

export default AsyncStorage;
export { AsyncStorage };
