import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  listContent: {
    paddingBottom: px(32),
  },
  group: {
    paddingHorizontal: px(16),
    paddingTop: px(12),
  },
  dateLabel: {
    marginLeft: px(8),
    marginTop: px(6),
    marginBottom: 4,
    fontSize: fontSize(14),
    fontWeight: '500',
    color: '#333333',
  },
  itemContent: {
    width: '100%',
    borderRadius: px(12),
    paddingHorizontal: px(12),
    paddingVertical: px(16),
    backgroundColor: '#F7F7FB',
    marginTop: px(12),
  },
  itemTop: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: {
    flex: 1,
    marginHorizontal: px(4),
    fontSize: fontSize(14),
    fontWeight: '500',
    color: '#333333',
  },
  itemTime: {
    fontSize: fontSize(12),
    color: '#999999',
    fontWeight: '400',
  },
  bottomContent: {
    fontWeight: '400',
    marginTop: px(12),
    fontSize: fontSize(14),
    color: '#333333',
  },
  footer: {
    height: px(32),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
