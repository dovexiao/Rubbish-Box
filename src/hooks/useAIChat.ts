import { useState, useEffect, useRef, useCallback } from 'react';
import { BASE_URL } from '@/config';
import { showToast } from '@/utils';
import { triggerLightHaptic } from '@/utils/haptics';
import { aiWebSocketService, WSMessage } from '@/services/aiWebSocketService';
import { getUserSessionKey, userVoiceToText } from '@/services/ai';
import type {
  ChatMessage,
  ConfirmAction,
  ConfirmMessage,
  TextMessage,
} from '@/pages/aiAssistant/typing';
import {
  extractJsonCardsFromTextContent,
  mapExecutePayloadToCard,
  type ExecutePayload,
} from '@/pages/aiAssistant/utils/extractJsonCardsFromMarkdown';

export interface UseAIChatOptions {
  initialMessages?: ChatMessage[];
  extraParams?: Record<string, unknown>;
}

const createMessageId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const getWebSocketUrl = (): string => {
  const wsDomain = BASE_URL.replace(/^http:\/\//, 'ws://')
    .replace(/^https:\/\//, 'wss://')
    .replace(/\/$/, '');
  return `${wsDomain}/boke/ws/user/chat`;
};

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? error.message : fallback;

const getStreamMessageId = (wsMessage: WSMessage, fallbackId?: string | null) =>
  wsMessage.sessionId ||
  wsMessage.conversationId ||
  fallbackId ||
  createMessageId();

interface StreamParserState {
  currentTextId: string | null;
  textSegmentIndex: number;
  sessionId: string;
}

const getNextTextSegmentIndex = (
  messages: ChatMessage[],
  sessionId: string,
): number => {
  let maxIndex = -1;
  const prefix = `${sessionId}-text-`;

  for (const msg of messages) {
    if (msg.type !== 'text' || msg.role !== 'assistant') continue;
    if (msg.id === sessionId) {
      maxIndex = Math.max(maxIndex, 0);
      continue;
    }
    if (!msg.id.startsWith(prefix)) continue;
    const index = Number(msg.id.slice(prefix.length));
    if (!Number.isNaN(index)) {
      maxIndex = Math.max(maxIndex, index);
    }
  }

  return maxIndex + 1;
};

const createStreamParserState = (
  sessionId: string,
  textSegmentIndex = 0,
): StreamParserState => ({
  currentTextId: `${sessionId}-text-${textSegmentIndex}`,
  textSegmentIndex,
  sessionId,
});

const cloneParserSnapshot = (parser: StreamParserState): StreamParserState => ({
  ...parser,
});

const resolveStreamParser = (
  prev: ChatMessage[],
  streamId: string,
  existing?: StreamParserState | null,
): StreamParserState => {
  if (existing && existing.sessionId === streamId) {
    return cloneParserSnapshot(existing);
  }
  return createStreamParserState(
    streamId,
    getNextTextSegmentIndex(prev, streamId),
  );
};

const removeTextSegment = (
  messages: ChatMessage[],
  textId: string | null,
): ChatMessage[] => {
  if (!textId) return messages;
  return messages.filter(
    message => !(message.id === textId && message.type === 'text'),
  );
};

const ensureEmptyStreamingText = (
  messages: ChatMessage[],
  textId: string,
): ChatMessage[] => {
  if (messages.some(item => item.id === textId && item.type === 'text')) {
    return messages;
  }
  return [
    ...messages,
    {
      id: textId,
      role: 'assistant',
      type: 'text',
      content: '',
      isStreaming: true,
    },
  ];
};

const isRemovableEmptyAssistantText = (msg: ChatMessage): boolean =>
  msg.type === 'text' &&
  msg.role === 'assistant' &&
  !msg.confirm &&
  !msg.content?.trim();

const removeEmptyAssistantTexts = (messages: ChatMessage[]): ChatMessage[] =>
  messages.filter(msg => !isRemovableEmptyAssistantText(msg));

const beginAssistantStream = (
  messages: ChatMessage[],
  streamId: string,
): { messages: ChatMessage[]; state: StreamParserState } => {
  const state = createStreamParserState(
    streamId,
    getNextTextSegmentIndex(messages, streamId),
  );
  return {
    messages: ensureEmptyStreamingText(messages, state.currentTextId!),
    state,
  };
};

/** 将发送阶段占位流对齐到服务端 streamId，无 type:start 时也能复用同一条思考气泡 */
const adoptStreamId = (
  messages: ChatMessage[],
  oldState: StreamParserState | null,
  streamId: string,
): { messages: ChatMessage[]; state: StreamParserState } => {
  if (oldState?.sessionId === streamId && oldState.currentTextId) {
    return {
      messages: ensureEmptyStreamingText(messages, oldState.currentTextId),
      state: cloneParserSnapshot(oldState),
    };
  }

  const state = createStreamParserState(
    streamId,
    getNextTextSegmentIndex(messages, streamId),
  );
  const newTextId = state.currentTextId!;
  const oldTextId = oldState?.currentTextId;

  if (!oldTextId) {
    return { messages: ensureEmptyStreamingText(messages, newTextId), state };
  }

  const oldIndex = messages.findIndex(
    msg => msg.id === oldTextId && msg.type === 'text',
  );
  if (oldIndex < 0) {
    return { messages: ensureEmptyStreamingText(messages, newTextId), state };
  }

  const next = [...messages];
  next[oldIndex] = {
    ...(next[oldIndex] as TextMessage),
    id: newTextId,
    isStreaming: true,
  };

  return {
    messages: ensureEmptyStreamingText(next, newTextId),
    state,
  };
};

const isConfirmSessionMatchById = (msg: ConfirmMessage, sessionId: string) => {
  const confirmSessionId = msg.sessionId || msg.replyId || msg.id;
  return (
    confirmSessionId === sessionId ||
    msg.replyId === sessionId ||
    msg.id === sessionId
  );
};

interface ConfirmTarget {
  sessionId: string;
  confirmMessageId?: string;
}

const matchConfirmMessage = (msg: ConfirmMessage, target: ConfirmTarget) => {
  if (target.confirmMessageId && msg.id === target.confirmMessageId) {
    return true;
  }
  return isConfirmSessionMatchById(msg, target.sessionId);
};

const isConfirmSessionMatch = (confirm: ConfirmAction, sessionId: string) =>
  confirm.sessionId === sessionId || confirm.replyId === sessionId;

const matchConfirmTargetInText = (
  msg: TextMessage,
  target: ConfirmTarget,
): boolean => {
  if (!msg.confirm) return false;
  if (
    target.confirmMessageId &&
    `${msg.id}-confirm` === target.confirmMessageId
  ) {
    return true;
  }
  return isConfirmSessionMatch(msg.confirm, target.sessionId);
};

const upsertConfirmReply = (
  messages: ChatMessage[],
  target: ConfirmTarget,
  appendContent: string,
  isReplyStreaming: boolean,
): ChatMessage[] => {
  let matched = false;
  const next = messages.map(msg => {
    if (msg.type === 'confirm' && matchConfirmMessage(msg, target)) {
      matched = true;
      return {
        ...msg,
        processing: false,
        replyContent: `${msg.replyContent ?? ''}${appendContent}`,
        isReplyStreaming,
      };
    }

    if (msg.type === 'text' && matchConfirmTargetInText(msg, target)) {
      matched = true;
      return {
        ...msg,
        confirm: {
          ...msg.confirm!,
          processing: false,
          replyContent: `${msg.confirm!.replyContent ?? ''}${appendContent}`,
          isReplyStreaming,
        },
      };
    }

    return msg;
  });

  if (matched || !appendContent) {
    return next;
  }

  for (let i = next.length - 1; i >= 0; i--) {
    const msg = next[i];
    if (
      msg?.type === 'confirm' &&
      msg.submitted &&
      !msg.approved &&
      !msg.rejected
    ) {
      next[i] = {
        ...msg,
        processing: false,
        replyContent: `${msg.replyContent ?? ''}${appendContent}`,
        isReplyStreaming,
      };
      break;
    }
  }

  return next;
};

const finalizeConfirmReply = (
  messages: ChatMessage[],
  target: ConfirmTarget,
): ChatMessage[] =>
  messages.map(msg => {
    if (msg.type === 'confirm' && matchConfirmMessage(msg, target)) {
      return { ...msg, processing: false, isReplyStreaming: false };
    }

    if (msg.type === 'text' && matchConfirmTargetInText(msg, target)) {
      return {
        ...msg,
        confirm: {
          ...msg.confirm!,
          processing: false,
          isReplyStreaming: false,
        },
      };
    }

    return msg;
  });

interface ProcessStreamOptions {
  confirmTarget?: ConfirmTarget;
}

const upsertStreamText = (
  messages: ChatMessage[],
  textId: string,
  appendContent: string,
  isStreaming: boolean,
  options?: ProcessStreamOptions,
): ChatMessage[] => {
  if (options?.confirmTarget) {
    return upsertConfirmReply(
      messages,
      options.confirmTarget,
      appendContent,
      isStreaming,
    );
  }
  return upsertTextSegment(messages, textId, appendContent, isStreaming);
};

const upsertTextSegment = (
  prev: ChatMessage[],
  textId: string,
  appendContent: string,
  isStreaming: boolean,
): ChatMessage[] => {
  if (!appendContent) return prev;
  const index = prev.findIndex(
    item => item.id === textId && item.type === 'text',
  );
  if (index >= 0) {
    const current = prev[index] as Extract<ChatMessage, { type: 'text' }>;
    const next = [...prev];
    next[index] = {
      ...current,
      content: (current.content ?? '') + appendContent,
      isStreaming,
    };
    return next;
  }
  return [
    ...prev,
    {
      id: textId,
      role: 'assistant',
      type: 'text',
      content: appendContent,
      isStreaming,
    },
  ];
};

const finalizeTextSegment = (
  prev: ChatMessage[],
  textId: string | null,
): ChatMessage[] => {
  if (!textId) return prev;
  return prev.map(item =>
    item.id === textId && item.type === 'text' && item.isStreaming
      ? { ...item, isStreaming: false }
      : item,
  );
};

const DEFAULT_REJECTED_MESSAGE = '未下发地锁控制指令。';
const DEFAULT_REJECTED_HINT = '你可以继续询问设备状态，或重新发起控制。';

const parseWSMessageData = (data: unknown): ExecutePayload | null => {
  if (!data) return null;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data.trim()) as ExecutePayload;
    } catch {
      return null;
    }
  }
  if (typeof data === 'object' && !Array.isArray(data)) {
    return data as ExecutePayload;
  }
  return null;
};

