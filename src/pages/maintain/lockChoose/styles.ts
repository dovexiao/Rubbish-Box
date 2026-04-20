import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FA',
    paddingHorizontal: px(24),
  },
  item: {
    width: '100%',
    minHeight: px(60),
    padding: px(12),
    marginTop: px(12),
    backgroundColor: '#FFFFFF',
    borderRadius: px(12),
    flexDirection: 'row',
    alignItems: 'center',
  },
  borderActive: {
    borderWidth: px(1),
    borderColor: '#333333',
  },
  lockName: {
    flex: 1,
    marginLeft: px(12),
    fontSize: fontSize(14),
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: px(20),
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: px(60),
  },
  emptyImage: {
    width: px(120),
    height: px(120),
  },
  emptyText: {
    fontSize: fontSize(14),
    color: '#666666',
    marginTop: px(16),
  },
});
