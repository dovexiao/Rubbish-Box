import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 32,
  },
  group: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  dateLabel: {
    marginLeft: 8,
    marginTop: 6,
    marginBottom: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  itemContent: {
    width: '100%',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: '#F7F7FB',
    marginTop: 12,
  },
  itemTop: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemName: {
    flex: 1,
    marginHorizontal: 4,
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  itemTime: {
    fontSize: 12,
    color: '#999999',
    fontWeight: '400',
  },
  bottomContent: {
    fontWeight: '400',
    marginTop: 12,
    fontSize: 14,
    color: '#333',
  },
  footer: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