const mapConfirmPayloadToAction = (
  payload: ExecutePayload,
  fallbackId: string,
): ConfirmAction => ({
  sessionId: payload.sessionId || fallbackId,
  replyId: payload.replyId || payload.messageId || fallbackId,
  title: payload.title || payload.pageName,
  content: payload.content || payload.message,
  cancelText: payload.cancelText,
  confirmText: payload.confirmText,
});

const mapConfirmPayloadToCard = (
  payload: ExecutePayload,
  fallbackId: string,
): ConfirmMessage => {
  const action = mapConfirmPayloadToAction(payload, fallbackId);
  return {
    id: fallbackId,
    role: 'assistant',
    type: 'confirm',
    title: action.title,
    content: action.content || '',
    cancelText: action.cancelText,
    confirmText: action.confirmText,
    sessionId: action.sessionId,
    replyId: action.replyId,
  };
};

const applyConfirmProcessingState = (
  messages: ChatMessage[],
  target: ConfirmTarget,
): ChatMessage[] =>
  messages.map(msg => {
    if (msg.type === 'confirm') {
      if (!matchConfirmMessage(msg, target)) {
        return msg;
      }
      return {
        ...msg,
        submitted: true,
        processing: true,
        replyContent: undefined,
        isReplyStreaming: true,
        approved: undefined,
        rejected: undefined,
      };
    }

    if (
      msg.type !== 'text' ||
      !msg.confirm ||
      !isConfirmSessionMatch(msg.confirm, target.sessionId)
    ) {
      return msg;
    }

    return {
      ...msg,
      confirm: {
        ...msg.confirm,
        submitted: true,
        processing: true,
        replyContent: undefined,
        isReplyStreaming: true,
        approved: undefined,
        rejected: undefined,
      },
    };
  });

