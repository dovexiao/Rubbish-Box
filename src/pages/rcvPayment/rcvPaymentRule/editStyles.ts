import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f7fa',
    paddingHorizontal: px(14),
    paddingTop: px(12),
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: px(14),
    padding: px(16),
    paddingBottom: px(0),
  },
  row: {
    width: '100%',
    paddingBottom: px(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, .05)',
  },

  rowTop: {
    width: '100%',
    paddingTop: px(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  rowWithDivider: {
    paddingTop: px(20),
    paddingBottom: px(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, .05)',
    position: 'relative',
  },
  row2: {
    paddingTop: px(20),
    paddingBottom: px(10),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, .05)',
    position: 'relative',
  },
  'row2-top': {
    marginBottom: px(8),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },

  rowWithDividerLast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  labelBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  required: {
    color: '#FF2B24',
    fontSize: fontSize(14),
    fontWeight: '500',
  },

  label: {
    color: '#333333',
    fontSize: fontSize(16),
    fontWeight: '500',
  },
  cardInput: {
    width: '100%',
    height: px(30),
    fontSize: fontSize(14),
  },

  cardInput2: {
    flex: 1,
    height: px(30),
    fontSize: fontSize(14),
  },

  cardInputText: {
    textAlign: 'right',
    fontSize: fontSize(14),
  },
  cardInputText2: {
    textAlign: 'center',
    fontSize: fontSize(14),
  },
  selector: {
    paddingHorizontal: px(12),
    paddingVertical: px(8),
    borderRadius: px(8),
    backgroundColor: '#F3F3F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorIcon: {
    transform: [{ rotate: '90deg' }],
  },

  selectorText: {
    color: '#333333',
    fontSize: fontSize(14),
    marginRight: px(8),
  },
  inlineFeeRow: {
    paddingVertical: px(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, .05)',
    gap: px(8),
  },
  inlineFeeRowSimple: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, .05)',
    gap: px(8),
  },
  inlineText: {
    color: '#333333',
    fontSize: fontSize(14),
  },
  inlineInput: {
    width: px(70),
    height: px(36),
    borderRadius: px(8),
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: px(8),
  },

  inlineInput2: {
    width: px(60),
    height: px(36),
    borderRadius: px(8),
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: px(8),
  },

  inlineInputText: {
    color: '#333',
    fontSize: fontSize(14),
  },
  rightInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: px(8),
  },
  leftWithIcon: {
    // width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioWrap: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: px(12),
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioIconWrap: {
    width: px(18),
    height: px(18),
    borderRadius: px(9),
    borderWidth: 1,
    borderColor: '#CCCCCC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: px(6),
  },
  radioIconWrapActive: {
    borderColor: '#333333',
    backgroundColor: '#333333',
  },
  radioCheckedInner: {
    width: px(10),
    height: px(10),
    borderRadius: px(5),
    backgroundColor: '#333333',
  },
  radioText: {
    color: '#333333',
    fontSize: fontSize(16),
  },
  tooltip: {
    selectorDisabled: {
      backgroundColor: '#F5F5F5',
    },
    selectorTextDisabled: {
      color: '#B7B7B7',
    },
    disabledRow: {
      opacity: 0.55,
    },
    position: 'absolute',
    left: px(40),
    top: px(50),
    backgroundColor: '#333333',
    borderRadius: px(10),
    paddingHorizontal: px(10),
    paddingVertical: px(8),
    zIndex: 99999,
  },
  tooltip2: {
    position: 'absolute',
    left: px(60),
    top: px(30),
    backgroundColor: '#333333',
    borderRadius: px(10),
    paddingHorizontal: px(10),
    paddingVertical: px(8),
    zIndex: 99999,
  },
  tooltipWide: {
    position: 'absolute',
    left: px(6),
    top: px(28),
    backgroundColor: '#333333',
    borderRadius: px(10),
    paddingHorizontal: px(10),
    paddingVertical: px(8),
    width: px(312),
    zIndex: 99999,
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: fontSize(12),
    lineHeight: px(18),
  },

  footer: {
    paddingTop: px(10),
    paddingBottom: px(8),
    backgroundColor: '#f6f7fa',
    alignItems: 'center',
  },
  saveBtn: {
    width: px(196),
    height: px(48),
    borderRadius: px(16),
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: fontSize(16),
    fontWeight: '500',
  },

  pickerPanel: {
    paddingHorizontal: px(12),
    paddingTop: px(4),
    paddingBottom: px(8),
  },
  pickerItemText: {
    fontSize: fontSize(16),
    color: '#333333',
    textAlign: 'center',
  },
  pickerIndicator: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0, 0, 0, .08)',
    backgroundColor: 'rgba(0, 0, 0, .03)',
  },

  popupTitle: {
    fontSize: fontSize(16),
    fontWeight: '500',
    color: '#333333',
  },
  popupFooter: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: px(12),
    paddingTop: px(8),
    paddingBottom: px(8),
  },
  popupBtn: {
    flex: 1,
    height: px(44),
    borderRadius: px(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupCancelBtn: {
    marginRight: px(8),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E4E4',
  },
  popupConfirmBtn: {
    marginLeft: px(8),
    backgroundColor: '#333333',
  },
  popupCancelText: {
    color: '#A9A9A9',
    fontSize: fontSize(16),
  },
  popupConfirmText: {
    color: '#FFFFFF',
    fontSize: fontSize(16),
    fontWeight: '500',
  },
  row3: {
    width: '100%',
    paddingBottom: px(10),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, .05)',
  },
});

export default styles;
