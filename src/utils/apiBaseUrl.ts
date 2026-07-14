/**
 * Dev 环境自定义 API 基址
 * 持久化后，业务请求（http 实例）统一走 getApiBaseUrl()
 */

import { BASE_URL, DEPLOY_ENV, ENV } from '@/config';
import { storageUtil } from '@/utils/storage';

const STORAGE_KEY = '@boklock_dev_custom_api_base_url';

let customBaseUrl: string | null = null;
let initPromise: Promise<void> | null = null;

/** 是否允许展示 / 使用 DevTools（dev 包，不含正式 real） */
export function isDevToolsEnabled(): boolean {
  return (
    DEPLOY_ENV === 'dev' ||
    ENV === 'development' ||
    ENV === 'dev' ||
    (typeof __DEV__ !== 'undefined' && __DEV__)
  );
}

export function normalizeApiBaseUrl(url: string): string {
  let next = String(url || '').trim().replace(/\/+$/, '');
  if (!next) return '';
  if (!/^https?:\/\//i.test(next)) {
    next = `http://${next}`;
  }
  return next;
}

/** 当前生效的 API 基址（有自定义则用自定义，否则用环境默认） */
export function getApiBaseUrl(): string {
  return customBaseUrl || BASE_URL;
}

export function getDefaultApiBaseUrl(): string {
  return BASE_URL;
}

export function getCustomApiBaseUrl(): string | null {
  return customBaseUrl;
}

export async function initCustomApiBaseUrl(): Promise<void> {
  if (!isDevToolsEnabled()) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const saved = await storageUtil.getItem<string>(STORAGE_KEY);
      if (typeof saved === 'string' && saved.trim()) {
        customBaseUrl = normalizeApiBaseUrl(saved);
      }
    } catch (e) {
      if (__DEV__) {
        console.warn('[apiBaseUrl] 读取自定义地址失败:', e);
      }
    }
  })();

  return initPromise;
}

export async function setCustomApiBaseUrl(
  url: string | null,
): Promise<string | null> {
  if (!isDevToolsEnabled()) return null;

  if (!url || !String(url).trim()) {
    customBaseUrl = null;
    try {
      await storageUtil.removeItem(STORAGE_KEY);
    } catch {}
    return null;
  }

  const normalized = normalizeApiBaseUrl(url);
  customBaseUrl = normalized;
  try {
    await storageUtil.setItem(STORAGE_KEY, normalized);
  } catch (e) {
    if (__DEV__) {
      console.warn('[apiBaseUrl] 保存自定义地址失败:', e);
    }
  }
  return normalized;
}
