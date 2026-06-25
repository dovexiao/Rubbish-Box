import { Platform } from 'react-native';
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

async function resolveVoiceUploadUri(filePath: string): Promise<string> {
  const trimmed = filePath.trim();
  if (!trimmed) {
    throw new Error('录音文件无效');
  }

  const fsPath = trimmed.replace(/^file:\/\//, '');
  const RNFS = require('react-native-fs') as {
    exists: (path: string) => Promise<boolean>;
    stat: (path: string) => Promise<{ size?: number }>;
    CachesDirectoryPath?: string;
    DocumentDirectoryPath?: string;
  };

  let targetPath = fsPath;

  if (!(await RNFS.exists(targetPath))) {
    const fileName = fsPath.split('/').pop();
    const candidates = [RNFS.CachesDirectoryPath, RNFS.DocumentDirectoryPath]
      .filter(Boolean)
      .map(dir => `${dir}/${fileName}`);

    const matched = (
      await Promise.all(
        candidates.map(async candidate => ((await RNFS.exists(candidate))
          ? candidate
          : null)),
      )
    ).find(Boolean);

    if (!matched) {
      throw new Error('录音文件不存在');
    }

    targetPath = matched;
  }

  const stat = await RNFS.stat(targetPath);
  if (!stat?.size) {
    throw new Error('录音文件为空');
  }

  if (Platform.OS === 'android') {
    return targetPath.startsWith('file://') ? targetPath : `file://${targetPath}`;
  }

  return targetPath.startsWith('file://') ? targetPath : `file://${targetPath}`;
}

export async function userVoiceToText(
  filePath: string,
): Promise<CreateFetchResponse<any>> {
  const uri = await resolveVoiceUploadUri(filePath);
  const formData = new FormData();
  formData.append('file', {
    uri,
    type: 'audio/m4a',
    name: 'voice.m4a',
  } as any);

  return post<any>('/boke/user/ai/audio/text', formData);
}

export const userChat = createFetch<any, any>('/boke/ai/user/chat', 'GET');
