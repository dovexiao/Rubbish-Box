import { get, post } from './api';

/**
 * 用户相关API服务
 * 对应UniApp项目中的service/my.ts
 */
interface User {
  id: string;
  username: string;
  avatar: string;
  nickname: string;
  grade?: string;
  points?: number;
  [key: string]: any;
}

interface LoginParams {
  username: string;
  password: string;
}

interface LoginResult {
  token: string;
  user: User;
}

/**
 * 用户登录
 */
export const login = (params: LoginParams): Promise<LoginResult> => {
  return post<LoginResult>('/user/login', params);
};

/**
 * 获取用户信息
 */
export const getUserInfo = (): Promise<User> => {
  return get<User>('/user/info');
};

/**
 * 更新用户信息
 */
export const updateUserInfo = (data: Partial<User>): Promise<User> => {
  return post<User>('/user/update', data);
};

/**
 * 获取用户徽章
 */
export const getUserBadges = (): Promise<any[]> => {
  return get<any[]>('/user/badges');
};

/**
 * 获取用户数据统计
 */
export const getUserStats = (): Promise<any> => {
  return get<any>('/user/stats');
};

export default {
  login,
  getUserInfo,
  updateUserInfo,
  getUserBadges,
  getUserStats,
};
