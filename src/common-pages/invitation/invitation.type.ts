import {PageParams} from '@/types';

export interface RecordListParams extends PageParams {
  // 格式 YYYY-MM-DD
  startTime: string;
  // 格式 YYYY-MM-DD
  endTime: string;
  // 排序
  sort?: 'asc' | 'desc' | null;
}

export interface UserDetailListParams extends PageParams {
  inviteTaskUserId: number;
}

export interface UserListItem {
  bonusAmount: number;
  completedNumber: number;
  depositAmount: number;
  inviteNumber: number;
  invitedNumber: number;
  inviteTaskUserId: number;
  level: number;
  status: number;
}

export interface UserTotal {
  bonusAmountTotal: number;
  invitedNumberTotal: number;
}

export interface RecordListItem {
  userAvatar?: string;
  createTime: number;
  inviteTaskUserDetailId?: number;
  inviteUserId: number;
  inviteUserPhone: string;
  status: number;
}
