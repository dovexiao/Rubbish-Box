import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    borderRadius: px(16),
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    padding: 0,
  },
  mask: {
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  maskPressable: {
    flex: 1,
  },
  centerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    backgroundColor: '#FFFFFF',
    borderRadius: px(16),
    overflow: 'hidden',
    padding: px(24),
  },
  header: {
    width: '100%',
  },
  title: {
    fontSize: fontSize(16),
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
  },

  footer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: px(15),
  },
  footerBtn: {
    paddingVertical: px(11),
    borderRadius: px(12),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnText: {
    fontSize: fontSize(14),
    lineHeight: px(22),
    fontWeight: '400',
    color: '#999',
    textAlign: 'center',
  },
  cancalBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,0.1)',
  },
  confirmBtn: {
    backgroundColor: '#333333',
    fontWeight: '500',
  },
  cancalBtnText: {
    color: '#999999',
  },
  confirmBtnText: {
    color: '#ffffff',
  },
});

export default styles;
