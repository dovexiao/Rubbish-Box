import { createFetch } from '@/utils/request';

/**
 * 设置相关接口
 */




// 删除地址
export const deleteAddress = createFetch<any, any>(
  '/boke/user/address/delete',
  'GET',
);

// 保存或更新地址
export const saveOrUpdate = createFetch<any, any>(
  '/boke/user/address/saveOrUpdate',
  'POST',
);

// 获取地址详情
export const getDetail = createFetch<any, any>(
  '/boke/user/address/detail',
  'GET',
);

// 文本解析
export const getTextParsing = createFetch<any, any>(
  '/boke/user/address/textParsing',
  'POST',
);