const applyConfirmResetProcessingState = (
  messages: ChatMessage[],
  target: ConfirmTarget,
): ChatMessage[] =>
  messages.map(msg => {
    if (msg.type === 'confirm') {
      if (!matchConfirmMessage(msg, target)) {
        return msg;
      }
      return {
        ...msg,
        submitted: false,
        processing: false,
        approved: undefined,
        rejected: undefined,
      };
    }

    if (
      msg.type !== 'text' ||
      !msg.confirm ||
      !isConfirmSessionMatch(msg.confirm, target.sessionId)
    ) {
      return msg;
    }

    return {
      ...msg,
      confirm: {
        ...msg.confirm,
        submitted: false,
        processing: false,
        approved: undefined,
        rejected: undefined,
      },
    };
  });

const applyConfirmRejectedState = (
  messages: ChatMessage[],
  target: ConfirmTarget,
  payload?: { rejectedMessage?: string; rejectedHint?: string },
): ChatMessage[] =>
  messages.map(msg => {
    if (msg.type === 'confirm') {
      if (!matchConfirmMessage(msg, target)) {
        return msg;
      }
      return {
        ...msg,
        submitted: true,
        processing: false,
        isReplyStreaming: false,
        rejected: true,
        approved: false,
        rejectedMessage:
          payload?.rejectedMessage ||
          msg.rejectedMessage ||
          DEFAULT_REJECTED_MESSAGE,
        rejectedHint:
          payload?.rejectedHint || msg.rejectedHint || DEFAULT_REJECTED_HINT,
      };
    }

    if (
      msg.type !== 'text' ||
      !msg.confirm ||
      !isConfirmSessionMatch(msg.confirm, target.sessionId)
    ) {
      return msg;
    }

    return {
      ...msg,
      confirm: {
        ...msg.confirm,
        submitted: true,
        processing: false,
        rejected: true,
        approved: false,
        rejectedMessage:
          payload?.rejectedMessage ||
          msg.confirm.rejectedMessage ||
          DEFAULT_REJECTED_MESSAGE,
        rejectedHint:
          payload?.rejectedHint ||
          msg.confirm.rejectedHint ||
          DEFAULT_REJECTED_HINT,
      },
    };
  });

const isSameConfirmCard = (card: ConfirmMessage, sessionId?: string) => {
  const cardSessionId = card.sessionId || card.replyId || card.id;
  return Boolean(
    sessionId &&
      (cardSessionId === sessionId ||
        card.replyId === sessionId ||
        card.id === sessionId),
  );
};

const mergeConfirmCardIntoMessages = (
  messages: ChatMessage[],
  card: ConfirmMessage,
  sessionId?: string,
): ChatMessage[] => {
  const finalized = messages.map(item =>
    item.type === 'text' && item.isStreaming
      ? { ...item, isStreaming: false }
      : item,
  );

  const existingIndex = finalized.findIndex(
    msg =>
      msg.type === 'confirm' &&
      isSameConfirmCard(msg, sessionId || card.sessionId || card.id),
  );

  if (existingIndex >= 0) {
    const next = [...finalized];
    next[existingIndex] = {
      ...(next[existingIndex] as ConfirmMessage),
      ...card,
    };
    return next;
  }

  return [...finalized, card];
};

const getSessionIdFromTextId = (textId: string): string => {
  const match = textId.match(/^(.*)-text-\d+$/);
  return match?.[1] || textId;
};

