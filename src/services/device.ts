import { createFetch } from '@/utils/request';

/**
 * 设备相关接口
 */

// 获取锁信息
export const getLockInfo = createFetch<any, any>(
  '/boke/userLock/detail',
  'GET',
);

// 操作锁
export const operateLock = createFetch<any, any>(
  '/boke/userLock/device/lockOpt',
  'POST',
);

// 获取操作结果
export const getOperateResult = createFetch<any, any>(
  '/boke/userLock/device/optStatus',
  'GET',
);

// 组合设备轮询接口
export const getGroupOperateResult = createFetch<any, any>(
  '/boke/userLock/device/group/optStatus',
  'GET',
);

// 操作蜂鸣器
export const operateBuzzing = createFetch<any, any>(
  '/boke/userLock/device/chirp',
  'POST',
);

// 获取锁设备列表
export const getLockDeviceList = createFetch<any, any>(
  '/boke/userLock/list',
  'POST',
);

// 获取锁列表（单个）
export const getLockList = createFetch<any, any>(
  '/boke/userLock/list/single',
  'POST',
);

// 操作锁盖
export const operateLockCover = createFetch<any, any>(
  '/boke/userLock/setting/openCover',
  'POST',
);

// 修改锁离开时间
export const modifyLockLeaveTime = createFetch<any, any>(
  '/boke/userLock/setting/leaveUpTime',
  'POST',
);

// 修改锁电池警告
export const modifyLockWarnBattery = createFetch<any, any>(
  '/boke/userLock/setting/warnBattery',
  'POST',
);

// 修改锁碰撞蜂鸣器
export const modifyLockCrashBuzzer = createFetch<any, any>(
  '/boke/userLock/setting/crashBuzzer',
  'POST',
);

// 获取操作记录列表
export const getRiceInfoList = createFetch<any, any>(
  '/boke/userLock/optRecords',
  'POST',
);

// 申请记录详情
export const lockApplyDetail = createFetch<any, any>(
  '/boke/apply/detail',
  'GET',
);

// 申请记录列表
export const lockApplyList = createFetch<any, any>('/boke/apply/list', 'POST');

// 审核申请
export const lockApplyAudit = createFetch<any, any>(
  '/boke/apply/audit',
  'POST',
);
