import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  switchBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    opacity: 0.5,
    marginTop: 16,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
  },
  switchLine: {
    width: 1,
    height: 16,
    marginHorizontal: 8,
    backgroundColor: '#999',
  },
  roleNameText: {
    fontWeight: 400,
    fontSize: 12,
    color: '#333333',
    marginRight: 8,
  },
  switchText: {
    fontSize: 14,
    fontWeight: '400',
  },
  header: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  footer: {
    width: '100%',
    paddingTop: 12,
    paddingBottom: 16,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectListBtn: {
    paddingHorizontal: 46,
    paddingVertical: 13,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
  },
  selectListBtnText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  emptyContainer: {
    padding: 30,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 14,
  },
  editContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingTop: 16,
    paddingHorizontal: 24,
    position: 'relative',
  },
  closeIcon: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  editContent: {
    marginTop: 24,
    marginBottom: 36,
  },
  editItem: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  input: {
    flex: 1,
    textAlign: 'right',
    fontSize: 16,
    color: '#333',
    padding: 0,
    marginRight: 4,
  },
  editFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editBtn: {
    flex: 1,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  cancelBtn: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,0.1)',
    marginRight: 15,
  },
  confirmBtn: {
    backgroundColor: '#333', // Dark theme primary
    marginLeft: 10,
  },
  cancelText: {
    color: '#666',
    fontSize: 16,
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
  },
});