const materializeJsonCardsFromText = (
  messages: ChatMessage[],
  textId: string,
  sessionId: string,
): ChatMessage[] => {
  const textIndex = messages.findIndex(
    item => item.id === textId && item.type === 'text',
  );
  if (textIndex < 0) return messages;

  const textMessage = messages[textIndex] as TextMessage;
  const cardCount = messages.filter(
    item => item.id.startsWith(`${sessionId}-card-`) && item.type !== 'text',
  ).length;
  const { textContent, cards } = extractJsonCardsFromTextContent(
    textMessage.content ?? '',
    sessionId,
    cardCount,
  );

  const contentChanged = textContent !== textMessage.content;
  if (!cards.length && !contentChanged) {
    if (!textMessage.content?.trim() && !textMessage.confirm) {
      const next = [...messages];
      next.splice(textIndex, 1);
      return next;
    }
    return messages;
  }

  let next = [...messages];
  if (textContent.trim()) {
    next[textIndex] = {
      ...textMessage,
      content: textContent,
      isStreaming: false,
    };
  } else {
    next.splice(textIndex, 1);
  }

  let insertAt = textContent.trim() ? textIndex + 1 : textIndex;
  for (const card of cards) {
    if (card.type === 'confirm') {
      next = mergeConfirmCardIntoMessages(next, card, sessionId);
      insertAt = next.length;
      continue;
    }
    next.splice(insertAt, 0, card);
    insertAt += 1;
  }

  return next;
};

const materializeAllJsonCardsInMessages = (
  messages: ChatMessage[],
): ChatMessage[] => {
  let next = messages;
  const textMessages = next.filter(
    (item): item is TextMessage =>
      item.type === 'text' && item.role === 'assistant' && !item.isStreaming,
  );

  for (const textMessage of textMessages) {
    next = materializeJsonCardsFromText(
      next,
      textMessage.id,
      getSessionIdFromTextId(textMessage.id),
    );
  }

  return next;
};

const processStreamChunk = (
  prev: ChatMessage[],
  state: StreamParserState,
  chunk: string,
  isComplete: boolean,
  options?: ProcessStreamOptions,
): { messages: ChatMessage[]; state: StreamParserState } => {
  let messages = prev;

  if (chunk && state.currentTextId) {
    messages = upsertStreamText(
      messages,
      state.currentTextId,
      chunk,
      !isComplete,
      options,
    );
    if (options?.confirmTarget) {
      messages = removeTextSegment(messages, state.currentTextId);
    }
  }

  if (isComplete && state.currentTextId) {
    if (!options?.confirmTarget) {
      messages = finalizeTextSegment(messages, state.currentTextId);
    }
    messages = materializeJsonCardsFromText(
      messages,
      state.currentTextId,
      state.sessionId,
    );
  }

  return { messages, state };
};

const isSpecialCardMessage = (wsMessage: WSMessage) => {
  const data = parseWSMessageData(wsMessage.data);
  const messageType = data?.type || data?.messageType;
  return (
    messageType === 'confirm' ||
    messageType === 'videoGuide' ||
    data?.pageType !== undefined
  );
};

const mapWSMessageToChatMessage = (
  wsMessage: WSMessage,
): ChatMessage | null => {
  const { content, data: rawData } = wsMessage;
  const data = parseWSMessageData(rawData);
  const messageType = data?.type || data?.messageType;
  const messageId = getStreamMessageId(wsMessage);

  if (data) {
    const pageType =
      data.pageType ??
      (messageType === 'confirm'
        ? 4
        : messageType === 'videoGuide'
        ? 13
        : undefined);

    if (pageType !== undefined) {
      const card = mapExecutePayloadToCard({ ...data, pageType }, messageId);
      if (card?.type === 'confirm') {
        return {
          ...card,
          content: content || data.content || data.message || '',
        };
      }
      if (card?.type === 'videoGuide') {
        return {
          ...card,
          intro: data.intro || data.message || content || card.intro,
        };
      }
      return card;
    }
  }

  if (messageType === 'confirm') {
    return {
      id: messageId,
      role: 'assistant',
      type: 'confirm',
      content: content || '',
      sessionId: messageId,
      replyId: messageId,
    };
  }

  return null;
};

const mapTopLevelConfirmMessage = (
  wsMessage: WSMessage,
): ConfirmMessage | null => {
  const { content, data: rawData } = wsMessage;
  const fallbackId = getStreamMessageId(wsMessage);
  const parsed = parseWSMessageData(rawData);

  if (!parsed && !content && !rawData) return null;

  if (parsed) {
    return {
      ...mapConfirmPayloadToCard(parsed, fallbackId),
      content: content || parsed.content || parsed.message || '',
    };
  }

  return {
    id: fallbackId,
    role: 'assistant',
    type: 'confirm',
    content: content || '是否执行？',
    sessionId: fallbackId,
    replyId: fallbackId,
  };
};

const finalizeStreamingMessages = (prev: ChatMessage[]) =>
  prev.map(item =>
    item.type === 'text' && item.isStreaming
      ? { ...item, isStreaming: false }
      : item,
  );

const hasUnresolvedConfirm = (messages: ChatMessage[]) =>
  messages.some(
    msg =>
      (msg.type === 'text' &&
        msg.confirm &&
        !msg.confirm.rejected &&
        !msg.confirm.submitted) ||
      (msg.type === 'confirm' && !msg.submitted),
  );

