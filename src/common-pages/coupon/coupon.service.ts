import {PageParams, PageResponse} from '@/types';
import {http} from '@/utils';

export interface CouponItem {
  couponAmount: number;
  expireTime: number;
  id: number;
  rechargeAmount: number;
  status: number; // 状态 1=使用 2=未使用 3=过期
}

export function getCouponListService(status: number) {
  return http.post<PageParams & {status: number}, PageResponse<CouponItem>>(
    'app/coupon/list',
    {
      pageNo: 1,
      pageSize: 100,
      status: status,
    },
  );
}
