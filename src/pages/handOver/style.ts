import { StyleSheet } from 'react-native';
import { px, fontSize } from '@/utils/ui';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: px(24),
    paddingRight: px(24),
    alignItems: 'center',
  },
  content: {
    width: '100%',
    height: px(204),
    marginTop: px(80),
    paddingLeft: px(12),
    paddingRight: px(12),
    paddingTop: px(16),
    paddingBottom: px(16),
    backgroundColor: '#f7f7fb',
    borderRadius: px(12),
  },
  contentTitle: {
    width: '100%',
    height: px(20),
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
    color: '#ffffff',
    fontWeight: '700',
  },
  toastText: {
    marginTop: px(8),
    fontWeight: '400',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    textAlign: 'center',
  },
});
