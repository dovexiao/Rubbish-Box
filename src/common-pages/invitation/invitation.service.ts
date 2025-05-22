import {http} from '@/utils';
import {
  RecordListItem,
  RecordListParams,
  UserDetailListParams,
  UserListItem,
  UserTotal,
} from './invitation.type';
import {PageResponse, SafeAny} from '@/types';
// 获取当前用户邀请任务列表
export function getUserList() {
  return http.get<null, UserListItem[]>('app/inviteTask/getUserList');
}

// 获取当前用户邀请记录列表
export function getRecordList(params: RecordListParams) {
  return http.post<RecordListParams, PageResponse<SafeAny>>(
    'app/inviteTask/getRecordList',
    params,
  );
}

// 获取任务详细用户数据列表
export function getTaskDetailList(params: UserDetailListParams) {
  return http.post<UserDetailListParams, PageResponse<RecordListItem>>(
    'app/inviteTask/getTaskDetailList',
    params,
  );
}

// 获取当前用户邀请任务人数和奖金总数
export function getUserTotal() {
  return http.get<null, UserTotal>('app/inviteTask/getUserTotal');
}
