import { StyleSheet } from 'react-native';

const passwordStyles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 55,
    paddingHorizontal: 24,
  },
  content: {
    marginTop: 16,
    backgroundColor: '#f7f7fb',
    borderRadius: 12,
    width: 326,
    height: 56,
    paddingHorizontal: 10,
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ff2b24',
  },
  error: {
    fontSize: 14,
    color: '#ff2b24',
    lineHeight: 20,
  },
  errorBox: {
    width: '100%',
    marginTop: 8,
  },
  forget: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    marginLeft: 42,
  },
  btn: {
    borderRadius: 16,
    marginTop: 32,
    width: 327,
    height: 48,
    backgroundColor: '#999999',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 22,
  },
  btnActive: {
    backgroundColor: '#333333',
  },
  changeType: {
    marginTop: 16,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  changeTypeDesc: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
});

export default passwordStyles;
