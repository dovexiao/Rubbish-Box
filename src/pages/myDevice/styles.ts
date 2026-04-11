import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    padding: 12,
    position: 'relative',
    backgroundColor: '#ffffff',
  },

  btnContainer: {
    borderRadius: 12,
    flex: 1,
  },

  btnContainerClose: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },

  btnContainerConfirmText: {
    color: '#ffffff',
    width: '100%',
  },

  btnContainerText: {
    fontSize: 16,
    color: '#ffffff',
    marginLeft: 3,
    fontWeight: 'bold',
  },

  btnAddText: {
    fontSize: 26,
    color: '#ffffff',
    fontWeight: 'bold',
  },

  title: {
    marginTop: 16,
    marginBottom: 16,
  },

  titleBorder: {
    width: 2,
    height: 12,
    backgroundColor: '#000000',
    marginRight: 6,
    borderRadius: 2,
  },

  titleText: {
    color: '#333333',
    fontSize: 14,
    fontWeight: 'bold',
  },

  popup: {
    width: '100%',
    paddingTop: 24,
    paddingLeft: 24,
    paddingRight: 24,
    paddingBottom: 42,
    display: 'flex',
    flexDirection: 'column',
  },

  label: {
    height: 20,
    width: 100,
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
    textAlign: 'left',
    fontStyle: 'normal',
    textTransform: 'none',
  },

  popupFooter: {
    width: '100%',
    height: 48,
    marginTop: 36,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  cancelBtn: {
    width: '48%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnTextCancel: {
    fontWeight: 'normal',
    fontSize: 16,
    color: '#999999',
    lineHeight: 48,
    textAlign: 'center',
    fontStyle: 'normal',
    textTransform: 'none',
  },

  confirmBtn: {
    width: '48%',
    height: 48,
    backgroundColor: '#333333',
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnTextConfirm: {
    fontWeight: 'normal',
    fontSize: 16,
    color: '#ffffff',
    lineHeight: 48,
    textAlign: 'center',
    fontStyle: 'normal',
    textTransform: 'none',
  },
});

export default styles;
