import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
  },
  iconWrapper: {
    marginTop: 180,
    gap: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 48,
    color: '#ffffff',
    fontWeight: '700',
  },
  iconText: {
    fontSize: 20,
    color: '#333333',
    lineHeight: 28,
    fontWeight: '700',
  },
  btnWrapper: {
    marginTop: 120,
    alignItems: 'center',
  },
  tips: {
    marginBottom: 24,
    fontSize: 16,
    color: '#999999',
    lineHeight: 22,
  },
  btnText: {
    fontWeight: '700',
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 22,
  },
});

