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
  contentBoxContent: {
    width: '100%',
    marginTop: px(32),
    display: 'flex',
    flexDirection: 'column',
    gap: px(8),
  },
  contentBoxContentTop: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contentBoxContentTopTitle: {
    fontWeight: '400',
    fontSize: fontSize(16),
    color: '#333333',
    lineHeight: px(22),
  },
  requiredLabel: {
    fontWeight: '400',
    fontSize: fontSize(16),
    color: '#FF2B24',
    lineHeight: px(22),
  },
  contentBoxContentTopLeft: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentBoxContentTopInput: {
    width: '100%',
    height: px(54),
    borderRadius: px(12),
    borderWidth: px(1),
    borderColor: '#EFEFF6',
    paddingVertical: px(12),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F7F7FB',
    fontSize: fontSize(16),
    color: '#333333',
    lineHeight: px(22),
    fontWeight: '400',
  },
  footerBtn: {
    height: px(48),
    width: px(196),
    borderRadius: px(16),
    marginTop: px(100),
  },
  footerBtnText: {
    fontSize: fontSize(16),
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: px(22),
  },
  scanFrameWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: px(300),
    height: px(300),
    marginTop: px(82),
    marginBottom: px(32),
  },
});

export default styles;
