import {SafeAny} from '@/types';
import {http} from '@/utils';

export interface TabType {
  type: string;
  typeName: string;
}

export const getTabs = () => {
  return http.post<null, TabType[]>('app/user/wallet/detail/types');
  // return http.post<null, TabType[]>('app/user/balance/types');
};

export const getList = (data: {
  pageNo: number | 1;
  pageSize?: number | 10;
  changeDesc: string;
  queryDate?: string;
}) => {
  // return http.post<null, SafeAny[]>('app/user/wallet/detail/list', data);
  // return http.post<null, SafeAny[]>('app/user/balance', data);

  return http.post<null, SafeAny[]>('app/user/wallet/detail/daily/list', data);
};
