import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import MarkdownView from '@/components/MarkdownView';
import { ConfirmMessage } from '../../typing';
import textStyles from '../textMessage/styles';
import styles from './styles';

interface Props {
  data: ConfirmMessage;
  onCancel?: () => void;
  onConfirm?: () => void;
}

export default function ConfirmCard({ data, onCancel, onConfirm }: Props) {
  const showActions = !data.submitted && !data.processing;
  const hasReply = Boolean(data.replyContent?.trim());
  const isPendingFlow = Boolean(
    data.submitted ||
      data.processing ||
      data.approved ||
      data.rejected ||
      hasReply,
  );
  const showThinking =
    data.processing || (Boolean(data.isReplyStreaming) && !hasReply);

  if (!isPendingFlow) {
    return (
      <View style={styles.messageRow}>
        <View style={styles.card}>
          <Text style={styles.title} selectable>
            {data.title || '需要确认'}
          </Text>
          <MarkdownView
            content={data.content || '是否执行？'}
            style={styles.contentMarkdown}
          />
          {showActions ? (
            <View style={styles.actions}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.cancelBtn}
                onPress={onCancel}
              >
                <Text style={styles.cancelBtnText}>
                  {data.cancelText || '取消'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.confirmBtn}
                onPress={onConfirm}
              >
                <Text style={styles.confirmBtnText}>
                  {data.confirmText || '确认执行'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  return (
    <View style={[textStyles.messageRow, textStyles.messageRowAssistant]}>
      <View
        style={[
          textStyles.bubble,
          textStyles.bubbleAssistant,
          styles.replyBubble,
          showThinking && styles.replyBubbleThinking,
        ]}
      >
        {data.approved ? (
          <Text style={styles.titleCompleted} selectable>
            执行完成
          </Text>
        ) : null}
        {data.rejected ? (
          <Text style={styles.titleCancelled} selectable>
            已取消
          </Text>
        ) : null}
        {showThinking ? (
          <Text
            style={[textStyles.text, textStyles.thinkingText]}
            selectable
          >
            正在思考中...
          </Text>
        ) : null}
        {hasReply ? (
          <MarkdownView
            content={data.replyContent!}
            isStreaming={Boolean(data.isReplyStreaming)}
          />
        ) : null}
        {data.rejected && data.rejectedHint ? (
          <MarkdownView content={data.rejectedHint} style={styles.rejectedHint} />
        ) : null}
      </View>
    </View>
  );
}
