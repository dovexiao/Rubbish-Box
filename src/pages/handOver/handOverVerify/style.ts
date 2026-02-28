import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  outContainer: {
    flex: 1,
    paddingLeft: 24,
    paddingRight: 24,
    flexDirection: 'column',
    alignItems: 'center',
  },
  innerTitle: {
    width: '100%',
    height: 22,
    fontWeight: '700',
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
    textAlign: 'center',
  },
  mt200: {
    marginTop: 100,
  },
  innerToast: {
    width: '100%',
    height: 20,
    marginTop: 8,
    marginBottom: 16,
    fontWeight: '400',
    fontSize: 14,
    color: '#999999',
    lineHeight: 20,
    textAlign: 'center',
  },
  innerPhone: {
    width: '100%',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 12,
  },
  backColor: {
    backgroundColor: '#f7f7fb',
  },
  whiteColor: {
    backgroundColor: '#ffffff',
  },
  adminMobile: {
    width: '100%',
    height: 34,
    fontWeight: '700',
    fontSize: 24,
    color: '#333333',
    lineHeight: 34,
    textAlign: 'center',
  },
  codeToast: {
    width: '100%',
    height: 20,
    marginBottom: 14,
    fontWeight: '400',
    fontSize: 14,
    color: '#ff2b24',
    lineHeight: 20,
    textAlign: 'center',
  },
  btn: {
    width: 160,
    height: 48,
    borderRadius: 16,
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
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 22,
    textAlign: 'center',
  },
});

