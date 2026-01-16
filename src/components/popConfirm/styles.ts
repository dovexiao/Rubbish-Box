import { StyleSheet } from "react-native";

const popupStyle = StyleSheet.create({
  popupContainer: {
    width: 300,
    height: 300,
    backgroundColor: '#FFFFFF',
  },
  btnMarginTop: {
    marginTop: 24,
  },
  btnContainerWrapper: {
    marginTop: 36,
  },
  btnContainer: {
    borderRadius: 12,
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
    marginLeft: 15
  }
});

export default popupStyle;