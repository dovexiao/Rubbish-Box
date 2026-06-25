import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
// 在 RN 中强制使用 axios 的 browser 版 bundle，避免依赖 Node 的 crypto 等内置模块
// eslint-disable-next-line @typescript-eslint/no-var-requires
const axios = require('axios/dist/browser/axios.cjs') as typeof import('axios');
import dayjs from 'dayjs';
import { BASE_URL, DEPLOY_ENV, DEPLOY_VERSION, GRAY } from '@/config';
import { tokenStorage } from '@/utils/storage';
import { navigateToLogin } from '@/utils/navigation';
import { cacheGetSync, cacheRemove } from '@/utils/cache';
import eventCenter from '@/utils/eventCenter';

/**
 * 过滤对象中的 undefined / null（递归），用于 GET params 规整化。
 */
function filterUndefinedAndNull(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  const result: any = {};
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value !== undefined && value !== null) {
      result[key] = filterUndefinedAndNull(value);
    }
  });
  return result;
}

/**
 * 生成随机字符串，用于请求 nonce（X-M-KEY）。
 */
function randomStr(length: number = 16): string {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 生成业务签名（X-M-SIGN）。
 *
 * - 对齐既有后端签名规则：仅签名基础类型字段（对象/数组不参与）
 * - 使用 HmacSHA256，key 固定为 'jdtz'
 */
function getSign(
  data: Record<string, any>,
  nonce: string,
  secret?: string,
): string {
  const crypto = require('crypto-js');
  const keys = Object.keys(data).sort();
  const params: string[] = [];

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i] as string;
    const value = data[key];

    if (value !== null && value !== undefined && value !== '') {
      if (
        Array.isArray(value) ||
        (typeof value === 'object' && value !== null)
      ) {
      } else {
        params.push(key + '=' + encodeURIComponent(value));
      }
    }
  }

  params.push('nonce=' + nonce);

  const signStr = params.join('&') + (secret || '');
  const sign = crypto.HmacSHA256(signStr, 'jdtz').toString(crypto.enc.Hex);

  return sign;
}

/**
 * 统一请求返回格式（参考 MyProject 的 CreateFetchResponse）
 */
export interface CreateFetchResponse<T = any> {
  header: Record<string, any>;
  success: boolean;
  code: number;
  data: T;
  message: string;
  /** 兼容后端/旧代码字段 */
  msg?: string;
  status?: number;
}

/**
 * 创建 axios 实例
 * 根据不同环境自动使用对应的 baseURL
 */
const http: AxiosInstance = (axios as any).create({
  baseURL: BASE_URL,
  timeout: 30000,
});

/**
 * 将后端返回的 code 规整为 number；无法解析时使用 fallback。
 */
function normalizeCode(code: any, fallback: number) {
  if (code === undefined || code === null || code === '') return fallback;
  const n = Number(code);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * 从后端响应中提取 message 字段，兼容 msg/message/error 多种字段名。
 */
function normalizeMessage(raw: any) {
  return (
    (raw?.msg as string) ||
    (raw?.message as string) ||
    (raw?.error as string) ||
    ''
  );
}

/**
 * 获取请求头所需 token。
 *
 * 项目里 token 可能写入两处：cache('token') 与 tokenStorage；此处做兜底读取。
 */
async function getTokenForHeaders(): Promise<string> {
  // 项目里有两套 token 写入方式：cacheSetSync('token') 与 tokenStorage.set()
  // 这里优先读 cache，再兜底读 tokenStorage，保证请求头稳定。
  const cacheToken = await cacheGetSync('token');
  if (cacheToken) return String(cacheToken);
  const storageToken = await tokenStorage.get();
  return storageToken ? String(storageToken) : '';
}

/**
 * 清理所有 token 存储（用于退出登录/被踢下线等场景）。
 */
async function clearAllToken() {
  try {
    await cacheRemove({ key: 'token' });
  } catch {}
  try {
    await tokenStorage.remove();
  } catch {}
}

/**
 * 根据业务 code 触发全局重新登录流程。
 * @param code 业务 code（或与 HTTP status 对齐后的 code）
 */
function handleReLoginByCode(code: number) {
  // 206：账号在其他设备登录/登录失效（与 MyProject RN 逻辑对齐）
  if (code === 206) {
    eventCenter.trigger('global:popConfirm:show', {
      title: '你的账号已在另一台设备登录，请重新登录',
      confirmText: '重新登录',
      showClose: false,
      onConfirm: async () => {
        await clearAllToken();
        navigateToLogin();
      },
    });
    return;
  }

  // 有些接口会把未授权放在业务 code 里返回
  if (code === 401) {
    clearAllToken().finally(() => {
      navigateToLogin();
    });
  }
}

/**
 * 请求拦截器
 * 可以在这里统一添加 token、语言等公共头部
 */
http.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      // 1) 给 url 增加时间戳（防缓存）
      const timestamp = dayjs().valueOf();
      const separator = config.url?.includes('?') ? '&' : '?';
      if (config.url) {
        config.url = `${config.url}${separator}t=${timestamp}`;
      }

      // 2) GET 请求过滤 undefined/null
      if (config.method === 'get' && config.params) {
        config.params = filterUndefinedAndNull(config.params);
      }

      // 3) token + 签名
      const token = await getTokenForHeaders();
      const secret = await cacheGetSync('siscrt');
      const random = randomStr(16);
      const isFormData =
        typeof FormData !== 'undefined' && config.data instanceof FormData;
      const requestData =
        config.method === 'get' ? (config.params as any) : (config.data as any);
      const sign = getSign(
        isFormData
          ? {}
          : ((requestData && typeof requestData === 'object'
              ? requestData
              : {}) as Record<string, any>),
        random,
        secret ? String(secret) : undefined,
      );

      const headerEntries = Object.entries(
        (config.headers || {}) as Record<string, any>,
      );
      const hasContentTypeHeader = headerEntries.some(
        ([key, value]) =>
          key.toLowerCase() === 'content-type' && value !== undefined,
      );

      // 4) 公共请求头（RN 专用）
      config.headers = (config.headers || {}) as any;
      (config.headers as any)['Accept'] = '*/*';
      if (isFormData) {
        // multipart 需由 axios 自动带上 boundary；如果调用方已显式指定，则保留它
        // 注意：此处必须使用首字母大写的 Content-Type，防止在鸿蒙端与底层强制追加的 Content-Type 产生双重 header
        if (!hasContentTypeHeader) {
          (config.headers as any)['Content-Type'] = 'multipart/form-data';
        }
      } else {
        (config.headers as any)['Content-Type'] = 'application/json';
      }
      (config.headers as any)['X-M-VERSION'] = DEPLOY_VERSION || '';
      (config.headers as any)['X-M-TOKEN'] = token || '';
      (config.headers as any)['X-M-TYPE'] = 'rn';
      (config.headers as any)['X-M-APP'] = 'app';
      (config.headers as any)['release'] = GRAY ? 'gray' : DEPLOY_ENV;
      (config.headers as any)['X-M-KEY'] = random;
      (config.headers as any)['X-M-SIGN'] = sign;

      // 兼容部分后端的 Authorization Bearer
      if (token) {
        (config.headers as any)['Authorization'] = `Bearer ${token}`;
      }
    } catch (error) {
      // 如果获取 token 失败，继续发送请求，只是不添加 token
      if (__DEV__) {
        console.warn('无法获取 token:', error);
      }
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  },
);

