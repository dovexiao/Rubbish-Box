import { Platform, TurboModuleRegistry } from 'react-native';
import type { TurboModule } from 'react-native';

/**
 * Harmony 平台下的 AsyncStorage 兼容 shim。
 *
 * 与旧版仅内存实现不同，这里优先使用 react-native-fs 做文件持久化，
 * 以保证杀进程后数据仍可恢复（贴近原生 AsyncStorage 行为）。
 */

type Store = Record<string, string>;
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

interface HarmonyPreferencesTurboModule extends TurboModule {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  getAllKeys: () => Promise<string[]>;
}

const memoryStore: Store = {};
const LOCAL_STORAGE_KEY = '__bok_async_storage__';

const localStorageRef: Storage | null =
  typeof globalThis !== 'undefined' &&
  (globalThis as any).localStorage &&
  typeof (globalThis as any).localStorage.getItem === 'function' &&
  typeof (globalThis as any).localStorage.setItem === 'function'
    ? ((globalThis as any).localStorage as Storage)
    : null;

const isHarmonyRuntime =
  Platform?.OS !== 'android' && Platform?.OS !== 'ios' && Platform?.OS != null;

const harmonyPreferencesModule: HarmonyPreferencesTurboModule | null =
  isHarmonyRuntime
    ? TurboModuleRegistry.get<HarmonyPreferencesTurboModule>(
        'HarmonyPreferences',
      )
    : null;

let RNFS: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  RNFS = require('react-native-fs');
} catch (e) {
  console.warn(
    '[async-storage-shim] react-native-fs unavailable, persistent file backend disabled:',
    e,
  );
}

let RNFetchBlob: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const mod = require('rn-fetch-blob');
  RNFetchBlob = mod?.default || mod;
} catch (e) {
  console.warn(
    '[async-storage-shim] rn-fetch-blob unavailable, secondary file backend disabled:',
    e,
  );
}

let nativeAsyncStorage: AsyncStorageLike | null = null;
if (!isHarmonyRuntime) {
  try {
    // 通过深路径导入，避免被 metro 对 "@react-native-async-storage/async-storage" 的别名重定向到当前 shim。
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const deepModule = require('@react-native-async-storage/async-storage/lib/module/index.js');
    const candidate = (deepModule?.default || deepModule) as AsyncStorageLike;
    if (
      candidate &&
      typeof candidate.setItem === 'function' &&
      typeof candidate.getItem === 'function' &&
      typeof candidate.removeItem === 'function'
    ) {
      nativeAsyncStorage = candidate;
    }
  } catch (e) {
    console.warn(
      '[async-storage-shim] native async-storage deep import unavailable:',
      e,
    );
  }
}

const storageDir: string | null =
  RNFS?.DocumentDirectoryPath ||
  RNFS?.CachesDirectoryPath ||
  RNFS?.TemporaryDirectoryPath ||
  null;

const storageFilePath = storageDir
  ? `${storageDir}/bok_async_storage.json`
  : null;
const storageTempFilePath = storageDir
  ? `${storageDir}/bok_async_storage.tmp.json`
  : null;

const rnfbFs = RNFetchBlob?.fs || null;
const rnfbDirs = rnfbFs?.dirs || null;
const rnfbStorageDir: string | null =
  rnfbDirs?.DocumentDir || rnfbDirs?.CacheDir || null;
const rnfbStorageFilePath = rnfbStorageDir
  ? `${rnfbStorageDir}/bok_async_storage.json`
  : null;

type StorageBackendName =
  | 'nativeAsyncStorage'
  | 'harmonyPreferences'
  | 'rnfs'
  | 'rnFetchBlob'
  | 'localStorage'
  | 'memory';
let storageBackendName: StorageBackendName = nativeAsyncStorage
  ? 'nativeAsyncStorage'
  : harmonyPreferencesModule
  ? 'harmonyPreferences'
  : RNFS
  ? 'rnfs'
  : rnfbFs
  ? 'rnFetchBlob'
  : localStorageRef
  ? 'localStorage'
  : 'memory';

