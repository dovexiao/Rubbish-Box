import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';
const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    padding: px(12),
    position: 'relative',
    backgroundColor: '#ffffff',
  },

  btnContainer: {
    borderRadius: px(12),
    flex: 1,
  },

  btnContainerClose: {
    borderStyle: 'solid',
    borderWidth: px(1),
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },

  btnContainerConfirmText: {
    color: '#ffffff',
    width: '100%',
  },

  btnContainerText: {
    fontSize: fontSize(16),
    color: '#ffffff',
    marginLeft: px(3),
    fontWeight: 'bold',
  },

  btnAddText: {
    fontSize: fontSize(26),
    color: '#ffffff',
    fontWeight: 'bold',
  },

  title: {
    marginTop: px(16),
    marginBottom: px(16),
  },

  titleBorder: {
    width: px(2),
    height: px(12),
    backgroundColor: '#000000',
    marginRight: px(6),
    borderRadius: px(2),
  },

  titleText: {
    color: '#333333',
    fontSize: fontSize(14),
    fontWeight: 'bold',
  },

  popup: {
    width: '100%',
    paddingTop: px(24),
    paddingLeft: px(24),
    paddingRight: px(24),
    paddingBottom: px(42),
    display: 'flex',
    flexDirection: 'column',
  },

  label: {
    height: px(20),
    width: px(100),
    fontWeight: 'bold',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    textAlign: 'left',
    fontStyle: 'normal',
    textTransform: 'none',
  },

  popupFooter: {
    width: '100%',
    height: px(48),
    marginTop: px(36),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  cancelBtn: {
    width: '48%',
    height: px(48),
    borderRadius: px(12),
    borderWidth: px(1),
    borderStyle: 'solid',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnTextCancel: {
    fontWeight: 'normal',
    fontSize: fontSize(16),
    color: '#999999',
    lineHeight: px(48),
    textAlign: 'center',
    fontStyle: 'normal',
    textTransform: 'none',
  },

  confirmBtn: {
    width: '48%',
    height: px(48),
    backgroundColor: '#333333',
    borderRadius: px(12),
    borderWidth: px(1),
    borderStyle: 'solid',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnTextConfirm: {
    fontWeight: 'normal',
    fontSize: fontSize(16),
    color: '#ffffff',
    lineHeight: px(48),
    textAlign: 'center',
    fontStyle: 'normal',
    textTransform: 'none',
  },
});

export default styles;
