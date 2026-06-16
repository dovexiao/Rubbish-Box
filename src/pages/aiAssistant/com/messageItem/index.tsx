import React from 'react';
import TextMessageItem from '../textMessage';
import PhoneChangeCard from '../phoneChangeCard';
import ConfirmCard from '../confirmCard';
import { ChatMessage } from '../../typing';

interface Props {
  data: ChatMessage;
  onConfirmCancel?: (id: string) => void;
  onConfirmSubmit?: (id: string) => void;
}

export default function MessageItem({
  data,
  onConfirmCancel,
  onConfirmSubmit,
}: Props) {
  switch (data.type) {
    case 'text':
      return <TextMessageItem data={data} />;
    case 'phoneChange':
      return <PhoneChangeCard data={data} />;
    case 'confirm':
      return (
        <ConfirmCard
          data={data}
          onCancel={() => onConfirmCancel?.(data.id)}
          onConfirm={() => onConfirmSubmit?.(data.id)}
        />
      );
    default:
      return null;
  }
}
