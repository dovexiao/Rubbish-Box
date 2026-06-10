import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  orderDetailContainer: {
    paddingTop: px(12),
    paddingHorizontal: px(24),
    paddingBottom: px(20),
  },
  row: {
    minHeight: px(20),
    marginBottom: px(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aftersaleDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginTop: px(2),
    marginBottom: px(14),
  },
  label: {
    color: '#333333',
    fontSize: fontSize(14),
    width: px(116),
    fontWeight: '500',
  },
  value: {
    flex: 1,
    textAlign: 'right',
    color: '#333333',
    fontSize: fontSize(14),
  },
  refundDetailWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  refundDetailBtn: {
    marginLeft: px(10),
    backgroundColor: '#f7f7fb',
    borderRadius: px(12),
    paddingHorizontal: px(16),
    paddingVertical: px(5),
  },
  refundDetailBtnText: {
    color: '#333333',
    fontSize: fontSize(14),
  },
  footerBtns: {
    paddingTop: px(10),
    // paddingBottom: px(12),
    flexDirection: 'row',
    justifyContent: 'center',
    gap: px(6),
  },
  footerBtn: {
    width: px(164),
    height: px(48),
    borderRadius: px(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtn2: {
    height: px(48),
    borderRadius: px(16),
    alignItems: 'center',
    justifyContent: 'center',
    width: px(196),
  },

  footerBtnGhost: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    backgroundColor: '#FFFFFF',
  },
  footerBtnPrimary: {
    backgroundColor: '#333333',
    marginLeft: px(10),
  },
  footerBtnSingle: {
    marginLeft: 0,
    marginRight: 0,
    marginHorizontal: px(60),
    flex: undefined,
  },
  footerBtnGhostText: {
    color: '#999999',
    fontSize: fontSize(16),
    fontWeight: '500',
  },
  footerBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: fontSize(16),
    fontWeight: '500',
  },
  popWrap: {
    paddingHorizontal: px(14),
    paddingBottom: px(10),
    marginTop: px(14),
  },
  popRow: {
    paddingTop: px(6),
    paddingBottom: px(24),
  },
  popLabel: {
    color: '#333333',
    fontSize: fontSize(14),
    fontWeight: '500',
  },
  popValue: {
    color: '#333333',
    fontSize: fontSize(14),
  },
  popReasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: px(16),
    height: px(32),
  },
  required: {
    color: '#FF2B24',
  },
  reasonInput: {
    flex: 1,
    marginLeft: px(14),
    textAlign: 'right',
    fontSize: fontSize(14),
    color: '#333333',
    padding: px(0),
  },
  reasonErrorText: {
    color: '#FD8E62',
    fontSize: fontSize(12),
    textAlign: 'right',
    marginTop: px(2),
    marginBottom: px(14),
  },
  popFooter: {
    marginTop: px(14),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  popBtn: {
    flex: 1,
    height: px(48),
    borderRadius: px(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  popCancelBtn: {
    marginRight: px(8),
    borderWidth: 1,
    borderColor: '#DDDDDD',
    backgroundColor: '#FFFFFF',
  },
  popConfirmBtn: {
    marginLeft: px(8),
    backgroundColor: '#333333',
  },
  popConfirmBtnDisabled: {
    backgroundColor: '#A9A9A9',
  },
  popCancelText: {
    color: '#999999',
    fontSize: fontSize(16),
    fontWeight: '500',
  },
  popConfirmText: {
    color: '#FFFFFF',
    fontSize: fontSize(16),
    fontWeight: '500',
  },
  phoneBtn: {
    height: px(48),
    borderRadius: px(12),
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: px(6),
  },
  phoneBtnText: {
    color: '#333333',
    fontSize: fontSize(16),
  },
  phoneCancelBtn: {
    marginTop: px(12),
  },
  phoneCancelText: {
    color: '#333333',
    fontSize: fontSize(16),
  },
});
