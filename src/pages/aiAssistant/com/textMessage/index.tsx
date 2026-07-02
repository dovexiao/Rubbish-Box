import React from 'react';
import { Text, View } from 'react-native';
import MarkdownView from '@/components/MarkdownView';
import { isStreamingExecuteJsonContent } from '../../utils/extractJsonCardsFromMarkdown';
import { ErrorMessage, TextMessage } from '../../typing';
import styles from './styles';

interface Props {
  data: TextMessage | ErrorMessage;
}

export default function TextMessageItem({ data }: Props) {
  const isError = data.type === 'error';
  const isUser = data.role === 'user';
  const isStreaming = !isError && 'isStreaming' in data && data.isStreaming;
  const content = data.content ?? '';
  const isEmptyStreaming = !isUser && !isError && isStreaming && !content.trim();
  const isExecuteJsonStreaming =
    !isUser && !isError && isStreaming && isStreamingExecuteJsonContent(content);
  const showThinking = isEmptyStreaming || isExecuteJsonStreaming;

  // 占位流结束后内容被抽成卡片或合并进确认卡时，避免渲染空白气泡
  if (!isUser && !isError && !showThinking && !content.trim()) {
    return null;
  }

  if (showThinking) {
    return (
      <View style={[styles.messageRow, styles.messageRowAssistant]}>
        <View style={[styles.bubble, styles.bubbleThinking]}>
          <Text style={[styles.text, styles.thinkingText]} selectable>
            正在思考中...
          </Text>
        </View>
      </View>
    );
  }

  const renderMessageContent = () => {
    if (isUser) {
      return (
        <Text style={styles.text} selectable>
          {content}
        </Text>
      );
    }

    if (isError) {
      return (
        <Text style={[styles.text, styles.errorText]} selectable>
          {content}
        </Text>
      );
    }

    return (
      <View style={styles.markdownWrap}>
        <MarkdownView content={content} isStreaming={Boolean(isStreaming)} />
        {isStreaming ? <Text style={styles.cursor}>|</Text> : null}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.messageRow,
        isUser ? styles.messageRowUser : styles.messageRowAssistant,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser
            ? styles.bubbleUser
            : isError
            ? styles.bubbleError
            : styles.bubbleAssistant,
        ]}
      >
        {renderMessageContent()}
      </View>
    </View>
  );
}
