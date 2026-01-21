import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    paddingHorizontal: 24,
    paddingTop: 100,
  },
  passwordTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: 34,
    textAlign: 'center',
  },
  codeBox: {
    marginTop: 52,
    marginBottom: 16,
  },
  codeTitle: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
    fontWeight: 'bold'
  },
  getAgain: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  getAgainText: {
    fontSize: 14,
    color: '#999',
  },
  getAgainTextActive: {
    color: '#333333',
  },
  btnBox: {
    marginTop: 90,
  },
  submitBtn: {
    marginTop: 16,
    backgroundColor: '#999999',
    borderRadius: 16,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
  },
  btnActive: {
    backgroundColor: '#333333',
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default styles;
