import {PageParams, PageResponse} from '@/types';
import {http} from '@/utils';

export interface RecordParams extends PageParams {
  startDate?: string;
  endDate?: string;
  receiveStatus?: number;
}

export interface RecordItem {
  betAmount: number;
  betDate: string;
  createTime: number;
  id: number;
  rebateAmount: number;
  receiveStatus: number;
  updateTime: number;
  userId: number;
}

export function getRecord(params: RecordParams) {
  return http.post<RecordParams, PageResponse<RecordItem>>(
    'app/bet/record/getRecordV2',
    params,
  );
}

export function doReceive(id: number) {
  return http.get('app/bet/record/updateStatus', {
    params: {id},
  });
}
