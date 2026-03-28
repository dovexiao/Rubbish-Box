import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fa',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    paddingBottom: 24,
    marginBottom: 12,
  },
  optContent: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 14,
    fontWeight: '400',
    color: '#333333',
    lineHeight: 20,
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 41,
    backgroundColor: '#333333',
  },
  btnDisabled: {
    backgroundColor: '#CCCCCC',
  },
  btnText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '400',
  },

  metaRow: {
    marginTop: 3,
  },
  metaText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
    marginRight: 8,
  },
  verticalLine: {
    width: 1,
    height: 12,
    backgroundColor: '#cccccc',
    marginHorizontal: 10,
  },

  actionsRow: {
    paddingHorizontal: 8,
  },
  operationWrap: {
    flex: 1,
    alignItems: 'center',
  },
  operationPlaceholder: {
    flex: 1,
  },
  iconBox: {
    marginTop: 20,
    marginBottom: 6,
    width: 50,
    height: 50,
    borderRadius: 25,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7FB',
    position: 'relative',
  },
  warningIcon: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
  },
  operationText: {
    fontSize: 12,
    color: '#333333',
    fontWeight: '400',
    textAlign: 'center',
  },
  bottomBtnContent: {
    backgroundColor: '#f6f7fa',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBtnText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
    marginLeft: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
  },
  emptyText: {
    color: '#666666',
    fontSize: 14,
  },
});
