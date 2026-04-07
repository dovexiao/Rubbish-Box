import { pad } from 'crypto-js';
import { StyleSheet } from 'react-native';
import { fontSize, px } from '@/utils/ui';
import a from '@ant-design/react-native/lib/modal/alert';
const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    paddingTop: px(24),
    paddingBottom: px(32),
    paddingHorizontal: px(16),
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },
  imgBox: {
    width: px(288),
    height: px(160),
    marginBottom: px(24),
  },
  imgBox_img: {
    width: px(288),
    height: px(160),
  },
  lockName: {
    fontSize: fontSize(16),
    color: '#333333',
    fontWeight: 'bold',
  },
  row: {
    marginBottom: px(16),
  },
  label: {
    minWidth: px(80),
    color: '#333333',
    fontWeight: 'bold',
    fontSize: fontSize(14),
    lineHeight: fontSize(20),
  },
  text: {
    color: '#333333',
    fontSize: fontSize(14),
    lineHeight: fontSize(20),
  },
  button: {
    width: px(196),
    height: px(48),
    margin: 'auto',
    borderRadius: px(16),
    marginBottom: px(16),
  },
  btnText: {
    color: '#ffffff',
    fontSize: fontSize(16),
  },
  reason: {
    width: '100%',
    marginTop: px(24),
    color: '#ff2b24',
    textAlign: 'center',
    fontSize: fontSize(16),
  },
  pass: {
    width: '100%',
    marginTop: px(24),
    color: '#37c22a',
    textAlign: 'center',
    fontSize: fontSize(16),
  },
  popupText: {
    fontSize: fontSize(14),
    color: '#333333',
    marginTop: px(16),
    lineHeight: fontSize(20),
    marginLeft: px(6),
  },
  textArea: {
    height: px(120),
    padding: px(16),
    marginTop: px(4),
    borderRadius: px(12),
    backgroundColor: '#f2f2f2',
  },
  botContent: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
  },
  infoText: {
    fontSize: fontSize(14),
    color: '#333333',
    marginHorizontal: px(16),
  },
});

export default styles;
