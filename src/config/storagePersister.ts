/**
 * React Query 持久化配置
 * 将 React Query 缓存持久化到 AsyncStorage
 */

import { PersistedClient, Persister } from '@tanstack/react-query-persist-client';
import { storageUtil } from '@/utils/storage';

const STORAGE_KEY = 'react-query-cache';

/**
 * 创建 AsyncStorage Persister
 */
export const createMMKVPersister = (): Persister => {
  return {
    persistClient: async (client: PersistedClient) => {
      try {
        await storageUtil.setItem(STORAGE_KEY, client);
      } catch (error) {
        console.error('Failed to persist query client:', error);
      }
    },
    restoreClient: async (): Promise<PersistedClient | undefined> => {
      try {
        const client = await storageUtil.getItem<PersistedClient>(STORAGE_KEY);
        return client || undefined;
      } catch (error) {
        console.error('Failed to restore query client:', error);
        return undefined;
      }
    },
    removeClient: async () => {
      try {
        await storageUtil.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Failed to remove query client:', error);
      }
    },
  };
};
