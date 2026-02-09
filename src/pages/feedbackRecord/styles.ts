import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 0,
    backgroundColor: '#F6F7FA',
  },
  tabsWrapper: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  recordItem: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNoText: {
    fontSize: 13,
    color: '#666666',
  },
  statusText: {
    fontSize: 13,
    color: '#999999',
  },
  statusProcessing: {
    color: '#FF9F00',
  },
  statusDone: {
    color: '#00B578',
  },
  line: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 8,
  },
  label: {
    fontSize: 13,
    color: '#333333',
  },
  value: {
    fontSize: 13,
    color: '#666666',
  },
  descRow: {
    marginTop: 4,
  },
  emptyBox: {
    paddingTop: 80,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999999',
  },
});

export default styles;

