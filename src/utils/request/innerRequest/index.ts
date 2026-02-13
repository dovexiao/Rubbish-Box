import type { AxiosRequestConfig } from 'axios';
import http, { type CreateFetchResponse } from '../../http';

/**
 * 兼容旧版 innerRequest，但在当前 RN 工程里直接走 axios/http 实现。
 *
 * - 仅保留统一的 CreateFetchResponse 返回结构
 * - 具体签名/加签逻辑交给 http.ts 的拦截器处理
 */
export default function innerRequest(
  option: AxiosRequestConfig,
): Promise<CreateFetchResponse<any>> {
  return http.request<any, CreateFetchResponse<any>>(option);
}