let loaded = false;
let loadingPromise: Promise<void> | null = null;
let persistChain: Promise<void> = Promise.resolve();

const isRNFSAvailable = (): boolean =>
  !!RNFS && !!storageFilePath && !!storageTempFilePath;

const isNativeAsyncStorageAvailable = (): boolean =>
  !!nativeAsyncStorage &&
  typeof nativeAsyncStorage.setItem === 'function' &&
  typeof nativeAsyncStorage.getItem === 'function' &&
  typeof nativeAsyncStorage.removeItem === 'function';

const isRNFetchBlobAvailable = (): boolean =>
  !!rnfbFs &&
  !!rnfbStorageFilePath &&
  typeof rnfbFs.exists === 'function' &&
  typeof rnfbFs.readFile === 'function' &&
  typeof rnfbFs.writeFile === 'function';

const isHarmonyPreferencesAvailable = (): boolean => !!harmonyPreferencesModule;

const hasStoreData = (data: Store | null): data is Store =>
  !!data && typeof data === 'object' && Object.keys(data).length > 0;

const readFromRNFS = async (): Promise<Store | null> => {
  if (!isRNFSAvailable()) {
    return null;
  }

  const exists = await RNFS.exists(storageFilePath);
  if (!exists) {
    return {};
  }

  const content = await RNFS.readFile(storageFilePath, 'utf8');
  if (!content) {
    return {};
  }

  const parsed = JSON.parse(content);
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return parsed as Store;
  }

  return {};
};

const readFromRNFetchBlob = async (): Promise<Store | null> => {
  if (!isRNFetchBlobAvailable()) {
    return null;
  }

  const exists = await rnfbFs.exists(rnfbStorageFilePath);
  if (!exists) {
    return {};
  }

  const content = await rnfbFs.readFile(rnfbStorageFilePath, 'utf8');
  if (!content) {
    return {};
  }

  const parsed = JSON.parse(content);
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return parsed as Store;
  }

  return {};
};

const readFromLocalStorage = (): Store | null => {
  if (!localStorageRef) {
    return null;
  }

  const text = localStorageRef.getItem(LOCAL_STORAGE_KEY);
  if (!text) {
    return {};
  }

  const parsed = JSON.parse(text);
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return parsed as Store;
  }

  return {};
};

const readFromHarmonyPreferences = async (): Promise<Store | null> => {
  if (!isHarmonyPreferencesAvailable()) {
    return null;
  }

  try {
    const keys = await harmonyPreferencesModule!.getAllKeys();
    if (!keys || keys.length === 0) {
      return {};
    }

    const result: Store = {};
    for (const key of keys) {
      const value = await harmonyPreferencesModule!.getItem(key);
      if (typeof value === 'string') {
        result[key] = value;
      }
    }
    return result;
  } catch (error) {
    console.warn('[async-storage-shim] read HarmonyPreferences failed:', error);
    return null;
  }
};

const writeToRNFS = async (data: Store): Promise<void> => {
  if (!isRNFSAvailable()) {
    throw new Error('RNFS unavailable');
  }

  const serialized = JSON.stringify(data);
  await RNFS.writeFile(storageTempFilePath, serialized, 'utf8');

  const targetExists = await RNFS.exists(storageFilePath);
  if (targetExists) {
    await RNFS.unlink(storageFilePath);
  }

  await RNFS.moveFile(storageTempFilePath, storageFilePath);
};

const writeToRNFetchBlob = async (data: Store): Promise<void> => {
  if (!isRNFetchBlobAvailable()) {
    throw new Error('RNFetchBlob unavailable');
  }

  await rnfbFs.writeFile(rnfbStorageFilePath, JSON.stringify(data), 'utf8');
};

const writeToLocalStorage = (data: Store): void => {
  if (!localStorageRef) {
    throw new Error('localStorage unavailable');
  }

  localStorageRef.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
};

