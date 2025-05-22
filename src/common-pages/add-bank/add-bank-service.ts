import {http} from '@/utils';

export interface BankInfo {
  id?: string;
  cardName: string;
  cardNumber: string;
  ifsCode: string;
  email?: string;
  upiId?: string;
  smsCode?: string;
}

export const onAddBank = (data: BankInfo) => {
  return http.post('app/card/add', data);
};

export const updateBank = (data: BankInfo) => {
  return http.post('app/card/update', data);
};

export const delBank = (data: {id: string}) => {
  return http.post('app/card/del', data);
};
