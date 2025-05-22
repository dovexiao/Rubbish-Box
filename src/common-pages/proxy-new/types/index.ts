import {PageParams} from '@/types';

interface betBonusRule {
  commissionLevel?: number;
  level?: number;
  tier1?: string;
  tier2?: string;
  tier3?: string;
  tier4?: string;
}
interface currentBonusRule extends betBonusRule {
  type?: string;
}
interface levelUpRule {
  level?: number;
  rechargeAmount?: number;
  levelIcon?: string;
}
export interface inviteListParams {
  inviteAmount: number;
  userAvatar?: string;
}
export interface RatioInfo {
  betBonusRule: betBonusRule[];
  currentBonusRule: currentBonusRule[];
  inviteBonusRule: betBonusRule[];
  levelUpRule: levelUpRule[];
  rechargeBonusRule: betBonusRule[];
  currentLevel: number;
  deadline: number;
  inviteBonus: number;
  teamRecharge: number;
}

export interface AgentInfo {
  inviteList?: inviteListParams[];
  // 代理申请状态：0未申请，1已申请审核中、2申请通过、3申请拒绝
  agentApplyStatus: number;
  // 代理等级
  agentLevel: number;
  // 邀請码
  inviteCode: string;
  registerDate: string;
  todayActiveUserCount: number;
  todayBetAmount: string;
  todayRechargeUserCount: number;
  // 今日佣金金额
  todayCommissionAmount: string;
  todayNewUserCount: number;
  todayRechargeAmount: string;

  totalBetAmount: string;
  totalCommissionAmount: string;
  totalRechargeAmount: string;
  totalUserCount: number;
  totalUsers: number;
  totalCommission: number;
  todayUsers: number;
  todayRecharge: number;
  todayCommission: number;
  yesterdayUsers: number;
  yesterdayRecharge: number;
  yesterdayCommission: number;
  //ratioInfo
  betBonusRule: betBonusRule[];
  currentBonusRule: currentBonusRule[];
  inviteBonusRule: betBonusRule[];
  levelUpRule: levelUpRule[];
  rechargeBonusRule: betBonusRule[];
  currentLevel: number;
  deadline: number;
  inviteBonus: number;
  teamRecharge: number;
  nextLevelAmount?: number;
  todayInviteCount?: any;

  // 用户id（原样展示）
  userId: number;
  // 用户手机号
  userPhone: string;
  // 用户头像
  userAvatar?: string;
}

export interface NewSubordinatesCount {
  userId: number; // 用户ID
  newSubordinatesCount: number; // 新下属数量
}
export interface commissionRateLevel {
  level: number;
}
export interface teamReportObj {
  startDate: number | string | null;
  endDate: number | string | null;
}
export interface teamReportListObj extends teamReportObj {
  leve: number;
  pageNo: number;
  pageSize: number;
}
export interface TeamReportParams {
  // 等级：1、2、3、4 0表示全部
  grade: number;
  // 日期，格式：20230822
  date?: number;
}

export interface TeamReportResult {
  // 下属用户数
  subordinateUserCount: number;
  commissionAmount: string;
  betCommissionAmount: string;
  rechargeCommissionAmount: string;
}

export interface SubordinateParams extends PageParams {
  // 类型：1今天、2昨天、3本月
  type: number;
}

export interface SubordinateItem {
  // 用户ID
  userId: number;
  // 手机号
  userPhone: string;
  // 用户等级
  agentUserLevel: number;
  // 注册时间
  registerTime: string;
  // 注册年月，格式202310
  registerYearMonth: number;

  // 投注金额
  betAmount: string;
  // 充值金额
  rechargeAmount: string;
  // 投注佣金金额
  betCommissionAmount: string;
  // 充值佣金金额
  rechargeCommissionAmount: string;
  // 总金额
  commissionAmount: string;
}

export interface CommissionDetailParams extends PageParams {
  // 手机号
  phone?: string;
  // 等级：1、2、3、4  0表示全部
  grade: number;
}

export interface CommissionDetailListItem {
  // 用户ID
  userId: number;
  // 手机号
  userPhone: string;
  activeDay: string;
  // 总金额
  commissionAmount: string;
}

export interface UserCommissionInfo {
  // 用户ID
  userId: number;
  // 脱敏手机号
  userPhone: string;
  // 用户等级
  agentUserLevel: number;
  // 注册时间
  registerTime: string;
  // 投注佣金金额
  betCommissionAmount: string;
  // 充值金额
  rechargeCommissionAmount: string;
  // 总金额
  commissionAmount: string;
}

export interface UserCommissionPageParams extends PageParams {
  userId: number;
  startDate: number | null;
  endDate: number | null;
  commissionSort: number;
}

export interface UserCommissionListItem {
  // 创建时间
  createTime: string;
  // 佣金类型
  type: number;
  // 佣金类型名称
  typeName: string;
  // 投注金额或充值金额
  amount: string;
  // 投注佣金金额或充值佣金金额
  commissionAmount: string;
  gameName: string;
  rebate: string;
  result: string;
}

export interface TodayEarningsChartItemRes {
  rank: number; // 排名名次
  userId: number; // 用户ID
  headImg: string; // 头像图片
  phone: string; // 脱敏后手机号
  commissionAmount: string; // 佣金金额
  commission?: number | string; // 佣金金额
  commissionType?: number | string;
  level?: number | string;
  status?: number | string;
  userPhone?: string;
}

export interface TodayEarningsChart {
  userId: number; // 用户ID
  rank: string; // 当前代理排名名次 超过99线上99+
  exceed: string; // 当前代理超过多少代理，例子20%
  commissionAmount: string; // 佣金金額
  earningsChartList: TodayEarningsChartItemRes[]; // 收益排行榜列表
}

export interface AgentRuleLevelItem {
  level: number;
  teamBetting: string;
  teamMember: number;
  teamRecharge: string;
}

export interface CommissionItem {
  commissionLevel: number;
  tier1: string;
  tier2: string;
  tier3: string;
  tier4: string;
  tier1Max: string;
  tier1Min: string;
  tier2Max: string;
  tier2Min: string;
  tier3Max: string;
  tier3Min: string;
  tier4Max: string;
  tier4Min: string;
}

export interface AgentRuleData {
  agentLevelList: AgentRuleLevelItem[];
  casinoCommissionList: CommissionItem[];
  lotteryCommissionList: CommissionItem[];
  refundList: CommissionItem[];
  scratchCommissionList: CommissionItem[];
  sportCommissionList: CommissionItem[];
}

export interface UserContentItem {
  activeDay: string;
  betCommissionAmount: number;
  commissionAmount: number;
  rechargeCommissionAmount: number;
  userId: number;
  userPhone: string;
}

export interface IProxyUserInfo {
  activeDay: string;
  agentLevel: number;
  betAmount: string;
  betUserCount: number;
  commissionAmount: string;
  newUserCount: number;
  rechargeAmount: string;
  registerDate: string;
  totalUserCount: number;
  userAvatar: string;
  userId: number;
  userPhone: string;
  wonLostAmount: string;
  contactPhone: string;
  rechargeUserCount: number;
}

export type BannerListItem = {
  bannerId: number;
  bannerImg: string;
  skipLinks: string;
  title: string;
};