const writeToHarmonyPreferences = async (data: Store): Promise<void> => {
  if (!isHarmonyPreferencesAvailable()) {
    throw new Error('HarmonyPreferences unavailable');
  }

  try {
    const existingKeys = (await harmonyPreferencesModule!.getAllKeys()) || [];
    // 先删除已不存在的 key
    for (const key of existingKeys) {
      if (!Object.prototype.hasOwnProperty.call(data, key)) {
        await harmonyPreferencesModule!.removeItem(key);
      }
    }
    // 覆盖/新增数据
    for (const [key, value] of Object.entries(data)) {
      const current = await harmonyPreferencesModule!.getItem(key);
      if (current !== value) {
        await harmonyPreferencesModule!.setItem(key, value);
      }
    }
  } catch (error) {
    console.warn(
      '[async-storage-shim] write HarmonyPreferences failed:',
      error,
    );
    throw error;
  }
};

const readFromNativeAsyncStorage = async (): Promise<Store | null> => {
  if (!isNativeAsyncStorageAvailable()) {
    return null;
  }

  const text = await nativeAsyncStorage!.getItem(LOCAL_STORAGE_KEY);
  if (!text) {
    return {};
  }

  const parsed = JSON.parse(text);
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    return parsed as Store;
  }

  return {};
};

const writeToNativeAsyncStorage = async (data: Store): Promise<void> => {
  if (!isNativeAsyncStorageAvailable()) {
    throw new Error('native async-storage unavailable');
  }

  await nativeAsyncStorage!.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
};

