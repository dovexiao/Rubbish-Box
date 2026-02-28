import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingLeft: 24,
    paddingRight: 24,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    height: 204,
    marginTop: 80,
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#f7f7fb',
    borderRadius: 12,
  },
  contentTitle: {
    width: '100%',
    height: 20,
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
    color: '#ffffff',
    fontWeight: '700',
  },
  toastText: {
    marginTop: 8,
    fontWeight: '400',
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    textAlign: 'center',
  },
});

