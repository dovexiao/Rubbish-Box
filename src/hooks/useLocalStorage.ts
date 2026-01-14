/**
 * 通用本地存储 Hook
 * 支持类型推断和响应式更新
 * MMKV 使用同步 API，无需 await
 */

import { useState, useEffect, useCallback } from 'react';
import { storageUtil } from '@/utils/storage';

/**
 * 通用本地存储 Hook
 * @param key 存储键名
 * @param defaultValue 默认值
 * @returns [value, setValue, loading, error]
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue?: T,
): [T | null, (value: T | null) => void, boolean, Error | null] {
  const [value, setValue] = useState<T | null>(() => {
    // 初始化时同步读取（MMKV 是同步的）
    try {
      return storageUtil.getItem<T>(key) ?? defaultValue ?? null;
    } catch {
      return defaultValue ?? null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 更新值的函数（同步）
  const updateValue = useCallback(
    (newValue: T | null) => {
      try {
        setError(null);
        if (newValue === null) {
          storageUtil.removeItem(key);
          setValue(null);
        } else {
          storageUtil.setItem(key, newValue);
          setValue(newValue);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to save');
        setError(error);
      }
    },
    [key],
  );

  return [value, updateValue, loading, error];
}
