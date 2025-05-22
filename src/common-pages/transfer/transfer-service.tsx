import {http} from '@/utils';

export const onTransfer = (price: number) => {
  return http.post('app/pay/withdrawal/free', {price});
};
