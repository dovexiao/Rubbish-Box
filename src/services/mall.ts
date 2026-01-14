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

