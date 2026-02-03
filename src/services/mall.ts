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
export const getPickupCodeDetail = createFetch('/boke/pickupCode/imgDetail', 'POST')

// 提货码确认提货
export const confirmPickupCode = createFetch('/boke/pickupCode/confirm', 'POST')

// 提货码填写收货地址
export const savePickupCodeAddress = createFetch('/boke/pickupCode/address', 'POST')

// 提货记录列表
export const getPickupCodeRecordList = createFetch('/boke/pickupCode/record/list', 'POST')

// 提货记录详情
export const getPickupCodeRecordDetail = createFetch('/boke/pickupCode/record/detail', 'POST')


