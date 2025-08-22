import {http} from '@/utils';

export interface PagerParams {
  pageNo?: number;
  pageSize?: number;
}
export interface RankingItem {
  prizeAmount: string;
  userPhone: number;
}

export type RankingList = RankingItem[];

export interface SpinOrderItem {
  betAmount: string;
  prizeAmount: string;
}

export type SpinOrderList = SpinOrderItem[];

export interface OrderCreateParams {
  isDemo: number;
  count: number;
  betAmount: number;
}

export interface PrizeInfo {
  prizeIndex: number;
  prizeAmount: string;
}

export interface SpinConfig {
  image: string;
  batchCount: number;
  myFree?: number;
  singleAmount: number;
}

export const postRankingList = () => {
  return http.post<null, RankingList>('app/turntable/order/ranking/list');
};

export const postSpinOrderList = (params: PagerParams) => {
  return http.post<PagerParams, SpinOrderList>(
    'app/turntable/order/list',
    params,
  );
};

export const postSpinOrderCreate = (count: number, basePrice: number = 10) => {
  return http.post<OrderCreateParams, PrizeInfo>('app/turntable/order/create', {
    isDemo: 1,
    count,
    betAmount: basePrice * count,
  });
};

export const postSpinConfig = (hasToken: boolean) => {
  if (hasToken) {
    return http.post<null, any>('app/turntable/config/getConfig');
  }
  return http.post<null, SpinConfig>('app/turntable/config/notToken/getConfig');
};
