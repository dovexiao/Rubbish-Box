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

export interface WithdrawRule {
  /** 最低金额 */
  minAmount: number;
  /** 提现比例 */
  per: string;
  /** 提现金额 */
  withAmount: number;
  /** 提现次数 */
  withCount: number;
}

export const getBankList = () => {
  return http.post<null, CardListItemType[]>('app/card/info');
};

export const onWithdraw = (data: {cardId: string; price: number}) => {
  return http.post('app/pay/paid', data);
};

/**
 * 获取提现规则说明
 */
export const getWithdrawRule = () => {
  return http.post<null, WithdrawRule>('app/user/paidrule');
};

/**
 * 创建分享记录
 */
export const createShareRecord = (deviceId: string, deviceType: string) => {
  return http.post<{}, any>('app/user/share/record/create', {
    shareDeviceId: deviceId,
    shareDeviceType: deviceType,
  });
}

/**
 * 获取分享倒计时
 */
export const getShareRecordCountdown = () => {
  return http.post<{}, any>('app/user/share/record/countdown');
}