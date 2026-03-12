import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
    backgroundColor: '#FFFFFF',
  },
  lockContentWrapper: {
    position: 'relative',
    width: '100%',
    marginTop: 16,
  },
  lockContentTextWrapper: {
    position: 'absolute',
    right: 48,
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
    marginBottom: 24,
  },
  deviceModeWrapper: {
    width: '100%',
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginBottom: 12,
  },
  deviceInfoWrapper: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginBottom: 12,
  },
  deviceInfoHeader: {
    height: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
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
    fontSize: 14,
    color: '#333333',
    marginBottom: 4,
  },
  modeTextValue: {
    fontSize: 14,
    color: '#333333',
  },
  desc: {
    fontSize: 12,
    color: '#333333',
    marginBottom: 16,
    marginTop: 6,
  },
  radioWrapper: {
    width: 20,
    height: 20,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  card: {
    width: '100%',
    backgroundColor: '#F7F7FB',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  snText: {
    fontSize: 14,
    color: '#333333',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  section: {
    marginTop: 8,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333333',
  },
  sectionDesc: {
    fontSize: 12,
    color: '#999999',
    marginTop: 4,
  },
  statusText: {
    fontSize: 13,
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
    marginTop: 12,
  },
  historyLink: {
    marginTop: 8,
    fontSize: 12,
    color: '#2F77FF',
    textAlign: 'center',
  },
  popupBtn: {
    height: 44,
    borderRadius: 22,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 24,
    marginBottom: 8,
  },
  popupBtnText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  popupBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  popupLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  popupLineText: {
    fontSize: 13,
    color: '#333333',
  },
  reasonLabel: {
    fontSize: 13,
    color: '#666666',
    marginRight: 8,
  },
  reasonText: {
    flex: 1,
    fontSize: 13,
    color: '#333333',
  },
  footerButtons: {
    marginTop: 16,
    marginBottom: 8,
  },
  maskWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 12,
  },
  btnContainerWrapper: {
    width: '100%',
    marginBottom: 24,
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  btnContainer: {
    borderRadius: 12,
    flex: 1,
  },
  btnContainerClose: {
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  btnContainerCloseText: {
    color: '#e86b6e',
  },
  btnContainerConfirm: {
    marginLeft: 15,
  },
  btnContainerConfirmText: {
    color: '#FFFFFF',
  },
  lockBtnTextFail: {
    marginBottom: 12,
    fontWeight: 'bold',
    fontSize: 16,
  },
  resetBtn: {
    borderRadius: 24,
  },
  historyUnqualifiedReason: {
    marginTop: 6,
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
