import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const popupStyle = StyleSheet.create({
  popupContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  popupTitle: {
    fontWeight: '500',
    fontSize: fontSize(16),
    color: '#333333',
    textAlign: 'center',
  },
  btnContainerWrapper: {
    width: '100%',
    marginTop: px(36),
    gap: px(15),
  },
  btnContainer: {
    borderRadius: px(12),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnContainerClose: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  btnContainerCloseText: {
    color: '#9a9a9a',
    fontWeight: '400',
    fontSize: fontSize(14),
    lineHeight: px(20),
  },
  btnContainerConfirmText: {
    color: '#ffffff',
    fontWeight: '500',
    fontSize: fontSize(14),
    lineHeight: px(20),
  },
});

export default popupStyle;
