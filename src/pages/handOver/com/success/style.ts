import { StyleSheet } from 'react-native';
import { px, fontSize } from '@/utils/ui';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: px(112),
    backgroundColor: '#FFFFFF',
  },
  row: {
    width: px(176),
    height: px(48),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  icon: {
    width: px(48),
    height: px(48),
  },
  title: {
    width: px(120),
    height: px(28),
    fontWeight: '700',
    fontSize: fontSize(20),
    color: '#333333',
    lineHeight: px(28),
    textAlign: 'center',
  },
  text: {
    width: px(98),
    height: px(22),
    marginTop: px(24),
    fontWeight: '400',
    fontSize: fontSize(16),
    color: '#999999',
    lineHeight: px(22),
    textAlign: 'center',
  },
});
