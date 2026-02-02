import { StyleSheet } from 'react-native';

const popupStyle = StyleSheet.create({
  popupContainer: {
    width: '100%',
    paddingHorizontal: 12,
    // padding: 24,
  },
  popupTitle: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  btnMarginTop: {
    marginTop: 24,
  },
  btnContainerWrapper: {
    marginTop: 36,
  },
  btnContainer: {
    borderRadius: 12,
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
    color: '#999999',
  },
  btnContainerConfirmText: {
    color: '#ffffff',
  },
  btnContainerConfirm: {
    marginLeft: 15,
  },
});

export default popupStyle;
