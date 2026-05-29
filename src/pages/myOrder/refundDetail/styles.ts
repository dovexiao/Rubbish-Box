import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopWidth: px(1),
    borderTopColor: '#fafafa',
  },
  container: {
    paddingHorizontal: px(24),
    paddingTop: px(16),
    paddingBottom: px(20),
  },
  item: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E9E9E9',
    paddingBottom: px(18),
    marginBottom: px(18),
  },
  itemLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
  },
  timeText: {
    color: '#999999',
    fontSize: fontSize(12),
    marginBottom: px(10),
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: px(10),
  },
  resultText: {
    fontSize: fontSize(14),
    marginRight: px(10),
  },
  reasonText: {
    color: '#333333',
    fontSize: fontSize(14),
  },
});
