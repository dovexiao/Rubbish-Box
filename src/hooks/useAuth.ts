import { useState, useEffect } from 'react';
import { tokenStorage } from '@/utils/storage';
import { cacheGetSync } from '@/utils/cache';

/**
 * 检查用户是否已登录
 * 使用异步方式检查 token
 */
export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [guestMode, setGuestMode] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const tokenValue = await tokenStorage.get();
        // 兜底：若 tokenStorage 中没有，但老的 cache 中有 token，则做一次迁移
        const cacheToken = await cacheGetSync('token');
        let finalToken = tokenValue;
        if (!finalToken && cacheToken) {
          finalToken = String(cacheToken);
          try {
            await tokenStorage.set(finalToken);
          } catch {}
        }

        // 访客模式：在未登录但用户选择“暂不登录”时允许进入主应用
        const cacheGuestMode = await cacheGetSync('guestMode');
        const isGuest = cacheGuestMode === true;

        const loggedIn = !!finalToken || isGuest;

        if (mounted) {
          setIsLoggedIn(loggedIn);
          setToken(finalToken);
          setGuestMode(isGuest);
          setLoading(false);
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('useAuth: 无法检查登录状态:', error);
        }
        if (mounted) {
          setIsLoggedIn(false);
          setToken(null);
          setGuestMode(false);
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  return {
    isLoggedIn,
    token,
    guestMode,
    loading,
  };
}

/**
 * 检查用户是否已登录（异步方法，用于非组件场景）
 */
export async function checkAuth(): Promise<boolean> {
  try {
    let token = await tokenStorage.get();
    if (!token) {
      const cacheToken = await cacheGetSync('token');
      if (cacheToken) {
        token = String(cacheToken);
        try {
          await tokenStorage.set(token);
        } catch {}
      }
    }
    if (token) return true;

    // 兜底：若显式开启了 guestMode，则视作“已通过登录页校验”，允许进入主应用
    const cacheGuestMode = await cacheGetSync('guestMode');
    return cacheGuestMode === true;
  } catch (error) {
    return false;
  }
}
