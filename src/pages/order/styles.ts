import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  orderContainer: {
    flex: 1,
    paddingTop: 12,
    backgroundColor: '#F6F7FA',
  },
  tabsWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  /** 固定宽度，Tabs 通过 onLayout 取到该宽度后 tab 栏才会变窄 */
  tabsBox: {
    width: 220,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#333333',
  },
  tabText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  tabTextActive: {
    fontSize: 14,
    color: '#333333',
    fontWeight: 'bold',
  },
  tabLine: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: '#333333',
    borderRadius: 1,
  },
  listWrapper: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyImage: {
    width: 120,
    height: 120,
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 16,
  },
});
