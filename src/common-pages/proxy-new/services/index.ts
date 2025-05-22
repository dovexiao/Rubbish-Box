import {http} from '@/utils';
import {
  AgentInfo,
  CommissionDetailListItem,
  CommissionDetailParams,
  TeamReportParams,
  TeamReportResult,
  TodayEarningsChart,
  UserCommissionInfo,
  UserCommissionListItem,
  UserCommissionPageParams,
  NewSubordinatesCount,
  commissionRateLevel,
  teamReportObj,
  teamReportListObj,
  AgentRuleData,
  UserContentItem,
  IProxyUserInfo,
  BannerListItem,
} from '../types';
import {PageParams, PageResponse} from '@/types';

// 代理信息接口
export function getAgentInfo() {
  return http.post<null, AgentInfo>('app/agent/getAgentInfo2');
}

// 团队报表
export function getTeamReport(params: TeamReportParams) {
  return http.post<TeamReportParams, TeamReportResult>(
    'app/agent/teamReport',
    params,
  );
}

// 代理佣金明细
export function getCommissionDetail(params: CommissionDetailParams) {
  return http.post<
    CommissionDetailParams,
    PageResponse<CommissionDetailListItem>
  >('app/agent/commissionDetail', params);
}

// 指定用户佣金明细信息
export function getUserCommissionInfo(userId: number) {
  return http.post<{userId: number}, UserCommissionInfo>(
    'app/agent/userCommissionInfo',
    {
      userId,
    },
  );
}

// 获得代理规则数据
export function getAgentRuleData() {
  return http.post<null, AgentRuleData>('app/agent/getAgentRuleData');
}

// 今日新用户列表
export function getTodayNewUserList(params: PageParams) {
  return http.post<PageParams, PageResponse<UserContentItem>>(
    'app/agent/todayNewUser',
    params,
  );
}

// 获取用户信息
export function getUserInfo(userId: number) {
  return http.post<{userId: number}, IProxyUserInfo>('app/agent/getUserInfo', {
    userId,
  });
}

// 指定用户佣金明细
export function getUserCommissionDetail(params: UserCommissionPageParams) {
  return http.post<
    UserCommissionPageParams,
    PageResponse<UserCommissionListItem>
  >('app/agent/userCommissionDetail', params);
}

// 今日收益排行榜
export function getTodayEarningsChart() {
  // return Promise.resolve<TodayEarningsChart>({
  //   userId: 1,
  //   rank: '800',
  //   exceed: '20%',
  //   commissionAmount: '10000',
  //   earningsChartList: [
  //     {
  //       rank: 1,
  //       userId: 10,
  //       headImg: '',
  //       phone: '1565555515',
  //       commissionAmount: '5000',
  //     },
  //     {
  //       rank: 2,
  //       userId: 10,
  //       headImg: '',
  //       phone: '1565555515',
  //       commissionAmount: '5000',
  //     },
  //     {
  //       rank: 3,
  //       userId: 10,
  //       headImg: '',
  //       phone: '1565555515',
  //       commissionAmount: '5000',
  //     },
  //     {
  //       rank: 4,
  //       userId: 10,
  //       headImg: '',
  //       phone: '1565555515',
  //       commissionAmount: '5000',
  //     },
  //     {
  //       rank: 5,
  //       userId: 10,
  //       headImg: '',
  //       phone: '1565555515',
  //       commissionAmount: '5000',
  //     },
  //     {
  //       rank: 6,
  //       userId: 10,
  //       headImg: '',
  //       phone: '1565555515',
  //       commissionAmount: '5000',
  //     },
  //     {
  //       rank: 7,
  //       userId: 10,
  //       headImg: '',
  //       phone: '1565555515',
  //       commissionAmount: '5000',
  //     },
  //     {
  //       rank: 8,
  //       userId: 10,
  //       headImg: '',
  //       phone: '1565555515',
  //       commissionAmount: '5000',
  //     },
  //     {
  //       rank: 9,
  //       userId: 10,
  //       headImg: '',
  //       phone: '1565555515',
  //       commissionAmount: '5000',
  //     },
  //     {
  //       rank: 10,
  //       userId: 10,
  //       headImg: '',
  //       phone: '1565555515',
  //       commissionAmount: '5000',
  //     },
  //   ],
  // });
  return http.post<null, TodayEarningsChart>('app/agent/todayEarningsChart');
}

// 获取新下级数据
export function getNewSubordinatesCount() {
  return http.post<null, NewSubordinatesCount>(
    'app/agent/getNewSubordinatesCount',
  );
}
// 代理佣金比率
export function getCommissionRate(data: commissionRateLevel) {
  return http.post('app/agent/commissionRate', data);
}
//团队报表列表
export function getTeamReportData(data: teamReportObj) {
  return http.post('/app/agent/teamReport', data);
}
//团队报表列表list
export function getTeamReportDataList(data: teamReportListObj) {
  return http.post('/app/agent/teamReportList', data);
}

// banner页
export const getBannerList = (type = 2) => {
  return http.post<{type: number; putPage: number}, BannerListItem[]>(
    'app/banner/manage/list',
    {
      type,
      putPage: 4,
    },
  );
};
//获取用户7天的下注游戏列表
export function getUser7DayGameList(data: {userId: number}) {
  return http.post('/app/agent/getUser7DayGameList', data);
}

export function getProxyHomeRichText() {
  return http.post<
    null,
    {
      activityContent: string;
      activityIcon: string;
      activityTitle: string;
      activityUrl: string;
    }
  >('/app/sysActivity/getSysActivity/1');
}
