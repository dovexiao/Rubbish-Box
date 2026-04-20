import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const forgetPasswordStyles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: px(24),
    paddingTop: px(152),
  },
  passwordTitle: {
    fontWeight: 'bold',
    fontSize: fontSize(16),
    color: '#333333',
    lineHeight: px(20),
  },
  content: {
    marginTop: px(16),
    backgroundColor: '#f7f7fb',
    borderRadius: px(12),
    paddingHorizontal: px(10),
    width: px(326),
    height: px(56),
    position: 'relative',
  },
  error: {
    borderWidth: 1,
    borderColor: '#ff2b24',
  },
  input: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorMessage: {
    fontWeight: 'normal',
    fontSize: fontSize(14),
    color: '#ff2b24',
    lineHeight: px(20),
    position: 'absolute',
    bottom: px(-28),
    left: '50%',
    marginLeft: px(-35),
  },
  btn: {
    backgroundColor: '#999999',
    borderRadius: px(16),
    width: px(327),
    height: px(48),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: px(100),
  },
  btnActive: {
    backgroundColor: '#333333',
  },
  btnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: fontSize(16),
  },
});

export default forgetPasswordStyles;
