import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    paddingHorizontal: px(24),
    paddingTop: px(100),
  },
  passwordTitle: {
    fontSize: fontSize(24),
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: px(34),
    textAlign: 'center',
  },
  codeBox: {
    marginTop: px(52),
    marginBottom: px(16),
  },
  codeTitle: {
    fontSize: fontSize(16),
    color: '#333333',
    lineHeight: px(22),
    fontWeight: 'bold',
  },
  getAgain: {
    paddingVertical: px(8),
    paddingHorizontal: px(12),
  },
  getAgainText: {
    fontSize: fontSize(14),
    color: '#999',
  },
  getAgainTextActive: {
    color: '#333333',
  },
  btnBox: {
    marginTop: px(90),
  },
  submitBtn: {
    marginTop: px(16),
    backgroundColor: '#999999',
    borderRadius: px(16),
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: px(15),
  },
  btnActive: {
    backgroundColor: '#333333',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: fontSize(16),
    fontWeight: 'bold',
  },
});

export default styles;
