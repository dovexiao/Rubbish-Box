import { createFetch } from '@/utils/request';

/**
 * 商城相关接口
 */

// 获取商品列表
export const getGoodsList = createFetch<any, any>(
  '/boke/mall/product/list',
  'POST',
);

// 获取商品详情
export const getGoodsDetail = createFetch<any, any>(
  '/boke/mall/product/detail',
  'GET',
);

// 提货码详情
export const getPickupCodeDetail = createFetch(
  '/boke/pickupCode/imgDetail',
  'POST',
);

// 提货码确认提货
export const confirmPickupCode = createFetch(
  '/boke/pickupCode/confirm',
  'POST',
);

// 提货码填写收货地址
export const savePickupCodeAddress = createFetch(
  '/boke/pickupCode/address',
  'POST',
);

// 提货记录列表
export const getPickupCodeRecordList = createFetch(
  '/boke/pickupCode/record/list',
  'POST',
);

// 提货记录详情
export const getPickupCodeRecordDetail = createFetch(
  '/boke/pickupCode/record/detail',
  'POST',
);

// 计费模板列表
export const getFeeTemplateList = createFetch('/boke/fee/list', 'POST');

// 新增/编辑计费模板
export const saveFeeTemplate = createFetch('/boke/fee/save', 'POST');

// 删除计费模板
export const deleteFeeTemplate = createFetch('/boke/fee/del', 'POST');

// 设备收费规则删除
export const removeRcvPaymentRule = createFetch(
  '/boke/userLock/chargeRule/delete',
  'POST',
);

// 提货码图片识别
export const ocrPickupCode = createFetch('/boke/pickupCode/ocr', 'GET');
