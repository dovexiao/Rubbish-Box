import {SafeAny} from '@/types';
import {http} from '@/utils';
export interface BalanceListItem {
  /** 到账金额 */
  balance: number;
  createTime: number | Date | string;
  /** 赠送金额 */
  giveBalance: number;
  icon: string;
  id: number;
  /** 支付金额 */
  money: number;
  packageId: number;
  sort: number;
  status: number;
}

export interface IncomeModel {
  /**
   * 金额充值ID
   */
  balanceId: string | 0;
  /**
   * 支付方式ID，目前默认UPI 传2
   */
  payTypeId: string;
  /**
   * 自定义金额，自定义金额 则balanceId传0
   */
  rechargeBalance: string | 0;

  // UPI: PAYTM_UPI_ONLY_PAYTM
  payTag: string;

  couponRecordId: number;
}

export interface IncomeResModel {
  orderNo: string;
  packageId: number;
  upiId: string;
}

export interface PayCallbackModel {
  /**
   *  订单号
   */
  orderNo: string;
  /**
   *  支付结果: 1
   */
  tradeResult: string;
  /**
   * URT
   */
  approvalUrt: string;
}

export interface PayMethod {
  /**
   *  id
   */
  id: number;
  /**
   *  图标
   */
  payIcon: string;
  /**
   *  支付名称
   */
  payName: string;
  /**
   *  支付类别
   */
  payTag: string;
  maxAmount: number;
  minAmount: number;
}

export const getBalanceList = () => {
  return http.post<null, BalanceListItem[]>('app/pay/balance/list');
};

export const goIncome = (incomeData: IncomeModel) => {
  // return http.post<IncomeModel, string | IncomeResModel>(
  //   'app/pay/income',
  //   incomeData,
  // );
  /* 2025 3 8 替换新接口 */
  return http.post<IncomeModel, string | IncomeResModel>(
    'app/pay/new/deposit',
    incomeData,
  );
};

export const getPayMethod = () => {
  /* 2025 3 8 替换新接口 */
  return http.post<null, PayMethod[]>('app/pay/deposit/channel');
  // return http.post<null, PayMethod[]>('app/pay/type/list');
};

export const paySuccess = (payCallback: PayCallbackModel) => {
  return http.post<SafeAny>('app/callback/upi/result', payCallback);
};
