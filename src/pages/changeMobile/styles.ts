import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: px(24),
  },
  section: {
    marginTop: px(100),
    marginBottom: px(16),
  },
  title: {
    fontSize: fontSize(16),
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: px(22),
    textAlign: 'center',
  },
  desc: {
    fontSize: fontSize(14),
    color: '#999999',
    lineHeight: px(20),
    textAlign: 'center',
    paddingHorizontal: px(24),
    marginTop: px(8),
  },
  inputRow: {
    marginTop: px(16),
    backgroundColor: '#f7f7fb',
    borderRadius: px(12),
    paddingHorizontal: px(10),
    flexDirection: 'row',
    alignItems: 'center',
    width: px(327),
    height: px(56),
  },
  input: {
    flex: 1,
    fontSize: fontSize(16),
    color: '#333333',
    lineHeight: px(22),
  },
  codeBtn: {
    marginLeft: px(12),
    paddingHorizontal: px(16),
    paddingVertical: px(6),
    borderLeftWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    minWidth: px(112),
    alignItems: 'center',
  },
  codeBtnDisabled: {
    borderColor: '#CCCCCC',
  },
  codeBtnText: {
    fontSize: fontSize(16),
    color: '#333333',
  },
  codeBtnTextDisabled: {
    color: '#CCCCCC',
  },
  errorBorder: {
    borderColor: '#ff2b24',
    borderWidth: 1,
    borderRadius: px(12),
  },
  errorText: {
    marginTop: px(4),
    fontSize: fontSize(12),
    color: '#FF4D4F',
    lineHeight: px(20),
  },
  nextBtn: {
    marginTop: px(36),
    width: px(160),
    height: px(48),
    borderRadius: px(16),
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  nextBtnDisabled: {
    backgroundColor: '#999999',
  },
  nextBtnText: {
    fontSize: fontSize(16),
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default styles;
