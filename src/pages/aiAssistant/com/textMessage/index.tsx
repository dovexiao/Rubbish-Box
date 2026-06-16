import React from 'react';
import { Text, View } from 'react-native';
import { TextMessage } from '../../typing';
import styles from './styles';

interface Props {
  data: TextMessage;
}

export default function TextMessageItem({ data }: Props) {
  const isUser = data.role === 'user';

  return (
    <View
      style={[
        styles.messageRow,
        isUser ? styles.messageRowUser : styles.messageRowAssistant,
      ]}
    >
      <View
        style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}
      >
        <Text style={styles.text}>{data.content}</Text>
      </View>
    </View>
  );
}
