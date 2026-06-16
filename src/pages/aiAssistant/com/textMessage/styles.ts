import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  messageRow: {
    width: '100%',
    flexDirection: 'row',
    marginBottom: px(12),
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '100%',
    padding: px(12),
    borderRadius: px(12),
  },
  bubbleUser: {
    backgroundColor: '#e0e8f9',
  },
  bubbleAssistant: {
    backgroundColor: '#ffffff',
  },
  text: {
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(22),
  },
});

export default styles;
