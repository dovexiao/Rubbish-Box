export type MessageRole = 'user' | 'assistant';

export type MessageType = 'text' | 'phoneChange' | 'confirm';

export interface BaseMessage {
  id: string;
  role: MessageRole;
  type: MessageType;
}

export interface TextMessage extends BaseMessage {
  type: 'text';
  content: string;
}

export interface PhoneChangeMessage extends BaseMessage {
  type: 'phoneChange';
  intro?: string;
  maskedPhone?: string;
}

export interface ConfirmMessage extends BaseMessage {
  type: 'confirm';
  title?: string;
  content: string;
  cancelText?: string;
  confirmText?: string;
}

export type ChatMessage = TextMessage | PhoneChangeMessage | ConfirmMessage;
