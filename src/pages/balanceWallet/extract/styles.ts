import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fa',
    paddingHorizontal: px(16),
    paddingTop: px(12),
  },
  content: {
    flex: 1,
  },
  availableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: px(12),
    padding: px(16),
    marginBottom: px(12),
  },
  availableTitle: {
    color: '#666666',
    fontSize: fontSize(16),
    fontWeight: '400',
  },
  availableValue: {
    color: '#333333',
    fontSize: fontSize(16),
    fontWeight: '500',
  },
  tipBox: {
    marginTop: px(8),
    backgroundColor: '#f9f9f9',
    borderRadius: px(8),
    padding: px(8),
  },
  tipText: {
    color: '#999',
    fontSize: fontSize(12),
    lineHeight: px(17),
  },
  tipHighlight: {
    color: '#FD8E62',
  },
  withdrawCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: px(12),
    padding: px(16),
  },
  sectionTitle: {
    color: '#333333',
    fontSize: fontSize(14),
  },
  amountRow: {
    marginTop: px(14),
    marginBottom: px(14),
  },
  currency: {
    color: '#333',
    fontSize: fontSize(20),
    fontWeight: '800',
    marginRight: px(8),
  },
  amountInput: {
    flex: 1,
    color: '#333',
    fontSize: fontSize(20),
    // fontWeight: '500',
    paddingVertical: 0,
  },
  fillAllText: {
    fontSize: fontSize(14),
    color: '#333',
    backgroundColor: '#f7f7fb',
    borderRadius: px(14),
    paddingHorizontal: px(16),
    paddingVertical: px(5),
    overflow: 'hidden',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#EBEBEB',
    marginTop: -px(6),
    marginBottom: px(20),
  },
  bankRow: {
    marginTop: px(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: px(8),
  },
  bankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankIcon: {
    width: px(24),
    height: px(24),
    marginRight: px(10),
  },
  bankName: {
    color: '#333333',
    fontSize: fontSize(14),
    fontWeight: '500',
    marginBottom: px(2),
  },
  bankDesc: {
    color: '#999999',
    fontSize: fontSize(12),
  },
  submitBtn: {
    height: px(48),
    backgroundColor: '#333333',
    borderRadius: px(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: px(48),
    marginBottom: px(24),
  },
  submitBtnDisabled: {
    backgroundColor: '#A2A2A2',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize(16),
    fontWeight: '500',
  },
  addBtn: {
    width: px(124),
    height: px(40),
    backgroundColor: '#333333',
    borderRadius: px(20),
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: px(12),
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize(14),
    fontWeight: '500',
  },
  bankPopupWrap: {
    paddingHorizontal: px(8),
    paddingBottom: px(4),
  },
  bankPopupDesc: {
    textAlign: 'center',
    color: '#999999',
    fontSize: fontSize(14),
    marginBottom: px(16),
  },
  bankPopupList: {
    maxHeight: px(250),
  },
  bankPopupListContent: {
    paddingBottom: px(6),
  },
  bankPopupItem: {
    marginBottom: px(20),
    paddingHorizontal: px(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bankCheck: {
    width: px(18),
    height: px(18),
    borderRadius: px(9),
    borderWidth: 1,
    borderColor: '#CFCFCF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: px(10),
  },
  bankCheckActive: {
    borderColor: '#2CCB77',
    backgroundColor: '#2CCB77',
  },
  bankStatusText: {
    fontSize: fontSize(14),
    fontWeight: '500',
    marginLeft: px(10),
  },
  bankPopupFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: px(8),
    paddingHorizontal: px(12),
  },
  bankPopupBtn: {
    flex: 1,
    height: px(48),
    borderRadius: px(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankPopupCancelBtn: {
    marginRight: px(6),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DEDEDE',
    borderRadius: px(12),
  },
  bankPopupConfirmBtn: {
    marginLeft: px(8),
    backgroundColor: '#333333',
  },
  bankPopupConfirmBtnDisabled: {
    backgroundColor: '#A2A2A2',
  },
  bankPopupCancelText: {
    color: '#A0A0A0',
    fontSize: fontSize(16),
    fontWeight: '500',
  },
  bankPopupConfirmText: {
    color: '#FFFFFF',
    fontSize: fontSize(16),
    fontWeight: '500',
  },
  verifyPopupWrap: {
    paddingHorizontal: px(18),
    paddingBottom: px(4),
  },
  verifyAmountLabel: {
    textAlign: 'center',
    color: '#333333',
    fontSize: fontSize(14),
    marginTop: px(10),
  },
  verifyAmountRow: {
    marginTop: px(8),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  verifyAmountCurrency: {
    color: '#333333',
    fontSize: fontSize(20),
    fontWeight: '700',
    marginRight: px(8),
    lineHeight: px(30),
  },
  verifyAmountValue: {
    color: '#333333',
    fontSize: fontSize(24),
    fontWeight: '500',
  },
  verifyDivider: {
    height: 1,
    backgroundColor: '#EFEFEF',
    marginTop: px(6),
  },
  verifyPhoneRow: {
    marginTop: px(24),
    marginBottom: px(12),
  },
  verifyPhoneText: {
    color: '#333333',
    fontSize: fontSize(14),
  },
  verifyCodeBtn: {
    minWidth: px(96),
    height: px(38),
    backgroundColor: '#333333',
    borderRadius: px(10),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: px(12),
  },
  verifyCodeBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize(15),
    fontWeight: '500',
  },
  verifyErrorText: {
    marginTop: px(8),
    textAlign: 'center',
    color: '#FF2B24',
    fontSize: fontSize(14),
    minHeight: px(20),
  },
  verifySubmitBtn: {
    marginTop: px(4),
    height: px(46),
    borderRadius: px(23),
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: px(40),
  },
  verifySubmitBtnDisabled: {
    backgroundColor: '#A2A2A2',
  },
  verifySubmitBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize(16),
    fontWeight: '500',
  },
});

export default styles;
