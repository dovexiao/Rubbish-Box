import React from 'react';
import TextMessageItem from '../textMessage';
import PhoneChangeCard from '../phoneChangeCard';
import ConfirmCard from '../confirmCard';
import VideoGuideCard from '../videoGuideCard';
import { ChatMessage, ConfirmMessage, TextMessage } from '../../typing';
import { resolveBackendSessionId } from '../../utils/extractJsonCardsFromMarkdown';

interface Props {
  data: ChatMessage;
  onConfirmCancel?: (sessionId: string, confirmMessageId?: string) => void;
  onConfirmSubmit?: (sessionId: string, confirmMessageId?: string) => void;
}

const toConfirmCard = (message: TextMessage): ConfirmMessage | null => {
  if (!message.confirm) return null;
  const { confirm } = message;
  return {
    id: `${message.id}-confirm`,
    role: 'assistant',
    type: 'confirm',
    title: confirm.title,
    content: confirm.content || '',
    cancelText: confirm.cancelText,
    confirmText: confirm.confirmText,
    sessionId: confirm.sessionId,
    replyId: confirm.replyId,
    submitted: confirm.submitted,
    processing: confirm.processing,
    rejected: confirm.rejected,
    approved: confirm.approved,
    replyContent: confirm.replyContent,
    isReplyStreaming: confirm.isReplyStreaming,
    rejectedMessage: confirm.rejectedMessage,
    rejectedHint: confirm.rejectedHint,
  };
};

const emitConfirmAction = (
  card: ConfirmMessage,
  handler: Props['onConfirmCancel'] | Props['onConfirmSubmit'],
) => {
  const explicitSessionId = card.sessionId?.trim();
  if (!explicitSessionId) return;

  const sessionId = resolveBackendSessionId(card.id, explicitSessionId);
  if (!sessionId) return;

  handler?.(sessionId, card.id);
};

export default function MessageItem({
  data,
  onConfirmCancel,
  onConfirmSubmit,
}: Props) {
  switch (data.type) {
    case 'text': {
      const confirmCard = toConfirmCard(data);
      if (!confirmCard) {
        return <TextMessageItem data={data} />;
      }

      return (
        <React.Fragment key={data.id}>
          <TextMessageItem data={data} />
          <ConfirmCard
            data={confirmCard}
            onCancel={() => emitConfirmAction(confirmCard, onConfirmCancel)}
            onConfirm={() => emitConfirmAction(confirmCard, onConfirmSubmit)}
          />
        </React.Fragment>
      );
    }
    case 'error':
      return <TextMessageItem data={data} />;
    case 'phoneChange':
      return <PhoneChangeCard data={data} />;
    case 'videoGuide':
      return <VideoGuideCard data={data} />;
    case 'confirm':
      return (
        <ConfirmCard
          data={data}
          onCancel={() => emitConfirmAction(data, onConfirmCancel)}
          onConfirm={() => emitConfirmAction(data, onConfirmSubmit)}
        />
      );
    default:
      return null;
  }
}
