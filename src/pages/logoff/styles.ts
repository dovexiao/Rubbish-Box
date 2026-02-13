import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
  },
  // Step 1 Confirm
  box: {
    paddingTop: 80,
    paddingBottom: 30,
    flex: 1,
  },
  flex1: {
    flex: 1,
    alignItems: 'center',
  },
  warnImage: {
    width: 120,
    height: 120,
  },
  confirmTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  content: {
    backgroundColor: '#f7f7fb',
    borderRadius: 12,
    marginTop: 24,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  item: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginBottom: 8,
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
    fontSize: 12,
    color: '#999999',
    lineHeight: 17,
    marginLeft: 6,
    flex: 1,
  },
  agreeLink: {
    color: '#999999',
  },
  btn: {
    marginTop: 16,
    backgroundColor: '#999999',
    borderRadius: 16,
    height: 48,
    width: 196,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  btnActive: {
    backgroundColor: '#333333',
  },
  btnText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Step 2 Verify (same as wechatUnbind)
  section: {
    marginTop: 100,
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: 24,
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    color: '#999999',
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginTop: 8,
  },
  inputRow: {
    marginTop: 16,
    backgroundColor: '#f7f7fb',
    borderRadius: 12,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    width: 327,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
  },
  codeBtn: {
    marginLeft: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderLeftWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    minWidth: 112,
    alignItems: 'center',
  },
  codeBtnDisabled: {
    borderColor: '#CCCCCC',
  },
  codeBtnText: {
    fontSize: 16,
    color: '#333333',
  },
  codeBtnTextDisabled: {
    color: '#CCCCCC',
  },
  errorBorder: {
    borderColor: '#ff2b24',
    borderWidth: 1,
    borderRadius: 12,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: '#FF4D4F',
    lineHeight: 20,
  },
  submitBtn: {
    marginTop: 36,
    width: 200,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: '#999999',
  },
  submitBtnText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  popTip: {
    fontSize: 12,
    color: '#999999',
    lineHeight: 17,
    marginTop: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  tipsBox: {
    backgroundColor: '#f7f7fb',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  tips: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#333333',
    marginRight: 8,
  },
  popBtn: {
    width: 156,
    backgroundColor: '#333333',
    marginTop: 36,
  },
});

export default styles;