/**
 * 响应拦截器
 * 统一处理错误、返回完整响应对象
 */
// axios 的类型定义默认要求拦截器返回 AxiosResponse；
// 这里我们把响应“扁平化”为 CreateFetchResponse，因此需要做一次类型兜底。
http.interceptors.response.use(
  ((response: AxiosResponse<any>) => {
    const raw = response.data;
    const header = (response.headers || {}) as Record<string, any>;
    const status = response.status;

    // 兼容多种后端返回：{ success, code, data, msg/message } 或 { code, data, msg/message } 或异常原始值
    let unified: CreateFetchResponse<any>;
    const hasSuccessField = typeof raw?.success === 'boolean';
    const hasCodeField = raw?.code !== undefined;

    if (hasSuccessField) {
      const code = normalizeCode(raw?.code, raw?.success ? 200 : 597);
      unified = {
        header,
        status,
        success: !!raw.success,
        code,
        data: raw.success ? raw.data : raw.msg || raw.message || raw.data,
        message: normalizeMessage(raw),
      };
    } else if (hasCodeField) {
      const code = normalizeCode(raw?.code, 200);
      const success = code === 200;
      unified = {
        header,
        status,
        success,
        code,
        data: raw?.data,
        message: normalizeMessage(raw),
      };
    } else {
      // 兜底：后端直接返回原始类型（如 true/false）
      const success = raw === true;
      unified = {
        header,
        status,
        success,
        code: success ? 200 : 597,
        data: raw,
        message: success ? '' : '请求失败',
      };
    }

    unified.msg = unified.message;
    handleReLoginByCode(unified.code);
    return unified;
  }) as any,
  (async (error: any) => {
    // 统一错误处理：不再 reject，返回统一结构（对齐 MyProject “不需要处理 reject” 的体验）
    if (error?.response) {
      const { status, data, headers } = error.response;

      // 401：未授权，清 token 并跳转登录
      if (status === 401) {
        await clearAllToken();
        navigateToLogin();
      }

      const code = normalizeCode(data?.code, status || 599);
      const unified: CreateFetchResponse<any> = {
        header: (headers || {}) as Record<string, any>,
        status,
        success: false,
        code,
        data: data?.data ?? data,
        message: normalizeMessage(data) || '请求错误',
      };
      unified.msg = unified.message;
      handleReLoginByCode(unified.code);
      return unified;
    }

    if (error?.request) {
      console.log(error?.request, '=====');
      const unified: CreateFetchResponse<any> = {
        header: {},
        success: false,
        code: 499,
        data: error.request,
        message: '网络不稳定，请重试',
      };
      unified.msg = unified.message;
      return unified;
    }

    const unified: CreateFetchResponse<any> = {
      header: {},
      success: false,
      code: 599,
      data: error,
      message: error?.message || '请求配置错误',
    };
    unified.msg = unified.message;
    return unified;
  }) as any,
);

/**
 * 封装常用请求方法，支持范型类型推导
 */
export function get<T = any>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<CreateFetchResponse<T>> {
  return http.get<any, CreateFetchResponse<T>>(url, config);
}

/**
 * POST 请求（默认 JSON body），返回统一结构 CreateFetchResponse。
 */
export function post<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<CreateFetchResponse<T>> {
  return http.post<any, CreateFetchResponse<T>>(url, data, config);
}

/**
 * PUT 请求（默认 JSON body），返回统一结构 CreateFetchResponse。
 */
export function put<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<CreateFetchResponse<T>> {
  return http.put<any, CreateFetchResponse<T>>(url, data, config);
}

/**
 * DELETE 请求，返回统一结构 CreateFetchResponse。
 */
export function del<T = any>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<CreateFetchResponse<T>> {
  return http.delete<any, CreateFetchResponse<T>>(url, config);
}

/**
 * 如果有特殊场景需要完全自定义 axios 配置，
 * 也可以直接导出实例
 */
export default http;
