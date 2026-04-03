import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: px(24),
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowTop: {
    marginTop: px(16),
  },
  rowMiddle: {
    marginTop: px(28),
  },
  label: {
    fontSize: fontSize(14),
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: px(20),
  },
  value: {
    fontSize: fontSize(14),
    color: '#333333',
    marginRight: px(2),
  },
  valueGray: {
    color: '#CCCCCC',
  },
  footerWrap: {
    marginTop: px(40),
    alignItems: 'center',
  },
  logoffBtn: {
    width: px(196),
    height: px(48),
    borderRadius: px(16),
    borderWidth: 1,
    borderColor: '#FF2B24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoffText: {
    fontSize: fontSize(16),
    color: '#FF2B24',
  },
  popTitle: {
    fontWeight: 'bold',
    fontSize: fontSize(16),
    lineHeight: px(22),
    color: '#333333',
    textAlign: 'center',
  },
  popDesc: {
    fontSize: fontSize(14),
    color: '#999999',
    lineHeight: px(20),
    textAlign: 'center',
    marginTop: px(8),
    fontWeight: 'normal',
  },
});

export default styles;
