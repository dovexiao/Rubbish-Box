import { del, get, post, put, type CreateFetchResponse } from './http';
import type { AxiosRequestConfig } from 'axios';

/**
 * 请求方法类型
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';


/**
 * 创建请求方法的工厂函数
 * @param url 请求地址
 * @param method 请求方法
 * @returns 请求函数
 */
export function createFetch<TResponse = any, TParams = any>(
  url: string,
  method: HttpMethod = 'GET',
) {
  // RN 环境：统一返回 CreateFetchResponse，不需要额外传 info
  return (
    params?: TParams,
    config?: AxiosRequestConfig,
  ): Promise<CreateFetchResponse<TResponse>> => {
    switch (method) {
      case 'GET':
        // GET 请求将 params 作为 query 参数
        return get<TResponse>(url, {
          params: params as any,
          ...config,
        });

      case 'POST':
        return post<TResponse>(url, params, config);

      case 'PUT':
        return put<TResponse>(url, params, config);

      case 'DELETE':
        return del<TResponse>(url, {
          params: params as any,
          ...config,
        });

      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
  };
}

