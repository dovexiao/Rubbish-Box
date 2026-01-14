import { createFetch } from '@/utils/request';

/**
 * 绑定设备相关接口
 */

// 绑定扫描
export const bindScan = createFetch<any, any>(
  '/boke/userLock/bindScan',
  'POST',
);

// 绑定设备
export const bind = createFetch<any, any>('/boke/userLock/bind', 'POST');

