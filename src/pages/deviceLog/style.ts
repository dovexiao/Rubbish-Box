import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: px(16),
  },
  containerScrollView: {
    paddingHorizontal: px(16),
  },
  date: {
    marginLeft: px(8),
    marginTop: px(12),
    marginBottom: px(4),
    fontSize: fontSize(14),
    fontWeight: '500',
    color: '#333',
  },
  card: {
    borderRadius: px(12),
    paddingHorizontal: px(12),
    paddingVertical: px(16),
    backgroundColor: '#F7F7FB',
    gap: px(12),
  },

  left: {
    flex: 1,
    fontSize: fontSize(14),
    marginRight: px(12),
    fontWeight: '400',
    color: '#333',
  },
  right: { fontSize: fontSize(12), color: '#999' },
});
