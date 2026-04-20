import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: px(16),
    paddingTop: px(16),
    paddingBottom: px(32),
    backgroundColor: '#FFFFFF',
  },
  lockContentWrapper: {
    position: 'relative',
    width: '100%',
    marginTop: px(16),
  },
  lockContentTextWrapper: {
    position: 'absolute',
    right: px(48),
    textAlign: 'center',
  },
  lockContentTextSuccess: {
    color: '#70b601',
  },
  lockContentTextFail: {
    color: '#e86b6e',
  },
  lockContentText: {},
  deviceNoText: {
    marginBottom: px(24),
  },
  deviceModeWrapper: {
    width: '100%',
    padding: px(10),
    borderRadius: px(12),
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginBottom: px(12),
  },
  deviceInfoWrapper: {
    width: '100%',
    paddingHorizontal: px(12),
    paddingVertical: px(16),
    borderRadius: px(12),
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginBottom: px(12),
  },
  deviceInfoHeader: {
    height: px(24),
    marginBottom: px(24),
  },
  title: {
    fontSize: fontSize(16),
    fontWeight: 'bold',
    color: '#333333',
  },
  modeTextSuccess: {
    color: '#70b601',
  },
  modeTextFail: {
    color: '#e86b6e',
  },
  modeText: {
    fontSize: fontSize(14),
    color: '#333333',
    marginBottom: px(4),
  },
  modeTextValue: {
    fontSize: fontSize(14),
    color: '#333333',
  },
  desc: {
    fontSize: fontSize(12),
    color: '#333333',
    marginBottom: px(16),
    marginTop: px(6),
  },
  radioWrapper: {
    width: px(20),
    height: px(20),
    borderRadius: px(20),
    backgroundColor: '#FFFFFF',
  },
  card: {
    width: '100%',
    backgroundColor: '#F7F7FB',
    borderRadius: px(16),
    padding: px(16),
    marginBottom: px(16),
  },
  snText: {
    fontSize: fontSize(14),
    color: '#333333',
    textAlign: 'center',
    marginTop: px(12),
    marginBottom: px(12),
  },
  section: {
    marginTop: px(8),
    marginBottom: px(8),
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: px(8),
  },
  sectionTitle: {
    fontSize: fontSize(15),
    fontWeight: 'bold',
    color: '#333333',
  },
  sectionDesc: {
    fontSize: fontSize(12),
    color: '#999999',
    marginTop: px(4),
  },
  statusText: {
    fontSize: fontSize(13),
  },
  statusNormal: {
    color: '#70B601',
  },
  statusFail: {
    color: '#E86B6E',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: px(12),
  },
  historyLink: {
    marginTop: px(8),
    fontSize: fontSize(12),
    color: '#2F77FF',
    textAlign: 'center',
  },
  popupBtn: {
    height: px(44),
    borderRadius: px(22),
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: px(24),
    marginBottom: px(8),
  },
  popupBtnText: {
    fontSize: fontSize(16),
    color: '#FFFFFF',
  },
  popupBody: {
    paddingHorizontal: px(16),
    paddingVertical: px(12),
  },
  popupLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: px(8),
  },
  popupLineText: {
    fontSize: fontSize(13),
    color: '#333333',
  },
  reasonLabel: {
    fontSize: fontSize(13),
    color: '#666666',
    marginRight: px(8),
  },
  reasonText: {
    flex: 1,
    fontSize: fontSize(13),
    color: '#333333',
  },
  footerButtons: {
    marginTop: px(16),
    marginBottom: px(8),
  },
  maskWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: px(12),
    zIndex: 2222,
  },
  btnContainerWrapper: {
    width: '100%',
    marginBottom: px(24),
    paddingTop: px(12),
    paddingHorizontal: px(12),
  },
  btnContainer: {
    borderRadius: px(12),
    flex: 1,
  },
  btnContainerClose: {
    borderStyle: 'solid',
    borderWidth: px(1),
    borderColor: 'rgba(0,0,0,0.1)',
  },
  btnContainerCloseText: {
    color: '#e86b6e',
  },
  btnContainerConfirm: {
    marginLeft: px(15),
  },
  btnContainerConfirmText: {
    color: '#FFFFFF',
  },
  lockBtnTextFail: {
    marginBottom: px(12),
    fontWeight: 'bold',
    fontSize: fontSize(16),
  },
  resetBtn: {
    borderRadius: px(24),
  },
  historyUnqualifiedReason: {
    marginTop: px(6),
  },
  btnContainerText: {
    width: '100%',
    textAlign: 'center',
  },
  deviceContentWrapperModel2: {
    position: 'relative',
  },
  deviceContentWrapper: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
});

export default styles;
