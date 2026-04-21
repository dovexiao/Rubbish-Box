import { px, fontSize } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f6f7fa',
  },
  card: {
    marginLeft: px(16),
    marginRight: px(16),
    marginTop: px(12),
    backgroundColor: '#ffffff',
    borderRadius: px(12),
    padding: px(16),
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

  contentLabel: {},

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
    borderRadius: px(8),
    paddingTop: px(5),
    paddingBottom: px(5),
    paddingLeft: px(8),
    paddingRight: px(8),
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    marginLeft: px(8),
    borderColor: '#333333',
  },

  btnContainerWrapper: {
    marginTop: px(29),
    marginBottom: px(8),
  },

  btnContainer: {
    borderRadius: px(12),
  },

  btnContainerClose: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },

  btnContainerCloseText: {
    color: '#999999',
    fontSize: fontSize(16),
  },

  btnContainerConfirm: {
    marginLeft: px(15),
    fontSize: fontSize(16),
  },

  btnContainerConfirmText: {
    color: '#ffffff',
    fontSize: fontSize(16),
    fontWeight: 'bold',
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
    marginLeft: px(16),
    marginRight: px(16),
    height: px(48),
    backgroundColor: '#f6f7fa',
    borderRadius: px(12),
    borderWidth: 1,
    borderColor: '#333333',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  addBtnText: {
    marginLeft: px(8),
    fontWeight: '500',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    textAlign: 'center',
    fontStyle: 'normal',
    textTransform: 'none',
  },
});
