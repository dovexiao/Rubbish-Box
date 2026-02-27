import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  passwordCode: {
    width: '100%',
    marginTop: 16,
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeItem: {
    width: 50,
    height: 50,
    backgroundColor: '#f7f7fb',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeItemError: {
    borderWidth: 1,
    borderColor: '#ff2b24',
  },
  codeNumText: {
    fontWeight: '700',
    fontSize: 24,
    color: '#333333',
    lineHeight: 34,
    textAlign: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    left: -100000,
    height: 0,
    width: 0,
    opacity: 0,
  },
});
