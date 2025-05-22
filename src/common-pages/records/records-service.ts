/* eslint-disable prettier/prettier */
import {http} from '@/utils';

export type WithdrawLogItem = {
  remark: string;
  bankName: string;
  createTime: number;
  orderNo: string;
  paidAmount: number;
  respCode: 0 | 1 | 2 | 3;
  reward: number;
  updateTime: number;
  userCardNumber: string;
  /** 后端不会返回,前端通过respCode转 */
  status: 'PROCESS' | 'COMPLETE' | 'FAILED' | 'REVIEW';
  /** 后端不会返回,前端占位 */
  price?: number;
  /** 后端不会返回,前端占位 */
  balance?: number;
  /** 后端不会返回,前端占位 */
  appDate: number;
  withdrawFeeRate: number;
};
const getWithdrawLogs = (pageNo: number, pageSize: number) => {
  return http.post<null, WithdrawLogItem[]>('app/pay/paid/log', {
    pageNo,
    pageSize,
  });
};

export type RechargeLogItem = {
  channelName: string;
  createTime: number;
  orderNo: string;
  paidAmount: number;
  reward: number;
  status: 'PROCESS' | 'COMPLETE';
  /** 后端不会返回,前端占位 */
  price?: number;
  /** 后端不会返回,前端占位 */
  balance?: number;
  /** 后端不会返回,前端占位 */
  appDate: number;
};
const getRechargeLogs = (pageNo: number, pageSize: number) => {
  return http.post<null, RechargeLogItem[]>('app/pay/recharge/log', {
    pageNo,
    pageSize,
  });
};

export type TransferLogItem = {
  appDate: number;
  balance: number;
  changeType: number;
  gameName: string;
  iconUrl: string;
  order: string;
  payType: number;
  payTypeName: string;
  price: number;
  reward: number;
  /** 后端不会返回,前端占位 */
  status?: 'PROCESS' | 'COMPLETE' | 'FAILED' | 'REVIEW';
  /** 后端不会返回,前端占位 */
  paidAmount?: number;
  /** 后端不会返回,前端占位 */
  createTime?: number;
};
const getTransferLogs = (pageNo: number, pageSize: number) => {
  return http.post<null, TransferLogItem[]>('/app/user/balance', {
    changeDesc: 20,
    pageNo,
    pageSize,
  });
};

export {getWithdrawLogs, getRechargeLogs, getTransferLogs};
