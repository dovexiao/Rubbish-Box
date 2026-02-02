import { useState, useEffect } from 'react';
import { cacheGetSync } from '@/utils/cache';

/**
 * 检查用户是否已登录
 * 使用异步方式检查 token
 */
export function useAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const cacheToken = await cacheGetSync('token');

        if (mounted) {
          const hasToken = !!cacheToken;
          setIsLoggedIn(hasToken);
          setToken(hasToken ? String(cacheToken) : null);
          setLoading(false);
        }
      } catch (error) {
        if (__DEV__) {
          console.warn('useAuth: 无法检查登录状态:', error);
        }
        if (mounted) {
          setIsLoggedIn(false);
          setToken(null);
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
    loading,
  };
}

/**
 * 检查用户是否已登录（异步方法，用于非组件场景）
 */
export async function checkAuth(): Promise<boolean> {
  try {
    // 只检查 cache 中的 token
    const cacheToken = await cacheGetSync('token');
    return !!cacheToken;
  } catch (error) {
    return false;
  }
}
