import { createFetch } from '@/utils/request';

/**
 * 组合设备相关接口
 */

// 创建组合设备选择列表
export const groupChooseList = createFetch<any, any>(
  '/boke/userLock/groupChooseList',
  'POST',
);

// 保存组合
export const saveGroup = createFetch<any, any>(
  '/boke/userLock/saveGroup',
  'POST',
);

// 组合子列表
export const groupSubList = createFetch<any, any>(
  '/boke/userLock/groupSubList',
  'POST',
);

// 成员列表
export const memberList = createFetch<any, any>(
  '/boke/userLock/member/list',
  'POST',
);

// 成员编辑
export const memberEdit = createFetch<any, any>(
  '/boke/userLock/member/save',
  'POST',
);

// 成员删除
export const memberDelete = createFetch<any, any>(
  '/boke/userLock/member/delete',
  'POST',
);

// 设备删除
export const deviceDelete = createFetch<any, any>(
  '/boke/userLock/deleteGroup',
  'POST',
);

// 获取默认组合名称
export const defaultName = createFetch<any, any>(
  '/boke/userLock/group/defaultName',
  'GET',
);

