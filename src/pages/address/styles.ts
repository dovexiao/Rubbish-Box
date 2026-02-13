import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FA',
    paddingHorizontal: 16,
  },
  listWrapper: {
    paddingBottom: 120,
  },
  addressItem: {
    width: '100%',
    marginTop: 12,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  itemPhone: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  itemEdit: {
    fontSize: 14,
    color: '#333333',
    fontWeight: 'bold',
    lineHeight: 20,
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  itemAddress: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  itemDel: {
    // marginLeft: 20,
    marginRight: 12,
  },
  itemDelText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  footerBtnWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 32,
    alignItems: 'center',
  },
  addBtn: {
    width: 196,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: '#999999',
  },
});

export default styles;
