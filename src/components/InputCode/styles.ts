import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  passwordCode: {
    width: '100%',
    marginTop: px(16),
    position: 'relative',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeItem: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7fb',
    borderRadius: px(12),
    width: px(48),
    height: px(48),
  },
  codeItemText: {
    fontWeight: 'bold',
    fontSize: fontSize(24),
    color: '#333333',
    lineHeight: px(34),
  },
  active: {
    borderWidth: 1,
    borderColor: '#333333',
  },
  error: {
    borderWidth: 1,
    borderColor: '#ff2b24',
  },
  errorMessage: {
    width: '100%',
    marginTop: px(8),
  },
  errorMessageText: {
    fontSize: fontSize(12),
    color: '#ff2b24',
    lineHeight: px(14),
    textAlign: 'center',
  },
  hideInput: {
    position: 'absolute',
    left: -1000,
    top: 0,
    height: px(50),
    width: px(100),
    opacity: 0,
    zIndex: -1,
    color: 'transparent',
  },
});

export default styles;
