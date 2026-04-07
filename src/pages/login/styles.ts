import { StyleSheet } from 'react-native';
import { fontSize, px } from '@/utils/ui';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: px(52),
  },
  logo: {
    width: px(191),
    height: px(66),
    aspectRatio: px(191) / px(66),
    marginTop: px(60),
  },
  logoTitle: {
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(20),
    letterSpacing: px(5),
    marginTop: px(8),
  },
  agree: {
    fontSize: fontSize(12),
    color: '#666666',
    lineHeight: px(17),
  },
  agreeLink: {
    color: '#333333',
    fontSize: fontSize(12),
    lineHeight: px(17),
  },
  logTip: {
    marginTop: px(24),
    marginBottom: px(16),
  },
  line: {
    width: px(24),
    height: 1,
    backgroundColor: '#999999',
  },
  fastDesc: {
    fontSize: fontSize(12),
    color: '#666666',
    lineHeight: px(17),
    marginHorizontal: px(12),
  },
  wxlogo: {
    width: px(50),
    height: px(50),
  },
  loginIcon: {
    width: px(50),
    height: px(50),
  },
  popTitle: {
    fontWeight: 'bold',
    fontSize: fontSize(16),
    lineHeight: px(22),
    color: '#333333',
    textAlign: 'center',
  },
  popDesc: {
    fontSize: fontSize(14),
    color: '#666666',
    lineHeight: px(20),
    textAlign: 'center',
    marginTop: px(8),
    fontWeight: 'normal',
  },
  popDescLink: {
    fontSize: fontSize(14),
    lineHeight: px(20),
    color: '#333333',
  },
  popNotice: {
    fontSize: fontSize(13),
    color: '#666666',
    lineHeight: px(16),
    marginTop: px(8),
  },
  popSubmit: {
    borderRadius: px(12),
    marginLeft: px(15),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wxLoginBtn: {
    padding: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  popBtnText: {
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default styles;
