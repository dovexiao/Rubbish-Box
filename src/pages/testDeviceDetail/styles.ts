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
});

export default styles;
