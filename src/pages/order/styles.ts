import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  orderContainer: {
    flex: 1,
    paddingTop: px(12),
    // backgroundColor: '#F6F7FA',
  },
  tabsWrap: {
    flexDirection: 'row',
  },
  /** 固定宽度，Tabs 通过 onLayout 取到该宽度后 tab 栏才会变窄 */
  tabsBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: px(12),
  },
  tab: {
    width: px(76),
    height: px(36),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: px(12),
    backgroundColor: '#ffffff',
  },
  tabActive: {
    borderWidth: px(1),
    borderBottomColor: '#333333',
  },
  tabText: {
    fontSize: fontSize(14),
    color: '#999999',
  },
  tabTextActive: {
    fontSize: fontSize(14),
    color: '#333333',
    fontWeight: '500',
  },

  listWrapper: {
    // paddingHorizontal: px(16),
    paddingBottom: px(24),
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: px(60),
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
