import { http } from "@/utils/request";

// 获取本周签到活动列表
export function getActivityWeekSignInList() {
  return http.post<{}, any>('app/business/ActivitySigninRecord/signinList');
}
// 领取新活动奖励金额
export function getActivityReceiveReward(arr: any) {
  return http.post<{}, any>(
    'app/business/ActivitySigninRecord/receiveSigninReward',
    {
      ids: arr,
    },
  );
}