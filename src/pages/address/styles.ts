import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FA',
    paddingHorizontal: px(16),
  },
  listWrapper: {
    paddingBottom: px(120),
  },
  addressItem: {
    width: '100%',
    marginTop: px(12),
    padding: px(16),
    borderRadius: px(12),
    backgroundColor: '#FFFFFF',
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: px(8),
  },
  itemName: {
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
  },
  itemPhone: {
    flex: 1,
    marginLeft: px(8),
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
  },
  itemEdit: {
    fontSize: fontSize(14),
    color: '#333333',
    fontWeight: 'bold',
    lineHeight: px(20),
  },
  rowBottom: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  itemAddress: {
    flex: 1,
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
  },
  itemDel: {
    // marginLeft: 20,
    marginRight: px(12),
  },
  itemDelText: {
    fontSize: fontSize(14),
    color: '#CCCCCC',
  },
  footerBtnWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: px(32),
    alignItems: 'center',
  },
  addBtn: {
    width: px(196),
    height: px(48),
    borderRadius: px(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    fontSize: fontSize(16),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: px(80),
  },
  emptyText: {
    marginTop: px(8),
    fontSize: fontSize(14),
    color: '#666666',
  },
});

export default styles;
