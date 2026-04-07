import { StyleSheet } from 'react-native';
import { fontSize, px } from '@/utils/ui';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    paddingLeft: px(12),
    paddingRight: px(12),
    paddingBottom: px(16),
    position: 'relative',
    backgroundColor: '#ffffff',
  },
  listItem: {
    paddingVertical: px(12),
    paddingHorizontal: px(22),
    borderRadius: px(12),
    backgroundColor: '#f7f7fb',
  },
  itemText: {
    color: '#333333',
    fontSize: fontSize(12),
  },
  itemText2: {
    color: '#333333',
    fontSize: fontSize(14),
  },
  itemText3: {
    color: '#333333',
    fontWeight: 'bold',
    fontSize: fontSize(12),
    lineHeight: fontSize(15),
  },
  imgBox: {
    width: px(50),
    height: px(30),
    marginTop: px(7),
  },
  imgBox_img: {
    width: px(30),
    height: px(30),
    marginRight: px(3),
  },
  tabsWrap: {
    height: px(40),
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    // backgroundColor: 'red',
  },
  tabsBox: {
    width: px(220),
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
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
});

export default styles;
