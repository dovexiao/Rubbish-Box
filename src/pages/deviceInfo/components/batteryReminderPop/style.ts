import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';
export const styles = StyleSheet.create({
  header: {
    padding: px(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerSide: {
    width: px(24),
    height: px(24),
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: fontSize(16),
    fontWeight: '500',
    color: '#333333',
  },
  closeBtn: {
    width: px(24),
    height: px(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  popupContainer: {
    paddingHorizontal: px(16),
    paddingBottom: px(16),
  },
  videoWrap: {
    position: 'relative',
    width: '100%',
    height: px(186),
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: px(12),
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playCircle: {
    width: px(120),
    height: px(120),
    borderRadius: px(60),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
