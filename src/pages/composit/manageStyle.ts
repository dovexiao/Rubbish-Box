import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  card: {
    marginHorizontal: px(24),
    marginTop: px(12),
    backgroundColor: '#f7f7fb',
    borderRadius: px(12),
    padding: px(12),
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

  remove: {
    color: '#cccccc',
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
    paddingRight: px(18),
  },

  buttonWrap: {
    position: 'absolute',
    bottom: px(24),
    marginBottom: px(40),
  },

  paddingH16: {
    paddingHorizontal: px(16),
  },

  popTitle: {
    fontSize: fontSize(16),
    fontWeight: '500',
    color: '#333333',
    lineHeight: px(22),
  },
  popSubTip: {
    paddingTop: px(16),
    paddingBottom: px(4),
    fontSize: fontSize(12),
    color: '#666',
    lineHeight: px(17),
    textAlign: 'center',
  },

  itemContent: {
    marginHorizontal: px(24),
    marginTop: px(12),
    paddingVertical: px(6),
  },

  itemContentValid: {
    marginTop: px(34),
  },

  itemContentRight: {
    height: px(40),
  },

  label: {
    fontWeight: 'bold',
    fontSize: fontSize(14),
    color: '#333333',
  },

  limitLabel: {
    fontSize: fontSize(14),
    color: '#333333',
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
    borderWidth: 1,
    borderStyle: 'solid',
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
    paddingTop: px(16),
    paddingBottom: px(8),
  },

  btnContainer: {
    width: px(156),
    paddingVertical: px(13),
    borderRadius: px(12),
    display: 'flex',
    justifyContent: 'center',
    alignContent: 'center',
  },

  btnContainerClose: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },

  btnContainerCloseText: {
    color: '#999999',
    fontSize: fontSize(16),
    textAlign: 'center',
  },

  btnContainerConfirm: {
    marginLeft: px(15),
    fontSize: fontSize(16),
  },

  btnContainerConfirmText: {
    color: '#ffffff',
    fontSize: fontSize(16),
    fontWeight: 'bold',
    textAlign: 'center',
  },

  mt24: {
    marginTop: px(12),
  },

  title: {
    height: px(20),
    fontWeight: 'normal',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    textAlign: 'left',
    fontStyle: 'normal',
    textTransform: 'none',
  },

  addBox: {
    paddingVertical: px(5),
    paddingHorizontal: px(8),
    backgroundColor: '#f7f7fb',
    borderRadius: px(12),
  },

  addBtnText: {
    marginHorizontal: px(2),
    fontWeight: '500',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
  },
});
