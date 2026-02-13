import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingHorizontal: 0,
    backgroundColor: '#F6F7FA',
  },
  tabsWrapper: {
    paddingHorizontal: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  tabsBox: {
    width: 220,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#333333',
  },
  tabText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  tabTextActive: {
    fontSize: 14,
    color: '#333333',
    fontWeight: 'bold',
  },
  listContent: {
    paddingHorizontal: 16,
  },
  recordItem: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  orderNoText: {
    fontSize: 12,
    color: '#999999',
    lineHeight: 17,
  },
  statusText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
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
    marginVertical: 12,
  },
  label: {
    fontSize: 14,
    color: '#333333',
    fontWeight: 'bold',
    minWidth: 58,
  },
  value: {
    fontSize: 14,
    color: '#333333',
    flex: 1,
    textAlign: 'right',
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
