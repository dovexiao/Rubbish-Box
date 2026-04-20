import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  orderContainer: {
    flex: 1,
    paddingTop: px(12),
    backgroundColor: '#F6F7FA',
  },
  tabsWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  /** 固定宽度，Tabs 通过 onLayout 取到该宽度后 tab 栏才会变窄 */
  tabsBox: {
    width: px(220),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: px(10),
    paddingVertical: px(6),
  },
  tabActive: {
    borderBottomWidth: px(2),
    borderBottomColor: '#333333',
  },
  tabText: {
    fontSize: fontSize(14),
    color: '#666666',
  },
  tabTextActive: {
    fontSize: fontSize(14),
    color: '#333333',
    fontWeight: 'bold',
  },
  tabLine: {
    position: 'absolute',
    bottom: 0,
    height: px(2),
    backgroundColor: '#333333',
    borderRadius: px(1),
  },
  listWrapper: {
    paddingHorizontal: px(16),
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
