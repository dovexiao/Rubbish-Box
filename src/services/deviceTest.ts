import { createFetch } from '@/utils/request';

/**
 * 设备测试相关接口
 */

// 获取测试设备列表
export const getTestDeviceList = createFetch<any, any>(
  '/boke/deviceTest/list',
  'POST',
);

// 测试设备操作
export const testDeviceOperation = createFetch<any, any>(
  '/boke/deviceTest/operation',
  'POST',
);

// 获取测试设备详情
export const getTestDeviceDetail = createFetch<any, any>(
  '/boke/deviceTest/detail',
  'GET',
);

// 修改测试设备
export const modifyTestDevice = createFetch<any, any>(
  '/boke/deviceTest/modify',
  'POST',
);

// 获取测试设备原因
export const getTestDeviceReason = createFetch<any, any>(
  '/boke/deviceTest/reason',
  'GET',
);

// 重置测试设备
export const resetTestDevice = createFetch<any, any>(
  '/boke/deviceTest/reset',
  'POST',
);

// 获取测试操作结果
export const getTestOperateResult = createFetch<any, any>(
  '/boke/deviceTest/optStatus',
  'GET',
);

