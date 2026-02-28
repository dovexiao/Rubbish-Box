import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    flexDirection: 'column',
    alignItems: 'center',
    paddingLeft: 24,
    paddingRight: 24,
  },
  deviceContent: {
    width: '100%',
    flex: 1,
  },
  deviceItem: {
    width: '100%',
    backgroundColor: '#f7f7fb',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  h220: {
    height: 110,
  },
  h160: {
    height: 80,
  },
  deviceImg: {
    width: 36,
    height: 36,
  },
  radioImg: {
    width: 20,
    height: 20,
  },
  flexBox: {
    flex: 1,
    marginLeft: 12,
    marginRight: 15,
  },
  itemName: {
    fontWeight: '700',
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    textAlign: 'left',
    flex: 1,
  },
  groupToast: {
    fontWeight: '400',
    fontSize: 12,
    color: '#ff5a5a',
    lineHeight: 17,
    textAlign: 'left',
  },
  pageFooter: {
    height: 80,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  sureCreateBtn: {
    width: 196,
    height: 48,
    backgroundColor: '#333333',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#999999',
  },
  sureCreateBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    marginTop: 50,
  },
  emptyImage: {
    width: 120,
    height: 120,
  },
  emptyText: {
    fontSize: 14,
    color: '#999999',
    opacity: 0.5,
    marginTop: 16,
  },
});