const findConfirmIndex = (
  messages: ChatMessage[],
  target: ConfirmTarget,
): number => {
  const directIndex = messages.findIndex(
    msg => msg.type === 'confirm' && matchConfirmMessage(msg, target),
  );
  if (directIndex >= 0) return directIndex;

  // 后端偶尔返回新的 sessionId；仅在候选卡片唯一时回退，避免串到旧确认卡片。
  const submittedIndexes = messages.reduce<number[]>((indexes, msg, index) => {
    if (msg.type === 'confirm' && msg.submitted && !msg.rejected)
      indexes.push(index);
    return indexes;
  }, []);
  return submittedIndexes.length === 1 ? submittedIndexes[0]! : -1;
};

const isTextForConfirmTarget = (
  message: TextMessage,
  target: ConfirmTarget,
): boolean => {
  const sessionId = getSessionIdFromTextId(message.id);
  return sessionId === target.sessionId || message.id === target.sessionId;
};

/** 确认后将 confirm 卡片之后的所有助手文本合并进卡片，并标记执行完成 */
const consolidateConfirmReplyMessages = (
  messages: ChatMessage[],
  target: ConfirmTarget,
): ChatMessage[] => {
  const confirmIndex = findConfirmIndex(messages, target);
  if (confirmIndex < 0) return messages;

  const confirm = messages[confirmIndex] as ConfirmMessage;
  const textIdsToRemove: string[] = [];
  const textParts: string[] = [];

  if (confirm.replyContent?.trim()) {
    textParts.push(confirm.replyContent.trim());
  }

  for (let i = confirmIndex + 1; i < messages.length; i++) {
    const msg = messages[i];
    if (
      msg?.type === 'text' &&
      msg.role === 'assistant' &&
      msg.content?.trim() &&
      isTextForConfirmTarget(msg, target)
    ) {
      textParts.push(msg.content.trim());
      textIdsToRemove.push(msg.id);
    }
  }

  const replyContent = textParts.join('\n\n');
  const next = messages.filter(msg => !textIdsToRemove.includes(msg.id));
  const newConfirmIndex = next.findIndex(msg => msg.id === confirm.id);
  if (newConfirmIndex < 0) return next;

  next[newConfirmIndex] = {
    ...(next[newConfirmIndex] as ConfirmMessage),
    processing: false,
    isReplyStreaming: false,
    replyContent: replyContent || confirm.replyContent || '',
    submitted: true,
    approved: true,
    rejected: false,
  };

  return next;
};

const shouldConsolidateConfirmReply = (
  messages: ChatMessage[],
  target: ConfirmTarget,
): boolean => {
  const confirmIndex = findConfirmIndex(messages, target);
  if (confirmIndex < 0) return false;

  const confirm = messages[confirmIndex] as ConfirmMessage;
  if (confirm.approved) return false;

  const hasTextsAfter = messages
    .slice(confirmIndex + 1)
    .some(
      msg =>
        msg.type === 'text' &&
        msg.role === 'assistant' &&
        msg.content?.trim() &&
        isTextForConfirmTarget(msg, target),
    );

  return Boolean(confirm.replyContent?.trim() || hasTextsAfter);
};

