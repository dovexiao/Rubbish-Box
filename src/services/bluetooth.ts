import { createFetch } from '@/utils/request';

/**
 * 蓝牙相关接口
 */

// 获取加密key
export const getEncryptKey = createFetch<any, any>(
  '/boke/userLock/setting/bluetooth',
  'POST',
);

// 蓝牙近身升降开启结果
export const getBluetoothStatus = createFetch<any, any>(
  '/boke/userLock/setting/bluetooth/status',
  'GET',
);

// 获取蓝牙PIN码
export const getBluetoothPin = createFetch<any, any>(
  '/boke/userLock/getting/pin',
  'GET',
);

// 设置蓝牙PIN码
export const settingBluetoothPin = createFetch<any, any>(
  '/boke/userLock/setting/pin',
  'POST',
);

// 切换模式校验
export const checkBluetoothMode = createFetch<any, any>(
  '/boke/userLock/checkModeSwitch',
  'POST',
);

// 重置pin
export const resetBluetoothPin = createFetch<any, any>(
  '/boke/userLock/reset/pin',
  'POST',
);

// 切换模式
export const switchBluetoothMode = createFetch<any, any>(
  '/boke/userLock/switchMode',
  'POST',
);

// 切换模式结果
export const switchBluetoothModeResult = createFetch<any, any>(
  '/boke/userLock/switchModeRes',
  'POST',
);

// 蓝牙近身打开
export const openBluetoothProximity = createFetch<any, any>(
  '/boke/userLock/open/bluetooth',
  'POST',
);

