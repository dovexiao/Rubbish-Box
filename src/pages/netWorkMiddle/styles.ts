import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  contentBox: {
    flexGrow: 1,
    width: '100%',
    paddingHorizontal: px(24),
    alignItems: 'center',
    paddingTop: px(131),
  },
  contentBoxItemTitle: {
    fontWeight: '500',
    fontSize: fontSize(16),
    color: '#333333',
    lineHeight: px(22),
  },
  contentBoxList: {
    width: '100%',
    marginTop: px(32),
    display: 'flex',
    flexDirection: 'column',
    gap: px(20),
  },
  contentBoxItem: {
    width: '100%',
    height: px(70),
    backgroundColor: '#F7F7FB',
    borderRadius: px(16),
    padding: px(24),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default styles;
