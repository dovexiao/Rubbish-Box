import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: px(24),
  },
  // Step 1 Confirm
  box: {
    paddingTop: px(80),
    paddingBottom: px(30),
    flex: 1,
  },
  flex1: {
    flex: 1,
    alignItems: 'center',
  },
  warnImage: {
    width: px(120),
    height: px(120),
  },
  confirmTitle: {
    fontSize: fontSize(16),
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: px(22),
    textAlign: 'center',
    paddingHorizontal: px(24),
  },
  content: {
    backgroundColor: '#f7f7fb',
    borderRadius: px(12),
    marginTop: px(24),
    paddingVertical: px(16),
    paddingHorizontal: px(16),
  },
  item: {
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    marginBottom: px(8),
  },
  footer: {
    width: '100%',
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    // marginBottom: 16,
  },
  agree: {
    fontSize: fontSize(12),
    color: '#999999',
    lineHeight: px(17),
    marginLeft: px(6),
    flex: 1,
  },
  agreeLink: {
    color: '#999999',
  },
  btn: {
    marginTop: px(16),
    backgroundColor: '#999999',
    borderRadius: px(16),
    height: px(48),
    width: px(196),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  btnActive: {
    backgroundColor: '#333333',
  },
  btnText: {
    fontSize: fontSize(16),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Step 2 Verify (same as wechatUnbind)
  section: {
    marginTop: px(100),
    marginBottom: px(16),
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize(18),
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: px(24),
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
    borderLeftWidth: px(1),
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
    borderWidth: px(1),
    borderRadius: px(12),
  },
  errorText: {
    marginTop: px(4),
    fontSize: fontSize(12),
    color: '#FF4D4F',
    lineHeight: px(20),
  },
  submitBtn: {
    marginTop: px(36),
    width: px(200),
    height: px(48),
    borderRadius: px(16),
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#999999',
  },
  submitBtnText: {
    fontSize: fontSize(16),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  popTip: {
    fontSize: fontSize(12),
    color: '#999999',
    lineHeight: px(17),
    marginTop: px(14),
    marginBottom: px(16),
    textAlign: 'center',
  },
  tipsBox: {
    backgroundColor: '#f7f7fb',
    borderRadius: px(12),
    paddingVertical: px(16),
    paddingHorizontal: px(12),
  },
  tips: {
    fontWeight: 'bold',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
  },
  dot: {
    width: px(4),
    height: px(4),
    borderRadius: px(2),
    backgroundColor: '#333333',
    marginRight: px(8),
  },
  popBtn: {
    width: px(156),
    backgroundColor: '#333333',
    marginTop: px(36),
  },
});

export default styles;
