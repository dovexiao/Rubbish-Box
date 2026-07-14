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

//  解除绑定验证码校验
export const unbindSmsCheck = createFetch<any, any>(
  '/boke/userLock/unbindSmsValid',
  'POST',
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

// 复位升锁
export const resetRiseLock = createFetch<any, any>(
  '/boke/userLock/setting/resetTime',
  'POST',
);

// 复位升锁结果
export const resetRiseLockResult = createFetch<any, any>(
  '/boke/userLock/setting/resetTimeRes',
  'GET',
);

// 获取设备钥匙列表
export const getDeviceKeyList = createFetch<any, any>(
  '/boke/userLock/key/list',
  'GET',
);

// 获取设备钥匙响应
export const getDeviceKeyResponse = createFetch<any, any>(
  '/boke/userLock/key/lastResponse',
  'GET',
);

// 获取设备测试钥匙响应
export const getTestDeviceKeyResponse = createFetch<any, any>(
  '/boke/deviceTest/key/lastResponse',
  'GET',
);
// 解绑钥匙短信
export const unbindKeySms = createFetch<any, any>(
  '/boke/userLock/key/unbindSms',
  'GET',
);

// 解绑钥匙
export const unbindKey = createFetch<any, any>(
  '/boke/userLock/key/unbind',
  'POST',
);

// 解绑钥匙测试
export const unbindKeyTest = createFetch<any, any>(
  '/boke/deviceTest/key/unbind',
  'POST',
);

//解绑钥匙结果
export const unbindKeyResult = createFetch<any, any>(
  '/boke/userLock/key/unbindRes',
  'POST',
);

// 解绑钥匙测试结果
export const unbindKeyTestResult = createFetch<any, any>(
  '/boke/deviceTest/key/unbindRes',
  'POST',
);

// 开始配对
export const startPairing = createFetch<any, any>(
  '/boke/userLock/key/startPair',
  'POST',
);

// 开始配对结果
export const startPairingResult = createFetch<any, any>(
  '/boke/userLock/key/startPairRes',
  'POST',
);

// 绑定钥匙
export const bindKey = createFetch<any, any>('/boke/userLock/key/bind', 'POST');

//绑定钥匙结果
export const bindKeyResult = createFetch<any, any>(
  '/boke/userLock/key/bindRes',
  'POST',
);

// 开始配对
export const testStartPairing = createFetch<any, any>(
  '/boke/deviceTest/key/startPair',
  'POST',
);

// 开始配对结果
export const testStartPairingResult = createFetch<any, any>(
  '/boke/deviceTest/key/startPairRes',
  'POST',
);

// 绑定钥匙
export const testBindKey = createFetch<any, any>(
  '/boke/deviceTest/key/bind',
  'POST',
);

//绑定钥匙结果
export const testBindKeyResult = createFetch<any, any>(
  '/boke/deviceTest/key/bindRes',
  'POST',
);

export const getDeviceTestKeyResponse = createFetch<any, any>(
  '/boke/deviceTest/key/lastResponse',
  'GET',
);

// 全部删除钥匙
export const allDeleteKey = createFetch<any, any>(
  '/boke/userLock/key/unbindAll',
  'POST',
);

// 全部删除测试钥匙
export const testAllDeleteKey = createFetch<any, any>(
  '/boke/deviceTest/key/unbindAll',
  'POST',
);

// 全部删除钥匙结果
export const allDeleteKeyResult = createFetch<any, any>(
  '/boke/userLock/key/unbindAllRes',
  'POST',
);

// 全部删除测试钥匙结果
export const testAllDeleteKeyResult = createFetch<any, any>(
  '/boke/deviceTest/key/unbindAllRes',
  'POST',
);

// 校验sn
export const checkSn = createFetch<any, any>(
  '/boke/userLock/gateway/group/bind',
  'POST',
);

// 网关变更
export const gatewayChange = createFetch<any, any>(
  '/boke/userLock/update/gateway/group',
  'POST',
);
