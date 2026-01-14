/**
 * 版本相关的 React Query Hooks
 */

import { useQuery } from '@tanstack/react-query';
import { getVersion, VersionInfo } from '@/services/common';

// Query Keys
export const versionKeys = {
  all: ['version'] as const,
  check: (client: 'ios' | 'android') => [...versionKeys.all, 'check', client] as const,
};

/**
 * 检查版本更新
 */
export function useVersionCheck(
  client: 'ios' | 'android',
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  },
) {
  return useQuery({
    queryKey: versionKeys.check(client),
    queryFn: () => getVersion({ client }),
    enabled: options?.enabled,
    staleTime: 10 * 60 * 1000, // 10 分钟
    refetchInterval: options?.refetchInterval,
    ...options,
  });
}

