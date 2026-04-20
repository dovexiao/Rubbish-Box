import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
    backgroundColor: '#F6F7FA',
  },
  tabsWrapper: {
    paddingHorizontal: px(16),
    marginBottom: px(12),
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  tabsBox: {
    width: px(220),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: px(10),
    paddingVertical: px(6),
  },
  tabActive: {
    borderBottomWidth: px(2),
    borderBottomColor: '#333333',
  },
  tabText: {
    fontSize: fontSize(14),
    color: '#CCCCCC',
  },
  tabTextActive: {
    fontSize: fontSize(14),
    color: '#333333',
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: px(16),
  },
  recordItem: {
    borderRadius: px(12),
    backgroundColor: '#FFFFFF',
    paddingHorizontal: px(16),
    paddingVertical: px(16),
    marginBottom: px(12),
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: px(12),
  },
  orderNoText: {
    fontSize: fontSize(12),
    color: '#999999',
    lineHeight: px(17),
  },
  statusText: {
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
  },
  statusProcessing: {
    color: '#ff873d',
  },
  statusDone: {
    color: '#37c22a',
  },
  line: {
    height: 1,
    backgroundColor: 'rgba(234, 234, 234, 0.9)',
    marginVertical: px(12),
  },
  label: {
    fontSize: fontSize(14),
    color: '#333333',
    fontWeight: 'bold',
    minWidth: px(58),
  },
  value: {
    fontSize: fontSize(14),
    color: '#333333',
    flex: 1,
    textAlign: 'right',
  },
  descRow: {
    marginTop: px(4),
  },
  emptyBox: {
    paddingTop: px(80),
    alignItems: 'center',
  },
  emptyText: {
    marginTop: px(8),
    fontSize: fontSize(14),
    color: '#666666',
  },
});

export default styles;
