/**
 * 通用的 React Query Hooks 封装
 * 提供统一的 useQuery 和 useMutation 封装
 */

import { useQuery, useMutation, UseQueryOptions, UseMutationOptions, QueryKey } from '@tanstack/react-query';

/**
 * 通用 Query Hook
 */
export function useApiQuery<TData = unknown, TError = Error>(
  queryKey: QueryKey,
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'>,
) {
  return useQuery({
    queryKey,
    queryFn,
    ...options,
  });
}

/**
 * 通用 Mutation Hook
 */
export function useApiMutation<TData = unknown, TError = Error, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'>,
) {
  return useMutation({
    mutationFn,
    ...options,
  });
}

