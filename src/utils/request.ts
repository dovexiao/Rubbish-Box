import http, { del, get, post, put, type CreateFetchResponse } from './http';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
// 第三方请求不走带签名的 http 实例，单独使用 axios 基础实例，避免自动加业务头
// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios/dist/browser/axios.cjs') as typeof import('axios');
const thirdAxios: AxiosInstance = axios.create({ timeout: 30000 });
import tencentUploadImpl from './tencentUpload';

/**
 * 请求方法类型
 */
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export function createFetch<TResponse = any, TParams = any>(
  url: string,
  method: HttpMethod = 'GET',
) {
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

/**
 * 只返回 data 的便捷封装
 * 使用方式示例：
 *   const getList = createDataFetch<ListRes, ListParams>('/api/list', 'GET');
 *   const list = await getList({ page: 1 }); // 直接得到后端 data
 */
export function createDataFetch<TResponse = any, TParams = any>(
  url: string,
  method: HttpMethod = 'GET',
) {
  const fetcher = createFetch<TResponse, TParams>(url, method);
  return async (
    params?: TParams,
    config?: AxiosRequestConfig,
  ): Promise<TResponse> => {
    const res = await fetcher(params as TParams, config);
    return res.data as TResponse;
  };
}

/**
 * 第三方完整 URL 请求（不走业务签名/BASE_URL），语义对齐老项目 thirdRequest：
 * - HTTP 200 视为 success=true, code=200
 * - 其它状态码视为 success=false, code=HTTP 状态码 或 599
 * - 网络错误 code=499，message="网络不稳定，请重试"
 */
export function thirdRequest<T = any>(
  config: AxiosRequestConfig,
): Promise<CreateFetchResponse<T>> {
  const finalConfig: AxiosRequestConfig = {
    ...config,
    // 第三方请求不使用默认 baseURL
    baseURL: config.baseURL ?? undefined,
  };

  return thirdAxios
    .request<any, AxiosResponse<any>>(finalConfig)
    .then(response => {
      const { status, data, headers } = response;
      if (status === 200) {
        return {
          header: (headers || {}) as Record<string, any>,
          success: true,
          code: 200,
          data: (data as any) ?? (response as any),
          message: '',
        };
      }
      return {
        header: (headers || {}) as Record<string, any>,
        success: false,
        code: status || 599,
        data: (data as any) ?? (response as any),
        message: '请求错误',
      };
    })
    .catch((error: any) => {
      if (error?.response) {
        const { status, data, headers } = error.response;
        return {
          header: (headers || {}) as Record<string, any>,
          success: false,
          code: status || 599,
          data: data ?? error.response,
          message: '请求错误',
        } as CreateFetchResponse<T>;
      }

      if (error?.request) {
        return {
          header: {},
          success: false,
          code: 499,
          data: error.request,
          message: '网络不稳定，请重试',
        } as CreateFetchResponse<T>;
      }

      return {
        header: {},
        success: false,
        code: 599,
        data: error,
        message: error?.message || '请求配置错误',
      } as CreateFetchResponse<T>;
    });
}

/**
 * 腾讯云 COS 上传：对外从 utils/request 暴露，内部复用统一实现
 */
export const tencentUpload = tencentUploadImpl;
