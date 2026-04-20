import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: px(24),
    paddingTop: px(16),
    gap: px(16),
    overflow: 'scroll',
  },
  cardTitleLine: {
    width: px(2),
    height: px(12),
    backgroundColor: '#333333',
    borderRadius: px(7),
  },
  cardTitle: {
    fontWeight: '500',
    fontSize: fontSize(14),
    color: '#333333',
    textAlign: 'left',
    marginLeft: px(6),
  },
  cardRows: {
    // width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: px(6),
  },
  powerModeRow: {
    position: 'relative',
  },
  powerModeRowActive: {
    zIndex: 10,
  },
  cardRowsTouch: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardLable: {
    fontSize: fontSize(14),
    fontWeight: '400',
    color: '#333333',
  },
  cardValue: {
    flex: 1,
    fontSize: fontSize(14),
    fontWeight: '400',
    color: '#333333',
    textAlign: 'right',
  },
  cardLine: {
    height: px(1),
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginVertical: px(8),
  },
  qrCodeBtn: {
    paddingVertical: px(5),
    paddingHorizontal: px(8),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7fb',
    borderRadius: px(12),
  },
  qrCodeBtnText: {
    fontSize: fontSize(14),
    fontWeight: '500',
    color: '#333333',
    marginHorizontal: px(2),
  },
  testBtn: {
    paddingVertical: px(4),
    paddingHorizontal: px(20),
    backgroundColor: '#333333',
    marginLeft: px(8),
    borderRadius: px(26),
  },
  testBtnText: {
    fontSize: fontSize(12),
    fontWeight: '500',
    color: '#FFFFFF',
  },
  toastText: {
    marginTop: px(8),
    fontSize: fontSize(14),
    fontWeight: '400',
    color: '#999999',
  },
  footerBtnContainer: {
    paddingVertical: px(8),
    paddingHorizontal: px(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerBtn: {
    paddingVertical: px(13),
    paddingHorizontal: px(42),
    borderRadius: px(12),
    borderWidth: 1,
    borderStyle: 'solid',
  },
  cancelBtn: {
    borderColor: 'rgba(0,0,0,0.1)',
  },
  confirmBtn: {
    borderColor: '#FF2B24',
  },
  footerBtnText: {
    fontSize: fontSize(16),
    fontWeight: '400',
    textAlign: 'center',
  },
  cancelBtnText: {
    color: '#999999',
  },
  confirmBtnText: {
    color: '#FF2B24',
  },
  // 编辑弹窗
  header: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: fontSize(16),
    fontWeight: '500',
    color: '#333',
  },
  editContainer: {
    backgroundColor: '#fff',
    borderRadius: px(16),
    paddingTop: px(16),
    paddingHorizontal: px(24),
    position: 'relative',
  },
  closeIcon: {
    position: 'absolute',
    top: px(16),
    right: px(16),
  },
  editContent: {
    marginTop: px(24),
    marginBottom: px(36),
  },
  editItem: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  editLabel: {
    fontSize: fontSize(14),
    color: '#333',
    fontWeight: '500',
  },
  input: {
    flex: 1,
    textAlign: 'right',
    fontSize: fontSize(16),
    color: '#333',
    padding: 0,
    marginRight: px(4),
  },
  editFooter: {
    paddingBottom: px(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editBtn: {
    flex: 1,
    height: px(44),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: px(12),
  },
  cancelPopBtn: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,0.1)',
    marginRight: px(15),
  },
  confirmPopBtn: {
    backgroundColor: '#333', // Dark theme primary
    marginLeft: px(10),
  },
  cancelText: {
    color: '#666',
    fontSize: fontSize(16),
  },
  confirmText: {
    color: '#fff',
    fontSize: fontSize(16),
  },

  // 电源模式提示
  powerModeTooltip: {
    position: 'absolute',
    bottom: px(-34),
    right: px(-8),
    backgroundColor: '#333',
    paddingHorizontal: px(12),
    paddingVertical: px(8),
    borderRadius: px(12),
    zIndex: 1000,
  },
  powerModeTooltipText: {
    fontSize: fontSize(12),
    fontWeight: '400',
    color: '#fff',
    textAlign: 'right',
  },

  qrCodeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: px(8),
    marginBottom: px(16),
  },

  scanPop: {
    backgroundColor: '#000000',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    paddingBottom: 0,
  },
  scanCameraContainer: {
    width: '100%',
  },
  scanCameraFill: {
    flex: 1,
  },
  scanFrameWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: px(300),
    height: px(300),
    marginTop: px(82),
    marginBottom: px(32),
  },
  scanTipWrapper: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    gap: px(16),
  },
  scanTipBox: {
    paddingHorizontal: px(23),
    paddingVertical: px(10),
    backgroundColor: 'rgba(0,0,0,0.8)',
    gap: 6,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: px(12),
  },
  scanTipTitle: {
    fontSize: fontSize(16),
    fontWeight: '500',
    color: '#FFFFFF',
  },
  scanTipText: {
    width: px(297),
    textAlign: 'center',
    fontSize: fontSize(14),
    color: '#FFFFFF',
    lineHeight: 20,
  },
  scanTipImg: {
    width: px(343),
    height: px(166),
    borderRadius: px(4),
  },
  adminInfoTitle: {
    marginVertical: px(12),
    fontSize: fontSize(16),
    fontWeight: '500',
    color: '#333333',
  },
  adminInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: px(24),
    marginBottom: px(34),
  },
  adminInfoText: {
    width: '100%',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    marginTop: px(12),
  },
  btnContainer: {
    borderRadius: px(12),
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnContainerConfirm: {
    marginLeft: px(15),
  },
  btnContainerConfirmText: {
    flex: 1,
    color: '#ffffff',
    textAlign: 'center',
  },
});