const ensureLoaded = async (): Promise<void> => {
  if (loaded) {
    return;
  }

  if (loadingPromise) {
    return loadingPromise;
  }

  loadingPromise = (async () => {
    try {
      let parsed: Store | null = null;

      if (storageBackendName === 'harmonyPreferences') {
        parsed = await readFromHarmonyPreferences();

        if (parsed === null && isRNFSAvailable()) {
          storageBackendName = 'rnfs';
          parsed = await readFromRNFS();
        }

        if (parsed === null && isRNFetchBlobAvailable()) {
          storageBackendName = 'rnFetchBlob';
          parsed = await readFromRNFetchBlob();
        }

        if (parsed === null && isNativeAsyncStorageAvailable()) {
          storageBackendName = 'nativeAsyncStorage';
          parsed = await readFromNativeAsyncStorage();
        }

        if (parsed === null && localStorageRef) {
          storageBackendName = 'localStorage';
          parsed = readFromLocalStorage();
        }
      } else if (storageBackendName === 'nativeAsyncStorage') {
        parsed = await readFromNativeAsyncStorage();
        if (parsed === null && isHarmonyPreferencesAvailable()) {
          storageBackendName = 'harmonyPreferences';
          parsed = await readFromHarmonyPreferences();
        }
        if (parsed === null && isRNFSAvailable()) {
          storageBackendName = 'rnfs';
          parsed = await readFromRNFS();
        }
        if (parsed === null && isRNFetchBlobAvailable()) {
          storageBackendName = 'rnFetchBlob';
          parsed = await readFromRNFetchBlob();
        }
        if (parsed === null && localStorageRef) {
          storageBackendName = 'localStorage';
          parsed = readFromLocalStorage();
        }
      } else if (storageBackendName === 'localStorage') {
        parsed = readFromLocalStorage();
        if (parsed === null && isHarmonyPreferencesAvailable()) {
          storageBackendName = 'harmonyPreferences';
          parsed = await readFromHarmonyPreferences();
        }
        if (parsed === null && isRNFSAvailable()) {
          storageBackendName = 'rnfs';
          parsed = await readFromRNFS();
        }
        if (parsed === null && isNativeAsyncStorageAvailable()) {
          storageBackendName = 'nativeAsyncStorage';
          parsed = await readFromNativeAsyncStorage();
        }
        if (parsed === null && isRNFetchBlobAvailable()) {
          storageBackendName = 'rnFetchBlob';
          parsed = await readFromRNFetchBlob();
        }
      } else if (storageBackendName === 'rnFetchBlob') {
        parsed = await readFromRNFetchBlob();

        if (!hasStoreData(parsed) && localStorageRef) {
          const localParsed = readFromLocalStorage();
          if (hasStoreData(localParsed)) {
            parsed = localParsed;
            try {
              await writeToRNFetchBlob(localParsed);
            } catch (migrateError) {
              console.warn(
                '[async-storage-shim] migrate localStorage to RNFetchBlob failed:',
                migrateError,
              );
              storageBackendName = 'localStorage';
            }
          }
        }

        if (parsed === null && isRNFSAvailable()) {
          storageBackendName = 'rnfs';
          parsed = await readFromRNFS();
        }

        if (parsed === null && isNativeAsyncStorageAvailable()) {
          storageBackendName = 'nativeAsyncStorage';
          parsed = await readFromNativeAsyncStorage();
        }

        if (parsed === null && isHarmonyPreferencesAvailable()) {
          storageBackendName = 'harmonyPreferences';
          parsed = await readFromHarmonyPreferences();
        }

        if (parsed === null && localStorageRef) {
          storageBackendName = 'localStorage';
          parsed = readFromLocalStorage();
        }
      } else if (storageBackendName === 'rnfs') {
        parsed = await readFromRNFS();

        // 历史版本可能把数据写在 localStorage（部分环境该实现非持久），
        // 这里在 RNFS 文件为空时做一次迁移，避免升级后丢登录态。
        if (!hasStoreData(parsed) && localStorageRef) {
          const localParsed = readFromLocalStorage();
          if (hasStoreData(localParsed)) {
            parsed = localParsed;
            try {
              await writeToRNFS(localParsed);
            } catch (migrateError) {
              console.warn(
                '[async-storage-shim] migrate localStorage to RNFS failed:',
                migrateError,
              );
              storageBackendName = 'localStorage';
            }
          }
        }

        if (parsed === null && isHarmonyPreferencesAvailable()) {
          storageBackendName = 'harmonyPreferences';
          parsed = await readFromHarmonyPreferences();
        }

        if (parsed === null && localStorageRef) {
          storageBackendName = 'localStorage';
          parsed = readFromLocalStorage();
        }

        if (parsed === null && isNativeAsyncStorageAvailable()) {
          storageBackendName = 'nativeAsyncStorage';
          parsed = await readFromNativeAsyncStorage();
        }

        if (parsed === null && isRNFetchBlobAvailable()) {
          storageBackendName = 'rnFetchBlob';
          parsed = await readFromRNFetchBlob();
        }
      }

      if (parsed && typeof parsed === 'object') {
        Object.assign(memoryStore, parsed);
      }
    } catch (error) {
      console.warn('[async-storage-shim] load persistent store failed:', error);
      if (storageBackendName === 'rnfs' && localStorageRef) {
        storageBackendName = 'localStorage';
      } else if (storageBackendName === 'rnfs' && isRNFetchBlobAvailable()) {
        storageBackendName = 'rnFetchBlob';
      } else if (
        storageBackendName === 'rnfs' &&
        isNativeAsyncStorageAvailable()
      ) {
        storageBackendName = 'nativeAsyncStorage';
      } else if (
        storageBackendName === 'harmonyPreferences' &&
        isRNFSAvailable()
      ) {
        storageBackendName = 'rnfs';
      } else if (
        storageBackendName === 'harmonyPreferences' &&
        isRNFetchBlobAvailable()
      ) {
        storageBackendName = 'rnFetchBlob';
      } else if (
        storageBackendName === 'harmonyPreferences' &&
        isNativeAsyncStorageAvailable()
      ) {
        storageBackendName = 'nativeAsyncStorage';
      } else if (
        storageBackendName === 'harmonyPreferences' &&
        localStorageRef
      ) {
        storageBackendName = 'localStorage';
      } else if (storageBackendName === 'rnFetchBlob' && isRNFSAvailable()) {
        storageBackendName = 'rnfs';
      } else if (
        storageBackendName === 'rnFetchBlob' &&
        isNativeAsyncStorageAvailable()
      ) {
        storageBackendName = 'nativeAsyncStorage';
      } else if (storageBackendName === 'rnFetchBlob' && localStorageRef) {
        storageBackendName = 'localStorage';
      } else if (
        storageBackendName === 'nativeAsyncStorage' &&
        localStorageRef
      ) {
        storageBackendName = 'localStorage';
      } else if (storageBackendName !== 'memory') {
        storageBackendName = 'memory';
      }
    } finally {
      loaded = true;
    }
  })();

  return loadingPromise;
};

