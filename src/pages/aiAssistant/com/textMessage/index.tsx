import React, { useEffect, useRef, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ErrorMessage, TextMessage } from '../../typing';
import styles from './styles';

interface Props {
  data: TextMessage | ErrorMessage;
  onConfirmCancel?: () => void;
  onConfirmSubmit?: () => void;
}

const TYPEWRITER_INTERVAL = 40;

export default function TextMessageItem({
  data,
  onConfirmCancel,
  onConfirmSubmit,
}: Props) {
  const isError = data.type === 'error';
  const isUser = data.role === 'user';
  const confirm = !isError && data.type === 'text' ? data.confirm : undefined;
  const showConfirmActions = Boolean(
    confirm && !confirm.submitted && !confirm.rejected && !confirm.approved,
  );

  const getConfirmTitle = () => {
    if (!confirm) return null;
    if (confirm.approved) {
      return { text: '执行完成', style: styles.confirmTitleCompleted };
    }
    if (confirm.rejected) {
      return { text: '已取消', style: styles.confirmTitleCancelled };
    }
    return { text: confirm.title || '需要确认', style: styles.confirmTitle };
  };

  const confirmTitle = getConfirmTitle();
  const [displayText, setDisplayText] = useState(data.content);
  const targetRef = useRef(data.content);

  useEffect(() => {
    targetRef.current = data.content;

    if (isUser || isError) {
      setDisplayText(data.content);
      return;
    }

    if (!('isStreaming' in data) || !data.isStreaming) {
      setDisplayText(data.content);
      return;
    }

    const timer = setInterval(() => {
      setDisplayText(prev => {
        const target = targetRef.current;
        if (prev.length >= target.length) return prev;
        return target.slice(0, prev.length + 1);
      });
    }, TYPEWRITER_INTERVAL);

    return () => clearInterval(timer);
  }, [data.content, data.type, isUser, isError, data]);

  const isStreaming = !isError && 'isStreaming' in data && data.isStreaming;
  const isThinking =
    !isUser && !isError && isStreaming && !(data.content ?? '').trim();

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
          confirm ? styles.bubbleWithConfirm : null,
        ]}
      >
        {confirmTitle ? (
          <Text style={confirmTitle.style}>{confirmTitle.text}</Text>
        ) : null}
        <Text
          style={[
            styles.text,
            isThinking && styles.thinkingText,
            isError && styles.errorText,
          ]}
        >
          {isUser ? data.content : isThinking ? '正在思考中...' : displayText}
          {!isUser && isStreaming && !isThinking ? (
            <Text style={styles.cursor}>|</Text>
          ) : null}
        </Text>

        {confirm?.rejected && confirm.rejectedHint ? (
          <Text style={styles.rejectedHint}>{confirm.rejectedHint}</Text>
        ) : null}

        {showConfirmActions ? (
          <View style={styles.confirmSection}>
            <View style={styles.confirmActions}>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.cancelBtn}
                onPress={onConfirmCancel}
              >
                <Text style={styles.cancelBtnText}>
                  {confirm!.cancelText || '取消'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.confirmBtn}
                onPress={onConfirmSubmit}
              >
                <Text style={styles.confirmBtnText}>
                  {confirm!.confirmText || '确认执行'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}
