import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    backgroundColor: '#f6f7fa',
    paddingBottom: px(16),
    paddingTop: 0,
    marginTop: px(16),
    borderTopRightRadius: px(16),
    borderTopLeftRadius: px(16),
  },
  orderContainer: {
    flex: 1,
    marginTop: px(6),
  },
  orderTypeWrap: {
    alignSelf: 'center',
    width: px(208),
    height: px(42),
    backgroundColor: '#EDEEF1',
    borderRadius: px(21),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: px(4),
  },
  orderTypeTab: {
    flex: 1,
    height: px(34),
    borderRadius: px(17),
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderTypeTabActive: {
    backgroundColor: '#333333',
  },
  orderTypeText: {
    fontSize: fontSize(16),
    color: '#666666',
    fontWeight: '400',
  },
  orderTypeTextActive: {
    fontSize: fontSize(16),
    color: '#FFFFFF',
    fontWeight: '500',
  },
  statusTabsWrap: {
    height: px(52),
  },
  tabItemBox: {
    position: 'relative',
    paddingHorizontal: px(6),
    paddingVertical: px(16),
  },
  statusTab: {
    width: px(76),
    height: px(36),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: px(12),
    backgroundColor: '#fff',
    position: 'relative',
  },
  statusTabActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: px(1),
    borderColor: '#333333',
  },
  statusTabText: {
    fontSize: fontSize(14),
    color: '#999999',
  },
  statusTabTextActive: {
    fontSize: fontSize(14),
    color: '#333333',
    fontWeight: '500',
  },
  statusBadge: {
    position: 'absolute',
    top: px(8),
    right: px(0),
    minWidth: px(18),
    height: px(18),
    borderRadius: px(9),
    backgroundColor: '#FF2B24',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: px(4),
    zIndex: 9999999,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: fontSize(11),
    fontWeight: '500',
  },

  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: px(12),
    paddingHorizontal: px(14),
    paddingVertical: px(12),
    marginTop: px(12),
    marginHorizontal: px(16),
  },
  orderCardHead: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderDeviceText: {
    flex: 1,
    minWidth: 0,
    color: '#333333',
    fontSize: fontSize(14),
  },
  orderStatusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: px(8),
    flexShrink: 0,
  },
  orderStatusText: {
    fontSize: fontSize(14),
    fontWeight: '500',
  },
  orderArrow: {
    color: '#999999',
    fontSize: fontSize(20),
    marginLeft: px(2),
    lineHeight: px(20),
  },
  orderDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0, 0, 0, .1)',
    marginTop: px(10),
    marginBottom: px(10),
  },
  orderInfoText: {
    color: '#333333',
    fontSize: fontSize(14),
    marginBottom: px(4),
  },

  listWrapper: {
    paddingBottom: px(24),
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyImage: {
    width: px(120),
    height: px(120),
  },
  emptyText: {
    fontSize: fontSize(14),
    color: '#333',
    marginTop: px(8),
  },
  redDot: {
    position: 'absolute',
    top: -px(16),
    right: -px(16),
    width: px(10),
    height: px(10),
    borderRadius: px(5),
    backgroundColor: '#FF2B24',
    zIndex: 9999,
  },
});
