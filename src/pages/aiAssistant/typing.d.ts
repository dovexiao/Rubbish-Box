export type MessageRole = 'user' | 'assistant';

export type MessageType =
  | 'text'
  | 'phoneChange'
  | 'confirm'
  | 'error'
  | 'loading'
  | 'start'
  | 'end'
  | 'message'
  | 'execute'
  | 'videoGuide';

export interface BaseMessage {
  id: string;
  role: MessageRole;
  type: MessageType;
}

export interface ConfirmAction {
  sessionId: string;
  replyId: string;
  title?: string;
  content?: string;
  cancelText?: string;
  confirmText?: string;
  rejected?: boolean;
  approved?: boolean;
  submitted?: boolean;
  rejectedMessage?: string;
  rejectedHint?: string;
}

export interface TextMessage extends BaseMessage {
  type: 'text';
  content: string;
  isStreaming?: boolean;
  confirm?: ConfirmAction;
}

export interface ErrorMessage extends BaseMessage {
  type: 'error';
  content: string;
}

export interface LoadingMessage extends BaseMessage {
  type: 'loading';
}

export interface StartMessage extends BaseMessage {
  type: 'start';
}

export interface EndMessage extends BaseMessage {
  type: 'end';
}

export interface PhoneChangeMessage extends BaseMessage {
  type: 'phoneChange';
  intro?: string;
  maskedPhone?: string | Record<string, any>;
  pageType?: string | number;
}

export interface VideoGuideMessage extends BaseMessage {
  type: 'videoGuide';
  intro?: string;
  videoUrl?: string;
  posterUrl?: string;
  pageType?: string | number;
}

export interface ConfirmMessage extends BaseMessage {
  type: 'confirm';
  title?: string;
  content: string;
  cancelText?: string;
  confirmText?: string;
  sessionId?: string;
  replyId?: string;
  submitted?: boolean;
  rejected?: boolean;
  approved?: boolean;
}

export type ChatMessage =
  | TextMessage
  | PhoneChangeMessage
  | VideoGuideMessage
  | ConfirmMessage
  | ErrorMessage
  | LoadingMessage
  | StartMessage
  | EndMessage;

export interface VoiceRecordResult {
  tempFilePath: string;
  duration: number;
  fileSize?: number;
}
