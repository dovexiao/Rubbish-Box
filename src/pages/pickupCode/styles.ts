import { StyleSheet, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingTop: 0,
    paddingBottom: 37,
    paddingHorizontal: 24,
  },
  codeBox: {
    marginTop: 115,
    marginBottom: 20,
  },
  codeBoxTitle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  codeInput: {
    marginTop: 48,
    width: '100%',
    height: 48,
    fontSize: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
  },
  codeInputText: {
    width: '100%',
    height: '100%',
    fontSize: 14,
    color: '#333333',
  },
  scanBox: {
    width: 102,
    height: 30,
    marginTop: 16,
    borderRadius: 12,
    marginBottom: 123,
    backgroundColor: '#F7F7FB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBoxText: {
    fontSize: 14,
    lineHeight: 30,
    color: '#333333',
    marginLeft: 6,
    fontWeight: 'bold',
  },
  submitBtn: {
    marginBottom: 16,
    borderRadius: 16,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bottomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomBtnText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: 'bold',
  },
  tipsBox: {
    marginTop: 20,
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
  successContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  successContentBox: {
    marginBottom: 24,
    width: '100%',
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
  popupTitle: {
    fontSize: 16,
    color: '#333333',
    fontWeight: 'bold',
    marginBottom: 0,
  },
});

export default styles;
