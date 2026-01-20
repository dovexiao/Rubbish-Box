import { StyleSheet } from 'react-native';

const loginSmsStyles = StyleSheet.create({
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    paddingHorizontal: 24,
  },
  passwordTitle: {
    marginTop: 152,
    marginLeft: 20
  },
  passwordTitleText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
  },
  btnBox: {
    marginTop: 78,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  getAgain: {
    borderRadius: 12,
  },
  getAgainActive: {
    color: '#333333',
  },
  getAgainText: {
    fontSize: 14,
    color: '#999',
    marginRight: 4,
  },
  getAgainTextActive: {
    color: '#333333',
  },
  submitBtn: {
    borderRadius: 12,
    marginTop: 16,
    backgroundColor: '#999999',
    paddingVertical: 15,
    width: '100%'
  },
  submitBtnText: {
    color: '#ffffff',
    lineHeight: 22,
    fontSize: 16,
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

