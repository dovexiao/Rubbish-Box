import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 152,
  },
  passwordTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
    marginLeft: 20
  },
  content: {
    marginTop: 16,
    backgroundColor: '#f7f7fb',
    borderRadius: 12,
    paddingHorizontal: 10,
    width: 327,
    height: 56,
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
    fontSize: 14,
    color: '#ff2b24',
    lineHeight: 20,
    position: 'absolute',
    bottom: -28,
    left: '50%',
    marginLeft: -35,
  },
  btn: {
    backgroundColor: '#999999',
    borderRadius: 16,
    width: 327,
    height: 48,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  btnActive: {
    backgroundColor: '#333333',
  },
  btnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default styles;
