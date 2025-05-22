import {http} from '@/utils';
import {AgentInfo} from '../types';
import {PageResponseProxyNew, SafeAny} from '@/types';
import {SetStateAction} from 'react';
interface TotalUserData {
  pageNo?: number;
  pageSize?: number;
  userPhone: string;
  level: number | string;
}
interface TodayUserData {
  pageNo?: number;
  pageSize?: number;
  todayCommissionRecharge?: SetStateAction<any>;
  todayCommissionInvite?: SetStateAction<any>;
  todayCommissionBet?: SetStateAction<any>;
  todayCommissionDetail?: never[];
}

interface KongArrayProps {
  areaName?: string;
  areaIcon?: string;
}
// 金刚区
export function getInviteKongArea(location?: number) {
  return http.get<null, Array<KongArrayProps>>(
    `app/home/kong/area/${location}`,
  );
}

// 代理信息接口
export function getTotalUsers() {
  return http.post<null, AgentInfo>('app/new/agent/team/info');
}

// 今天佣金信息
export function getTodayCommission(params: TodayUserData) {
  return http.post<TodayUserData, PageResponseProxyNew<SafeAny>>(
    'app/new/agent/today/commission/detail',
    params,
  );
}
// my ratio
export function getMyRatio() {
  return http.post<null, AgentInfo>('app/new/agent/my/ratio');
}
// 团队成员
export function getTotalUser(data: TotalUserData) {
  return http.post<any, any>('app/new/agent/total/users', data);
}
// 历史佣金信息
export function getTotalCommission(data: TotalUserData) {
  return http.post<any, any>('app/new/agent/commission/detail', data);
}
