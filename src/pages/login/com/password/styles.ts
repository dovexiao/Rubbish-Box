import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const passwordStyles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: px(55),
    paddingHorizontal: px(24),
  },
  content: {
    marginTop: px(16),
    backgroundColor: '#f7f7fb',
    borderRadius: px(12),
    width: px(326),
    height: px(56),
    paddingHorizontal: px(10),
  },
  input: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBorder: {
    borderRadius: px(12),
    borderWidth: px(1),
    borderColor: '#ff2b24',
  },
  error: {
    fontSize: fontSize(14),
    color: '#ff2b24',
    lineHeight: px(20),
  },
  errorBox: {
    width: '100%',
    marginTop: px(8),
  },
  forget: {
    fontWeight: 'bold',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    marginLeft: px(42),
  },
  btn: {
    borderRadius: px(16),
    marginTop: px(32),
    width: px(327),
    height: px(48),
    backgroundColor: '#999999',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontWeight: 'bold',
    fontSize: fontSize(16),
    color: '#ffffff',
    lineHeight: px(22),
  },
  btnActive: {
    backgroundColor: '#333333',
  },
  changeType: {
    marginTop: px(16),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeTypeDesc: {
    fontWeight: 'bold',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
  },
});

export default passwordStyles;
