import {http} from '@/utils';
import {BasicObject, PageParams, PageResponse} from '@types';

export interface PromotionListItem {
  buttonName: string;
  buttonLink: string;
  //活动内容
  activityContent?: string;
  activityStartTime?: number;
  activityEndTime?: number;
  activityIcon?: string;
  // 标题
  activityTitle: string;
  activitySubTitle: string;
  titlePosition: number;
  buttonText: string;
  // 跳转url，后台设定
  activityUrl: string;
  activityType?: 'signin' | 'other';
  id: number;
  tagList: BasicObject[];
  amount: number;
  buttonStyle?: number;
}

export function getPromotionList(pageNo: number, tagId: number) {
  return http.post<PageParams, PageResponse<PromotionListItem>>(
    'app/sysActivity/getList',
    {
      pageNo,
      tagId,
    },
  );
}

export interface ActivityTagListItem {
  name: string;
  icon: string;
  id: number;
}

export function getActivityTagList() {
  return http.post<any, ActivityTagListItem[]>(
    'app/sysActivity/getActivityTagList',
  );
}

export function getPromotionDetail(id: number) {
  return http.post<{}, PromotionListItem>(
    `app/sysActivity/getSysActivity/${id}`,
  );
}
// 查看七日列表
export function getSevenDayRewards() {
  return http.post<{}, any>(
    'app/activity/recharge/log/activity/recharge/sevenDayRewards',
  );
}
// 查看复充列表
export function getListRecharge() {
  return http.post<{}, any>('app/activity/recharge/log/listRecharge');
}
// 领取七日连充奖励金额
export function getReceiveSevenDayReward(arr: any) {
  return http.post<{}, any>('app/activity/recharge/log/receiveSevenDayReward', {
    ids: arr,
  });
}
// 查看首充-每日充值图片配置
export function getActivityPromotionImage() {
  return http.post<{}, any>('app/business/ActivitySigninRecord/listImg');
}
// 获取本周签到活动列表
export function getActivityWeekSignInList() {
  return http.post<{}, any>('app/business/ActivitySigninRecord/signinList');
}
// 获取首充列表
export function getActivityRechargeList() {
  return http.post<{}, any>('app/business/ActivitySigninRecord/listRecharge');
}
// 领取新活动奖励金额
export function getActivityReceiveReward(arr: any) {
  return http.post<{}, any>(
    'app/business/ActivitySigninRecord/receiveSevenDayReward',
    {
      ids: arr,
    },
  );
}
