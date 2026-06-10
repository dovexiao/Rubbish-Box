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
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    alignContent: 'center',
    marginVertical: px(16),
  },
  tabsBox: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: px(4),
    borderRadius: px(162),
  },
  tab: {
    paddingHorizontal: px(25),
    paddingVertical: px(6),
    borderRadius: px(162),
  },
  tabActive: {
    backgroundColor: '#333333',
  },
  tabText: {
    fontSize: fontSize(14),
    color: '#999999',
  },
  tabTextActive: {
    fontSize: fontSize(14),
    color: '#FFFFFF',
    fontWeight: '500',
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
