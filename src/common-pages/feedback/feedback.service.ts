import {PageParams} from '@/types';
import {http} from '@/utils';

export interface SubmitFeedBackParams {
  messageContent: string;
  messageImgs?: string;
}

export function submitFeedBackService(data: SubmitFeedBackParams) {
  return http.post<any, any>('app/message/board/feedback', {
    messageContent: data?.messageContent,
    messageImgs: data?.messageImgs || '',
  });
}

export function getFeedBackUnReadCount() {
  return http.post<any, any>('app/message/board/unread/messages');
}

export interface FeedBackRecordItem {
  messageContent: string;
  messageImg: string;
  messageTime: string;
  systemMessage?: string;
}

export function getFeedBackRecordListService(data: PageParams) {
  return http.post<PageParams, any>('app/message/board/list', data);
}
