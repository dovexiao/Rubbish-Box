import {SafeAny} from '@types';
import {http} from '@utils';

export interface IVipItem {
  amount: number;
  diff: number;
  level: number;
  name: string;
  rewardReceivingStatus: number;
  statusReached: number;
  totalPay: number;
  [k: string]: SafeAny;
}

export type IVipItemList = IVipItem[];

export interface IUnloginVipItem {
  amount: number;
  level: number;
  [k: string]: SafeAny;
}

interface GiftAdmountData {
  amount?: number;
  type?: number;
  buttonText?: string;
  couponImg?: string;
  routing?: string;
  title?: string;
}
export type IUnloginVipItemList = IUnloginVipItem[];

export function postVipInfo() {
  return http.post<null, IVipItemList>('app/membershipCard/getMemberCardInfo');
}

export function postUnloginVipInfo() {
  return http.post<null, IUnloginVipItemList>('app/membershipCard/getConfig');
}

export const getGiftCodeAmount = (giftCode: string) => {
  return http.post<null, GiftAdmountData>(
    `app/red/packets/receive/${giftCode}`,
  );
};