const persistInternal = async (): Promise<void> => {
  try {
    if (storageBackendName === 'harmonyPreferences') {
      await writeToHarmonyPreferences(memoryStore);
      return;
    }

    if (storageBackendName === 'nativeAsyncStorage') {
      await writeToNativeAsyncStorage(memoryStore);
      return;
    }

    if (storageBackendName === 'localStorage') {
      writeToLocalStorage(memoryStore);
      return;
    }

    if (storageBackendName === 'rnfs') {
      await writeToRNFS(memoryStore);
      return;
    }

    if (storageBackendName === 'rnFetchBlob') {
      await writeToRNFetchBlob(memoryStore);
      return;
    }
  } catch (error) {
    console.warn('[async-storage-shim] persist store failed:', error);

    if (storageBackendName === 'harmonyPreferences' && isRNFSAvailable()) {
      try {
        await writeToRNFS(memoryStore);
        storageBackendName = 'rnfs';
        return;
      } catch (fallbackError) {
        console.warn(
          '[async-storage-shim] fallback HarmonyPreferences -> RNFS failed:',
          fallbackError,
        );
      }
    }

    if (
      storageBackendName === 'harmonyPreferences' &&
      isRNFetchBlobAvailable()
    ) {
      try {
        await writeToRNFetchBlob(memoryStore);
        storageBackendName = 'rnFetchBlob';
        return;
      } catch (fallbackError) {
        console.warn(
          '[async-storage-shim] fallback HarmonyPreferences -> RNFetchBlob failed:',
          fallbackError,
        );
      }
    }

    if (storageBackendName === 'harmonyPreferences' && localStorageRef) {
      try {
        writeToLocalStorage(memoryStore);
        storageBackendName = 'localStorage';
        return;
      } catch (fallbackError) {
        console.warn(
          '[async-storage-shim] fallback HarmonyPreferences -> localStorage failed:',
          fallbackError,
        );
      }
    }

    if (storageBackendName === 'nativeAsyncStorage' && localStorageRef) {
      try {
        writeToLocalStorage(memoryStore);
        storageBackendName = 'localStorage';
        return;
      } catch (fallbackError) {
        console.warn(
          '[async-storage-shim] fallback nativeAsyncStorage -> localStorage failed:',
          fallbackError,
        );
      }
    }

    if (storageBackendName === 'rnfs' && localStorageRef) {
      try {
        writeToLocalStorage(memoryStore);
        storageBackendName = 'localStorage';
        return;
      } catch (fallbackError) {
        console.warn(
          '[async-storage-shim] fallback to localStorage failed:',
          fallbackError,
        );
      }
    }

    if (storageBackendName === 'rnfs' && isRNFetchBlobAvailable()) {
      try {
        await writeToRNFetchBlob(memoryStore);
        storageBackendName = 'rnFetchBlob';
        return;
      } catch (fallbackError) {
        console.warn(
          '[async-storage-shim] fallback rnfs -> RNFetchBlob failed:',
          fallbackError,
        );
      }
    }

    if (storageBackendName === 'rnFetchBlob' && localStorageRef) {
      try {
        writeToLocalStorage(memoryStore);
        storageBackendName = 'localStorage';
        return;
      } catch (fallbackError) {
        console.warn(
          '[async-storage-shim] fallback RNFetchBlob -> localStorage failed:',
          fallbackError,
        );
      }
    }

    storageBackendName = 'memory';
  }
};

