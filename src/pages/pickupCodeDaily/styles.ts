import { fontSize, px } from '@/utils/ui';
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
    height: px(138),
  },
  headerImage: {
    width: px(291),
    height: px(122),
    resizeMode: 'contain',
  },
  contentCard: {
    flex: 1,
    width: '100%',
    padding: px(24),
    backgroundColor: '#FFFFFF',
    borderRadius: px(16),
  },
  dailyTitle: {
    fontSize: fontSize(16),
    color: '#333333',
    fontWeight: 'bold',
  },
  dailyTips: {
    color: '#999999',
    fontSize: fontSize(12),
    marginTop: px(8),
    marginBottom: px(24),
  },
  rowLabel: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowLabelText: {
    fontSize: fontSize(14),
    color: '#333333',
  },
  codeInputBox: {
    width: '100%',
    height: px(48),
    fontSize: fontSize(14),
    marginTop: px(8),
    paddingHorizontal: px(12),
    borderRadius: px(12),
    marginBottom: px(32),
    backgroundColor: '#F7F7FB',
    justifyContent: 'center',
  },
  codeInput: {
    width: '100%',
    height: '100%',
    fontSize: fontSize(14),
    color: '#333333',
  },
  submitBtn: {
    marginBottom: px(16),
    borderRadius: px(16),
    alignSelf: 'center',
  },
  submitBtnText: {
    fontSize: fontSize(16),
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  recordBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  recordBtnText: {
    fontSize: fontSize(14),
    color: '#333333',
    fontWeight: 'bold',
  },
  tipsBox: {
    marginTop: px(24),
    width: '100%',
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
    alignSelf: 'center',
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
  popupTitle: {
    fontSize: fontSize(16),
    color: '#333333',
    fontWeight: 'bold',
    marginBottom: px(0),
    textAlign: 'center',
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
});

export default styles;
