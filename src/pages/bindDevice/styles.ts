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
    width: 300,
    height: 300,
    marginTop: 20,
  },
  tipText: {
    marginTop: 24,
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  viewTitle: {
    fontSize: 16,
    color: '#333333',
    fontWeight: 'bold',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 8,
  },
  viewContent: {
    fontSize: 14,
    color: '#999999',
    lineHeight: 20,
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
    width: 313,
    height: 88,
    marginBottom: 32,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
  },
  toastTitle: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    lineHeight: 22,
    textAlign: 'center',
  },
  toastContent: {
    width: 283,
    height: 40,
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    textAlign: 'center',
  },
  toastImage: {
    width: 313,
    height: 166,
    marginTop: 16,
  },
});

export default styles;
