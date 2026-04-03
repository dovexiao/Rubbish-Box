import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  passwordCode: {
    width: '100%',
    marginTop: 16,
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeItem: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7fb',
    borderRadius: 12,
    width: 48,
    height: 48,
  },
  codeItemText: {
    fontWeight: 'bold',
    fontSize: 24,
    color: '#333333',
    lineHeight: 34,
  },
  active: {
    borderWidth: 1,
    borderColor: '#333333',
  },
  error: {
    borderWidth: 1,
    borderColor: '#ff2b24',
  },
  errorMessage: {
    width: '100%',
    marginTop: 8,
  },
  errorMessageText: {
    fontSize: 12,
    color: '#ff2b24',
    lineHeight: 14,
    textAlign: 'center',
  },
  hideInput: {
    position: 'absolute',
    left: -1000,
    top: 0,
    height: 50,
    width: 100,
    opacity: 0,
    zIndex: -1,
    color: 'transparent',
  },
});

export default styles;
