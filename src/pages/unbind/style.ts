import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: px(24),
    alignItems: 'center',
  },
  content: {
    width: '100%',
    marginTop: px(80),
    paddingHorizontal: px(12),
    paddingVertical: px(16),
    backgroundColor: '#F7F7FB',
    borderRadius: px(12),
  },
  contentTitle: {
    fontWeight: '700',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    textAlign: 'left',
  },
  contentText: {
    width: '100%',
    marginTop: px(12),
  },
  text: {
    width: '100%',
    color: '#333333',
    fontSize: fontSize(14),
    textAlign: 'left',
    lineHeight: px(20),
    fontWeight: '400',
    marginBottom: px(6),
  },
  confirmBtn: {
    width: px(160),
    height: px(48),
    marginTop: px(36),
    backgroundColor: '#333333',
    borderRadius: px(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: fontSize(16),
    color: '#FFFFFF',
    fontWeight: '700',
  },
  toastTitle: {
    marginTop: px(8),
    fontSize: fontSize(18),
    color: '#333333',
    lineHeight: px(22),
    textAlign: 'center',
    fontWeight: '400',
  },
  toastText: {
    marginTop: px(8),
    fontSize: fontSize(16),
    color: '#333333',
    lineHeight: px(22),
    textAlign: 'center',
    fontWeight: '400',
  },
  popBtnWrap: {
    marginTop: px(24),
  },
});
