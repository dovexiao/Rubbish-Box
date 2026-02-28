import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  box: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
    fontWeight: '700',
  },
  subTitle: {
    marginTop: 8,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  inputWrap: {
    marginTop: 16,
    width: '100%',
  },
  inputTitle: {
    fontSize: 14,
    color: '#999999',
    lineHeight: 20,
    marginBottom: 12,
  },
  digitsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  digitBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f7f7fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitText: {
    fontSize: 20,
    color: '#333333',
    lineHeight: 28,
    fontWeight: '700',
  },
  hiddenInput: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: 40,
    opacity: 0,
  },
  btnRow: {
    width: '100%',
    marginTop: 16,
  },
  btn: {
    width: 124,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  confirmBtn: {
    backgroundColor: '#333333',
  },
  cancelText: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '600',
  },
  confirmText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '700',
  },
});

