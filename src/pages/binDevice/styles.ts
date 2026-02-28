import { StyleSheet, Dimensions } from 'react-native';

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  cameraMask: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanFrameWrapper: {
    width: screenWidth * 0.7,
    height: screenWidth * 0.7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: '100%',
    height: '100%',
  },
  tipText: {
    marginTop: 24,
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default styles;

