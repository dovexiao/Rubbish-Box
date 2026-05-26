import { px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: px(24),
    paddingTop: px(24),
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
    width: px(48),
    height: px(48),
    borderRadius: px(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
