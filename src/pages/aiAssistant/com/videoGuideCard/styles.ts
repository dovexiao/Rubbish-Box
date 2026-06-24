import { fontSize, px } from '@/utils/ui';
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  messageRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: px(12),
  },
  card: {
    width: '100%',
    padding: px(12),
    backgroundColor: '#fbfbfb',
    borderRadius: px(12),
  },
  title: {
    marginBottom: px(12),
    fontWeight: '500',
    fontSize: fontSize(14),
    color: '#333333',
    lineHeight: px(22),
  },
  videoWrap: {
    position: 'relative',
    width: '100%',
    height: px(190),
    overflow: 'hidden',
    borderRadius: px(8),
    backgroundColor: '#000000',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.15)',
  },
  playBtn: {
    width: px(48),
    height: px(48),
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: px(24),
  },
});

export default styles;
