import { StyleSheet } from 'react-native';

const popupStyle = StyleSheet.create({
  popupContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  popupTitle: {
    fontWeight: '500',
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
  },
  btnContainerWrapper: {
    width: '100%',
    marginTop: 36,
    gap: 15,
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
});

export default popupStyle;
