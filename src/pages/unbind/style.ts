import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    marginTop: 80,
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: '#F7F7FB',
    borderRadius: 12,
  },
  contentTitle: {
    fontWeight: '700',
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    textAlign: 'left',
  },
  contentText: {
    width: '100%',
    marginTop: 12,
  },
  text: {
    width: '100%',
    color: '#333333',
    fontSize: 14,
    textAlign: 'left',
    lineHeight: 20,
    fontWeight: '400',
    marginBottom: 6,
  },
  confirmBtn: {
    width: 160,
    height: 48,
    marginTop: 36,
    backgroundColor: '#333333',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  toastTitle: {
    marginTop: 8,
    fontSize: 18,
    color: '#333333',
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '400',
  },
  toastText: {
    marginTop: 8,
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '400',
  },
  popBtnWrap: {
    marginTop: 24,
  },
});

