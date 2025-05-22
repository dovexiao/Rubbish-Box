import {PageParams, PageResponse} from '@/types';
import {http} from '@utils';

export interface NotificationItem {
  buttonLink?: string;
  buttonName?: string;
  /** 创建时间 */
  createTime: string;
  id: number;
  /** 是否已读 0未读 1已读 */
  ifRead: number;
  /** 图标 */
  messageIcon: string;
  /** 标题 */
  messageTitle: string;
  /** 发送时间 */
  sendTime: number;
  status: number;
  messageContent: string;
  messageContentOverview: string;
  messageType: number;
}
/**
 * 消息类型 1 系统消息 2 用户消息
 */
export type MessageType = 1 | 2;

export function postUserMessageList(pageNo: number) {
  return http.post<PageParams, PageResponse<NotificationItem>>(
    // 'app/userMessage/getList',
    'app/userMessage/new/getList',
    {
      pageNo,
    },
  );
}
export function delMessageInfo(id: number) {
  return http.post<{id: number}, any>('app/userMessage/delete', {
    id: id,
  });
}
export function postSystemMessageList(pageNo: number) {
  return http.post<PageParams, PageResponse<NotificationItem>>(
    'app/sysMessage/getList',
    {
      pageNo,
    },
  );
}

export interface UnReadCountResponse {
  messageTotalCount: number;
  sysMessageCount: number;
  sysUserMessageCount: number;
}

export function getUnReadCountService() {
  return http.get<any, UnReadCountResponse>('app/userMessage/unReadCount');
}

export interface MessageTypeDataResponse {
  id: number;
  lastMessageContent: string;
  lastSendTime: number;
  lastSendUserId: number;
  messageType: number;
  messageTypeDataIcon: string;
  messageTypeDataTitle: string;
  packageId: number;
  unreadCount: number;
}

export function getMessageInfoService() {
  return http.get<{id: number}, any>('app/userMessage/getInfo', {
    params: {id: 11},
  });
}

export function getMessageTypeService() {
  return http.post<any, MessageTypeDataResponse[]>(
    'app/userMessage/getMessageTypeData',
    {},
  );
}

export function getMessageListService(
  params: PageParams & {messageType: number},
) {
  // >('app/userMessage/getList', {
  return http.post<
    PageParams & {messageType: number},
    PageResponse<NotificationItem>
  >('app/userMessage/new/getList', {
    messageType: params?.messageType,
    pageNo: params?.pageNo,
  });
}

export function readMessageService(id: number, messageType: number) {
  return http.post<{messageType: number}>(
    `app/userMessage/read/${id}/${messageType}`,
  );
}

export function readAllMessageService(messageType: number) {
  return http.post<{messageType: number}>(
    `app/userMessage/one/click/read/${messageType}`,
  );
}
