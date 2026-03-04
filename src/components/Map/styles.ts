import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  mapContainer: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    // padding: 4,
    width: 157,
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  mapContent: {
    width: '100%',
    flex: 1,
    borderRadius: 8,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
  },
  addressContainer: {
    marginTop: 8,
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 17,
    gap: 6,
  },
  addressText: {
    fontSize: 12,
    color: '#333333',
    lineHeight: 17,
    flex: 1,
    overflow: 'hidden',
  },
  loading: {
    width: 157,
    minHeight: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 12,
    color: '#333333',
  },
  mapFallback: {
    flex: 1,
    minHeight: 120,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F7FB',
  },
  mapFallbackText: {
    marginTop: 8,
    fontSize: 12,
    color: '#666666',
  },
  mapClickOverlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 1,
  },
});
