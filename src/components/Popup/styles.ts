import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: px(24),
    borderTopRightRadius: px(24),
    overflow: 'hidden',
    width: 'auto',
  },

  header: {
    height: px(40),
    paddingHorizontal: px(12),
    top: px(8),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  title: {
    flex: 1,
    fontSize: fontSize(16),
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
    width: '100%',
  },

  closeBtn: {
    width: px(24),
    height: px(24),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: px(12),
    top: 0,
  },

  body: {},

  footer: {},

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  footerBtn: {
    flex: 1,
  },

  footerGap: {
    width: px(12),
  },
});

export default styles;