export const useAIChat = (options?: UseAIChatOptions) => {
  const [messages, setMessages] = useState<ChatMessage[]>(
    options?.initialMessages ?? [],
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const conversationIdRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const streamingMessageIdRef = useRef<string | null>(null);
  const streamParserRef = useRef<StreamParserState | null>(null);
  const pendingConfirmRef = useRef<{
    sessionId: string;
    approved: boolean;
    confirmMessageId?: string;
  } | null>(null);
  const lastApprovedConfirmTargetRef = useRef<ConfirmTarget | null>(null);
  const optionsRef = useRef<UseAIChatOptions | undefined>(options);
  const messagesRef = useRef(messages);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const connectionEpochRef = useRef(0);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  /**
   * WebSocket 回调可能在 React 提交 state 前连续触发。
   * 同步更新 ref 可避免后一个 chunk 读取到旧消息，也让 end 分支拿到真实最终结果。
   */
  const commitMessages = useCallback(
    (updater: (current: ChatMessage[]) => ChatMessage[]): ChatMessage[] => {
      const next = updater(messagesRef.current);
      messagesRef.current = next;
      setMessages(next);
      return next;
    },
    [],
  );

  const abortActiveAssistantStream = useCallback(() => {
    const textId = streamParserRef.current?.currentTextId;
    streamingMessageIdRef.current = null;
    streamParserRef.current = null;
    commitMessages(prev =>
      textId
        ? removeTextSegment(prev, textId)
        : removeEmptyAssistantTexts(prev),
    );
  }, [commitMessages]);

  const clearScheduledClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleSocketClose = useCallback(() => {
    clearScheduledClose();
    closeTimerRef.current = setTimeout(() => {
      // 主动关闭前使旧连接回调失效，避免 onClose 再次修改当前流。
      connectionEpochRef.current += 1;
      aiWebSocketService.close();
      setIsConnected(false);
      closeTimerRef.current = null;
    }, 100);
  }, [clearScheduledClose]);

  const getPendingConfirmTarget = (): ConfirmTarget | undefined => {
    const pending = pendingConfirmRef.current;
    if (!pending) return undefined;
    return {
      sessionId: pending.sessionId,
      confirmMessageId: pending.confirmMessageId,
    };
  };

  const finalizeStream = useCallback(() => {
    setIsLoading(false);
    commitMessages(prev => {
      let next = materializeAllJsonCardsInMessages(
        finalizeStreamingMessages(prev),
      );
      next = removeEmptyAssistantTexts(next);
      const pending = pendingConfirmRef.current;
      if (pending) {
        next = applyConfirmResetProcessingState(next, {
          sessionId: pending.sessionId,
          confirmMessageId: pending.confirmMessageId,
        });
      }
      streamParserRef.current = null;
      streamingMessageIdRef.current = null;
      pendingConfirmRef.current = null;
      lastApprovedConfirmTargetRef.current = null;
      return next;
    });
  }, [commitMessages]);

  const appendStreamContent = useCallback(
    (wsMessage: WSMessage, chunk: string, isComplete = false) => {
      const streamId = getStreamMessageId(
        wsMessage,
        streamingMessageIdRef.current,
      );
      streamingMessageIdRef.current = streamId;

      commitMessages(prev => {
        const adopted = adoptStreamId(prev, streamParserRef.current, streamId);

        const confirmTarget = getPendingConfirmTarget();
        const streamOptions: ProcessStreamOptions | undefined = confirmTarget
          ? { confirmTarget }
          : undefined;

        const { messages, state } = processStreamChunk(
          adopted.messages,
          adopted.state,
          chunk,
          isComplete,
          streamOptions,
        );
        streamParserRef.current = state;
        return messages;
      });
    },
    [commitMessages],
  );

  const finishPendingConfirmReject = useCallback(
    (wsMessage: WSMessage) => {
      const pending = pendingConfirmRef.current;
      if (!pending || pending.approved) return;

      const parsed = parseWSMessageData(wsMessage.data);
      const target: ConfirmTarget = {
        sessionId: pending.sessionId,
        confirmMessageId: pending.confirmMessageId,
      };
      commitMessages(prev => {
        let next = finalizeConfirmReply(prev, target);
        next = applyConfirmRejectedState(next, target, {
          rejectedMessage: parsed?.rejectedMessage || wsMessage.content,
          rejectedHint: parsed?.rejectedHint,
        });
        return next;
      });
      showToast({ title: '已取消', icon: 'none' });
      pendingConfirmRef.current = null;
    },
    [commitMessages],
  );

  const handleWSMessage = useCallback(
    (wsMessage: WSMessage) => {
      const { type, content, conversationId, sessionId } = wsMessage;

      if (conversationId) {
        conversationIdRef.current = conversationId;
      }

      if (sessionId) {
        sessionIdRef.current = sessionId;
      }

      if (type === 'start') {
        setIsLoading(true);
        triggerLightHaptic();
        const streamId = getStreamMessageId(
          wsMessage,
          streamingMessageIdRef.current,
        );
        streamingMessageIdRef.current = streamId;

        if (!pendingConfirmRef.current) {
          commitMessages(prev => {
            const adopted = adoptStreamId(
              prev,
              streamParserRef.current,
              streamId,
            );
            streamParserRef.current = adopted.state;
            return adopted.messages;
          });
        } else {
          streamParserRef.current = createStreamParserState(
            streamId,
            getNextTextSegmentIndex(messagesRef.current, streamId),
          );
        }
        return;
      }

      if (type === 'confirm') {
        setIsLoading(false);
        const cardMessage = mapTopLevelConfirmMessage(wsMessage);
        if (cardMessage) {
          const sessionId = getStreamMessageId(wsMessage);
          commitMessages(prev => {
            let finalized = finalizeStreamingMessages(prev);
            finalized = removeEmptyAssistantTexts(finalized);
            return mergeConfirmCardIntoMessages(
              finalized,
              cardMessage,
              sessionId,
            );
          });
        }
        streamingMessageIdRef.current = null;
        streamParserRef.current = null;
        return;
      }

      if (type === 'message' || type === 'execute') {
        if (type === 'execute' && isSpecialCardMessage(wsMessage)) {
          const cardMessage = mapWSMessageToChatMessage(wsMessage);
          if (cardMessage) {
            const sessionId = getStreamMessageId(wsMessage);
            commitMessages(prev => {
              let finalized = finalizeStreamingMessages(prev);
              finalized = removeEmptyAssistantTexts(finalized);
              if (cardMessage.type === 'confirm') {
                return mergeConfirmCardIntoMessages(
                  finalized,
                  cardMessage,
                  sessionId,
                );
              }
              return [...finalized, cardMessage];
            });
            streamingMessageIdRef.current = null;
            streamParserRef.current = null;
          }
          return;
        }

        setIsLoading(true);
        appendStreamContent(wsMessage, content || '');
        return;
      }

      if (type === 'error') {
        if (pendingConfirmRef.current && !pendingConfirmRef.current.approved) {
          finishPendingConfirmReject(wsMessage);
          streamingMessageIdRef.current = null;
          streamParserRef.current = null;
          setIsLoading(false);
          return;
        }

        pendingConfirmRef.current = null;
        lastApprovedConfirmTargetRef.current = null;
        const messageId = getStreamMessageId(
          wsMessage,
          streamingMessageIdRef.current,
        );
        streamingMessageIdRef.current = null;
        streamParserRef.current = null;
        setIsLoading(false);
        commitMessages(prev => {
          let finalized = finalizeStreamingMessages(prev);
          finalized = removeEmptyAssistantTexts(finalized);
          const index = finalized.findIndex(
            item =>
              item.id === messageId &&
              (item.type === 'text' || item.type === 'error'),
          );
          const errorMessage: ChatMessage = {
            id: messageId,
            role: 'assistant',
            type: 'error',
            content: content || '请求失败，请重试',
          };
          if (index >= 0) {
            const next = [...finalized];
            next[index] = errorMessage;
            return next;
          }
          return [...finalized, errorMessage];
        });
        return;
      }

      if (type === 'end') {
        const streamId = getStreamMessageId(
          wsMessage,
          streamingMessageIdRef.current,
        );
        const pendingConfirm = pendingConfirmRef.current;
        const parserAtEnd = streamParserRef.current
          ? cloneParserSnapshot(streamParserRef.current)
          : null;

        const finalizedMessages = commitMessages(prev => {
          const parserSnapshot = resolveStreamParser(
            prev,
            streamId,
            parserAtEnd,
          );

          const confirmTarget =
            (pendingConfirm
              ? {
                  sessionId: pendingConfirm.sessionId,
                  confirmMessageId: pendingConfirm.confirmMessageId,
                }
              : undefined) ??
            lastApprovedConfirmTargetRef.current ??
            getPendingConfirmTarget();

          const streamOptions: ProcessStreamOptions | undefined = confirmTarget
            ? { confirmTarget }
            : undefined;

          const { messages } = processStreamChunk(
            prev,
            parserSnapshot,
            content || '',
            true,
            streamOptions,
          );
          let nextMessages = materializeAllJsonCardsInMessages(
            finalizeStreamingMessages(messages),
          );
          nextMessages = removeEmptyAssistantTexts(nextMessages);

          const consolidateTarget =
            (pendingConfirm?.approved ? confirmTarget : undefined) ??
            lastApprovedConfirmTargetRef.current ??
            undefined;

          if (consolidateTarget) {
            const shouldConsolidate =
              Boolean(pendingConfirm?.approved) ||
              shouldConsolidateConfirmReply(nextMessages, consolidateTarget);
            if (shouldConsolidate) {
              nextMessages = consolidateConfirmReplyMessages(
                nextMessages,
                consolidateTarget,
              );
              lastApprovedConfirmTargetRef.current = null;
            }
          }

          streamParserRef.current = null;
          streamingMessageIdRef.current = null;
          return nextMessages;
        });

        const isConfirmRejectResponse =
          Boolean(pendingConfirm) && !pendingConfirm!.approved;

        if (isConfirmRejectResponse) {
          finishPendingConfirmReject(wsMessage);
        } else if (pendingConfirm?.approved) {
          pendingConfirmRef.current = null;
          lastApprovedConfirmTargetRef.current = null;
        }

        setIsLoading(false);
        triggerLightHaptic();

        if (
          isConfirmRejectResponse ||
          !hasUnresolvedConfirm(finalizedMessages)
        ) {
          scheduleSocketClose();
        }
      }
    },
    [
      appendStreamContent,
      commitMessages,
      finishPendingConfirmReject,
      scheduleSocketClose,
    ],
  );

  const connectChatWebSocket = useCallback(
    async (
      requestParams: Record<string, unknown>,
      afterConnect?: () => void,
    ) => {
      clearScheduledClose();
      const connectionEpoch = ++connectionEpochRef.current;

      try {
        const params: Record<string, unknown> = {
          ...requestParams,
          ...optionsRef.current?.extraParams,
        };

        if (conversationIdRef.current)
          params['conversationId'] = conversationIdRef.current;
        if (sessionIdRef.current) params['sessionId'] = sessionIdRef.current;

        const res = await getUserSessionKey(params);
        if (connectionEpoch !== connectionEpochRef.current) return false;

        if (!res.success || !res.data) {
          setIsLoading(false);
          if (!pendingConfirmRef.current) {
            abortActiveAssistantStream();
          } else {
            pendingConfirmRef.current = null;
          }
          if (res.code === 206) {
            return false;
          }
          showToast({ title: res.message || '获取会话失败', icon: 'none' });
          return false;
        }

        const wsUrl = getWebSocketUrl();
        if (connectionEpoch !== connectionEpochRef.current) return false;
        if (!wsUrl) {
          setIsLoading(false);
          if (!pendingConfirmRef.current) {
            abortActiveAssistantStream();
          } else {
            pendingConfirmRef.current = null;
          }
          showToast({ title: 'WebSocket 地址无效', icon: 'none' });
          return false;
        }

        aiWebSocketService.connect({
          url: wsUrl,
          chatKey: res.data,
          onOpen: () => {
            if (connectionEpoch !== connectionEpochRef.current) return;
            setIsConnected(true);
            afterConnect?.();
          },
          onClose: () => {
            if (connectionEpoch !== connectionEpochRef.current) return;
            setIsConnected(false);
            finalizeStream();
          },
          onError: () => {
            if (connectionEpoch !== connectionEpochRef.current) return;
            setIsConnected(false);
            setIsLoading(false);
            if (!pendingConfirmRef.current) {
              abortActiveAssistantStream();
            }
            pendingConfirmRef.current = null;
            lastApprovedConfirmTargetRef.current = null;
            showToast({ title: '连接失败，请重试', icon: 'none' });
          },
          onMessage: wsMessage => {
            if (connectionEpoch !== connectionEpochRef.current) return;
            handleWSMessage(wsMessage);
          },
        });
        return true;
      } catch (error: unknown) {
        if (connectionEpoch !== connectionEpochRef.current) return false;
        console.error('初始化 WebSocket 失败:', error);
        setIsLoading(false);
        if (!pendingConfirmRef.current) {
          abortActiveAssistantStream();
        } else {
          pendingConfirmRef.current = null;
        }
        lastApprovedConfirmTargetRef.current = null;
        showToast({
          title: getErrorMessage(error, '发送失败，请重试'),
          icon: 'none',
        });
        return false;
      }
    },
    [
      abortActiveAssistantStream,
      clearScheduledClose,
      finalizeStream,
      handleWSMessage,
    ],
  );

  const initWebSocket = useCallback(
    async (message: string, sessionId?: string) => {
      await connectChatWebSocket({
        message,
        ...(sessionId ? { sessionId } : {}),
      });
    },
    [connectChatWebSocket],
  );

  const sendMessage = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!text) return;
      if (pendingConfirmRef.current) {
        showToast({ title: '请等待当前操作完成', icon: 'none' });
        return;
      }

      const userMessage: ChatMessage = {
        id: createMessageId(),
        role: 'user',
        type: 'text',
        content: text,
      };

      const streamId = createMessageId();
      streamingMessageIdRef.current = streamId;

      commitMessages(prev => {
        const withUser = [...prev, userMessage];
        const begun = beginAssistantStream(withUser, streamId);
        streamParserRef.current = begun.state;
        return begun.messages;
      });
      setIsLoading(true);

      try {
        if (aiWebSocketService.isConnected()) {
          aiWebSocketService.close();
          setIsConnected(false);
        }
        await initWebSocket(text);
      } catch (error) {
        console.error('发送消息失败:', error);
        abortActiveAssistantStream();
        setIsLoading(false);
      }
    },
    [abortActiveAssistantStream, commitMessages, initWebSocket],
  );

  const sendVoiceMessage = useCallback(
    async (filePath: string) => {
      if (!filePath) {
        showToast({ title: '录音文件无效', icon: 'none' });
        return;
      }

      try {
        const log = await userVoiceToText(filePath);

        if (!log.success) {
          showToast({
            title: log.message || log.msg || '识别失败',
            icon: 'none',
          });
          return;
        }
        if (!log.data?.length) {
          showToast({ title: '未识别到语音内容', icon: 'none' });
          return;
        }

        await sendMessage(log.data);
      } catch (error: unknown) {
        showToast({
          title: getErrorMessage(error, '语音识别失败'),
          icon: 'none',
        });
      }
    },
    [sendMessage],
  );

  const confirmToolCall = useCallback(
    async (
      sessionId: string,
      params?: { approved?: boolean; confirmMessageId?: string },
    ) => {
      if (pendingConfirmRef.current) return;

      const approved = params?.approved !== false;
      const target: ConfirmTarget = {
        sessionId,
        confirmMessageId: params?.confirmMessageId,
      };

      commitMessages(prev => applyConfirmProcessingState(prev, target));

      const sendConfirmPayload = () => {
        aiWebSocketService.send({ sessionId, approved });
      };

      try {
        pendingConfirmRef.current = {
          sessionId,
          approved,
          confirmMessageId: params?.confirmMessageId,
        };
        lastApprovedConfirmTargetRef.current = approved ? target : null;
        setIsLoading(true);

        if (aiWebSocketService.isConnected()) {
          sendConfirmPayload();
          return;
        }

        const connected = await connectChatWebSocket(
          { sessionId, approved },
          sendConfirmPayload,
        );
        if (!connected) {
          pendingConfirmRef.current = null;
          lastApprovedConfirmTargetRef.current = null;
          setIsLoading(false);
          commitMessages(prev =>
            applyConfirmResetProcessingState(prev, target),
          );
        }
      } catch (error: unknown) {
        pendingConfirmRef.current = null;
        lastApprovedConfirmTargetRef.current = null;
        setIsLoading(false);
        commitMessages(prev => applyConfirmResetProcessingState(prev, target));
        showToast({ title: getErrorMessage(error, '操作失败'), icon: 'none' });
      }
    },
    [commitMessages, connectChatWebSocket],
  );

  const disconnect = useCallback(() => {
    clearScheduledClose();
    connectionEpochRef.current += 1;
    aiWebSocketService.close();
    setIsConnected(false);
    setIsLoading(false);
    conversationIdRef.current = null;
    sessionIdRef.current = null;
    streamingMessageIdRef.current = null;
    streamParserRef.current = null;
    pendingConfirmRef.current = null;
    lastApprovedConfirmTargetRef.current = null;
  }, [clearScheduledClose]);

  const clearMessages = useCallback(() => {
    disconnect();
    commitMessages(() => []);
  }, [commitMessages, disconnect]);

  useEffect(() => {
    return () => {
      clearScheduledClose();
      connectionEpochRef.current += 1;
      aiWebSocketService.close();
    };
  }, [clearScheduledClose]);

  return {
    messages,
    isConnected,
    isLoading,
    sendMessage,
    sendVoiceMessage,
    confirmToolCall,
    disconnect,
    clearMessages,
    reconnect: initWebSocket,
  };
};
