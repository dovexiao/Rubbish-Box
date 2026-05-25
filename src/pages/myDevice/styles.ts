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
    fontSize: fontSize(14),
    color: '#ffffff',
    marginLeft: px(3),
    fontWeight: '500',
  },

  btnAddText: {
    fontSize: fontSize(14),
    lineHeight: px(20),
    color: '#ffffff',
    fontWeight: '500',
  },

  title: {
    marginTop: px(24),
    marginBottom: px(12),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: px(16),
  },

  titleBorder: {
    flex: 1,
    height: px(1),
    backgroundColor: 'rgba(0,0,0,0.1)',
  },

  titleText: {
    color: '#333333',
    fontSize: fontSize(14),
    fontWeight: '500',
    lineHeight: px(20),
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // paddingVertical: px(16),
    backgroundColor: '#FFFFFF',
  },
  tabItemList: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: px(4),
    borderRadius: px(162),
    backgroundColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  tabItem: {
    width: px(106),
    height: px(32),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: px(171),
  },
  tabItemActive: {
    backgroundColor: '#333333',
  },
  tabItemText: {
    fontSize: fontSize(14),
    lineHeight: px(20),
    color: '#333333',
  },
  tabItemTextActive: {
    color: '#FFFFFF',
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: px(8),
    paddingHorizontal: px(16),
    gap: px(15),
  },
  footerBtn: {
    height: px(48),
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: px(12),
  },
  footerBtnText: {
    fontSize: fontSize(16),
    lineHeight: px(22),
  },
  footerBtnClose: {
    borderColor: 'rgba(0,0,0,0.1)',
    borderWidth: px(1),
    borderStyle: 'solid',
  },
  footerBtnAdd: {
    backgroundColor: '#333333',
  },
  footerBtnCloseText: {
    color: '#999999',
  },
  footerBtnAddText: {
    color: '#ffffff',
    fontWeight: '500',
  },
});

export default styles;
