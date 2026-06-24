import React from 'react';
import TextMessageItem from '../textMessage';
import PhoneChangeCard from '../phoneChangeCard';
import ConfirmCard from '../confirmCard';
import VideoGuideCard from '../videoGuideCard';
import { ChatMessage, ConfirmAction } from '../../typing';

interface Props {
  data: ChatMessage;
  onConfirmCancel?: (sessionId: string) => void;
  onConfirmSubmit?: (sessionId: string) => void;
}

const getConfirmSessionId = (confirm: ConfirmAction) => confirm.sessionId;

export default function MessageItem({
  data,
  onConfirmCancel,
  onConfirmSubmit,
}: Props) {
  switch (data.type) {
    case 'text':
      return (
        <TextMessageItem
          data={data}
          onConfirmCancel={
            data.confirm
              ? () => onConfirmCancel?.(getConfirmSessionId(data.confirm!))
              : undefined
          }
          onConfirmSubmit={
            data.confirm
              ? () => onConfirmSubmit?.(getConfirmSessionId(data.confirm!))
              : undefined
          }
        />
      );
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
          onCancel={() =>
            onConfirmCancel?.(data.sessionId || data.replyId || data.id)
          }
          onConfirm={() =>
            onConfirmSubmit?.(data.sessionId || data.replyId || data.id)
          }
        />
      );
    default:
      return null;
  }
}
