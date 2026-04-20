import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FA',
    paddingHorizontal: px(16),
  },
  serviceItem: {
    width: '100%',
    marginTop: px(12),
    padding: px(16),
    backgroundColor: '#FFFFFF',
    borderRadius: px(12),
  },
  itemTopBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: px(20),
  },
  itemTopText: {
    flex: 1,
    fontSize: fontSize(12),
    color: '#999999',
    lineHeight: px(17),
  },
  diviler: {
    width: '100%',
    height: px(1),
    marginVertical: px(12),
    backgroundColor: 'rgba(51,51,51,0.1)',
  },
  text: {
    fontSize: fontSize(14),
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: px(20),
  },
  rightText: {
    flex: 1,
    fontWeight: 'normal',
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
