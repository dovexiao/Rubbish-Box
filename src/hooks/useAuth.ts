import { useState, useEffect } from 'react';
import { tokenStorage } from '@/utils/storage';

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
        const hasToken = await tokenStorage.has();
        const tokenValue = await tokenStorage.get();
        
        if (mounted) {
          setIsLoggedIn(hasToken && !!tokenValue);
          setToken(tokenValue);
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
    const hasToken = await tokenStorage.has();
    const token = await tokenStorage.get();
    return hasToken && !!token;
  } catch (error) {
    return false;
  }
}
