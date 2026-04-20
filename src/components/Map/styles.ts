import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  mapContainer: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    borderRadius: px(12),
    // padding: 4,
    width: px(157),
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  mapContent: {
    width: '100%',
    flex: 1,
    borderRadius: px(8),
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
  },
  addressContainer: {
    marginTop: px(8),
    marginBottom: px(4),
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: px(17),
    gap: px(6),
  },
  addressText: {
    fontSize: fontSize(12),
    color: '#333333',
    lineHeight: px(17),
    flex: 1,
    overflow: 'hidden',
  },
  loading: {
    width: px(157),
    minHeight: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: fontSize(12),
    color: '#333333',
  },
  mapFallback: {
    flex: 1,
    minHeight: px(120),
    paddingHorizontal: px(12),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F7FB',
  },
  mapFallbackText: {
    marginTop: px(8),
    fontSize: fontSize(12),
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
