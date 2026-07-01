import {
  findJsonCodeBlocks,
  type JsonCodeBlock,
} from '@/components/markdownRenderer/findJsonCodeBlocks';
import type {
  ChatMessage,
  ConfirmMessage,
  PhoneChangeMessage,
  VideoGuideMessage,
} from '../typing';
import { getPageTypeConfig } from '../constants';

export interface ExecutePayload {
  type?: string;
  messageType?: string;
  pageType?: string | number;
  pageName?: string;
  message?: string;
  intro?: string;
  title?: string;
  content?: string;
  cancelText?: string;
  confirmText?: string;
  replyId?: string;
  messageId?: string;
  sessionId?: string;
  rejectedMessage?: string;
  rejectedHint?: string;
  maskedPhone?: string;
  videoUrl?: string;
  posterUrl?: string;
  poster?: string;
  extend?: unknown;
}

interface SourceRange {
  start: number;
  end: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const readString = (
  record: Record<string, unknown>,
  keys: string[],
): string => {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
};

const readPayloadString = (payload: ExecutePayload, keys: string[]): string =>
  readString(payload as Record<string, unknown>, keys);

const parseExtend = (extend: unknown): Record<string, unknown> | null => {
  if (isRecord(extend)) return extend;
  if (typeof extend !== 'string') return null;

  const source = extend.trim();
  if (!source.startsWith('{')) return null;

  try {
    const parsed = JSON.parse(source) as unknown;
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const removeSourceRanges = (source: string, ranges: SourceRange[]): string => {
  if (!ranges.length) return source;

  let result = source;
  const sorted = [...ranges].sort((a, b) => b.start - a.start);
  for (const range of sorted) {
    result = `${result.slice(0, range.start)}${result.slice(range.end)}`;
  }

  return result.replace(/\n[\t ]*\n[\t ]*\n+/g, '\n\n').trim();
};

export const stripJsonCodeBlocks = (markdown: string): string =>
  removeSourceRanges(
    markdown,
    findJsonCodeBlocks(markdown).map(({ start, end }) => ({ start, end })),
  );

const EXECUTE_JSON_MARKERS =
  /"pageType"\s*:|"toolName"\s*:|"interactionType"\s*:/;

export const isStreamingExecuteJsonContent = (content: string): boolean => {
  const trimmed = content.trimStart();
  if (!trimmed) return false;

  if (/^```(?:json)?/i.test(trimmed) || /^```[\t ]*j/i.test(trimmed)) {
    return true;
  }

  if (trimmed.startsWith('{') && EXECUTE_JSON_MARKERS.test(trimmed)) {
    return true;
  }

  return false;
};

export const isExecutePayload = (value: unknown): value is ExecutePayload =>
  isRecord(value);

const toExecutePayloads = (value: unknown): ExecutePayload[] => {
  if (Array.isArray(value)) return value.filter(isExecutePayload);
  return isExecutePayload(value) ? [value] : [];
};

export const parseVideoGuideMedia = (
  parsed: ExecutePayload,
  pageType: string | number,
): { videoUrl: string; posterUrl: string } => {
  const pageConfig = getPageTypeConfig(pageType);
  let videoUrl = readPayloadString(parsed, ['videoUrl']);
  let posterUrl = readPayloadString(parsed, ['posterUrl', 'poster']);
  const extendRecord = parseExtend(parsed.extend);

  if (typeof parsed.extend === 'string') {
    const source = parsed.extend.trim();
    if (/^https?:\/\//i.test(source) && /\.mp4(?:\?|$)/i.test(source)) {
      videoUrl = source;
    }
  }

  if (extendRecord) {
    videoUrl =
      readString(extendRecord, ['videoUrl', 'url', 'video']) || videoUrl;
    posterUrl = readString(extendRecord, ['posterUrl', 'poster']) || posterUrl;
  }

  return {
    videoUrl: videoUrl || pageConfig?.videoUrl || '',
    posterUrl: posterUrl || pageConfig?.imgUrl || '',
  };
};

/** 从客户端派生的消息 id（如 xxx-card-0）还原后端 sessionId */
export const resolveBackendSessionId = (
  messageId: string,
  explicitSessionId?: string,
): string => {
  const candidate = explicitSessionId?.trim() || messageId;
  return candidate.replace(/-(?:card|text)-\d+$/, '').replace(/-confirm$/, '');
};

export const mapExecutePayloadToCard = (
  payload: ExecutePayload,
  cardId: string,
  streamSessionId?: string,
): ChatMessage | null => {
  if (!isExecutePayload(payload)) return null;

  const parentSessionId = streamSessionId ?? cardId;

  const pageType =
    payload.pageType === undefined || payload.pageType === null
      ? ''
      : String(payload.pageType);
  const messageType = readPayloadString(payload, ['messageType', 'type'])
    .toLowerCase()
    .replace(/[\s_-]/g, '');
  const isConfirm =
    pageType === '4' ||
    messageType === 'confirm' ||
    messageType === 'confirmation';
  const isVideoGuide =
    pageType === '13' ||
    messageType === 'videoguide' ||
    messageType === 'video';

  if (isConfirm) {
    const card: ConfirmMessage = {
      id: cardId,
      role: 'assistant',
      type: 'confirm',
      title: readPayloadString(payload, ['title', 'pageName']) || undefined,
      content: readPayloadString(payload, ['content', 'message']),
      cancelText: readPayloadString(payload, ['cancelText']) || undefined,
      confirmText: readPayloadString(payload, ['confirmText']) || undefined,
      sessionId: readPayloadString(payload, ['sessionId']) || parentSessionId,
      replyId:
        readPayloadString(payload, ['replyId', 'messageId']) || parentSessionId,
    };
    return card;
  }

  if (isVideoGuide) {
    const { videoUrl, posterUrl } = parseVideoGuideMedia(
      payload,
      payload.pageType ?? 13,
    );
    const card: VideoGuideMessage = {
      id: cardId,
      role: 'assistant',
      type: 'videoGuide',
      intro:
        readPayloadString(payload, ['message', 'intro', 'pageName']) ||
        '充电指导',
      videoUrl,
      posterUrl,
      pageType: payload.pageType,
    };
    return card;
  }

  const card: PhoneChangeMessage = {
    id: cardId,
    role: 'assistant',
    type: 'phoneChange',
    intro:
      readPayloadString(payload, ['message', 'intro', 'pageName']) || undefined,
    maskedPhone: payload.extend as string,
    pageType: payload.pageType,
  };
  return card;
};

const mapBlockToCards = (
  block: JsonCodeBlock,
  sessionId: string,
  cardIndexStart: number,
): ChatMessage[] => {
  const cards: ChatMessage[] = [];

  for (const payload of toExecutePayloads(block.value)) {
    const card = mapExecutePayloadToCard(
      payload,
      `${sessionId}-card-${cardIndexStart + cards.length}`,
      sessionId,
    );
    if (card) cards.push(card);
  }

  return cards;
};

export const extractJsonCardsFromTextContent = (
  content: string,
  sessionId: string,
  cardIndexStart = 0,
): { textContent: string; cards: ChatMessage[] } => {
  const blocks = findJsonCodeBlocks(content);
  const cards: ChatMessage[] = [];

  for (const block of blocks) {
    cards.push(
      ...mapBlockToCards(block, sessionId, cardIndexStart + cards.length),
    );
  }

  if (blocks.length) {
    return {
      textContent: removeSourceRanges(
        content,
        blocks.map(({ start, end }) => ({ start, end })),
      ),
      cards,
    };
  }

  const trimmed = content.trim();
  if (!trimmed || (!trimmed.startsWith('{') && !trimmed.startsWith('['))) {
    return { textContent: content, cards: [] };
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    const bareCards: ChatMessage[] = [];
    for (const payload of toExecutePayloads(parsed)) {
      const card = mapExecutePayloadToCard(
        payload,
        `${sessionId}-card-${cardIndexStart + bareCards.length}`,
        sessionId,
      );
      if (card) bareCards.push(card);
    }

    return { textContent: '', cards: bareCards };
  } catch {
    return { textContent: content, cards: [] };
  }
};
