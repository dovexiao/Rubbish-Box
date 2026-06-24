import { createFetch } from '@/utils/request';
import type { CreateFetchResponse } from '@/utils/http';
import { post } from '@/utils/http';

export interface GetUserSessionKeyRequest {
  message?: string;
  conversationId?: string;
  sessionId?: string;
  approved?: boolean;
  [key: string]: any;
}

export const getUserSessionKey = createFetch<any, GetUserSessionKeyRequest>(
  '/boke/ai/user/chatKey',
  'POST',
);

export const userConfirmToolCall = createFetch<any, any>(
  '/boke/ai/user/chat/confirm',
  'POST',
);

export async function userVoiceToText(
  filePath: string,
): Promise<CreateFetchResponse<any>> {
  const uri = filePath.startsWith('file://') ? filePath : `file://${filePath}`;
  const formData = new FormData();
  formData.append('file', {
    uri,
    type: 'audio/m4a',
    name: 'voice.m4a',
  } as any);

  return post<any>('/boke/user/ai/audio/text', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}

export const userChat = createFetch<any, any>('/boke/ai/user/chat', 'GET');
