import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fa',
  },
  listContent: {
    paddingHorizontal: px(16),
    paddingTop: px(12),
    paddingBottom: px(16),
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: px(16),
    padding: px(16),
    paddingBottom: px(24),
    marginBottom: px(12),
  },
  optContent: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: fontSize(14),
    fontWeight: '400',
    color: '#333333',
    lineHeight: px(20),
  },
  btn: {
    paddingHorizontal: px(16),
    paddingVertical: px(6),
    borderRadius: px(41),
    backgroundColor: '#333333',
  },
  btnDisabled: {
    backgroundColor: '#CCCCCC',
  },
  btnText: {
    fontSize: fontSize(12),
    color: '#FFFFFF',
    fontWeight: '400',
  },

  metaRow: {
    marginTop: px(3),
  },
  metaText: {
    fontSize: fontSize(12),
    color: '#666666',
    marginLeft: px(4),
    marginRight: px(8),
  },
  verticalLine: {
    width: 1,
    height: px(12),
    backgroundColor: '#cccccc',
    marginHorizontal: px(10),
  },

  actionsRow: {
    paddingHorizontal: px(8),
  },
  operationWrap: {
    flex: 1,
    alignItems: 'center',
  },
  operationPlaceholder: {
    flex: 1,
  },
  iconBox: {
    marginTop: px(20),
    marginBottom: px(6),
    width: px(50),
    height: px(50),
    borderRadius: px(25),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7FB',
    position: 'relative',
  },
  warningIcon: {
    position: 'absolute',
    top: px(-4),
    right: px(-4),
    width: px(20),
    height: px(20),
  },
  operationText: {
    fontSize: fontSize(12),
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
    paddingHorizontal: px(10),
    paddingVertical: px(8),
    borderRadius: px(12),
    shadowColor: '#000000',
    shadowOffset: {
      width: px(0),
      height: px(2),
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBtnText: {
    fontSize: fontSize(14),
    color: '#333333',
    fontWeight: '500',
    marginLeft: px(2),
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: px(80),
  },
  emptyText: {
    color: '#666666',
    fontSize: fontSize(14),
  },
});
