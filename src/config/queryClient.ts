/**
 * React Query 配置
 */

import { QueryClient } from '@tanstack/react-query';

// 创建 QueryClient 实例
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 默认缓存时间：5 分钟
      staleTime: 5 * 60 * 1000,
      // 默认垃圾回收时间：10 分钟
      gcTime: 10 * 60 * 1000,
      // 失败重试次数
      retry: 1,
      // 失败重试延迟
      retryDelay: 1000,
      // 窗口聚焦时重新获取数据
      refetchOnWindowFocus: false,
      // 网络重连时重新获取数据
      refetchOnReconnect: true,
    },
    mutations: {
      // 失败重试次数
      retry: 0,
    },
  },
});

