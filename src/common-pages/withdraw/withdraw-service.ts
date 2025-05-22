import {http} from '@/utils';

export interface CardListItemType {
  accountName?: string;
  accountNumber?: string | '';
  ifscCode?: string;
  upiId?: string;
  userEmail?: string;
  id?: string;
  img?: string;
}

export const getBankList = () => {
  return http.post<null, CardListItemType[]>('app/card/info');
};

export const onWithdraw = (data: {cardId: string; price: number}) => {
  return http.post('app/pay/paid', data);
};
