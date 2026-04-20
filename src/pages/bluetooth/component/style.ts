import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  box: {
    width: '100%',
    // paddingHorizontal: 20,
    // paddingVertical: 24,
    backgroundColor: '#ffffff',
    borderRadius: px(12),
    alignItems: 'center',
  },
  title: {
    fontSize: fontSize(16),
    color: '#333333',
    lineHeight: px(22),
    fontWeight: '700',
  },
  subTitle: {
    marginTop: px(8),
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
  },
  inputWrap: {
    marginTop: px(16),
    width: '100%',
    position: 'relative',
  },
  inputTitle: {
    fontSize: fontSize(14),
    color: '#999999',
    lineHeight: px(20),
  },
  digitsRow: {
    marginTop: px(8),
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  digitBox: {
    width: px(40),
    height: px(40),
    borderRadius: px(8),
    backgroundColor: '#f7f7fb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitText: {
    fontSize: fontSize(20),
    color: '#333333',
    lineHeight: px(28),
    fontWeight: '700',
  },
  hiddenInput: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    height: px(40),
    opacity: 0,
  },
  btnRow: {
    width: '100%',
    marginTop: px(24),
  },
  btn: {
    width: px(124),
    height: px(42),
    borderRadius: px(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  confirmBtn: {
    backgroundColor: '#333333',
  },
  cancelText: {
    fontSize: fontSize(14),
    color: '#999999',
    fontWeight: '600',
  },
  confirmText: {
    fontSize: fontSize(14),
    color: '#ffffff',
    fontWeight: '700',
  },
});