const persist = async (): Promise<void> => {
  persistChain = persistChain.then(async () => {
    await persistInternal();
  });

  try {
    await persistChain;
  } catch {
    // 异常已在 persistInternal 中记录，避免链路中断
  }
};

async function setItem(key: string, value: string): Promise<void> {
  await ensureLoaded();
  memoryStore[key] = value;
  await persist();
}

async function getItem(key: string): Promise<string | null> {
  await ensureLoaded();
  return Object.prototype.hasOwnProperty.call(memoryStore, key)
    ? memoryStore[key]
    : null;
}

async function removeItem(key: string): Promise<void> {
  await ensureLoaded();
  delete memoryStore[key];
  await persist();
}

async function clear(): Promise<void> {
  await ensureLoaded();
  Object.keys(memoryStore).forEach(k => delete memoryStore[k]);
  await persist();
}

async function getAllKeys(): Promise<string[]> {
  await ensureLoaded();
  return Object.keys(memoryStore);
}

async function multiGet(keys: string[]): Promise<[string, string | null][]> {
  await ensureLoaded();
  return keys.map(key => [
    key,
    Object.prototype.hasOwnProperty.call(memoryStore, key)
      ? memoryStore[key]
      : null,
  ]);
}

async function multiSet(entries: [string, string][]): Promise<void> {
  await ensureLoaded();
  entries.forEach(([key, value]) => {
    memoryStore[key] = value;
  });
  await persist();
}

async function multiRemove(keys: string[]): Promise<void> {
  await ensureLoaded();
  keys.forEach(key => {
    delete memoryStore[key];
  });
  await persist();
}

async function mergeItem(key: string, value: string): Promise<void> {
  await ensureLoaded();

  const current = memoryStore[key];
  if (!current) {
    memoryStore[key] = value;
    await persist();
    return;
  }

  try {
    const merged = {
      ...JSON.parse(current),
      ...JSON.parse(value),
    };
    memoryStore[key] = JSON.stringify(merged);
  } catch {
    memoryStore[key] = value;
  }

  await persist();
}

async function multiMerge(entries: [string, string][]): Promise<void> {
  await ensureLoaded();

  for (const [key, value] of entries) {
    const current = memoryStore[key];
    if (!current) {
      memoryStore[key] = value;
      continue;
    }

    try {
      const merged = {
        ...JSON.parse(current),
        ...JSON.parse(value),
      };
      memoryStore[key] = JSON.stringify(merged);
    } catch {
      memoryStore[key] = value;
    }
  }

  await persist();
}

const AsyncStorage = {
  setItem,
  getItem,
  removeItem,
  clear,
  getAllKeys,
  multiGet,
  multiSet,
  multiRemove,
  mergeItem,
  multiMerge,
};

export const getAsyncStorageShimBackendName = (): string => storageBackendName;

export const getAsyncStorageShimDebugInfo = (): {
  backend: StorageBackendName;
  rnfsAvailable: boolean;
  rnFetchBlobAvailable: boolean;
  localStorageAvailable: boolean;
  nativeAsyncStorageAvailable: boolean;
  harmonyPreferencesAvailable: boolean;
} => ({
  backend: storageBackendName,
  rnfsAvailable: isRNFSAvailable(),
  rnFetchBlobAvailable: isRNFetchBlobAvailable(),
  localStorageAvailable: !!localStorageRef,
  nativeAsyncStorageAvailable: isNativeAsyncStorageAvailable(),
  harmonyPreferencesAvailable: isHarmonyPreferencesAvailable(),
});

export default AsyncStorage;
export { AsyncStorage };
