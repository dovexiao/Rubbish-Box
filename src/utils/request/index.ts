import type { AxiosRequestConfig } from 'axios';
import type { CreateFetchResponse } from '../http';
import {
  createFetch as coreCreateFetch,
  thirdRequest as coreThirdRequest,
  tencentUpload as coreTencentUpload,
} from '../request';
import type { TProxy } from './constants';

/**
 * 兼容旧版 bok 中的 request 封装，但基于当前 axios/http 实现。
 *
 * - warning（默认）：成功时返回 data，失败时抛出统一结构的错误对象
 * - info：返回完整的 CreateFetchResponse，不抛异常
 */
export async function request<
  TData = any,
  TResponse = any,
  M extends TProxy = 'warning',
>(
  options: {
    url: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    data?: TData;
    config?: AxiosRequestConfig;
  },
  type?: M,
): Promise<M extends 'info' ? CreateFetchResponse<TResponse> : TResponse> {
  const method = (options.method || 'GET').toUpperCase() as
    | 'GET'
    | 'POST'
    | 'PUT'
    | 'DELETE';
  const fetcher = coreCreateFetch<TResponse, TData>(options.url, method);
  const res = await fetcher(options.data as TData, options.config);

  if (type === 'info') {
    return res as any;
  }

  if (res.success && res.code === 200) {
    return res.data as any;
  }

  // 与旧版保持行为：warning 模式下抛出错误，让上层自行处理
  throw res;
}

// 只处理 response.data 为 json 的情况, 其他返回都属于异常
// 自动化使用的方法
export function createFetch<
  REQ extends Record<string, any>,
  RES extends Record<string, any>,
>(url: any, method: 'GET' | 'POST') {
  return <T extends TProxy = 'warning'>(
    data: REQ,
    type?: T,
  ): Promise<
    T extends 'info' ? CreateFetchResponse<RES['data']> : RES['data']
  > => {
    return request<REQ, RES['data'], T>(
      {
        url,
        method,
        data,
      },
      type,
    ) as any;
  };
}

// 第三方请求：直接透传到新的 thirdRequest（axios）
export function thirdRequest<T = any>(
  options: AxiosRequestConfig,
): Promise<CreateFetchResponse<T>> {
  return coreThirdRequest<T>(options);
}

// 腾讯 COS 上传：复用统一的 tencentUpload 实现
export function tencentUpload(options: {
  file: any;
  filename: string;
  index: number;
  randomFileName?: boolean;
  appointName?: string;
  folderName?: string;
}) {
  return coreTencentUpload(options as any);
}

export default {
  request,
  createFetch,
  thirdRequest,
  tencentUpload,
};
