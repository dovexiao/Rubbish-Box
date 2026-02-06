import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mask: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  maskPressable: {
    flex: 1,
  },
  centerWrapper: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    padding: 24,
  },
  header: {
    width: '100%',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    textAlign: 'center',
  },

  footer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
  },
  footerBtn: {
    paddingVertical: 11,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#999',
    textAlign: 'center',
  },
  cancalBtn: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(0,0,0,0.1)',
  },
  confirmBtn: {
    backgroundColor: '#333333',
  },
  cancalBtnText: {
    color: '#999999',
  },
  confirmBtnText: {
    color: '#ffffff',
  },
});

export default styles;
