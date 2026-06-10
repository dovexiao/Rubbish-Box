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

// 获取共享地锁订单列表
export const getLockOrderList = createFetch<any, any>(
  '/boke/lock/order/list',
  'POST',
);

// 获取共享地锁订单详情
export const getLockOrderDetail = createFetch<any, any>(
  '/boke/lock/order/detail',
  'POST',
);

// 用户发起售后退款
export const postUserAfsRefund = createFetch<any, any>(
  '/boke/lock/order/afsRefund',
  'POST',
);

// 商户处理售后退款
export const postMerchantDealRefund = createFetch<any, any>(
  '/boke/lock/order/dealRefund',
  'POST',
);

// 我的订单-退款发起记录列表
export const getOrderRefundApplyList = createFetch<any, any>(
  '/boke/lock/order/refund/list',
  'POST',
);

// 我的订单-售后小红点数量
export const getAfterSaleRedDotCount = createFetch<any, any>(
  '/boke/lock/order/afterSaleRedDotCount',
  'GET',
);
