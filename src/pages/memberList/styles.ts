import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: '#F6F7FA',
  },
  listContent: {
    paddingBottom: 80,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  username: {
    fontSize: 14,
    color: '#333333',
    fontWeight: 'bold',
    lineHeight: 20,
  },
  mobile: {
    fontSize: 14,
    color: '#999999',
    lineHeight: 20,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeText: {
    fontSize: 14,
    color: '#999999',
    paddingRight: 12,
  },
  footer: {
    marginBottom: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonWrap: {
    boxShadow: '0 4px 16px 0 rgba(0, 0, 0, 0.25)',
    borderRadius: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 14,
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100,
  },
});

export default styles;
