import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  outContainer: {
    flex: 1,
    paddingLeft: px(24),
    paddingRight: px(24),
    flexDirection: 'column',
    alignItems: 'center',
  },
  innerTitle: {
    width: '100%',
    height: px(22),
    fontWeight: '700',
    fontSize: fontSize(16),
    color: '#333333',
    lineHeight: px(22),
    textAlign: 'center',
  },
  mt200: {
    marginTop: px(100),
  },
  innerToast: {
    width: '100%',
    height: px(20),
    marginTop: px(8),
    marginBottom: px(16),
    fontWeight: '400',
    fontSize: fontSize(14),
    color: '#999999',
    lineHeight: px(20),
    textAlign: 'center',
  },
  innerPhone: {
    width: '100%',
    height: px(56),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: px(8),
    borderRadius: px(12),
  },
  backColor: {
    backgroundColor: '#f7f7fb',
  },
  whiteColor: {
    backgroundColor: '#ffffff',
  },
  adminMobile: {
    width: '100%',
    height: px(34),
    fontWeight: '700',
    fontSize: fontSize(24),
    color: '#333333',
    lineHeight: px(34),
    textAlign: 'center',
  },
  codeToast: {
    width: '100%',
    height: px(20),
    marginBottom: px(14),
    fontWeight: '400',
    fontSize: fontSize(14),
    color: '#ff2b24',
    lineHeight: px(20),
    textAlign: 'center',
  },
  btn: {
    width: px(160),
    height: px(48),
    borderRadius: px(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendCodeBtn: {
    backgroundColor: '#333333',
  },
  verificationCodeBtn: {
    backgroundColor: '#999999',
  },
  btnText: {
    fontWeight: '700',
    fontSize: fontSize(16),
    color: '#ffffff',
    lineHeight: px(22),
    textAlign: 'center',
  },
});
