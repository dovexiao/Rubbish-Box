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

export interface BalanceListParams {
  /** 是否显示金额为300的项 - 显示: 1或者不传; 不显示: 2*/
  remark?: string;
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

  // 是否同意条款
  waterCrossingSign: number;
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
  /** 支付类型ID - 有多个，逗号分隔 */
  remarks: string;
}

export interface RechargeTypeListItem {
  /** ID */
  id: string;
  maxAmount: number;
  minAmount: number;
  /** 支付名称 */
  payName: string;
  /** 支付标签 */
  payTag: string;
  /** 支付图标 */
  payIcon?: string;
}

export interface PayMethodV2Params {
  modeId: string;
}

export const getBalanceList = (params?: BalanceListParams) => {
  return http.post<null, BalanceListItem[]>('app/pay/balance/list', params);
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

export interface AdjustParams {
  First_deposit?: number | string;
  Deposit?: number | string;
  Recharge?: number | string;
}
export const getAdjustParams = () => {
  return http.post<AdjustParams>('app/pay/adjust/notice');
};

// 查看用户充值类型展示
export const getUserRechargeType = () => {
  return http.post<null, number>(
    'app/business/ActivitySigninRecord/payImgUser',
  );
};

/**
 * 获取充值类型
 */
export const getRechargeTypeList = () => {
  return http.post<SafeAny, RechargeTypeListItem[]>('app/pay/type/list02');
};

/**
 * 获取支付通道
 *
 * @param PayMethodV2Params
 */
export const getPayMethodV2 = (params: PayMethodV2Params) => {
  return http.post<SafeAny, PayMethod[]>('app/pay/deposit/channel02', params);
};
