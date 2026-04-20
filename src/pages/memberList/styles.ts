import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: px(16),
    paddingTop: px(12),
    paddingBottom: px(16),
    backgroundColor: '#F6F7FA',
  },
  listContent: {
    paddingBottom: px(80),
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: px(12),
    padding: px(16),
    marginTop: px(12),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  username: {
    fontSize: fontSize(14),
    color: '#333333',
    fontWeight: 'bold',
    lineHeight: px(20),
  },
  mobile: {
    fontSize: fontSize(14),
    color: '#999999',
    lineHeight: px(20),
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeText: {
    fontSize: fontSize(14),
    color: '#999999',
    paddingRight: px(12),
  },
  footer: {
    marginBottom: px(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonWrap: {
    boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.25)',
    borderRadius: px(16),
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: fontSize(16),
    fontWeight: 'bold',
    lineHeight: px(22),
  },
  emptyText: {
    textAlign: 'center',
    color: '#666666',
    fontSize: fontSize(14),
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: px(100),
  },
});

export default styles;
