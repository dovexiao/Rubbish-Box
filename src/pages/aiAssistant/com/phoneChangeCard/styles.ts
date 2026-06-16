import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  messageRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: px(12),
  },
  card: {
    width: '100%',
    padding: px(12),
    backgroundColor: '#fbfbfb',
    borderRadius: px(12),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: px(12),
  },
  title: {
    fontWeight: '500',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(22),
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: px(4),
  },
  linkText: {
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
  },
  formCard: {
    padding: px(16),
    backgroundColor: '#ffffff',
    borderRadius: px(16),
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  formTitle: {
    marginBottom: px(16),
    fontSize: fontSize(14),
    fontWeight: '500',
    color: '#333333',
    lineHeight: px(20),
  },
  formDesc: {
    marginBottom: px(24),
    fontSize: fontSize(12),
    color: '#999999',
    lineHeight: px(17),
  },
  input: {
    width: '100%',
    height: px(44),
    paddingHorizontal: px(24),
    marginBottom: px(16),
    fontSize: fontSize(14),
    color: '#333333',
    backgroundColor: '#f4f4f4',
    borderRadius: px(16),
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: px(44),
    marginBottom: px(32),
    backgroundColor: '#f4f4f4',
    borderRadius: px(16),
    overflow: 'hidden',
  },
  codeInput: {
    flex: 1,
    minWidth: 0,
    height: px(44),
    paddingHorizontal: px(24),
    fontSize: fontSize(14),
    color: '#333333',
    backgroundColor: 'transparent',
  },
  codeDivider: {
    width: 1,
    height: px(20),
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    flexShrink: 0,
  },
  codeBtn: {
    flexShrink: 0,
    paddingHorizontal: px(24),
    height: px(44),
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeBtnText: {
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
  },
  submitBtn: {
    width: '100%',
    height: px(44),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#cccccc',
    borderRadius: px(16),
  },
  submitBtnText: {
    fontSize: fontSize(14),
    color: '#ffffff',
    lineHeight: px(20),
  },
});

export default styles;
