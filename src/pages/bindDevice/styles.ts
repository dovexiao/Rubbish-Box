import { fontSize, px } from '@/utils/ui';
import { StyleSheet, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    position: 'relative',
    flexDirection: 'column',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  cameraMask: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },

  scanFrame: {
    width: px(300),
    height: px(300),
    marginTop: px(20),
  },
  tipText: {
    marginTop: px(24),
    fontSize: fontSize(14),
    color: '#FFFFFF',
    textAlign: 'center',
  },
  viewTitle: {
    fontSize: fontSize(16),
    color: '#333333',
    fontWeight: 'bold',
    lineHeight: px(22),
    textAlign: 'center',
    marginBottom: px(8),
  },
  viewContent: {
    fontSize: fontSize(14),
    color: '#999999',
    lineHeight: px(20),
    textAlign: 'center',
  },
  maskBottom: {
    width: '100%',
    flex: 1,
    position: 'absolute',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    zIndex: 5,
    backgroundColor: 'transparent',
  },
  toastContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    width: px(313),
    height: px(88),
    marginBottom: px(16),
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: px(12),
  },
  toastTitle: {
    fontSize: fontSize(16),
    color: '#FFFFFF',
    fontWeight: 'bold',
    lineHeight: px(22),
    textAlign: 'center',
  },
  toastContent: {
    width: px(283),
    height: px(40),
    fontSize: fontSize(14),
    color: '#FFFFFF',
    lineHeight: px(20),
    textAlign: 'center',
  },
  toastImage: {
    width: px(313),
    aspectRatio: px(313) / px(166),
  },
});

export default styles;
