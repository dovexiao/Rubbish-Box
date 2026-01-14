import { createFetch } from '@/utils/request';

/**
 * 订单相关接口
 */

// 获取订单列表
export const getOrderList = createFetch<any, any>(
  '/boke/mall/order/userOrderList',
  'POST',
);

// 创建订单
export const createOrder = createFetch<any, any>(
  '/boke/mall/order/create',
  'POST',
);

// 获取订单详情
export const getOrderDetail = createFetch<any, any>(
  '/boke/mall/order/userOrderDetail',
  'GET',
);

// 订单支付
export const postOrderPay = createFetch<any, any>(
  '/boke/custom/trade/pay',
  'POST',
);

// 获取支付结果
export const getPayResult = createFetch<any, any>(
  '/boke/custom/trade/query',
  'POST',
);

