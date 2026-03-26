import { StyleSheet } from 'react-native';

const loginStyles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 55,
  },
  content: {
    marginTop: 16,
    backgroundColor: '#f7f7fb',
    borderRadius: 12,
    paddingHorizontal: 10,
    width: 326,
    height: 56,
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
  tip: {
    marginTop: 16,
    width: 654 / 2,
  },
  tipText: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 17,
  },
  btn: {
    borderRadius: 16,
    marginTop: 32,
    width: 327,
    height: 48,
    position: 'relative',
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
  error: {
    fontWeight: 'normal',
    fontSize: 14,
    color: '#ff2b24',
    lineHeight: 20,
    position: 'absolute',
    top: -26,
    left: '50%',
    marginLeft: -42,
  },
});

export default loginStyles;
