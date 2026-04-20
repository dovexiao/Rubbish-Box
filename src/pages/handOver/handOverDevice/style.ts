import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    flexDirection: 'column',
    alignItems: 'center',
    paddingLeft: px(24),
    paddingRight: px(24),
  },
  deviceContent: {
    width: '100%',
    flex: 1,
  },
  deviceItem: {
    width: '100%',
    backgroundColor: '#f7f7fb',
    borderRadius: px(12),
    padding: px(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: px(12),
  },
  h220: {
    height: px(110),
  },
  h160: {
    height: px(80),
  },
  deviceImg: {
    width: px(36),
    height: px(36),
  },
  radioImg: {
    width: px(20),
    height: px(20),
  },
  flexBox: {
    flex: 1,
    marginLeft: px(12),
    marginRight: px(15),
  },
  itemName: {
    fontWeight: '700',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    textAlign: 'left',
    flex: 1,
  },
  groupToast: {
    fontWeight: '400',
    fontSize: fontSize(12),
    color: '#ff5a5a',
    lineHeight: px(17),
    textAlign: 'left',
  },
  pageFooter: {
    height: px(80),
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: px(32),
  },
  sureCreateBtn: {
    width: px(196),
    height: px(48),
    backgroundColor: '#333333',
    borderRadius: px(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#999999',
  },
  sureCreateBtnText: {
    color: '#ffffff',
    fontSize: fontSize(16),
    fontWeight: '700',
  },
  emptyContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    marginTop: px(50),
  },
  emptyImage: {
    width: px(120),
    height: px(120),
  },
  emptyText: {
    fontSize: fontSize(14),
    color: '#666666',
    marginTop: px(16),
  },
});
