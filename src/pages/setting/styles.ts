import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: px(24),
    paddingTop: px(24),
    paddingBottom: px(32),
    backgroundColor: '#FFFFFF',
  },
  itemFirst: {
    width: '100%',
    height: px(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  item: {
    width: '100%',
    height: px(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: px(28),
  },
  itemText: {
    fontSize: fontSize(14),
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: px(20),
  },
  itemText2: {
    fontSize: fontSize(14),
    color: '#333333',
    marginRight: px(4),
  },
  updateBtn: {
    height: px(30),
    paddingHorizontal: px(12),
    borderRadius: px(12),
    backgroundColor: '#F7F7FB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateBtnText: {
    fontSize: fontSize(14),
    color: '#333333',
    fontWeight: 'bold',
  },
});

export default styles;
