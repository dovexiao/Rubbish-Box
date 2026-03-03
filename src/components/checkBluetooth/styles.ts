import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  popupContainer: {
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
    textAlign: 'left',
    fontWeight: '700',
  },
  steps: {
    marginTop: 32,
  },
  stepItem: {
    backgroundColor: '#f7f7fb',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  stepItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  stepText: {
    fontWeight: '700',
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
  },
});

