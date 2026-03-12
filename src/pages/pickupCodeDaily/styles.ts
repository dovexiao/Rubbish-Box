import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  headerImageWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 138,
  },
  headerImage: {
    width: 291,
    height: 122,
    resizeMode: 'contain',
  },
  contentCard: {
    flex: 1,
    width: '100%',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  dailyTitle: {
    fontSize: 16,
    color: '#333333',
    fontWeight: 'bold',
  },
  dailyTips: {
    color: '#999999',
    fontSize: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  rowLabel: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabelText: {
    fontSize: 14,
    color: '#333333',
  },
  codeInputBox: {
    width: '100%',
    height: 48,
    fontSize: 14,
    marginTop: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 32,
    backgroundColor: '#F7F7FB',
    justifyContent: 'center',
  },
  codeInput: {
    width: '100%',
    height: '100%',
    fontSize: 14,
    color: '#333333',
  },
  submitBtn: {
    marginBottom: 16,
    borderRadius: 16,
    alignSelf: 'center',
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  recordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  recordBtnText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: 'bold',
  },
  tipsBox: {
    marginTop: 24,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 12,
    color: '#3D3D3D',
    marginBottom: 8,
  },
  tipsItem: {
    color: '#999999',
    fontSize: 12,
    lineHeight: 17,
  },
  deviceImgBox: {
    width: 120,
    height: 60,
    marginTop: 20,
    alignSelf: 'center',
    position: 'relative',
  },
  deviceImage: {
    width: 120,
    height: 60,
  },
  numBox: {
    position: 'absolute',
    top: -10,
    right: -10,
  },
  numBoxText: {
    fontSize: 18,
    color: '#333333',
    paddingBottom: 3,
    fontWeight: 'bold',
  },
  numBoxText2: {
    color: '#333333',
    fontSize: 24,
    fontWeight: 'bold',
  },
  popupTitle: {
    fontSize: 16,
    color: '#333333',
    fontWeight: 'bold',
    marginBottom: 0,
    textAlign: 'center',
  },
  qrCodeContent: {
    width: '100%',
    minHeight: 176,
    marginTop: 32,
    marginHorizontal: 26,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodeImage: {
    width: 120,
    height: 120,
    marginTop: 8,
  },
  qrCodeContentText: {
    fontSize: 14,
    color: '#333333',
    marginTop: 12,
    textAlign: 'center',
  },
});

export default styles;
