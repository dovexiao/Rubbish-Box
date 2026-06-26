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
    minWidth: 0,
    padding: px(12),
    borderRadius: px(12),
    overflow: 'hidden',
  },
  bubbleUser: {
    backgroundColor: '#e0e8f9',
  },
  bubbleAssistant: {
    backgroundColor: '#ffffff',
  },
  bubbleThinking: {
    alignSelf: 'flex-start',
  },
  markdownWrap: {
    width: '100%',
    minWidth: 0,
  },
  bubbleError: {
    backgroundColor: '#fff1f0',
  },
  bubbleWithConfirm: {
    width: '100%',
  },
  text: {
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(22),
  },
  thinkingText: {
    color: '#999999',
  },
  errorText: {
    color: '#ff4d4f',
  },
  cursor: {
    marginLeft: px(2),
    color: '#333333',
  },
  confirmSection: {
    marginTop: px(12),
    paddingTop: px(12),
    flexDirection: 'column',
  },
  confirmTitle: {
    marginBottom: px(8),
    fontWeight: '500',
    fontSize: fontSize(14),
    color: '#fd8e62',
    lineHeight: px(22),
  },
  confirmTitleCancelled: {
    marginBottom: px(8),
    fontWeight: '500',
    fontSize: fontSize(14),
    color: '#999999',
    lineHeight: px(22),
  },
  confirmTitleCompleted: {
    marginBottom: px(8),
    fontWeight: '500',
    fontSize: fontSize(14),
    color: '#52c41a',
    lineHeight: px(22),
  },
  confirmActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: px(8),
  },
  cancelBtn: {
    flex: 1,
    height: px(42),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: px(12),
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  cancelBtnText: {
    fontSize: fontSize(14),
    color: '#999999',
    lineHeight: px(20),
  },
  confirmBtn: {
    flex: 1,
    height: px(42),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333333',
    borderRadius: px(12),
  },
  confirmBtnText: {
    fontWeight: '500',
    fontSize: fontSize(14),
    color: '#ffffff',
    lineHeight: px(20),
  },
  rejectedHint: {
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(22),
  },
});

export default styles;
