import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ConfirmMessage } from '../../typing';
import styles from './styles';

interface Props {
  data: ConfirmMessage;
  onCancel?: () => void;
  onConfirm?: () => void;
}

export default function ConfirmCard({ data, onCancel, onConfirm }: Props) {
  const showActions = !data.submitted;

  const getTitle = () => {
    if (data.approved) {
      return { text: '执行完成', style: styles.titleCompleted };
    }
    if (data.rejected) {
      return { text: '已取消', style: styles.titleCancelled };
    }
    return { text: data.title || '需要确认', style: styles.title };
  };

  const title = getTitle();

  return (
    <View style={styles.messageRow}>
      <View style={styles.card}>
        <Text style={title.style}>{title.text}</Text>
        <Text style={styles.content}>{data.content}</Text>
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
