import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const loginSmsStyles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingHorizontal: px(24),
  },
  passwordTitle: {
    marginTop: px(152),
    marginLeft: px(20),
  },
  passwordTitleText: {
    fontWeight: 'bold',
    fontSize: fontSize(16),
    color: '#333333',
    lineHeight: px(22),
  },
  btnBox: {
    marginTop: px(78),
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  getAgain: {
    borderRadius: px(12),
  },
  getAgainActive: {
    color: '#333333',
  },
  getAgainText: {
    fontSize: fontSize(14),
    color: '#999',
    marginRight: px(4),
  },
  getAgainTextActive: {
    color: '#333333',
  },
  submitBtn: {
    borderRadius: px(12),
    marginTop: px(16),
    backgroundColor: '#999999',
    paddingVertical: px(15),
    width: '100%',
  },
  submitBtnText: {
    color: '#ffffff',
    lineHeight: px(22),
    fontSize: fontSize(16),
    textAlign: 'center',
    fontWeight: 'normal',
  },
  submitBtnTextActive: {
    fontWeight: 'bold',
  },
  btnActive: {
    backgroundColor: '#333333',
  },
});

export default loginSmsStyles;
