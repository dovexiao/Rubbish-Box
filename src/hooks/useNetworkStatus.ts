import { useState, useEffect } from 'react';
import { addNetworkListener, NetworkType, getNetworkType } from '@/utils/network';

/**
 * 网络状态Hook
 * 用于组件中监听网络状态变化
 */
export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [networkType, setNetworkType] = useState<NetworkType>(NetworkType.UNKNOWN);
  const [isFirstCheck, setIsFirstCheck] = useState(true);

  useEffect(() => {
    // 初始检查
    const checkInitialStatus = async () => {
      try {
        const type = await getNetworkType();
        setNetworkType(type);
        setIsConnected(type !== NetworkType.NONE);
        setIsFirstCheck(false);
      } catch (error) {
        console.error('初始网络状态检查失败:', error);
        setIsConnected(false);
        setIsFirstCheck(false);
      }
    };

    checkInitialStatus();

    // 添加网络变化监听
    const unsubscribe = addNetworkListener((state) => {
      setIsConnected(state.isConnected ?? false);
      
      if (!state.isConnected) {
        setNetworkType(NetworkType.NONE);
      } else {
        switch (state.type) {
          case 'wifi':
            setNetworkType(NetworkType.WIFI);
            break;
          case 'cellular':
            setNetworkType(NetworkType.CELLULAR);
            break;
          case 'ethernet':
            setNetworkType(NetworkType.ETHERNET);
            break;
          default:
            setNetworkType(NetworkType.UNKNOWN);
        }
      }
    });

    // 清理监听器
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isConnected,
    networkType,
    isFirstCheck,
  };
}
