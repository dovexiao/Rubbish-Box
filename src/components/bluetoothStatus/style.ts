import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  groupListContent: {
    width: '100%',
    padding: px(24),
  },
  groupListItem: {
    width: '100%',
    backgroundColor: '#f7f7fb',
    borderRadius: px(12),
    paddingVertical: px(16),
    paddingHorizontal: px(12),
    marginBottom: px(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupListItemText: {
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    flex: 1,
    marginRight: px(12),
  },
  groupListItemButton: {
    width: px(80),
    height: px(29),
    borderRadius: px(41),
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupListItemButtonText: {
    fontSize: fontSize(12),
    color: '#ffffff',
    lineHeight: px(17),
    fontWeight: '700',
  },
  groupListItemTextConnected: {
    fontSize: fontSize(14),
    color: '#1fc871',
    lineHeight: px(20),
  },
  groupListItemTextPairedFar: {
    fontSize: fontSize(14),
    color: '#ff873d',
    lineHeight: px(20),
  },
  popTitle: {
    fontWeight: '700',
    fontSize: fontSize(16),
    color: '#333333',
    lineHeight: px(22),
    textAlign: 'center',
  },
  popText: {
    marginTop: px(8),
    fontSize: fontSize(14),
    color: '#999999',
    lineHeight: px(20),
    textAlign: 'center',
  },
  vipCodeTitle: {
    fontWeight: '400',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    textAlign: 'center',
  },
  vipCodeText: {
    fontSize: fontSize(14),
    color: '#ff873d',
    lineHeight: px(20),
    textAlign: 'center',
  },
  operationConfirmButton: {
    width: px(124),
    height: px(42),
    backgroundColor: '#333333',
    borderRadius: px(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: px(15),
  },
  operationConfirmButtonText: {
    fontSize: fontSize(12),
    color: '#ffffff',
    lineHeight: px(17),
    fontWeight: '700',
  },
});
