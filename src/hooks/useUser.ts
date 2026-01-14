/**
 * 用户相关的 React Query Hooks
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUserInfo, login, LoginParams, UserInfo } from '@/services/user';

// Query Keys
export const userKeys = {
  all: ['user'] as const,
  info: () => [...userKeys.all, 'info'] as const,
};

/**
 * 获取用户信息
 */
export function useUserInfo(options?: {
  enabled?: boolean;
  onSuccess?: (data: UserInfo) => void;
  onError?: (error: Error) => void;
}) {
  return useQuery({
    queryKey: userKeys.info(),
    queryFn: fetchUserInfo,
    enabled: options?.enabled,
    staleTime: 5 * 60 * 1000, // 5 分钟
    ...options,
  });
}

/**
 * 登录 Mutation
 */
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: LoginParams) => login(params),
    onSuccess: (data) => {
      // 登录成功后，使缓存失效并重新获取用户信息
      queryClient.invalidateQueries({ queryKey: userKeys.info() });
      // 或者直接设置用户信息到缓存
      // queryClient.setQueryData(userKeys.info(), data);
    },
    onError: (error) => {
      console.error('Login error:', error);
    },
  });
}

