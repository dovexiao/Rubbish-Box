/**
 * 智能存储 Hook
 * 支持类型推断、跨组件同步（发布订阅模式）、自动合并对象更新
 * MMKV 使用同步 API，无需 await
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { storageUtil } from '@/utils/storage';

// 发布订阅管理器
class StorageEventEmitter {
  private listeners: Map<string, Set<(value: any) => void>> = new Map();

  /**
   * 订阅存储变化
   */
  subscribe(key: string, callback: (value: any) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key)!.add(callback);

    // 返回取消订阅函数
    return () => {
      const callbacks = this.listeners.get(key);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(key);
        }
      }
    };
  }

  /**
   * 发布存储变化
   */
  emit(key: string, value: any): void {
    const callbacks = this.listeners.get(key);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(value);
        } catch (error) {
          console.error(`Error in storage listener for key ${key}:`, error);
        }
      });
    }
  }
}

// 全局事件发射器
const storageEventEmitter = new StorageEventEmitter();

/**
 * 智能存储 Hook
 * 
 * 特性：
 * 1. 类型推断 - 自动推断存储值的类型
 * 2. 跨组件同步 - 使用发布订阅模式，一个组件更新，其他组件自动同步
 * 3. 自动合并对象更新 - 更新对象时自动合并，而不是完全替换
 * 
 * @param key 存储键名
 * @param defaultValue 默认值
 * @returns [value, setValue, loading, error]
 */
export function useSmartStorage<T>(
  key: string,
  defaultValue?: T,
): [
  T | null,
  (value: T | null | ((prev: T | null) => T | null), merge?: boolean) => void,
  boolean,
  Error | null,
] {
  // 初始化时同步读取（MMKV 是同步的）
  const [value, setValue] = useState<T | null>(() => {
    try {
      return storageUtil.getItem<T>(key) ?? defaultValue ?? null;
    } catch {
      return defaultValue ?? null;
    }
  });
  const [loading] = useState(false); // MMKV 是同步的，不需要 loading
  const [error, setError] = useState<Error | null>(null);

  // 订阅存储变化（跨组件同步）
  useEffect(() => {
    const unsubscribe = storageEventEmitter.subscribe(key, (newValue: T | null) => {
      setValue(newValue);
    });

    return unsubscribe;
  }, [key]);

  // 更新值的函数（同步）
  const updateValue = useCallback(
    (
      newValueOrUpdater: T | null | ((prev: T | null) => T | null),
      merge: boolean = false,
    ) => {
      try {
        setError(null);

        // 处理函数式更新
        let finalValue: T | null;
        if (typeof newValueOrUpdater === 'function') {
          const updater = newValueOrUpdater as (prev: T | null) => T | null;
          finalValue = updater(value);
        } else {
          finalValue = newValueOrUpdater;
        }

        // 如果是对象且启用合并模式
        if (
          merge &&
          finalValue !== null &&
          typeof finalValue === 'object' &&
          !Array.isArray(finalValue) &&
          value !== null &&
          typeof value === 'object' &&
          !Array.isArray(value)
        ) {
          // 自动合并对象
          finalValue = { ...value, ...finalValue } as T;
        }

        // 保存到存储（同步）
        if (finalValue === null) {
          storageUtil.removeItem(key);
          setValue(null);
        } else {
          storageUtil.setItem(key, finalValue);
          setValue(finalValue);
        }

        // 发布变化事件（通知其他组件）
        storageEventEmitter.emit(key, finalValue);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to save');
        setError(error);
      }
    },
    [key, value],
  );

  return [value, updateValue, loading, error];
}

/**
 * 便捷 Hook：字符串存储
 */
export function useSmartStorageString(
  key: string,
  defaultValue?: string,
) {
  return useSmartStorage<string>(key, defaultValue);
}

/**
 * 便捷 Hook：数字存储
 */
export function useSmartStorageNumber(
  key: string,
  defaultValue?: number,
) {
  return useSmartStorage<number>(key, defaultValue);
}

/**
 * 便捷 Hook：布尔值存储
 */
export function useSmartStorageBoolean(
  key: string,
  defaultValue?: boolean,
) {
  return useSmartStorage<boolean>(key, defaultValue);
}

/**
 * 便捷 Hook：对象存储（自动合并）
 */
export function useSmartStorageObject<T extends Record<string, any>>(
  key: string,
  defaultValue?: T,
) {
  const [value, setValue, loading, error] = useSmartStorage<T>(key, defaultValue);

  // 对象更新时默认启用合并
  const updateObject = useCallback(
    (updates: Partial<T> | ((prev: T | null) => T | null)) => {
      if (typeof updates === 'function') {
        setValue(updates, false);
      } else {
        setValue(updates as T, true); // 启用合并
      }
    },
    [setValue],
  );

  return [value, updateObject, loading, error] as const;
}
