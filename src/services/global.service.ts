/* eslint-disable prettier/prettier */
import {SafeAny} from '@/types';
import {http, indusWinHttp, sportsHttp} from '@utils';
import globalStore from './global.state';

export interface MessageCountInfo {
  messageTotalCount: number;
  sysMessageCount: number;
  sysUserMessageCount: number;
}

// 这里用来放一些全局要用到的请求

/** 获取刮刮乐令牌 */
export const setScratchAuth = () => {};

/** 获取用户余额 */
export const getBalance = () => {
  return http.post<null, number>('app/user/getBalance');
};

export interface IUserInfo {
  canWithdrawAmount: number; // 可兑现金额
  createTime: number;
  level: number;
  rechargeAmount: number; // 充值金额
  userBalance: number; // 用户总额
  userPhone: string;
  userId: number;
  updateTime: number;
  lastLoginTime: number;
  // 0 不是代理 1 是代理
  isAgent: number;
  // 缺少用户名
  [k: string]: SafeAny;
}

export interface IVipItem {
  amount: number;
  diff: number;
  level: number;
  name: string;
  // 0 已领取 1 未领取
  rewardReceivingStatus: number;
  // 0 未抵达 1 已抵达
  statusReached: number;
  totalPay: number;
  [k: string]: SafeAny;
}

export type IVipItemList = IVipItem[];

export interface IVipConfigItem {
  amount: number;
  level: number;
  spin: number;
  recharge: number;
  [k: string]: SafeAny;
}

export interface MessageCountInfo {
  messageTotalCount: number;
  sysMessageCount: number;
  sysUserMessageCount: number;
}

export interface ReadMessageParams {
  messageId: number;
  messageType: number;
}

export interface SlotegratorStartParams {
  id: string;
  forFun: string;
}

/** 获取用户信息 */
export function postUserInfo() {
  return http.post<null, IUserInfo>('app/user/info');
}

export const noticeCheckOut = () => {
  globalStore.token &&
    indusWinHttp
      .get('iGaming/api/noticeCheckOut')
      .then(() => globalStore.updateAmount.next());
};

/** 获取用户消息未读条数 */
export function getMessageNotReadCount() {
  return http.get<null, MessageCountInfo>('app/userMessage/unReadCount');
}

/** 读取消息
 * @param messageType 1 系统消息 2 用户消息
 */
export function postReadMessage(messageId: number, messageType: 1 | 2) {
  return http.post<ReadMessageParams, null>('app/userMessageStatus/readMsg', {
    messageId,
    messageType,
  });
}

export function getSlotegratorGameStart(gameId: string) {
  return indusWinHttp.get<SlotegratorStartParams, string>(
    '/iGaming/casino/getGamesStart',
    {
      params: {
        id: gameId,
        forFun: 'false',
      },
    },
  );
}

export type IVipConfig = IVipConfigItem[];

export function postVipInfo() {
  return http.post<null, IVipItemList>('app/membershipCard/getMemberCardInfo');
}

export function postVipConfig() {
  return http.post<null, IVipConfig>('app/membershipCard/getConfig');
}

export const getSprotUrl = () => {
  return sportsHttp.get<null, string>('sap/start');
};

export function appBroadcast() {
  return http.post<null, string[]>('app/broadcast/list');
}

export function appEmail() {
  return http.post<null, string>('app/base/official/email');
}
