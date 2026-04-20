import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f6f7fa',
  },

  card: {
    marginLeft: px(16),
    marginRight: px(16),
    marginBottom: px(12),
    borderRadius: px(12),
    padding: px(16),
    height: px(82),
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  username: {
    fontWeight: 'bold',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
  },

  mobile: {
    fontSize: fontSize(14),
    color: '#999999',
    lineHeight: px(20),
  },

  mt20: {
    marginTop: px(10),
  },

  buttonTitle: {
    fontWeight: 'bold',
    fontSize: fontSize(16),
    color: '#ffffff',
    lineHeight: px(22),
  },

  pr28: {
    paddingRight: px(12),
  },

  buttonWrap: {
    shadowColor: 'rgba(0,0,0,0.25)',
    shadowOffset: { width: 0, height: px(2) },
    shadowRadius: px(8),
    shadowOpacity: 1,
    elevation: px(4),
    borderRadius: px(12),
  },

  footerWrap: {
    width: '100%',
    paddingTop: px(16),
    paddingHorizontal: px(16),
    backgroundColor: '#f6f7fa',
  },

  popSubTip: {
    paddingTop: px(14),
    fontSize: fontSize(12),
    color: '#999999',
    lineHeight: px(17),
    textAlign: 'center',
  },

  itemContent: {
    marginTop: px(24),
    paddingLeft: px(16),
    paddingRight: px(16),
  },

  label: {
    fontWeight: 'bold',
    fontSize: fontSize(14),
    color: '#333333',
  },

  contentLabel: {
    width: px(120),
  },

  input: {
    textAlign: 'right',
  },

  ml12: {
    marginLeft: px(6),
  },

  ml32: {
    marginLeft: px(16),
  },

  ml16: {
    marginLeft: px(8),
  },

  ml8: {
    marginLeft: px(4),
  },

  endtimeBox: {
    marginTop: px(12),
  },

  endTime: {
    borderWidth: px(1),
    borderColor: '#333333',
    borderRadius: px(8),
    paddingTop: px(5),
    paddingBottom: px(5),
    paddingLeft: px(8),
    paddingRight: px(8),
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    marginLeft: px(8),
  },

  btnContainerWrapper: {
    marginTop: px(36),
  },

  btnContainer: {
    borderRadius: px(12),
  },

  btnContainerClose: {
    borderStyle: 'solid',
    borderWidth: px(1),
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },

  btnContainerCloseText: {
    color: '#999999',
  },

  btnContainerConfirm: {
    marginLeft: px(15),
  },

  btnContainerConfirmText: {
    color: '#ffffff',
  },

  rows: {
    height: px(20),
    flex: 1,
  },

  delText: {
    height: px(20),
    fontWeight: 'normal',
    fontSize: fontSize(14),
    color: '#999999',
    lineHeight: px(20),
    textAlign: 'left',
  },

  editText: {
    height: px(20),
    fontWeight: 'bold',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    textAlign: 'left',
  },

  searchBoxWrap: {
    width: '100%',
    backgroundColor: '#f6f7fa',
    paddingBottom: px(12),
    alignItems: 'center',
  },

  searchBox: {
    width: px(343),
    height: px(40),
    marginTop: px(12),
    paddingLeft: px(12),
    paddingRight: px(12),
    backgroundColor: '#ffffff',
    borderRadius: px(25),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  listBottomSpace: {
    height: px(20),
  },

  popup: {
    paddingLeft: px(24),
    paddingRight: px(24),
  },

  num: {
    width: '100%',
    height: px(22),
    fontWeight: 'bold',
    fontSize: fontSize(16),
    color: '#333333',
    lineHeight: px(22),
    textAlign: 'center',
  },

  popTitleText: {
    height: px(22),
    fontWeight: 'bold',
    fontSize: fontSize(16),
    color: '#333333',
    lineHeight: px(22),
    textAlign: 'center',
  },

  popText: {
    height: px(20),
    fontWeight: 'bold',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    textAlign: 'left',
  },

  cancalBtn: {
    width: px(156),
    height: px(48),
    borderRadius: px(12),
    borderWidth: px(1),
    borderStyle: 'solid',
    borderColor: 'rgba(0, 0, 0, 0.1)',
    fontWeight: 'normal',
    fontSize: fontSize(16),
    color: '#999999',
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  confirmBtn: {
    width: px(156),
    height: px(48),
    marginLeft: px(15),
    borderRadius: px(12),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },

  confirmBtnText: {
    fontWeight: 'bold',
    fontSize: fontSize(16),
    color: '#ffffff',
    textAlign: 'center',
  },

  bgColor999: {
    backgroundColor: '#999999',
  },

  bgColor333: {
    backgroundColor: '#333333',
  },
});
