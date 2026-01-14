import { createFetch } from '@/utils/request';

/**
 * 设备信息相关接口
 */

// 更新名称
export const updateName = createFetch<any, any>(
  '/boke/userLock/updateName',
  'POST',
);

// 获取设备信息
export const getInfo = createFetch<any, any>(
  '/boke/userLock/device/info',
  'POST',
);

// 修改二维码扫描
export const changeQrCodeScan = createFetch<any, any>(
  '/boke/userLock/changeQrCodeScan',
  'POST',
);

// 修改二维码
export const changeQrCode = createFetch<any, any>(
  '/boke/userLock/changeQrCode',
  'POST',
);

// 获取版本记录
export const getVersionRecords = createFetch<any, any>(
  '/boke/userLock/versionRecords',
  'POST',
);

// 解绑短信
export const unbindSms = createFetch<any, any>(
  '/boke/userLock/unbindSms',
  'GET',
);

// 解绑
export const unbind = createFetch<any, any>('/boke/userLock/unbind', 'POST');

// 获取更新信息
export const getUpdateInfo = createFetch<any, any>(
  '/boke/user/user/version/update',
  'GET',
);

// 最新版本
export const lastVersion = createFetch<any, any>(
  '/boke/userLock/lastVersion',
  'GET',
);

