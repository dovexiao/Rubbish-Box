import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: px(24),
    backgroundColor: '#FFFFFF',
  },
  item: {
    width: '100%',
    height: px(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: px(28),
  },
  itemFirst: {
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
});

export default styles;
