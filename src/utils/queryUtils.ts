/**
 * React Query 工具函数
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * 清除所有查询缓存
 */
export function clearAllQueries(queryClient: QueryClient) {
  queryClient.clear();
}

/**
 * 使特定查询失效并重新获取
 */
export function invalidateQueries(queryClient: QueryClient, queryKey: string[]) {
  queryClient.invalidateQueries({ queryKey });
}

/**
 * 预取查询数据
 */
export async function prefetchQuery<T>(
  queryClient: QueryClient,
  queryKey: string[],
  queryFn: () => Promise<T>,
) {
  await queryClient.prefetchQuery({
    queryKey,
    queryFn,
  });
}

/**
 * 设置查询数据到缓存
 */
export function setQueryData<T>(
  queryClient: QueryClient,
  queryKey: string[],
  data: T,
) {
  queryClient.setQueryData(queryKey, data);
}

/**
 * 获取查询数据
 */
export function getQueryData<T>(queryClient: QueryClient, queryKey: string[]) {
  return queryClient.getQueryData<T>(queryKey);
}

