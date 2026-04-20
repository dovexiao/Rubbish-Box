import { px, fontSize } from '@/utils/ui';
import { StyleSheet, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingTop: 0,
    paddingBottom: px(37),
    paddingHorizontal: px(24),
  },
  codeBox: {
    marginTop: px(115),
    marginBottom: px(20),
  },
  codeBoxTitle: {
    textAlign: 'center',
    fontSize: fontSize(16),
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  codeInput: {
    marginTop: px(48),
    width: '100%',
    height: px(48),
    fontSize: fontSize(14),
    borderRadius: px(12),
    borderWidth: px(1),
    borderColor: '#E5E5E5',
    paddingHorizontal: px(12),
    backgroundColor: '#FFFFFF',
  },
  codeInputText: {
    width: '100%',
    height: '100%',
    fontSize: fontSize(14),
    color: '#333333',
  },
  scanBox: {
    width: px(102),
    height: px(30),
    marginTop: px(16),
    borderRadius: px(12),
    marginBottom: px(123),
    backgroundColor: '#F7F7FB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBoxText: {
    fontSize: fontSize(14),
    lineHeight: px(30),
    color: '#333333',
    marginLeft: px(6),
    fontWeight: 'bold',
  },
  submitBtn: {
    marginBottom: px(16),
    borderRadius: px(16),
  },
  submitBtnText: {
    fontSize: fontSize(16),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  bottomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomBtnText: {
    fontSize: fontSize(14),
    color: '#333333',
    fontWeight: 'bold',
  },
  tipsBox: {
    marginTop: px(20),
  },
  tipsTitle: {
    fontSize: fontSize(12),
    color: '#3D3D3D',
    marginBottom: px(8),
  },
  tipsItem: {
    color: '#999999',
    fontSize: fontSize(12),
    lineHeight: px(17),
  },
  deviceImgBox: {
    width: px(120),
    height: px(60),
    marginTop: px(20),
    position: 'relative',
  },
  deviceImage: {
    width: px(120),
    height: px(60),
  },
  numBox: {
    position: 'absolute',
    top: px(-10),
    right: px(-10),
  },
  numBoxText: {
    fontSize: fontSize(18),
    color: '#333333',
    paddingBottom: px(3),
    fontWeight: 'bold',
  },
  numBoxText2: {
    color: '#333333',
    fontSize: fontSize(24),
    fontWeight: 'bold',
  },
  successContent: {
    paddingHorizontal: px(24),
    paddingBottom: px(24),
  },
  successContentBox: {
    marginBottom: px(24),
    width: '100%',
  },
  qrCodeContent: {
    width: '100%',
    minHeight: px(176),
    marginTop: px(32),
    marginHorizontal: px(26),
    borderRadius: px(16),
    borderWidth: px(1),
    borderColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodeImage: {
    width: px(120),
    height: px(120),
    marginTop: px(8),
  },
  qrCodeContentText: {
    fontSize: fontSize(14),
    color: '#333333',
    marginTop: px(12),
    textAlign: 'center',
  },
  popupTitle: {
    fontSize: fontSize(16),
    color: '#333333',
    fontWeight: 'bold',
    marginBottom: px(0),
  },
});

export default styles;
