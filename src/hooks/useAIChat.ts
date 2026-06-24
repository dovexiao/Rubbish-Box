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
  VideoGuideMessage,
} from '@/pages/aiAssistant/typing';
import { getPageTypeConfig } from '@/pages/aiAssistant/constants';

export interface UseAIChatOptions {
  initialMessages?: ChatMessage[];
  extraParams?: Record<string, any>;
}

const createMessageId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const getWebSocketUrl = (): string => {
  const wsDomain = BASE_URL.replace(/^http:\/\//, 'ws://').replace(
    /^https:\/\//,
    'wss://',
  );
  return `${wsDomain}/boke/ws/user/chat`;
};

const getStreamMessageId = (wsMessage: WSMessage, fallbackId?: string | null) =>
  wsMessage.sessionId ||
  wsMessage.conversationId ||
  fallbackId ||
  createMessageId();

const EXECUTE_CODE_BLOCK_MARKER = '```json';
const EXECUTE_JSON_START = '{';
const PAGE_TYPE_MARKER = '"pageType"';
const EXECUTE_END_PATTERN = /\n```\r?\n/;
const EXECUTE_FIELD_MARKERS = [
  '"pageType"',
  '"toolName"',
  '"errorMsg"',
  '"interactionType"',
  '"pageName"',
  '"supplyMsg"',
];

const looksLikeExecuteJson = (str: string): boolean => {
  const trimmed = str.trim();
  if (!trimmed) return false;
  if (/^\s*\{/.test(trimmed)) return true;
  if (
    trimmed.endsWith('}') &&
    EXECUTE_FIELD_MARKERS.some(marker => trimmed.includes(marker))
  ) {
    return true;
  }
  return EXECUTE_FIELD_MARKERS.some(marker => trimmed.includes(marker));
};

const normalizeExecuteJsonRaw = (raw: string): string => {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith('{')) return trimmed;
  if (looksLikeExecuteJson(trimmed)) return `{${trimmed}`;
  return trimmed;
};

const findExecuteEndIndex = (buffer: string) => {
  const match = buffer.match(EXECUTE_END_PATTERN);
  if (!match || match.index === undefined) return -1;
  return match.index;
};

const getExecuteEndMarkerLength = (buffer: string, endIdx: number) => {
  const slice = buffer.slice(endIdx);
  const match = slice.match(EXECUTE_END_PATTERN);
  return match?.[0]?.length ?? 0;
};

/** 从首个 { 起匹配完整 JSON 对象闭合位置（相对 str 起点） */
const findBraceCloseIndex = (str: string): number => {
  let depth = 0;
  let started = false;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === '\\') {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
    } else if (ch === '{') {
      depth += 1;
      started = true;
    } else if (ch === '}') {
      depth -= 1;
      if (started && depth === 0) {
        return i;
      }
    }
  }
  return -1;
};

/** 流结束后从原始字符串提取可解析的 JSON */
const extractJsonObject = (raw: string): string | null => {
  const trimmed = normalizeExecuteJsonRaw(raw);
  if (!trimmed) return null;

  try {
    JSON.parse(trimmed);
    return trimmed;
  } catch {
    // continue
  }

  const start = trimmed.indexOf(EXECUTE_JSON_START);
  if (start === -1) return null;

  const closeIdx = findBraceCloseIndex(trimmed.slice(start));
  if (closeIdx === -1) return null;

  const candidate = trimmed.slice(start, start + closeIdx + 1);
  try {
    JSON.parse(candidate);
    return candidate;
  } catch {
    const lastEnd = trimmed.lastIndexOf('}');
    if (lastEnd > start) {
      const fallback = trimmed.slice(start, lastEnd + 1);
      try {
        JSON.parse(fallback);
        return fallback;
      } catch {
        return null;
      }
    }
  }
  return null;
};

/** 起始：开头为 {，或包含 pageType（```json / {） */
const findExecuteStart = (
  buffer: string,
): {
  index: number;
  skip: number;
  isCodeBlock: boolean;
  prependLeadingBrace?: boolean;
} | null => {
  const jsonAtStart = buffer.match(/^\s*\{/);
  if (jsonAtStart) {
    const index = buffer.indexOf(EXECUTE_JSON_START);
    return { index, skip: 0, isCodeBlock: false };
  }

  const codeBlockIdx = buffer.indexOf(EXECUTE_CODE_BLOCK_MARKER);
  if (codeBlockIdx !== -1) {
    return {
      index: codeBlockIdx,
      skip: EXECUTE_CODE_BLOCK_MARKER.length,
      isCodeBlock: true,
    };
  }

  const pageTypeIdx = buffer.indexOf(PAGE_TYPE_MARKER);
  if (pageTypeIdx !== -1) {
    const jsonStartIdx = buffer.lastIndexOf(EXECUTE_JSON_START, pageTypeIdx);
    if (jsonStartIdx !== -1) {
      return { index: jsonStartIdx, skip: 0, isCodeBlock: false };
    }
    return { index: 0, skip: 0, isCodeBlock: false, prependLeadingBrace: true };
  }

  if (looksLikeExecuteJson(buffer)) {
    return null;
  }

  return null;
};

type StreamPhase = 'text' | 'execute';

interface StreamParserState {
  phase: StreamPhase;
  buffer: string;
  executeJsonBuffer: string;
  currentTextId: string | null;
  cardCount: number;
  sessionId: string;
  isCodeBlockJson: boolean;
  prependLeadingBrace: boolean;
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
  cardCount = 0,
): StreamParserState => ({
  phase: 'text',
  buffer: '',
  executeJsonBuffer: '',
  currentTextId: `${sessionId}-text-${cardCount}`,
  cardCount,
  sessionId,
  isCodeBlockJson: false,
  prependLeadingBrace: false,
});

/** 保留 buffer 末尾可能是 marker 前缀的部分，避免跨 chunk 截断 */
const findSafeFlushIndex = (
  str: string,
  marker: string,
  isComplete: boolean,
) => {
  if (isComplete) return str.length;
  for (let len = Math.min(str.length, marker.length - 1); len > 0; len--) {
    if (marker.startsWith(str.slice(-len))) {
      return str.length - len;
    }
  }
  return str.length;
};

const findSafeFlushIndexForText = (str: string, isComplete: boolean) => {
  if (looksLikeExecuteJson(str)) {
    return 0;
  }
  if (isComplete) return str.length;
  if (/^\s*\{/.test(str)) {
    return str.indexOf(EXECUTE_JSON_START);
  }
  return Math.min(
    findSafeFlushIndex(str, PAGE_TYPE_MARKER, false),
    findSafeFlushIndex(str, EXECUTE_CODE_BLOCK_MARKER, false),
    findSafeFlushIndex(str, EXECUTE_JSON_START, false),
  );
};

const getTextSegmentContent = (
  messages: ChatMessage[],
  textId: string | null,
): string => {
  if (!textId) return '';
  const item = messages.find(
    message => message.id === textId && message.type === 'text',
  );
  return item?.type === 'text' ? item.content ?? '' : '';
};

const findLeakedExecuteText = (
  messages: ChatMessage[],
  sessionId: string,
): { textId: string; content: string } | null => {
  for (const message of messages) {
    if (message.type !== 'text' || message.role !== 'assistant') continue;
    if (!message.id.startsWith(`${sessionId}-text-`)) continue;
    const content = message.content ?? '';
    if (looksLikeExecuteJson(content)) {
      return { textId: message.id, content };
    }
  }
  return null;
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
    if (!current.confirm?.submitted) {
      const next = [...prev];
      next[index] = {
        ...current,
        content: (current.content ?? '') + appendContent,
        isStreaming,
      };
      return next;
    }
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

interface ExecutePayload {
  type?: string;
  messageType?: string;
  pageType?: string | number;
  pageName?: string;
  message?: string;
  intro?: string;
  maskedPhone?: string;
  title?: string;
  content?: string;
  cancelText?: string;
  confirmText?: string;
  replyId?: string;
  messageId?: string;
  sessionId?: string;
  rejectedMessage?: string;
  rejectedHint?: string;
  videoUrl?: string;
  posterUrl?: string;
  poster?: string;
  extend?: any;
}

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
  if (typeof data === 'object') {
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

const parseVideoGuideMedia = (
  parsed: ExecutePayload,
  pageType: string | number,
) => {
  const pageConfig = getPageTypeConfig(pageType);
  let videoUrl = parsed.videoUrl || '';
  let posterUrl = parsed.posterUrl || parsed.poster || '';
  const extend = parsed.extend;

  if (typeof extend === 'string') {
    const trimmed = extend.trim();
    if (trimmed.startsWith('http') && /\.mp4(\?|$)/i.test(trimmed)) {
      videoUrl = trimmed;
    } else if (trimmed.startsWith('{')) {
      try {
        const ext = JSON.parse(trimmed) as Record<string, string | undefined>;
        videoUrl = ext['videoUrl'] || ext['url'] || ext['video'] || videoUrl;
        posterUrl = ext['posterUrl'] || ext['poster'] || posterUrl;
      } catch {
        // ignore invalid extend json
      }
    }
  } else if (extend && typeof extend === 'object') {
    const ext = extend as Record<string, string | undefined>;
    videoUrl = ext['videoUrl'] || ext['url'] || ext['video'] || videoUrl;
    posterUrl = ext['posterUrl'] || ext['poster'] || posterUrl;
  }

  if (!videoUrl && pageConfig?.videoUrl) {
    videoUrl = pageConfig.videoUrl;
  }
  if (!posterUrl && pageConfig?.imgUrl) {
    posterUrl = pageConfig.imgUrl;
  }

  return { videoUrl, posterUrl };
};

const mapVideoGuidePayloadToCard = (
  payload: ExecutePayload,
  fallbackId: string,
  pageType: string | number,
): VideoGuideMessage => {
  const { videoUrl, posterUrl } = parseVideoGuideMedia(payload, pageType);
  return {
    id: fallbackId,
    role: 'assistant',
    type: 'videoGuide',
    intro: payload.message || payload.intro || payload.pageName || '充电指导',
    videoUrl,
    posterUrl,
    pageType,
  };
};

const confirmMessageToAction = (card: ConfirmMessage): ConfirmAction => ({
  sessionId: card.sessionId || card.id,
  replyId: card.replyId || card.id,
  title: card.title,
  content: card.content,
  cancelText: card.cancelText,
  confirmText: card.confirmText,
});

const isConfirmSessionMatch = (confirm: ConfirmAction, sessionId: string) =>
  confirm.sessionId === sessionId || confirm.replyId === sessionId;

const applyConfirmSubmittedState = (
  messages: ChatMessage[],
  sessionId: string,
  approved: boolean,
): ChatMessage[] =>
  messages.map(msg => {
    if (msg.type === 'confirm') {
      const confirmSessionId = msg.sessionId || msg.replyId || msg.id;
      if (
        confirmSessionId !== sessionId &&
        msg.replyId !== sessionId &&
        msg.id !== sessionId
      ) {
        return msg;
      }
      return { ...msg, submitted: true, approved, rejected: !approved };
    }

    if (
      msg.type !== 'text' ||
      !msg.confirm ||
      !isConfirmSessionMatch(msg.confirm, sessionId)
    ) {
      return msg;
    }

    return {
      ...msg,
      confirm: {
        ...msg.confirm,
        submitted: true,
        approved,
        rejected: !approved,
      },
    };
  });

const applyConfirmRejectedState = (
  messages: ChatMessage[],
  sessionId: string,
  payload?: { rejectedMessage?: string; rejectedHint?: string },
): ChatMessage[] =>
  messages.map(msg => {
    if (
      msg.type !== 'text' ||
      !msg.confirm ||
      !isConfirmSessionMatch(msg.confirm, sessionId)
    ) {
      return msg;
    }

    return {
      ...msg,
      confirm: {
        ...msg.confirm,
        submitted: true,
        rejected: true,
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

const findLastAssistantTextIndex = (
  messages: ChatMessage[],
  sessionId?: string,
): number => {
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (!message) continue;
    if (message.role !== 'assistant' || message.type !== 'text') continue;
    if (message.confirm?.submitted) continue;
    if (
      sessionId &&
      !message.id.startsWith(`${sessionId}-text-`) &&
      message.id !== sessionId
    ) {
      continue;
    }
    return i;
  }

  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    if (
      message?.role === 'assistant' &&
      message?.type === 'text' &&
      !message.confirm?.submitted
    ) {
      return i;
    }
  }

  return -1;
};

const mergeConfirmIntoMessages = (
  messages: ChatMessage[],
  action: ConfirmAction,
  options?: { sessionId?: string; appendContent?: string },
): ChatMessage[] => {
  const next = [...messages];
  const index = findLastAssistantTextIndex(next, options?.sessionId);
  const extra = options?.appendContent?.trim();

  if (index >= 0) {
    const textMessage = next[index] as TextMessage;
    if (textMessage.confirm?.submitted) {
      return [
        ...next,
        {
          id: `${
            options?.sessionId || action.replyId
          }-text-${getNextTextSegmentIndex(
            next,
            options?.sessionId || action.sessionId,
          )}`,
          role: 'assistant',
          type: 'text',
          content: extra || action.content || '',
          confirm: action,
        },
      ];
    }

    let content = textMessage.content ?? '';
    if (extra && !content.includes(extra)) {
      content = content ? `${content}\n${extra}` : extra;
    }

    next[index] = {
      ...textMessage,
      content,
      isStreaming: false,
      confirm: action,
    };
    return next;
  }

  return [
    ...next,
    {
      id: options?.sessionId || action.replyId,
      role: 'assistant',
      type: 'text',
      content: extra || action.content || '',
      confirm: action,
    },
  ];
};

const mergeConfirmCardIntoMessages = (
  messages: ChatMessage[],
  card: ConfirmMessage,
  sessionId?: string,
): ChatMessage[] =>
  mergeConfirmIntoMessages(messages, confirmMessageToAction(card), {
    sessionId,
    appendContent: card.content,
  });

const appendOrMergeCard = (
  messages: ChatMessage[],
  card: ChatMessage,
  sessionId: string,
): ChatMessage[] => {
  if (card.type === 'confirm') {
    return mergeConfirmCardIntoMessages(messages, card, sessionId);
  }
  return [...messages, card];
};

const mapExecuteJsonToCard = (
  raw: string,
  sessionId: string,
  cardIndex: number,
): ChatMessage | null => {
  try {
    const parsed = JSON.parse(raw.trim()) as ExecutePayload;
    if (
      parsed.pageType === undefined ||
      parsed.pageType === null ||
      parsed.pageType === ''
    ) {
      return null;
    }

    const cardId = `${sessionId}-card-${cardIndex}`;
    const pageType = String(parsed.pageType);

    if (pageType === '4') {
      return mapConfirmPayloadToCard(parsed, cardId);
    }

    if (pageType === '13') {
      return mapVideoGuidePayloadToCard(parsed, cardId, parsed.pageType!);
    }

    return {
      id: cardId,
      role: 'assistant',
      type: 'phoneChange',
      intro: parsed.message || parsed.intro || parsed.pageName,
      maskedPhone: parsed.maskedPhone || parsed.extend,
      pageType: parsed.pageType,
    };
  } catch {
    // 流式阶段 JSON 可能尚未完整，忽略
  }
  return null;
};

const tryCreateCardFromRawJson = (
  raw: string,
  sessionId: string,
  cardIndex: number,
): { card: ChatMessage | null; jsonStr: string | null } => {
  const jsonStr = extractJsonObject(raw);
  if (!jsonStr) return { card: null, jsonStr: null };
  const card = mapExecuteJsonToCard(jsonStr, sessionId, cardIndex);
  return { card, jsonStr };
};

const finalizeExecutePhase = (
  messages: ChatMessage[],
  state: StreamParserState,
): { messages: ChatMessage[]; rest: string } => {
  const leaked = findLeakedExecuteText(messages, state.sessionId);
  let rawJson = state.executeJsonBuffer + state.buffer;
  if (state.prependLeadingBrace && !rawJson.trimStart().startsWith('{')) {
    rawJson = `{${rawJson}`;
  }
  if (leaked) {
    rawJson = normalizeExecuteJsonRaw(`${leaked.content}${rawJson}`);
  }

  const { card, jsonStr } = tryCreateCardFromRawJson(
    rawJson,
    state.sessionId,
    state.cardCount,
  );
  let nextMessages = messages;

  if (card) {
    if (card.type === 'confirm') {
      nextMessages = removeTextSegment(
        nextMessages,
        leaked?.textId ?? state.currentTextId,
      );
      nextMessages = mergeConfirmCardIntoMessages(
        nextMessages,
        card,
        state.sessionId,
      );
    } else {
      nextMessages = removeTextSegment(
        nextMessages,
        leaked?.textId ?? state.currentTextId,
      );
      nextMessages = [...nextMessages, card];
    }
    state.cardCount += 1;
  } else if (jsonStr) {
    state.cardCount += 1;
  }

  const rest = jsonStr
    ? rawJson.slice(rawJson.indexOf(jsonStr) + jsonStr.length)
    : rawJson;
  return { messages: nextMessages, rest };
};

const processStreamChunk = (
  prev: ChatMessage[],
  state: StreamParserState,
  chunk: string,
  isComplete: boolean,
): { messages: ChatMessage[]; state: StreamParserState } => {
  state.buffer += chunk;
  let messages = prev;

  while (true) {
    if (state.phase === 'text') {
      const executeStart = findExecuteStart(state.buffer);
      if (!executeStart) {
        const safeEnd = findSafeFlushIndexForText(state.buffer, isComplete);
        const textPart = state.buffer.slice(0, safeEnd);
        if (textPart && state.currentTextId) {
          messages = upsertTextSegment(
            messages,
            state.currentTextId,
            textPart,
            !isComplete,
          );
        }
        state.buffer = state.buffer.slice(safeEnd);
        break;
      }

      const textBefore = state.buffer.slice(0, executeStart.index);
      if (textBefore && state.currentTextId) {
        messages = upsertTextSegment(
          messages,
          state.currentTextId,
          textBefore,
          false,
        );
        messages = finalizeTextSegment(messages, state.currentTextId);
      }
      state.buffer = state.buffer.slice(executeStart.index + executeStart.skip);
      state.phase = 'execute';
      state.executeJsonBuffer = '';
      state.isCodeBlockJson = executeStart.isCodeBlock;
      state.prependLeadingBrace = Boolean(executeStart.prependLeadingBrace);
      state.currentTextId = null;
      continue;
    }

    // 纯 JSON 流式：只累积，等 end 再解析，避免中途 } 误截断
    if (!state.isCodeBlockJson) {
      state.executeJsonBuffer += state.buffer;
      state.buffer = '';
      break;
    }

    const codeEndIdx = findExecuteEndIndex(state.buffer);
    if (codeEndIdx === -1) {
      const safeEnd = findSafeFlushIndex(state.buffer, '\n```\n', isComplete);
      state.executeJsonBuffer += state.buffer.slice(0, safeEnd);
      state.buffer = state.buffer.slice(safeEnd);
      break;
    }

    const jsonPart =
      state.executeJsonBuffer + state.buffer.slice(0, codeEndIdx);
    const card = mapExecuteJsonToCard(
      jsonPart,
      state.sessionId,
      state.cardCount,
    );
    if (card) {
      messages = appendOrMergeCard(messages, card, state.sessionId);
    }
    state.cardCount += 1;
    const endLen = getExecuteEndMarkerLength(state.buffer, codeEndIdx);
    state.buffer = state.buffer.slice(codeEndIdx + endLen);
    state.phase = 'text';
    state.executeJsonBuffer = '';
    state.isCodeBlockJson = false;
    state.currentTextId = `${state.sessionId}-text-${state.cardCount}`;
    continue;
  }

  if (isComplete) {
    if (state.phase === 'execute') {
      const { messages: nextMessages, rest } = finalizeExecutePhase(
        messages,
        state,
      );
      messages = nextMessages;
      state.buffer = rest;
      state.executeJsonBuffer = '';
      state.phase = 'text';
      state.isCodeBlockJson = false;
      state.prependLeadingBrace = false;
      state.currentTextId = `${state.sessionId}-text-${state.cardCount}`;
    } else if (state.buffer || state.currentTextId) {
      const leakedText = getTextSegmentContent(messages, state.currentTextId);
      const combined = `${leakedText}${state.buffer}`;

      if (looksLikeExecuteJson(combined)) {
        const { card } = tryCreateCardFromRawJson(
          combined,
          state.sessionId,
          state.cardCount,
        );
        if (card) {
          messages = removeTextSegment(messages, state.currentTextId);
          messages = appendOrMergeCard(messages, card, state.sessionId);
          state.cardCount += 1;
          state.buffer = '';
        } else if (state.buffer && state.currentTextId) {
          messages = upsertTextSegment(
            messages,
            state.currentTextId,
            state.buffer,
            false,
          );
          state.buffer = '';
        }
      } else if (state.buffer && state.currentTextId) {
        messages = upsertTextSegment(
          messages,
          state.currentTextId,
          state.buffer,
          false,
        );
        state.buffer = '';
      }
    }
    if (state.currentTextId) {
      messages = finalizeTextSegment(messages, state.currentTextId);
    }
  }

  return { messages, state };
};

const isSpecialCardMessage = (wsMessage: WSMessage) => {
  const data = parseWSMessageData(wsMessage.data);
  const messageType = data?.type || data?.messageType;
  return (
    messageType === 'phoneChange' ||
    messageType === 'confirm' ||
    messageType === 'videoGuide'
  );
};

const mapWSMessageToChatMessage = (
  wsMessage: WSMessage,
): ChatMessage | null => {
  const { content, data: rawData } = wsMessage;
  const data = parseWSMessageData(rawData);
  const messageType = data?.type || data?.messageType;
  const messageId = getStreamMessageId(wsMessage);

  if (messageType === 'phoneChange') {
    return {
      id: messageId,
      role: 'assistant',
      type: 'phoneChange',
      intro: data?.intro || content,
      maskedPhone: data?.maskedPhone,
      pageType: data?.pageType,
    };
  }

  if (messageType === 'videoGuide') {
    const pageType = data?.pageType ?? 13;
    const { videoUrl, posterUrl } = parseVideoGuideMedia(data || {}, pageType);
    return {
      id: messageId,
      role: 'assistant',
      type: 'videoGuide',
      intro: data?.intro || data?.message || content,
      videoUrl: data?.videoUrl || videoUrl,
      posterUrl: data?.posterUrl || data?.poster || posterUrl,
      pageType,
    };
  }

  if (messageType === 'confirm') {
    if (data) {
      return {
        ...mapConfirmPayloadToCard(data, messageId),
        content: content || data.content || data.message || '',
      };
    }
    return {
      id: messageId,
      role: 'assistant',
      type: 'confirm',
      content: content || '',
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
    content: content || '',
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

export const useAIChat = (options?: UseAIChatOptions) => {
  const [messages, setMessages] = useState<ChatMessage[]>(
    options?.initialMessages ?? [],
  );
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const chatKeyRef = useRef<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  const streamingMessageIdRef = useRef<string | null>(null);
  const streamParserRef = useRef<StreamParserState | null>(null);
  const pendingConfirmRef = useRef<{
    sessionId: string;
    approved: boolean;
  } | null>(null);
  const optionsRef = useRef<UseAIChatOptions | undefined>(options);
  const messagesRef = useRef(messages);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const finalizeStream = useCallback(() => {
    setIsLoading(false);
    streamingMessageIdRef.current = null;
    streamParserRef.current = null;
    setMessages(prev => finalizeStreamingMessages(prev));
  }, []);

  const appendStreamContent = useCallback(
    (wsMessage: WSMessage, chunk: string, isComplete = false) => {
      const streamId = getStreamMessageId(
        wsMessage,
        streamingMessageIdRef.current,
      );
      streamingMessageIdRef.current = streamId;

      setMessages(prev => {
        if (
          !streamParserRef.current ||
          streamParserRef.current.sessionId !== streamId
        ) {
          streamParserRef.current = createStreamParserState(
            streamId,
            getNextTextSegmentIndex(prev, streamId),
          );
        }

        const parserSnapshot: StreamParserState = {
          ...streamParserRef.current,
          buffer: streamParserRef.current.buffer,
          executeJsonBuffer: streamParserRef.current.executeJsonBuffer,
        };

        const { messages, state } = processStreamChunk(
          prev,
          parserSnapshot,
          chunk,
          isComplete,
        );
        streamParserRef.current = state;
        return messages;
      });
    },
    [],
  );

  const finishPendingConfirmReject = useCallback((wsMessage: WSMessage) => {
    const pending = pendingConfirmRef.current;
    if (!pending || pending.approved) return;

    const parsed = parseWSMessageData(wsMessage.data);
    setMessages(prev =>
      applyConfirmRejectedState(prev, pending.sessionId, {
        rejectedMessage: parsed?.rejectedMessage || wsMessage.content,
        rejectedHint: parsed?.rejectedHint,
      }),
    );
    showToast({ title: '已取消', icon: 'none' });
    pendingConfirmRef.current = null;
  }, []);

  const handleWSMessage = useCallback(
    (wsMessage: WSMessage) => {
      console.log('wsMessage', wsMessage);
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
        if (pendingConfirmRef.current?.approved) {
          showToast({ title: '已确认执行', icon: 'none' });
        }
        const streamId = getStreamMessageId(
          wsMessage,
          streamingMessageIdRef.current,
        );
        streamingMessageIdRef.current = streamId;
        streamParserRef.current = createStreamParserState(
          streamId,
          getNextTextSegmentIndex(messagesRef.current, streamId),
        );
        return;
      }

      if (type === 'confirm') {
        setIsLoading(false);
        const cardMessage = mapTopLevelConfirmMessage(wsMessage);
        if (cardMessage) {
          const sessionId = getStreamMessageId(wsMessage);
          setMessages(prev =>
            mergeConfirmCardIntoMessages(
              finalizeStreamingMessages(prev),
              cardMessage,
              sessionId,
            ),
          );
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
            setMessages(prev => {
              const finalized = finalizeStreamingMessages(prev);
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
        } else {
          pendingConfirmRef.current = null;
        }
        const messageId = getStreamMessageId(
          wsMessage,
          streamingMessageIdRef.current,
        );
        streamingMessageIdRef.current = null;
        streamParserRef.current = null;
        setIsLoading(false);
        setMessages(prev => {
          const finalized = finalizeStreamingMessages(prev);
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

        let finalizedMessages: ChatMessage[] = [];
        setMessages(prev => {
          if (
            !streamParserRef.current ||
            streamParserRef.current.sessionId !== streamId
          ) {
            streamParserRef.current = createStreamParserState(
              streamId,
              getNextTextSegmentIndex(prev, streamId),
            );
          }

          const parserSnapshot: StreamParserState = {
            ...streamParserRef.current,
            buffer: streamParserRef.current.buffer,
            executeJsonBuffer: streamParserRef.current.executeJsonBuffer,
          };

          const { messages } = processStreamChunk(
            prev,
            parserSnapshot,
            content || '',
            true,
          );
          finalizedMessages = finalizeStreamingMessages(messages);
          return finalizedMessages;
        });

        const isConfirmRejectResponse =
          Boolean(pendingConfirmRef.current) &&
          !pendingConfirmRef.current!.approved;

        if (isConfirmRejectResponse) {
          finishPendingConfirmReject(wsMessage);
        } else if (pendingConfirmRef.current?.approved) {
          pendingConfirmRef.current = null;
        }

        setIsLoading(false);
        streamingMessageIdRef.current = null;
        streamParserRef.current = null;
        triggerLightHaptic();

        if (
          isConfirmRejectResponse ||
          !hasUnresolvedConfirm(finalizedMessages)
        ) {
          setTimeout(() => {
            aiWebSocketService.close();
            setIsConnected(false);
          }, 100);
        }
      }
    },
    [appendStreamContent, finalizeStream, finishPendingConfirmReject],
  );

  const connectChatWebSocket = useCallback(
    async (requestParams: Record<string, any>, afterConnect?: () => void) => {
      try {
        const params: Record<string, any> = {
          ...requestParams,
          ...optionsRef.current?.extraParams,
        };

        if (conversationIdRef.current) {
          params['conversationId'] = conversationIdRef.current;
        }

        if (sessionIdRef.current) {
          params['sessionId'] = sessionIdRef.current;
        }

        const res = await getUserSessionKey(params);
        if (!res.success || !res.data) {
          setIsLoading(false);
          pendingConfirmRef.current = null;
          showToast({ title: res.message || '获取会话失败', icon: 'none' });
          return false;
        }

        chatKeyRef.current = res.data;
        const wsUrl = getWebSocketUrl();
        console.log('wsUrl====', wsUrl);

        aiWebSocketService.connect({
          url: wsUrl,
          chatKey: res.data,
          onOpen: () => {
            setIsConnected(true);
            afterConnect?.();
          },
          onClose: () => {
            setIsConnected(false);
            finalizeStream();
          },
          onError: () => {
            setIsConnected(false);
            setIsLoading(false);
            pendingConfirmRef.current = null;
            showToast({ title: '连接失败，请重试', icon: 'none' });
          },
          onMessage: handleWSMessage,
        });
        return true;
      } catch (error) {
        console.error('初始化 WebSocket 失败:', error);
        setIsLoading(false);
        pendingConfirmRef.current = null;
        showToast({ title: '发送失败，请重试', icon: 'none' });
        return false;
      }
    },
    [handleWSMessage, finalizeStream],
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

      const userMessage: ChatMessage = {
        id: createMessageId(),
        role: 'user',
        type: 'text',
        content: text,
      };

      setMessages(prev => [...prev, userMessage]);
      setIsLoading(true);

      try {
        if (aiWebSocketService.isConnected()) {
          aiWebSocketService.close();
          setIsConnected(false);
        }
        await initWebSocket(text);
      } catch (error) {
        console.error('发送消息失败:', error);
        setIsLoading(false);
      }
    },
    [initWebSocket],
  );

  const sendVoiceMessage = useCallback(
    async (filePath: string) => {
      if (!filePath) {
        showToast({ title: '录音文件无效', icon: 'none' });
        return;
      }
      console.log('filePath====', filePath);
      try {
        const log = await userVoiceToText(filePath);
        console.log('log====', log);

        if (!log.success) {
          showToast({ title: '识别失败', icon: 'none' });
          return;
        }
        if (!log.data?.length) {
          showToast({ title: '未识别到语音内容', icon: 'none' });
          return;
        }

        await sendMessage(log.data);
      } catch (err: any) {
        showToast({ title: err?.message || '语音识别失败', icon: 'none' });
      }
    },
    [sendMessage],
  );

  const confirmToolCall = useCallback(
    async (sessionId: string, params?: { approved?: boolean }) => {
      const approved = params?.approved !== false;

      setMessages(prev =>
        applyConfirmSubmittedState(prev, sessionId, approved),
      );

      const sendConfirmPayload = () => {
        aiWebSocketService.send({ sessionId, approved });
      };

      try {
        pendingConfirmRef.current = { sessionId, approved };
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
          setIsLoading(false);
        }
      } catch (err: any) {
        pendingConfirmRef.current = null;
        setIsLoading(false);
        showToast({ title: err?.message || '操作失败', icon: 'none' });
      }
    },
    [connectChatWebSocket],
  );

  const disconnect = useCallback(() => {
    aiWebSocketService.close();
    setIsConnected(false);
    chatKeyRef.current = null;
    conversationIdRef.current = null;
    pendingConfirmRef.current = null;
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    conversationIdRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

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
