import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  popupContainer: {
    paddingHorizontal: px(24),
  },
  title: {
    fontSize: fontSize(16),
    color: '#333333',
    lineHeight: px(22),
    textAlign: 'left',
    fontWeight: '700',
  },
  steps: {
    marginTop: px(32),
  },
  stepItem: {
    backgroundColor: '#f7f7fb',
    borderRadius: px(12),
    paddingVertical: px(12),
    paddingHorizontal: px(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: px(16),
  },
  stepItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: px(8),
    flexShrink: 1,
  },
  stepText: {
    fontWeight: '700',
    fontSize: fontSize(16),
    color: '#333333',
    lineHeight: px(22),
  },
});
