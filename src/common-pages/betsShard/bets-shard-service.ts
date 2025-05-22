import {http} from '@/utils';
import {AxiosRequestConfig} from 'axios';

export interface BankInfo extends AxiosRequestConfig<any> {
  packageId: number;
  userId: number;
}
export interface OrderInfo extends AxiosRequestConfig<any> {
  packageId: number;
  userId: number;
  gameCode: string;
  issNo: string;
  yearMonth: number;
  orderGroup: string;
}

export const getUserInfo = (params: BankInfo) => {
  return http.get(
    'app/share/getUserInfo?packageId=' +
      params?.packageId +
      '&userId=' +
      params?.userId,
  );
};
export const getShareOrder = (data: OrderInfo) => {
  return http.post('app/share/getShareOrder', data);
};
