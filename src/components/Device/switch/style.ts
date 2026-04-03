import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  switchBtn: {
    paddingVertical: px(6),
    paddingHorizontal: px(12),
    backgroundColor: '#fff',
    opacity: 0.5,
    marginTop: px(16),
    borderRadius: px(12),
    display: 'flex',
    alignItems: 'center',
  },
  switchLine: {
    width: px(1),
    height: px(16),
    marginHorizontal: px(8),
    backgroundColor: '#999',
  },
  roleNameText: {
    fontSize: fontSize(12),
    color: '#333333',
    marginRight: px(8),
    fontWeight: '400',
  },
  switchText: {
    fontSize: fontSize(14),
    fontWeight: '400',
  },
  header: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize(16),
    fontWeight: '500',
    color: '#333',
  },
  footer: {
    width: '100%',
    paddingTop: px(12),
    paddingBottom: px(16),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectListBtn: {
    paddingHorizontal: px(46),
    paddingVertical: px(13),
    borderRadius: px(12),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
  },
  selectListBtnText: {
    fontSize: fontSize(16),
    fontWeight: '500',
    color: '#fff',
  },
  emptyContainer: {
    padding: px(30),
    alignItems: 'center',
  },
  emptyText: {
    color: '#666666',
    fontSize: fontSize(14),
  },
  editContainer: {
    backgroundColor: '#fff',
    borderRadius: px(16),
    paddingTop: px(16),
    paddingHorizontal: px(24),
    position: 'relative',
  },
  closeIcon: {
    position: 'absolute',
    top: px(16),
    right: px(16),
  },
  editContent: {
    marginTop: px(24),
    marginBottom: px(36),
  },
  editItem: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editLabel: {
    fontSize: fontSize(14),
    color: '#333',
    fontWeight: '500',
  },
  input: {
    flex: 1,
    textAlign: 'right',
    fontSize: fontSize(16),
    color: '#333',
    padding: 0,
    marginRight: px(4),
  },
  editFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editBtn: {
    flex: 1,
    height: px(44),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: px(12),
  },
  cancelBtn: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,0.1)',
    marginRight: px(15),
  },
  confirmBtn: {
    backgroundColor: '#333', // Dark theme primary
    marginLeft: px(10),
  },
  cancelText: {
    color: '#666',
    fontSize: fontSize(16),
  },
  confirmText: {
    color: '#fff',
    fontSize: fontSize(16),
  },
});
