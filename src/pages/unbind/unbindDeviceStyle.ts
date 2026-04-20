import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  outContainer: {
    flex: 1,
    paddingHorizontal: px(24),
    alignItems: 'center',
  },
  innerTitle: {
    width: '100%',
    marginTop: px(100),
    fontWeight: '700',
    fontSize: fontSize(16),
    color: '#333333',
    lineHeight: px(22),
    textAlign: 'center',
  },
  innerToast: {
    width: '100%',
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
    backgroundColor: '#F7F7FB',
  },
  whiteColor: {
    backgroundColor: '#FFFFFF',
  },
  phoneNumber: {
    width: '100%',
    fontWeight: '700',
    fontSize: fontSize(20),
    color: '#333333',
    lineHeight: px(28),
    textAlign: 'center',
  },
  codeToast: {
    width: '100%',
    height: px(20),
    marginBottom: px(14),
    fontWeight: '400',
    fontSize: fontSize(14),
    color: '#FF2B24',
    lineHeight: px(20),
    textAlign: 'center',
  },
  btn: {
    width: px(160),
    height: px(48),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: px(16),
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
    color: '#FFFFFF',
    lineHeight: px(22),
    textAlign: 'center',
  },
});
