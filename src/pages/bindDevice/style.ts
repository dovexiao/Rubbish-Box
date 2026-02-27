import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scanFrameWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanFrame: {
    width: 300,
    height: 300,
    marginTop: 82,
    marginBottom: 32,
  },
  scanTipWrapper: {
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  scanTipBox: {
    paddingHorizontal: 23,
    paddingVertical: 10,
    backgroundColor: 'rgba(0,0,0,0.8)',
    gap: 6,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  scanTipTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  scanTipText: {
    width: 297,
    textAlign: 'center',
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  scanTipImg: {
    width: 343,
    height: 166,
    borderRadius: 4,
  },
});
