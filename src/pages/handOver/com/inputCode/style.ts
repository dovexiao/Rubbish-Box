import { StyleSheet } from 'react-native';
import { px, fontSize } from '@/utils/ui';

export const styles = StyleSheet.create({
  passwordCode: {
    width: '100%',
    marginTop: px(16),
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeItem: {
    width: px(50),
    height: px(50),
    backgroundColor: '#f7f7fb',
    borderRadius: px(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeItemActive: {
    borderWidth: 1,
    borderColor: '#2552F5',
  },
  codeItemError: {
    borderWidth: 1,
    borderColor: '#ff2b24',
  },
  codeNumText: {
    fontWeight: '700',
    fontSize: fontSize(24),
    color: '#333333',
    lineHeight: px(34),
    textAlign: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    left: -100000,
    height: 0,
    width: 0,
    opacity: 0,
  },
});
