import { StyleSheet } from 'react-native';
import { fontSize, px } from '@/utils/ui';

const loginStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: px(55),
  },
  content: {
    marginTop: px(16),
    backgroundColor: '#f7f7fb',
    borderRadius: px(12),
    paddingHorizontal: px(10),
    width: px(326),
    height: px(56),
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
    borderWidth: 1,
    borderColor: '#ff2b24',
  },
  tip: {
    marginTop: px(16),
    width: px(654) / 2,
  },
  tipText: {
    fontSize: fontSize(12),
    color: '#666666',
    lineHeight: px(17),
  },
  btn: {
    borderRadius: px(16),
    marginTop: px(32),
    width: px(327),
    height: px(48),
    position: 'relative',
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
  error: {
    fontWeight: 'normal',
    fontSize: fontSize(14),
    color: '#ff2b24',
    lineHeight: px(20),
    position: 'absolute',
    top: px(-26),
    left: '50%',
    marginLeft: px(-42),
  },
});

export default loginStyles;
