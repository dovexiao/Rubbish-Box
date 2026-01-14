import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { BASE_URL } from '@/config';
import { tokenStorage } from '@/utils/storage';
import { navigateToLogin } from '@/utils/navigation';

/**
 * 基础接口返回结构（可按你的后端返回结构调整）
 */
export interface BaseResponse<T = any> {
  code: number | string;
  message: string;
  data: T;
}

/**
 * 创建 axios 实例
 * 根据不同环境自动使用对应的 baseURL
 */
const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

/**
 * 请求拦截器
 * 可以在这里统一添加 token、语言等公共头部
 */
http.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // 自动添加 token（AsyncStorage 是异步的）
    try {
      const token = await tokenStorage.get();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
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
http.interceptors.response.use(
  (response: AxiosResponse<BaseResponse>) => {
    const res = response.data;
    console.log('res', res);
    return res as any;
  },
  async error => {
    // 统一错误处理
    if (error.response) {
      const { status } = error.response;

      // 401 未授权，清除 token 并跳转登录
      if (status === 401) {
        try {
          await tokenStorage.remove();
        } catch (storageError) {
          // 如果清除 token 失败，记录错误但继续跳转
          if (__DEV__) {
            console.warn('无法清除 token:', storageError);
          }
        }
        // 跳转到登录页面
        navigateToLogin();
      }

      // 500 服务器错误
      if (status >= 500) {
        console.error('服务器错误:', error.response.data);
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('网络错误: 无法连接到服务器');
    } else {
      // 请求配置错误
      console.error('请求错误:', error.message);
    }

    return Promise.reject(error);
  },
);

/**
 * 封装常用请求方法，支持范型类型推导
 */
export function get<T = any>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  return http.get<any, T>(url, config);
}

export function post<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<T> {
  return http.post<any, T>(url, data, config);
}

export function put<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig,
): Promise<T> {
  return http.put<any, T>(url, data, config);
}

export function del<T = any>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  return http.delete<any, T>(url, config);
}

/**
 * 如果有特殊场景需要完全自定义 axios 配置，
 * 也可以直接导出实例
 */
export default http;


